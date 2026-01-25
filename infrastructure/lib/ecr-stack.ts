import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

/**
 * ECR 스택 Props
 * ECRスタックProps
 */
export interface EcrStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
}

/**
 * ECR (Elastic Container Registry) 스택
 * ECRスタック
 *
 * Docker 이미지를 저장하고 관리하는 프라이빗 컨테이너 레지스트리
 * Dockerイメージを保存・管理するプライベートコンテナレジストリ
 *
 * ECR 선택 이유:
 * - AWS 네이티브 컨테이너 레지스트리로 IAM과 통합
 * - EC2/ECS/EKS와의 원활한 연동
 * - FreeTier: 500MB 스토리지 무료
 *
 * ECR選択理由:
 * - AWSネイティブコンテナレジストリでIAMと統合
 * - EC2/ECS/EKSとのシームレスな連携
 * - FreeTier: 500MBストレージ無料
 */
export class EcrStack extends cdk.Stack {
  // 다른 스택에서 참조할 수 있도록 레포지토리를 퍼블릭으로 노출
  // 他のスタックから参照できるようにリポジトリをパブリックで公開
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props);

    const { projectName, environment } = props;

    // ============================================================
    // ECR Repository 생성
    // ECRリポジトリ作成
    //
    // 이 레포지토리는 Next.js Docker 이미지를 저장합니다.
    // このリポジトリはNext.js Dockerイメージを保存します。
    //
    // CI/CD 흐름:
    // GitHub Actions → Docker Build → ECR Push → EC2 Pull
    //
    // CI/CDフロー:
    // GitHub Actions → Docker Build → ECR Push → EC2 Pull
    // ============================================================
    this.repository = new ecr.Repository(this, 'FrontendRepo', {
      repositoryName: `${projectName}-${environment}-frontend`,

      // 이미지 태그 변경 가능 여부
      // イメージタグ変更可否
      // MUTABLE: 같은 태그로 이미지 덮어쓰기 가능 (개발 편의)
      // MUTABLE: 同じタグでイメージ上書き可能（開発便宜）
      imageTagMutability: ecr.TagMutability.MUTABLE,

      // 스택 삭제 시 레포지토리 삭제 여부
      // スタック削除時にリポジトリ削除するかどうか
      // 개발 환경이므로 스택과 함께 삭제
      // 開発環境なのでスタックと一緒に削除
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      // 스택 삭제 시 이미지도 함께 삭제
      // スタック削除時にイメージも一緒に削除
      emptyOnDelete: true,

      // 이미지 스캔 설정 (보안 취약점 검사)
      // イメージスキャン設定（セキュリティ脆弱性検査）
      imageScanOnPush: true,

      // 수명 주기 정책: 오래된 이미지 자동 삭제로 스토리지 비용 절감
      // ライフサイクルポリシー: 古いイメージ自動削除でストレージコスト削減
      lifecycleRules: [
        {
          // 태그가 없는 이미지는 1일 후 삭제
          // タグがないイメージは1日後に削除
          rulePriority: 1,
          description: 'Remove untagged images after 1 day',
          tagStatus: ecr.TagStatus.UNTAGGED,
          maxImageAge: cdk.Duration.days(1),
        },
        {
          // 최근 5개 이미지만 유지
          // 最新5つのイメージのみ保持
          rulePriority: 2,
          description: 'Keep only 5 most recent images',
          tagStatus: ecr.TagStatus.ANY,
          maxImageCount: 5,
        },
      ],
    });

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: this.repository.repositoryUri,
      description: 'ECR Repository URI',
      exportName: `${projectName}-${environment}-ecr-uri`,
    });

    new cdk.CfnOutput(this, 'RepositoryArn', {
      value: this.repository.repositoryArn,
      description: 'ECR Repository ARN',
      exportName: `${projectName}-${environment}-ecr-arn`,
    });
  }
}
