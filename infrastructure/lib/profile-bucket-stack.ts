import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * Profile Bucket 스택 Props
 * Profile BucketスタックProps
 */
export interface ProfileBucketStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
}

/**
 * 프로필 이미지 S3 버킷 스택
 * プロフィール画像S3バケットスタック
 *
 * 사용자 프로필 이미지 저장용 S3 버킷
 * ユーザープロフィール画像保存用S3バケット
 *
 * 이원화 전략:
 * - 구직자: Presigned URL로 동적 업로드
 * - 기업 로고: GitHub Actions로 정적 배포
 *
 * 二元化戦略:
 * - 求職者: Presigned URLで動的アップロード
 * - 企業ロゴ: GitHub Actionsで静的デプロイ
 *
 * 버킷 구조:
 * portfolio-profile-images-{account-id}/
 * ├── jobseekers/           ← Presigned URL로 동적 업로드
 * │   └── {cognito_sub}/
 * │       └── profile.jpg
 * └── companies/            ← GitHub Actions로 정적 배포
 *     ├── company-a.png
 *     └── company-b.png
 *
 * バケット構造:
 * portfolio-profile-images-{account-id}/
 * ├── jobseekers/           ← Presigned URLで動的アップロード
 * │   └── {cognito_sub}/
 * │       └── profile.jpg
 * └── companies/            ← GitHub Actionsで静的デプロイ
 *     ├── company-a.png
 *     └── company-b.png
 */
export class ProfileBucketStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ProfileBucketStackProps) {
    super(scope, id, props);

    const { projectName, environment } = props;

    // ============================================================
    // S3 버킷 생성 (프로필 이미지)
    // S3バケット作成（プロフィール画像）
    //
    // 보안 설정:
    // - 퍼블릭 액세스 완전 차단
    // - CloudFront OAC를 통해서만 조회 가능
    // - Presigned URL로만 업로드 가능 (5분 만료)
    //
    // セキュリティ設定:
    // - パブリックアクセス完全ブロック
    // - CloudFront OACを通じてのみ閲覧可能
    // - Presigned URLでのみアップロード可能（5分有効期限）
    // ============================================================
    this.bucket = new s3.Bucket(this, 'ProfileImagesBucket', {
      bucketName: `${projectName}-${environment}-profile-images-${this.account}`,

      // 퍼블릭 액세스 완전 차단
      // パブリックアクセス完全ブロック
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      // 암호화 설정 (S3 관리형)
      // 暗号化設定（S3マネージド）
      encryption: s3.BucketEncryption.S3_MANAGED,

      // 버전 관리 비활성화 (비용 절감)
      // バージョニング無効化（コスト削減）
      versioned: false,

      // 스택 삭제 시 버킷 삭제 (개발 환경)
      // スタック削除時にバケット削除（開発環境）
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,

      // CORS 설정 (Presigned URL 업로드를 위해)
      // CORS設定（Presigned URLアップロードのため）
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: [
            'http://localhost:3000',
            `https://${projectName}.${environment}.com`,
            'https://*.cloudfront.net',
          ],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],

      // 수명 주기 규칙: 불완전한 멀티파트 업로드 7일 후 삭제
      // ライフサイクルルール: 不完全なマルチパートアップロード7日後削除
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
    });

    // ============================================================
    // 버킷 정책
    // バケットポリシー
    //
    // CloudFront OAC가 버킷에 접근할 수 있도록 정책 추가
    // CloudFront OACがバケットにアクセスできるようにポリシー追加
    // 실제 OAC 정책은 CloudFrontStack에서 자동으로 추가됨
    // 実際のOACポリシーはCloudFrontStackで自動的に追加される
    // ============================================================

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'ProfileBucketName', {
      value: this.bucket.bucketName,
      description: 'S3 Bucket for Profile Images',
      exportName: `${projectName}-${environment}-profile-bucket`,
    });

    new cdk.CfnOutput(this, 'ProfileBucketArn', {
      value: this.bucket.bucketArn,
      description: 'S3 Bucket ARN for Profile Images',
      exportName: `${projectName}-${environment}-profile-bucket-arn`,
    });

    new cdk.CfnOutput(this, 'ProfileBucketRegionalDomainName', {
      value: this.bucket.bucketRegionalDomainName,
      description: 'S3 Bucket Regional Domain Name',
      exportName: `${projectName}-${environment}-profile-bucket-domain`,
    });
  }

  /**
   * EC2 역할에 S3 권한 부여
   * EC2ロールにS3権限付与
   *
   * Presigned URL 생성을 위해 EC2가 S3에 접근할 수 있어야 함
   * Presigned URL生成のためEC2がS3にアクセスできる必要あり
   *
   * @param role EC2 인스턴스 IAM 역할
   */
  grantEc2Access(role: iam.IRole): void {
    // 읽기 권한 (이미지 조회)
    // 読み取り権限（画像閲覧）
    this.bucket.grantRead(role);

    // 쓰기 권한 (Presigned URL로 업로드)
    // 書き込み権限（Presigned URLでアップロード）
    this.bucket.grantPut(role);

    // 삭제 권한 (프로필 이미지 교체 시)
    // 削除権限（プロフィール画像変更時）
    this.bucket.grantDelete(role);
  }
}
