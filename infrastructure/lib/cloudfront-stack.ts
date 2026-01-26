import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

/**
 * CloudFront 스택 Props
 * CloudFrontスタックProps
 */
export interface CloudFrontStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly alb: elbv2.IApplicationLoadBalancer;
  /** 커스텀 도메인 (선택사항) / カスタムドメイン（オプション） */
  readonly domainName?: string;
  /** ACM 인증서 (domainName 설정 시 필수) / ACM証明書（domainName設定時に必須） */
  readonly certificate?: acm.ICertificate;
}

/**
 * CloudFront + S3 스택
 * CloudFront + S3スタック
 *
 * [L7 - Application Layer] 글로벌 CDN 및 에러 페이지 호스팅
 * グローバルCDNおよびエラーページホスティング
 *
 * CloudFront 선택 이유:
 * - 글로벌 엣지 로케이션으로 빠른 콘텐츠 전송
 * - HTTPS 자동 제공 (기본 도메인)
 * - S3와 연동하여 에러 페이지 제공
 * - ALB와 연동하여 동적 콘텐츠 프록시
 *
 * CloudFront選択理由:
 * - グローバルエッジロケーションで高速コンテンツ配信
 * - HTTPS自動提供（デフォルトドメイン）
 * - S3と連携してエラーページ提供
 * - ALBと連携して動的コンテンツプロキシ
 *
 * 아키텍처:
 * User → CloudFront → ALB (동적 콘텐츠)
 *                   → S3 (에러 페이지, 정적 에셋)
 *
 * アーキテクチャ:
 * User → CloudFront → ALB（動的コンテンツ）
 *                   → S3（エラーページ、静的アセット）
 */
export class CloudFrontStack extends cdk.Stack {
  // 다른 스택에서 참조할 수 있도록 퍼블릭으로 노출
  // 他のスタックから参照できるようにパブリックで公開
  public readonly distribution: cloudfront.Distribution;
  public readonly errorPagesBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    const { projectName, environment, alb } = props;

    // ============================================================
    // S3 버킷 생성 (에러 페이지 + 정적 에셋)
    // S3バケット作成（エラーページ + 静的アセット）
    //
    // 보안 설정:
    // - 퍼블릭 액세스 완전 차단
    // - CloudFront OAC를 통해서만 접근 가능
    //
    // セキュリティ設定:
    // - パブリックアクセス完全ブロック
    // - CloudFront OACを通じてのみアクセス可能
    // ============================================================
    this.errorPagesBucket = new s3.Bucket(this, 'ErrorPagesBucket', {
      bucketName: `${projectName}-${environment}-error-pages-${this.account}`,

      // 퍼블릭 액세스 차단 (보안 필수)
      // パブリックアクセスブロック（セキュリティ必須）
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      // 암호화 설정
      // 暗号化設定
      encryption: s3.BucketEncryption.S3_MANAGED,

      // 스택 삭제 시 버킷 삭제 (개발 환경)
      // スタック削除時にバケット削除（開発環境）
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,

      // CORS 설정 (영상 재생 등을 위해)
      // CORS設定（動画再生などのため）
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // ============================================================
    // CloudFront Origin Access Control (OAC)
    // CloudFrontオリジンアクセスコントロール
    //
    // OAC 선택 이유 (OAI 대비):
    // - 최신 보안 표준
    // - S3 서버 사이드 암호화 지원
    // - AWS Signature Version 4 사용
    //
    // OAC選択理由（OAI比較）:
    // - 最新セキュリティ標準
    // - S3サーバーサイド暗号化対応
    // - AWS Signature Version 4使用
    // ============================================================

    // ============================================================
    // CloudFront Distribution 생성
    // CloudFrontディストリビューション作成
    //
    // Origins:
    // 1. ALB Origin (기본): 동적 콘텐츠 (Next.js SSR)
    // 2. S3 Origin: 에러 페이지, 정적 에셋
    //
    // Origins:
    // 1. ALB Origin（デフォルト）: 動的コンテンツ（Next.js SSR）
    // 2. S3 Origin: エラーページ、静的アセット
    // ============================================================
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `${projectName}-${environment} Portfolio CDN`,

      // 기본 Origin: ALB (동적 콘텐츠)
      // デフォルトOrigin: ALB（動的コンテンツ）
      defaultBehavior: {
        origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
        }),

        // 캐싱 정책: 동적 콘텐츠는 캐싱하지 않음
        // キャッシュポリシー: 動的コンテンツはキャッシュしない
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,

        // 오리진 요청 정책: 모든 헤더 전달
        // オリジンリクエストポリシー: すべてのヘッダー転送
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,

        // HTTP → HTTPS 리다이렉트
        // HTTP → HTTPSリダイレクト
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,

        // 허용 HTTP 메소드
        // 許可HTTPメソッド
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      },

