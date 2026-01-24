#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

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

// TODO: 각 스택은 Task 2.2 ~ 2.6에서 순차적으로 추가 예정
// TODO: 各スタックはTask 2.2 ~ 2.6で順次追加予定

// VpcStack: Task 2.2에서 추가
// EcrStack: Task 2.3에서 추가
// Ec2Stack: Task 2.4에서 추가
// AlbStack: Task 2.5에서 추가
// CloudFrontStack: Task 2.6에서 추가

app.synth();
