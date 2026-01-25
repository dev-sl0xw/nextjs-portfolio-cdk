#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EcrStack } from '../lib/ecr-stack';
import { Ec2Stack } from '../lib/ec2-stack';
import { AlbStack } from '../lib/alb-stack';

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

// TODO: CloudFrontStack - Task 2.6에서 추가 (albStack.alb 참조)

app.synth();