      // 추가 Behaviors: S3 정적 에셋
      // 追加Behaviors: S3静的アセット
      additionalBehaviors: {
        // /404.html 에러 페이지는 S3에서 제공
        // /404.htmlエラーページはS3から提供
        // NOTE: errorResponses에서 /404.html을 참조하므로 이 behavior가 필요
        // NOTE: errorResponsesで/404.htmlを参照するのでこのbehaviorが必要
        '/404.html': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.errorPagesBucket),
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        // /_astro/* 에러 페이지 에셋 (Astro 빌드 출력물)
        // /_astro/*エラーページアセット（Astroビルド出力物）
        '/_astro/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.errorPagesBucket),
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        // /assets/* 경로는 S3에서 제공
        // /assets/*パスはS3から提供
        '/assets/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.errorPagesBucket),
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        // /videos/* 경로는 S3에서 제공 (영상 호스팅)
        // /videos/*パスはS3から提供（動画ホスティング）
        '/videos/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.errorPagesBucket),
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },

      // 에러 응답 설정: 404 에러 시 S3의 404.html 반환
      // エラーレスポンス設定: 404エラー時にS3の404.html返却
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],

      // 가격 등급: 아시아 + 북미 + 유럽 (비용 최적화)
      // 価格クラス: アジア + 北米 + ヨーロッパ（コスト最適化）
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,

      // HTTP 버전
      // HTTPバージョン
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,

      // 기본 루트 객체 설정 안 함 (Next.js에서 처리)
      // デフォルトルートオブジェクト設定なし（Next.jsで処理）
      defaultRootObject: '',

      // ============================================================
      // 커스텀 도메인 설정 (선택사항)
      // カスタムドメイン設定（オプション）
      //
      // domainName과 certificate가 모두 제공된 경우에만 설정
      // domainNameとcertificateが両方提供された場合のみ設定
      // ============================================================
      ...(props.domainName && props.certificate && {
        domainNames: [props.domainName],
        certificate: props.certificate,
      }),
    });

    // ============================================================
    // ACM 인증서 및 커스텀 도메인
    // ACM証明書およびカスタムドメイン
    //
    // 커스텀 도메인 설정 완료:
    // - CertificateStack에서 us-east-1 리전에 인증서 생성
    // - props.domainName과 props.certificate로 설정
    // - DNS 검증은 외부 DNS 관리자에게 CNAME 추가 요청
    //
    // カスタムドメイン設定完了:
    // - CertificateStackでus-east-1リージョンに証明書作成
    // - props.domainNameとprops.certificateで設定
    // - DNS検証は外部DNS管理者にCNAME追加を依頼
    // ============================================================

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: `${projectName}-${environment}-cf-distribution-id`,
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name (Access URL)',
      exportName: `${projectName}-${environment}-cf-domain`,
    });

    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Portfolio Site URL',
      exportName: `${projectName}-${environment}-site-url`,
    });

    // 커스텀 도메인 URL (설정된 경우)
    // カスタムドメインURL（設定された場合）
    if (props.domainName) {
      new cdk.CfnOutput(this, 'CustomDomainUrl', {
        value: `https://${props.domainName}`,
        description: 'Custom Domain URL',
        exportName: `${projectName}-${environment}-custom-domain-url`,
      });
    }

    new cdk.CfnOutput(this, 'ErrorPagesBucketName', {
      value: this.errorPagesBucket.bucketName,
      description: 'S3 Bucket for Error Pages',
      exportName: `${projectName}-${environment}-error-pages-bucket`,
    });
  }
}
