import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

/**
 * EC2 스택 Props
 * EC2スタックProps
 */
export interface Ec2StackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly vpc: ec2.IVpc;
  readonly ecrRepository: ecr.IRepository;
  // RDS 및 Cognito 환경변수 전달용 (선택적)
  // RDSおよびCognito環境変数伝達用（オプション）
  readonly rdsSecretArn?: string;
  readonly cognitoUserPoolId?: string;
  readonly cognitoClientId?: string;
}

/**
 * EC2 인스턴스 스택
 * EC2インスタンススタック
 *
 * Next.js Docker 컨테이너를 실행하는 EC2 인스턴스
 * Next.js Dockerコンテナを実行するEC2インスタンス
 *
 * EC2 선택 이유:
 * - FreeTier: t2.micro 750시간/월 무료
 * - Docker 실행 가능
 * - 간단한 설정으로 빠른 배포
 *
 * EC2選択理由:
 * - FreeTier: t2.micro 750時間/月無料
 * - Docker実行可能
 * - シンプルな設定で素早いデプロイ
 *
 * 대안 검토:
 * - ECS Fargate: 관리 편의성 높지만 FreeTier 없음
 * - Lambda: 콜드 스타트 이슈, SSR에 부적합
 *
 * 代替案検討:
 * - ECS Fargate: 管理便宜性高いがFreeTierなし
 * - Lambda: コールドスタート問題、SSRに不適切
 */
