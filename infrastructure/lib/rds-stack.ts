import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

/**
 * RDS 스택 Props
 * RDSスタックProps
 */
export interface RdsStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly vpc: ec2.IVpc;
  readonly ec2SecurityGroup: ec2.ISecurityGroup;
}

/**
 * RDS PostgreSQL 스택
 * RDS PostgreSQLスタック
 *
 * Amazon RDS PostgreSQL을 사용한 관계형 데이터베이스
 * Amazon RDS PostgreSQLを使用したリレーショナルデータベース
 *
 * RDS PostgreSQL 선택 이유:
 * - FreeTier: db.t3.micro 750시간/월 + 20GB 스토리지 무료
 * - 완전 관리형 데이터베이스
 * - 자동 백업, 패치 관리
 * - Prisma/TypeORM 등 ORM 호환성
 *
 * RDS PostgreSQL選択理由:
 * - FreeTier: db.t3.micro 750時間/月 + 20GBストレージ無料
 * - 完全マネージドデータベース
 * - 自動バックアップ、パッチ管理
 * - Prisma/TypeORM等ORM互換性
 *
 * 비용 최적화 결정:
 * - Public Subnet 배치 (NAT Gateway 비용 절감)
 * - Security Group으로 EC2에서만 접근 허용
 *
 * コスト最適化決定:
 * - Public Subnet配置（NAT Gatewayコスト削減）
 * - Security GroupでEC2からのみアクセス許可
 *
 * ⚠️ 프로덕션 권장: Private Subnet + NAT Gateway
 * ⚠️ 本番推奨: Private Subnet + NAT Gateway
 */
export class RdsStack extends cdk.Stack {
  public readonly instance: rds.DatabaseInstance;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly secret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    const { projectName, environment, vpc, ec2SecurityGroup } = props;

    // ============================================================
    // [L4 - Transport Layer] Security Group
    // セキュリティグループ
    //
    // EC2 인스턴스에서만 PostgreSQL(5432) 접근 허용
    // EC2インスタンスからのみPostgreSQL(5432)アクセス許可
    //
    // 면접 대비:
    // "비용 최적화를 위해 RDS를 Public Subnet에 배치했지만,
    //  Security Group으로 EC2에서만 접근 가능하도록 제한했습니다.
    //  프로덕션에서는 Private Subnet + NAT Gateway를 권장합니다."
    //
    // 面接対策:
    // 「コスト最適化のためRDSをPublic Subnetに配置しましたが、
    //  Security GroupでEC2からのみアクセス可能に制限しました。
    //  本番環境ではPrivate Subnet + NAT Gatewayを推奨します。」
    // ============================================================
    this.securityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc,
      securityGroupName: `${projectName}-${environment}-sg-rds`,
      description: 'Security group for RDS PostgreSQL - EC2 access only',

