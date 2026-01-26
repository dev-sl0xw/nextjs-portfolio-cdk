#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EcrStack } from '../lib/ecr-stack';
import { Ec2Stack } from '../lib/ec2-stack';
import { AlbStack } from '../lib/alb-stack';
import { CertificateStack } from '../lib/certificate-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { RdsStack } from '../lib/rds-stack';
import { ProfileBucketStack } from '../lib/profile-bucket-stack';

// 앱 인스턴스 생성
// アプリインスタンス作成
const app = new cdk.App();

// 환경 설정
// 環境設定
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// 프로젝트 공통 설정
// プロジェクト共通設定
const projectName = 'portfolio';
const environment = 'dev';

// 커스텀 도메인 설정
// カスタムドメイン設定
const domainName = 'vibe.er.ht';

// 공통 태그 적용 (aws-best-practices.md 규칙 준수)
// 共通タグ適用（aws-best-practices.md規則遵守）
cdk.Tags.of(app).add('Project', 'nextjs-portfolio');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');

// ============================================================
// 스택 생성
// スタック作成
// ============================================================

// VPC Stack (Task 2.2)
// 네트워크 인프라 기반
// ネットワークインフラ基盤
const vpcStack = new VpcStack(app, 'VpcStack', {
  env,
  projectName,
  environment,
  description: 'VPC infrastructure for portfolio site',
});

// ECR Stack (Task 2.3)
// Docker 이미지 레지스트리
// Dockerイメージレジストリ
const ecrStack = new EcrStack(app, 'EcrStack', {
  env,
  projectName,
  environment,
  description: 'ECR repository for frontend Docker images',
});

// EC2 Stack (Task 2.4)
// Next.js Docker 컨테이너 실행 서버
// Next.js Dockerコンテナ実行サーバー
const ec2Stack = new Ec2Stack(app, 'Ec2Stack', {
  env,
  projectName,
  environment,
  vpc: vpcStack.vpc,
  ecrRepository: ecrStack.repository,
  description: 'EC2 instance for running Next.js container',
});
ec2Stack.addDependency(vpcStack);
ec2Stack.addDependency(ecrStack);

// ALB Stack (Task 2.5)
// L7 로드밸런서
// L7ロードバランサー
const albStack = new AlbStack(app, 'AlbStack', {
  env,
  projectName,
  environment,
  vpc: vpcStack.vpc,
  ec2Instance: ec2Stack.instance,
  description: 'Application Load Balancer for traffic distribution',
});
albStack.addDependency(ec2Stack);

// Certificate Stack (us-east-1 리전 필수)
// SSL/TLS 인증서 - CloudFront용은 반드시 us-east-1에 생성
// SSL/TLS証明書 - CloudFront用は必ずus-east-1に作成
const certificateStack = new CertificateStack(app, 'CertificateStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',  // CloudFront 인증서는 us-east-1 필수
  },
  projectName,
  environment,
  domainName,
  description: 'ACM Certificate for CloudFront custom domain',
  crossRegionReferences: true,  // cross-region 참조 활성화
});

// CloudFront Stack (Task 2.6)
// 글로벌 CDN + S3 에러 페이지 + 커스텀 도메인
// グローバルCDN + S3エラーページ + カスタムドメイン
const cloudFrontStack = new CloudFrontStack(app, 'CloudFrontStack', {
  env,
  projectName,
  environment,
  alb: albStack.alb,
  domainName,
  certificate: certificateStack.certificate,
  description: 'CloudFront CDN with S3 error pages and custom domain',
  crossRegionReferences: true,  // cross-region 참조 활성화
});
cloudFrontStack.addDependency(albStack);
cloudFrontStack.addDependency(certificateStack);

// Cognito Stack
// 사용자 인증 관리 (50,000 MAU 무료)
// ユーザー認証管理（50,000 MAU無料）
const cognitoStack = new CognitoStack(app, 'CognitoStack', {
  env,
  projectName,
  environment,
  description: 'Cognito User Pool for authentication',
});

// RDS Stack
// PostgreSQL 데이터베이스 (db.t3.micro FreeTier)
// PostgreSQLデータベース（db.t3.micro FreeTier）
const rdsStack = new RdsStack(app, 'RdsStack', {
  env,
  projectName,
  environment,
  vpc: vpcStack.vpc,
  ec2SecurityGroup: ec2Stack.securityGroup,
  description: 'RDS PostgreSQL database',
});
rdsStack.addDependency(vpcStack);
rdsStack.addDependency(ec2Stack);

// Profile Bucket Stack
// 프로필 이미지 S3 버킷
// プロフィール画像S3バケット
const profileBucketStack = new ProfileBucketStack(app, 'ProfileBucketStack', {
  env,
  projectName,
  environment,
  description: 'S3 bucket for profile images',
});

app.synth();