export class Ec2Stack extends cdk.Stack {
  // 다른 스택에서 참조할 수 있도록 퍼블릭으로 노출
  // 他のスタックから参照できるようにパブリックで公開
  public readonly instance: ec2.Instance;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);

    const { projectName, environment, vpc, ecrRepository, rdsSecretArn, cognitoUserPoolId, cognitoClientId } = props;

    // ============================================================
    // [L4 - Transport Layer] Security Group (Stateful)
    // セキュリティグループ（ステートフル）
    //
    // Security Group vs NACL:
    // - SG: 인스턴스 레벨, Stateful (응답 자동 허용)
    // - NACL: 서브넷 레벨, Stateless (응답도 명시 필요)
    //
    // Stateful 의미:
    // - 인바운드 허용 시 응답 아웃바운드 자동 허용
    // - 아웃바운드 허용 시 응답 인바운드 자동 허용
    //
    // Stateful意味:
    // - インバウンド許可時にレスポンスアウトバウンド自動許可
    // - アウトバウンド許可時にレスポンスインバウンド自動許可
    // ============================================================
    this.securityGroup = new ec2.SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc,
      securityGroupName: `${projectName}-${environment}-sg-ec2`,
      description: 'Security group for EC2 instance running Next.js',

      // 기본적으로 모든 아웃바운드 허용 (Docker 이미지 pull 등)
      // デフォルトですべてのアウトバウンド許可（Dockerイメージpull等）
      allowAllOutbound: true,
    });

    // SSH 접근 허용 (개발/디버깅 용도)
    // SSHアクセス許可（開発/デバッグ用途）
    // TODO: 프로덕션에서는 특정 IP로 제한 필요
    // TODO: 本番環境では特定IPに制限が必要
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access - DEVELOPMENT ONLY'
    );

    // Next.js 애플리케이션 포트 (ALB에서 접근)
    // Next.jsアプリケーションポート（ALBからアクセス）
    // 실제로는 ALB Security Group에서만 허용하도록 Task 2.5에서 수정
    // 実際にはALB Security Groupからのみ許可するようにTask 2.5で修正
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow Next.js app port - will be restricted to ALB in Task 2.5'
    );

    // ============================================================
    // IAM Role 생성
    // IAMロール作成
    //
    // EC2가 ECR에서 Docker 이미지를 pull하기 위한 권한
    // EC2がECRからDockerイメージをpullするための権限
    //
    // 최소 권한 원칙 적용:
    // - ECR pull 권한만 부여
    // - SSM Session Manager 권한 (SSH 대안)
    //
    // 最小権限原則適用:
    // - ECR pull権限のみ付与
    // - SSM Session Manager権限（SSH代替）
    // ============================================================
    const ec2Role = new iam.Role(this, 'Ec2Role', {
      roleName: `${projectName}-${environment}-ec2-role`,
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'IAM role for EC2 to pull images from ECR',
    });

    // ECR pull 권한 추가
    // ECR pull権限追加
    ecrRepository.grantPull(ec2Role);

    // SSM Session Manager 권한 (SSH 없이 인스턴스 접속 가능)
    // SSM Session Manager権限（SSHなしでインスタンス接続可能）
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    // Secrets Manager 읽기 권한 (RDS 인증정보 조회용)
    // Secrets Manager読み取り権限（RDS認証情報取得用）
    if (rdsSecretArn) {
      ec2Role.addToPolicy(new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [rdsSecretArn],
        effect: iam.Effect.ALLOW,
      }));
    }

    // ============================================================
    // User Data 스크립트
    // User Dataスクリプト
    //
    // EC2 인스턴스 시작 시 자동으로 Docker 설치 및 설정
    // EC2インスタンス起動時に自動でDockerインストールおよび設定
    // ============================================================
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -e',

      // 시스템 업데이트
      // システムアップデート
      'yum update -y',

      // Docker 설치
      // Dockerインストール
      'yum install -y docker',
      'systemctl start docker',
      'systemctl enable docker',

      // ec2-user를 docker 그룹에 추가
      // ec2-userをdockerグループに追加
      'usermod -aG docker ec2-user',

      // AWS CLI v2 설치 (ECR 인증용)
      // AWS CLI v2インストール（ECR認証用）
      'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"',
      'unzip -q awscliv2.zip',
      './aws/install',

      // jq 설치 (JSON 파싱용)
      // jqインストール（JSONパース用）
      'yum install -y jq',

      // 환경변수 파일 디렉토리 생성
      // 環境変数ファイルディレクトリ作成
      'mkdir -p /home/ec2-user/app',
      'touch /home/ec2-user/app/.env',
      'chown ec2-user:ec2-user /home/ec2-user/app/.env',

      // 설치 완료 로그
      // インストール完了ログ
      'echo "Docker and AWS CLI installation completed" >> /var/log/user-data.log'
    );

    // RDS 및 Cognito 환경변수 설정 스크립트 추가
    // RDSおよびCognito環境変数設定スクリプト追加
    if (rdsSecretArn) {
      userData.addCommands(
        '# RDS 환경변수 설정',
        '# RDS環境変数設定',
        `RDS_SECRET_ARN="${rdsSecretArn}"`,
        'REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)',
        '',
        '# Secrets Manager에서 RDS 인증정보 조회',
        '# Secrets ManagerからRDS認証情報取得',
        'RDS_SECRET=$(aws secretsmanager get-secret-value --secret-id $RDS_SECRET_ARN --region $REGION --query SecretString --output text)',
        '',
        '# JSON에서 값 추출',
        '# JSONから値抽出',
        'DB_HOST=$(echo $RDS_SECRET | jq -r .host)',
        'DB_PORT=$(echo $RDS_SECRET | jq -r .port)',
        'DB_NAME=$(echo $RDS_SECRET | jq -r .dbname)',
        'DB_USER=$(echo $RDS_SECRET | jq -r .username)',
        'DB_PASSWORD=$(echo $RDS_SECRET | jq -r .password)',
        '',
        '# 환경변수 파일에 작성',
        '# 環境変数ファイルに書き込み',
        'cat > /home/ec2-user/app/.env << EOF',
        'DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME',
        'DB_HOST=$DB_HOST',
        'DB_PORT=$DB_PORT',
        'DB_NAME=$DB_NAME',
        'DB_USER=$DB_USER',
        'DB_PASSWORD=$DB_PASSWORD',
        'EOF',
        '',
        'echo "RDS environment variables configured" >> /var/log/user-data.log'
      );
    }

    // Cognito 환경변수 추가
    // Cognito環境変数追加
    if (cognitoUserPoolId && cognitoClientId) {
      userData.addCommands(
        '# Cognito 환경변수 설정',
        '# Cognito環境変数設定',
        'cat >> /home/ec2-user/app/.env << EOF',
        `NEXT_PUBLIC_COGNITO_USER_POOL_ID=${cognitoUserPoolId}`,
        `NEXT_PUBLIC_COGNITO_CLIENT_ID=${cognitoClientId}`,
        `NEXT_PUBLIC_COGNITO_REGION=ap-northeast-1`,
        'EOF',
        '',
        'chown ec2-user:ec2-user /home/ec2-user/app/.env',
        'chmod 600 /home/ec2-user/app/.env',
        'echo "Cognito environment variables configured" >> /var/log/user-data.log'
      );
    }

    // ============================================================
    // EC2 인스턴스 생성
    // EC2インスタンス作成
    //
    // t2.micro 선택 이유:
    // - FreeTier: 750시간/월 무료
    // - 1 vCPU, 1GB RAM (MVP에 충분)
    //
    // t2.micro選択理由:
    // - FreeTier: 750時間/月無料
    // - 1 vCPU, 1GB RAM（MVPに十分）
    // ============================================================
    this.instance = new ec2.Instance(this, 'WebServer', {
      instanceName: `${projectName}-${environment}-ec2-web`,
      vpc,

      // SSH 키페어 (GitHub Actions 배포용)
      // SSHキーペア（GitHub Actionsデプロイ用）
      keyName: `${projectName}-${environment}-keypair`,

      // Public Subnet에 배치 (인터넷 접근 가능)
      // Public Subnetに配置（インターネットアクセス可能）
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },

      // t2.micro: FreeTier 대상 인스턴스 타입
      // t2.micro: FreeTier対象インスタンスタイプ
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),

      // Amazon Linux 2023 (최신 보안 패치 적용)
      // Amazon Linux 2023（最新セキュリティパッチ適用）
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),

      securityGroup: this.securityGroup,
      role: ec2Role,
      userData,

      // EBS 볼륨 설정 (FreeTier: 30GB까지 무료)
      // EBSボリューム設定（FreeTier: 30GBまで無料）
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(20, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
    });

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'InstanceId', {
      value: this.instance.instanceId,
      description: 'EC2 Instance ID',
      exportName: `${projectName}-${environment}-ec2-instance-id`,
    });

    new cdk.CfnOutput(this, 'InstancePublicIp', {
      value: this.instance.instancePublicIp,
      description: 'EC2 Instance Public IP',
      exportName: `${projectName}-${environment}-ec2-public-ip`,
    });

    new cdk.CfnOutput(this, 'SecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      description: 'EC2 Security Group ID',
      exportName: `${projectName}-${environment}-ec2-sg-id`,
    });
  }
}
