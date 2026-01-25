import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';

/**
 * ALB 스택 Props
 * ALBスタックProps
 */
export interface AlbStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly vpc: ec2.IVpc;
  readonly ec2Instance: ec2.Instance;
}

/**
 * ALB (Application Load Balancer) 스택
 * ALBスタック
 *
 * [L7 - Application Layer] HTTP/HTTPS 트래픽을 처리하는 로드밸런서
 * HTTP/HTTPSトラフィックを処理するロードバランサー
 *
 * ALB 선택 이유:
 * - L7 로드밸런싱: HTTP 헤더, 경로 기반 라우팅 가능
 * - Health Check: EC2 상태 자동 모니터링
 * - CloudFront와 연동 용이
 *
 * ALB選択理由:
 * - L7ロードバランシング: HTTPヘッダー、パスベースルーティング可能
 * - Health Check: EC2状態自動モニタリング
 * - CloudFrontとの連携容易
 *
 * 대안 검토:
 * - NLB: L4 로드밸런싱, HTTP 분석 불가
 * - CLB: 레거시, 새 프로젝트에 비권장
 *
 * 代替案検討:
 * - NLB: L4ロードバランシング、HTTP分析不可
 * - CLB: レガシー、新プロジェクトに非推奨
 *
 * ⚠️ 비용 주의: ALB는 FreeTier에 포함되지 않음 (~$16-22/월)
 * ⚠️ コスト注意: ALBはFreeTierに含まれない（~$16-22/月）
 */
export class AlbStack extends cdk.Stack {
  // 다른 스택에서 참조할 수 있도록 퍼블릭으로 노출
  // 他のスタックから参照できるようにパブリックで公開
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly listener: elbv2.ApplicationListener;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: AlbStackProps) {
    super(scope, id, props);

    const { projectName, environment, vpc, ec2Instance } = props;

    // ============================================================
    // [L4 - Transport Layer] ALB Security Group (Stateful)
    // ALBセキュリティグループ（ステートフル）
    //
    // 트래픽 흐름:
    // CloudFront → ALB:80 → EC2:3000
    //
    // トラフィックフロー:
    // CloudFront → ALB:80 → EC2:3000
    // ============================================================
    this.securityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      securityGroupName: `${projectName}-${environment}-sg-alb`,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    // CloudFront에서 HTTP 트래픽 허용
    // CloudFrontからHTTPトラフィック許可
    // CloudFront IP 범위는 동적이므로 anyIpv4 사용
    // CloudFront IP範囲は動的なのでanyIpv4使用
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from CloudFront (and internet for testing)'
    );

    // ============================================================
    // 참고: EC2 Security Group 설정
    // 参考: EC2セキュリティグループ設定
    //
    // EC2 Stack에서 3000 포트가 이미 열려있습니다.
    // EC2 Stackで3000ポートが既に開放されています。
    // TODO: 프로덕션에서는 ALB SG에서만 접근 허용하도록 수정 필요
    // TODO: 本番環境ではALB SGからのみアクセス許可するよう修正が必要
    // ============================================================

    // ============================================================
    // [L7 - Application Layer] ALB 생성
    // ALB作成
    //
    // Application Load Balancer는 OSI 7계층에서 동작:
    // - HTTP/HTTPS 프로토콜 이해
    // - Host, Path 기반 라우팅 가능
    // - WebSocket, HTTP/2 지원
    //
    // Application Load BalancerはOSI 7層で動作:
    // - HTTP/HTTPSプロトコル理解
    // - Host、Pathベースルーティング可能
    // - WebSocket、HTTP/2対応
    // ============================================================
    this.alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      loadBalancerName: `${projectName}-${environment}-alb`,
      vpc,

      // 인터넷에서 접근 가능하도록 public 서브넷에 배치
      // インターネットからアクセス可能なようにpublicサブネットに配置
      internetFacing: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },

      securityGroup: this.securityGroup,

      // 삭제 보호 비활성화 (개발 환경)
      // 削除保護無効化（開発環境）
      deletionProtection: false,
    });

    // ============================================================
    // Target Group 생성
    // ターゲットグループ作成
    //
    // EC2 인스턴스를 타겟으로 등록
    // EC2インスタンスをターゲットとして登録
    // ============================================================
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      targetGroupName: `${projectName}-${environment}-tg`,
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,

      // 인스턴스 타겟 타입
      // インスタンスターゲットタイプ
      targetType: elbv2.TargetType.INSTANCE,

      // Health Check 설정
      // Health Check設定
      healthCheck: {
        path: '/',
        protocol: elbv2.Protocol.HTTP,
        port: '3000',
        healthyHttpCodes: '200-399',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },

      // 타겟 등록 해제 시 연결 드레이닝 시간
      // ターゲット登録解除時の接続ドレイニング時間
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // EC2 인스턴스를 타겟 그룹에 등록
    // EC2インスタンスをターゲットグループに登録
    targetGroup.addTarget(new targets.InstanceTarget(ec2Instance, 3000));

    // ============================================================
    // HTTP Listener 생성
    // HTTPリスナー作成
    //
    // TODO: 프로덕션에서는 HTTPS 리스너 + ACM 인증서 사용 권장
    // TODO: 本番環境ではHTTPSリスナー + ACM証明書使用推奨
    // ============================================================
    this.listener = this.alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    });

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: this.alb.loadBalancerDnsName,
      description: 'ALB DNS Name',
      exportName: `${projectName}-${environment}-alb-dns`,
    });

    new cdk.CfnOutput(this, 'AlbArn', {
      value: this.alb.loadBalancerArn,
      description: 'ALB ARN',
      exportName: `${projectName}-${environment}-alb-arn`,
    });

    new cdk.CfnOutput(this, 'AlbSecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      description: 'ALB Security Group ID',
      exportName: `${projectName}-${environment}-alb-sg-id`,
    });
  }
}
