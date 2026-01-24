import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

/**
 * VPC 스택 Props
 * VPCスタックProps
 */
export interface VpcStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
}

/**
 * VPC 인프라 스택
 * VPCインフラスタック
 *
 * 이 스택은 네트워크 인프라의 기반을 구성합니다.
 * このスタックはネットワークインフラの基盤を構成します。
 *
 * [L3 - Network Layer] OSI 네트워크 계층 리소스
 * - VPC: 가상 프라이빗 클라우드 (10.0.0.0/16)
 * - Subnets: 퍼블릭 서브넷 2개 (AZ-a, AZ-c)
 * - Internet Gateway: 인터넷 연결
 * - Route Table: IP 패킷 라우팅
 *
 * [L4 - Transport Layer] OSI 전송 계층 리소스
 * - NACL: Stateless 패킷 필터링 (서브넷 레벨)
 */
export class VpcStack extends cdk.Stack {
  // 다른 스택에서 참조할 수 있도록 VPC를 퍼블릭으로 노출
  // 他のスタックから参照できるようにVPCをパブリックで公開
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const { projectName, environment } = props;

    // ============================================================
    // VPC 생성
    // VPC作成
    //
    // VPC 선택 이유:
    // - 격리된 네트워크 환경 제공
    // - 보안 그룹, NACL 등 네트워크 보안 기능 활용
    // - 서브넷 분리로 리소스 구조화
    //
    // VPC選択理由:
    // - 分離されたネットワーク環境を提供
    // - セキュリティグループ、NACLなどネットワークセキュリティ機能活用
    // - サブネット分離でリソース構造化
    // ============================================================
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: `${projectName}-${environment}-vpc`,

      // CIDR 블록: 10.0.0.0/16 (65,536 IP 주소)
      // CIDRブロック: 10.0.0.0/16（65,536 IPアドレス）
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),

      // 가용 영역 2개 사용 (ALB 고가용성 요구사항)
      // アベイラビリティゾーン2つ使用（ALB高可用性要件）
      maxAzs: 2,

      // NAT Gateway 비용 절감: Private Subnet 없이 Public Subnet만 사용
      // NAT Gatewayコスト削減: Private Subnetなしで Public Subnetのみ使用
      // ⚠️ NAT Gateway 비용: ~$30-45/월 → 제거하여 FreeTier 유지
      // ⚠️ NAT Gatewayコスト: ~$30-45/月 → 削除してFreeTier維持
      natGateways: 0,

      // 서브넷 구성: Public Subnet만 생성
      // サブネット構成: Public Subnetのみ作成
      subnetConfiguration: [
        {
          // Public Subnet: 인터넷 게이트웨이를 통한 직접 인터넷 접근
          // Public Subnet: インターネットゲートウェイを通じた直接インターネットアクセス
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24, // /24 = 256 IP 주소 (10.0.1.0/24, 10.0.2.0/24)
        },
      ],

      // VPC 엔드포인트 비용 절감을 위해 기본 생성 비활성화
      // VPCエンドポイントコスト削減のためデフォルト作成無効化
      gatewayEndpoints: {},
    });

    // ============================================================
    // [L3] Internet Gateway (자동 생성)
    // インターネットゲートウェイ（自動作成）
    //
    // VPC 생성 시 Public Subnet이 있으면 자동으로 IGW가 생성됩니다.
    // VPC作成時にPublic Subnetがあると自動的にIGWが作成されます。
    //
    // 트래픽 흐름 (L3 - Network Layer):
    // トラフィックフロー（L3 - ネットワーク層）:
    // Internet → IGW → Route Table → Subnet → Instance
    // ============================================================

    // ============================================================
    // [L4] NACL 설정 (Stateless)
    // NACL設定（ステートレス）
    //
    // NACL vs Security Group:
    // - NACL: 서브넷 레벨, Stateless (인바운드/아웃바운드 각각 규칙 필요)
    // - SG: 인스턴스 레벨, Stateful (응답 트래픽 자동 허용)
    //
    // NACL vs セキュリティグループ:
    // - NACL: サブネットレベル、ステートレス（インバウンド/アウトバウンドそれぞれルール必要）
    // - SG: インスタンスレベル、ステートフル（レスポンストラフィック自動許可）
    //
    // 기본 NACL은 모든 트래픽을 허용합니다.
    // デフォルトNACLはすべてのトラフィックを許可します。
    // 추가 제한이 필요한 경우 커스텀 NACL을 생성할 수 있습니다.
    // 追加制限が必要な場合はカスタムNACLを作成できます。
    // ============================================================

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${projectName}-${environment}-vpc-id`,
    });

    new cdk.CfnOutput(this, 'PublicSubnetIds', {
      value: this.vpc.publicSubnets.map(s => s.subnetId).join(','),
      description: 'Public Subnet IDs',
      exportName: `${projectName}-${environment}-public-subnet-ids`,
    });
  }
}
