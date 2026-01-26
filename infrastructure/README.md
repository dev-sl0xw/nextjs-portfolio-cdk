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
┌─────────────────────────────────────────────────────────────┐
│                       CDK App                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  VPC Stack   │───▶│  ALB Stack   │───▶│CloudFront    │   │
│  │              │    │              │    │  Stack       │   │
│  │ - VPC        │    │ - ALB        │    │ - CloudFront │   │
│  │ - Subnets    │    │ - Target Grp │    │ - S3 Bucket  │   │
│  │ - IGW        │    │ - Security   │    │ - OAC        │   │
│  └──────────────┘    │   Group      │    │ - Custom Dom │   │
│         │            └──────────────┘    └──────────────┘   │
│         │                   │                   ▲            │
│         ▼                   ▼                   │            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  EC2 Stack   │    │  ECR Stack   │    │ Certificate  │   │
│  │              │    │              │    │  Stack       │   │
│  │ - EC2        │    │ - ECR Repo   │    │ (us-east-1)  │   │
│  │ - User Data  │    │              │    │ - ACM Cert   │   │
│  │ - IAM Role   │    │              │    │   (DNS検証)   │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
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
    ├── vpc-stack.ts         # VPC 스택
    ├── ec2-stack.ts         # EC2 스택
    ├── alb-stack.ts         # ALB 스택
    ├── certificate-stack.ts # ACM 인증서 (us-east-1)
    ├── cloudfront-stack.ts  # CloudFront 스택
    └── ecr-stack.ts         # ECR 스택
```

---

## 참고 문서 / 参考ドキュメント

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Patterns](https://cdkpatterns.com/)
