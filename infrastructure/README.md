# Infrastructure (AWS CDK)

# インフラストラクチャ（AWS CDK）

AWS CDK를 사용한 포트폴리오 사이트 인프라 코드입니다.

AWS CDKを使用したポートフォリオサイトインフラコードです。

---

## 🌐 배포 URL / デプロイURL

| 도메인 | URL |
| --- | --- |
| **Custom Domain** | [https://vibe.er.ht](https://vibe.er.ht) |
| **CloudFront** | [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net) |

---

## 스택 구성 / スタック構成

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│                                CDK App                                         │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  VPC Stack   │───▶│  ALB Stack   │───▶│CloudFront    │◄───│ Certificate  │ │
│  │              │    │              │    │  Stack       │    │  Stack       │ │
│  │ - VPC        │    │ - ALB        │    │ - CloudFront │    │ (us-east-1)  │ │
│  │ - Subnets    │    │ - Target Grp │    │ - S3 Bucket  │    │ - ACM Cert   │ │
│  │ - IGW        │    │ - Security   │    │ - OAC        │    │   (DNS検証)   │ │
│  └──────────────┘    │   Group      │    │ - Custom Dom │    └──────────────┘ │
│         │            └──────────────┘    └──────────────┘                     │
│         │                   │                   ▲                              │
│         ▼                   ▼                   │                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                     │
│  │  EC2 Stack   │    │  ECR Stack   │    │Profile Bucket│                     │
│  │              │    │              │    │  Stack       │                     │
│  │ - EC2        │    │ - ECR Repo   │    │ - S3 Bucket  │                     │
│  │ - User Data  │    │              │    │ - CORS       │                     │
│  │ - IAM Role   │    │              │    │ - Presigned  │                     │
│  └──────────────┘    └──────────────┘    └──────────────┘                     │
│         │                                                                      │
│         │            ┌──────────────┐    ┌──────────────┐                     │
│         └───────────▶│  RDS Stack   │    │Cognito Stack │                     │
│                      │              │    │              │                     │
│                      │ - PostgreSQL │    │ - User Pool  │                     │
│                      │ - Secrets Mgr│    │ - App Client │                     │
│                      │ - Security   │    │ - OAuth/OIDC │                     │
│                      └──────────────┘    └──────────────┘                     │
│                                                                                │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 스택 상세 / スタック詳細

| 스택 | 파일 | 리전 | 리소스 |
| --- | --- | --- | --- |
| **VPC Stack** | `lib/vpc-stack.ts` | ap-northeast-1 | VPC, Public Subnets (2 AZ), Internet Gateway |
| **EC2 Stack** | `lib/ec2-stack.ts` | ap-northeast-1 | EC2 (t2.micro), Security Group, IAM Role, User Data |
| **ALB Stack** | `lib/alb-stack.ts` | ap-northeast-1 | Application Load Balancer, Target Group, Listener |
| **Certificate Stack** | `lib/certificate-stack.ts` | **us-east-1** | ACM Certificate (DNS Validation) |
| **CloudFront Stack** | `lib/cloudfront-stack.ts` | ap-northeast-1 | CloudFront Distribution, S3 Bucket (Error Pages), OAC, Custom Domain |
| **ECR Stack** | `lib/ecr-stack.ts` | ap-northeast-1 | ECR Repository |
| **Cognito Stack** | `lib/cognito-stack.ts` | ap-northeast-1 | User Pool, User Pool Client, OAuth/OIDC |
| **RDS Stack** | `lib/rds-stack.ts` | ap-northeast-1 | PostgreSQL 15 (db.t3.micro), Security Group, Secrets Manager |
| **Profile Bucket Stack** | `lib/profile-bucket-stack.ts` | ap-northeast-1 | S3 Bucket (Profile Images), CORS, Lifecycle Rules |

---

## 주요 설계 결정 / 主要設計決定

### 1. Public Subnet Only (NAT Gateway 제거)

```text
비용 절감: ~$30-45/월 절감
コスト削減: ~$30-45/月削減
```

- EC2를 Public Subnet에 배치
- Internet Gateway를 통한 직접 인터넷 접속
- 보안 그룹으로 인바운드 트래픽 제어

### 2. CloudFront + ALB + Custom Domain 구조

```text
User → vibe.er.ht → CloudFront (HTTPS/ACM) → ALB (HTTP) → EC2
```

- CloudFront에서 HTTPS 종료 (ACM 인증서)
- ALB-EC2 구간은 HTTP (비용 절감)
- 커스텀 도메인: `vibe.er.ht`
- ACM 인증서: us-east-1 리전 (CloudFront 필수)
- DNS 검증 방식 사용 (외부 DNS 관리자에게 CNAME 추가)

### 3. S3 Origin Access Control (OAC)

- S3 버킷 퍼블릭 액세스 완전 차단
- CloudFront를 통해서만 접근 가능
- 에러 페이지 및 정적 에셋 호스팅

### 4. Cognito 인증 / Cognito認証

```text
선택 이유: 50,000 MAU 무료 (FreeTier 영구)
選択理由: 50,000 MAU無料（FreeTier永久）
```

- User Pool: 이메일 기반 로그인
- OAuth 2.0 / OIDC 표준 지원
- SRP (Secure Remote Password) 인증
- 커스텀 속성: userType (jobseeker/company)

### 5. RDS PostgreSQL / RDS PostgreSQL

```text
비용 최적화: Public Subnet 배치 (NAT Gateway 비용 절감)
コスト最適化: Public Subnet配置（NAT Gatewayコスト削減）
```

- db.t3.micro: FreeTier 대상 (750시간/월)
- PostgreSQL 15 (LTS, 안정성)
- Secrets Manager: 인증정보 자동 생성 및 관리
- Security Group: EC2에서만 접근 허용

### 6. 프로필 이미지 S3 / プロフィール画像S3

```text
이원화 전략:
二元化戦略:
- 구직자: Presigned URL로 동적 업로드
- 求職者: Presigned URLで動的アップロード
- 기업 로고: GitHub Actions로 정적 배포
- 企業ロゴ: GitHub Actionsで静的デプロイ
```

- 퍼블릭 액세스 완전 차단
- CloudFront OAC를 통한 읽기 전용 접근
- Presigned URL (5분 만료)로 업로드

### 7. MVP vs Production 구성 / MVP vs Production構成

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  MVP (현재/現在)                    │  Production 권장/推奨              │
├─────────────────────────────────────────────────────────────────────────┤
│  RDS: Public Subnet (단일 AZ)       │  RDS: Private Subnet (Multi-AZ)    │
│  RDS Failover: 없음                 │  RDS Failover: 자동 (1-2분)         │
│  Read Replica: 없음                 │  Read Replica: 읽기 분산 권장       │
│  NAT Gateway: 없음 (비용 절감)      │  NAT Gateway: 필수 (~$30-45/월)     │
│  서브넷: 10.0.1.0/24, 10.0.2.0/24   │  +10.0.11.0/24, 10.0.21.0/24 (DB)  │
│  WAF: 없음                          │  AWSManagedRulesCommonRuleSet       │
│  백업: 7일                          │  백업: 30일 + 크로스 리전           │
└─────────────────────────────────────────────────────────────────────────┘
```

> ⚠️ 현재 RDS Public Subnet 배치는 비용 최적화 선택이며, Security Group으로 EC2에서만 접근 허용
> ⚠️ 現在のRDS Public Subnet配置はコスト最適化選択であり、Security GroupでEC2からのみアクセス許可

---

## 명령어 / コマンド

```bash
# 의존성 설치 / 依存関係インストール
npm install

# TypeScript 컴파일 / TypeScriptコンパイル
npm run build

# 변경 감지 컴파일 / 変更検知コンパイル
npm run watch

# 유닛 테스트 / ユニットテスト
npm run test

# CloudFormation 템플릿 생성 / CloudFormationテンプレート生成
npx cdk synth

# 배포 상태 비교 / デプロイ状態比較
npx cdk diff

# 전체 스택 배포 / 全スタックデプロイ
npx cdk deploy --all

# 전체 스택 삭제 / 全スタック削除
npx cdk destroy --all
```

---

## 환경 설정 / 環境設定

### cdk.json 주요 설정

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "context": {
    "projectName": "portfolio",
    "environment": "dev"
  }
}
```

### 환경 변수 (bin/app.ts)

```typescript
const projectName = 'portfolio';
const environment = 'dev';
```

---

## 출력값 / 出力値

배포 후 다음 출력값을 확인할 수 있습니다:

デプロイ後、以下の出力値を確認できます:

| 출력 | 설명 |
| --- | --- |
| `CustomDomainUrl` | 커스텀 도메인 URL (https://vibe.er.ht) |
| `DistributionDomainName` | CloudFront 도메인 (접속 URL) |
| `DistributionId` | CloudFront Distribution ID |
| `CertificateArn` | ACM 인증서 ARN (us-east-1) |
| `ErrorPagesBucketName` | S3 에러 페이지 버킷명 |
| `AlbDnsName` | ALB DNS 이름 |
| `EcrRepositoryUri` | ECR 리포지토리 URI |
| `UserPoolId` | Cognito User Pool ID |
| `UserPoolClientId` | Cognito User Pool Client ID |
| `RdsEndpoint` | RDS PostgreSQL 엔드포인트 |
| `RdsSecretArn` | RDS 인증정보 Secrets Manager ARN |
| `ProfileBucketName` | S3 프로필 이미지 버킷명 |

---

## 디렉토리 구조 / ディレクトリ構造

```text
infrastructure/
├── README.md           # 이 파일 / このファイル
├── package.json
├── cdk.json            # CDK 설정 / CDK設定
├── tsconfig.json
├── bin/
│   └── app.ts          # CDK App 엔트리포인트 / エントリーポイント
└── lib/
    ├── vpc-stack.ts             # VPC 스택
    ├── ec2-stack.ts             # EC2 스택
    ├── alb-stack.ts             # ALB 스택
    ├── certificate-stack.ts     # ACM 인증서 (us-east-1)
    ├── cloudfront-stack.ts      # CloudFront 스택
    ├── ecr-stack.ts             # ECR 스택
    ├── cognito-stack.ts         # Cognito 인증 스택
    ├── rds-stack.ts             # RDS PostgreSQL 스택
    └── profile-bucket-stack.ts  # 프로필 이미지 S3 스택
```

---

## 참고 문서 / 参考ドキュメント

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Patterns](https://cdkpatterns.com/)