      // 아웃바운드 트래픽 불필요 (RDS는 인바운드만 받음)
      // アウトバウンドトラフィック不要（RDSはインバウンドのみ受信）
      allowAllOutbound: false,
    });

    // EC2 Security Group에서만 PostgreSQL 포트 접근 허용
    // EC2 Security GroupからのみPostgreSQLポートアクセス許可
    this.securityGroup.addIngressRule(
      ec2SecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from EC2 only'
    );

    // ============================================================
    // Database Credentials (Secrets Manager)
    // データベース認証情報（Secrets Manager）
    //
    // Secrets Manager 자동 생성:
    // - 안전한 비밀번호 자동 생성
    // - 자동 교체 가능
    // - IAM 기반 접근 제어
    //
    // Secrets Manager自動作成:
    // - 安全なパスワード自動生成
    // - 自動ローテーション可能
    // - IAMベースアクセス制御
    // ============================================================
    const credentials = rds.Credentials.fromGeneratedSecret('postgres', {
      secretName: `${projectName}-${environment}-rds-credentials`,
    });

    // ============================================================
    // RDS PostgreSQL 인스턴스 생성
    // RDS PostgreSQLインスタンス作成
    //
    // db.t3.micro 선택 이유:
    // - FreeTier: 750시간/월 무료
    // - 2 vCPU, 1GB RAM
    // - 버스트 가능 성능 (MVP에 충분)
    //
    // db.t3.micro選択理由:
    // - FreeTier: 750時間/月無料
    // - 2 vCPU, 1GB RAM
    // - バースト可能パフォーマンス（MVPに十分）
    // ============================================================
    this.instance = new rds.DatabaseInstance(this, 'PostgresInstance', {
      instanceIdentifier: `${projectName}-${environment}-postgres`,

      // PostgreSQL 15 선택 (LTS, 안정성)
      // PostgreSQL 15選択（LTS、安定性）
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),

      // db.t3.micro: FreeTier 대상
      // db.t3.micro: FreeTier対象
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),

      vpc,

      // Public Subnet 배치 (비용 절감)
      // Public Subnet配置（コスト削減）
      // ⚠️ Security Group으로 보안 유지
      // ⚠️ Security Groupでセキュリティ維持
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },

      // Public 액세스 허용 (Security Group으로 제한)
      // Publicアクセス許可（Security Groupで制限）
      publiclyAccessible: true,

      securityGroups: [this.securityGroup],
      credentials,

      // 데이터베이스 이름
      // データベース名
      databaseName: `${projectName.replace(/-/g, '_')}_${environment}`,

      // 스토리지 설정 (FreeTier: 20GB)
      // ストレージ設定（FreeTier: 20GB）
      allocatedStorage: 20,
      maxAllocatedStorage: 20, // 자동 확장 비활성화 (비용 제어)
      storageType: rds.StorageType.GP2,

      // 암호화 활성화
      // 暗号化有効化
      storageEncrypted: true,

      // Multi-AZ 비활성화 (개발 환경, 비용 절감)
      // Multi-AZ無効化（開発環境、コスト削減）
      multiAz: false,

      // 자동 백업 설정
      // 自動バックアップ設定
      backupRetention: cdk.Duration.days(7),
      preferredBackupWindow: '03:00-04:00', // UTC (KST 12:00-13:00)

      // 유지보수 창
      // メンテナンスウィンドウ
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00', // UTC

      // 삭제 보호 비활성화 (개발 환경)
      // 削除保護無効化（開発環境）
      deletionProtection: false,

      // 스냅샷 비활성화 (개발 환경)
      // スナップショット無効化（開発環境）
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      // 성능 개선 도우미 비활성화 (FreeTier 범위 유지)
      // Performance Insights無効化（FreeTier範囲維持）
      enablePerformanceInsights: false,

      // CloudWatch 로그 내보내기
      // CloudWatchログエクスポート
      cloudwatchLogsExports: ['postgresql'],
      cloudwatchLogsRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,

      // 파라미터 그룹 (기본 사용)
      // パラメータグループ（デフォルト使用）
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        'DefaultParameterGroup',
        'default.postgres15'
      ),
    });

    // Secret 참조 저장
    // Secret参照保存
    this.secret = this.instance.secret!;

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'RdsEndpoint', {
      value: this.instance.dbInstanceEndpointAddress,
      description: 'RDS PostgreSQL Endpoint',
      exportName: `${projectName}-${environment}-rds-endpoint`,
    });

    new cdk.CfnOutput(this, 'RdsPort', {
      value: this.instance.dbInstanceEndpointPort,
      description: 'RDS PostgreSQL Port',
      exportName: `${projectName}-${environment}-rds-port`,
    });

    new cdk.CfnOutput(this, 'RdsSecretArn', {
      value: this.secret.secretArn,
      description: 'RDS Credentials Secret ARN',
      exportName: `${projectName}-${environment}-rds-secret-arn`,
    });

    new cdk.CfnOutput(this, 'RdsSecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      description: 'RDS Security Group ID',
      exportName: `${projectName}-${environment}-rds-sg-id`,
    });

    new cdk.CfnOutput(this, 'RdsDatabaseName', {
      value: `${projectName.replace(/-/g, '_')}_${environment}`,
      description: 'RDS Database Name',
      exportName: `${projectName}-${environment}-rds-db-name`,
    });
  }
}
