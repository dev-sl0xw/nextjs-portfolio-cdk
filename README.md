# Next.js Portfolio Site with AWS CDK

# Next.js ポートフォリオサイト（AWS CDK）

면접 시연용 포트폴리오 사이트 MVP입니다. AWS CDK를 사용하여 인프라를 구성하고, Next.js로 프론트엔드를 개발합니다.

面接デモ用ポートフォリオサイトMVPです。AWS CDKを使用してインフラを構成し、Next.jsでフロントエンドを開発します。

---

## 아키텍처 / アーキテクチャ

```text
                              Internet
                                  │
                                  ▼
                         ┌───────────────┐
                         │  CloudFront   │
                         │  (HTTPS/ACM)  │
                         └───────────────┘
                          │           │
                    (메인 트래픽)  (에러 시)
                          │           │
                          ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                      VPC (10.0.0.0/16)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Internet Gateway                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│       ┌────────────────────┼────────────────────┐           │
│       ▼                    │                    ▼           │
│  ┌──────────┐              │              ┌──────────┐      │
│  │ Public   │              │              │ Public   │      │
│  │ Subnet   │              │              │ Subnet   │      │
│  │ AZ-a     │              │              │ AZ-c     │      │
│  │10.0.1.0  │              │              │10.0.2.0  │      │
│  │ /24      │              │              │ /24      │      │
│  │          │              │              │          │      │
│  │ ┌──────┐ │◄─────────────┼─────────────▶│ ┌──────┐ │      │
│  │ │ ALB  │ │              │              │ │ ALB  │ │      │
│  │ └──────┘ │              │              │ └──────┘ │      │
│  │    │     │              │              │          │      │
│  │    ▼     │              │              │          │      │
│  │ ┌──────┐ │              │              │          │      │
│  │ │ EC2  │ │              │              │          │      │  ┌─────────┐
│  │ │t2.mic│ │              │              │          │      │  │   S3    │
│  │ │Docker│ │              │              │          │      │  │ (404    │
│  │ │Next. │ │              │              │          │      │  │  page)  │
│  │ │ js   │ │              │              │          │      │  │ + OAC   │
│  │ └──────┘ │              │              │          │      │  └─────────┘
│  └──────────┘              │              └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 기술 스택 / 技術スタック

### 인프라 / インフラ

| 구분 | 기술 |
| --- | --- |
| IaC | AWS CDK (TypeScript) |
| CDN | CloudFront + ACM |
| 컴퓨팅 | EC2 (t2.micro, FreeTier) + Docker |
| 로드밸런서 | ALB (Application Load Balancer) |
| 스토리지 | S3 (에러 페이지, 영상) |
| 네트워크 | VPC, Public Subnet, Internet Gateway |

### 프론트엔드 / フロントエンド

| 구분 | 기술 |
| --- | --- |
| 메인 사이트 | Next.js 14+ |
| 에러 페이지 | Astro |
| 스타일링 | Tailwind CSS |
| 언어 | TypeScript |

### CI/CD

| 구분 | 기술 |
| --- | --- |
| 파이프라인 | GitHub Actions |
| 컨테이너 레지스트리 | Amazon ECR |

---

## 프로젝트 구조 / プロジェクト構造

```text
nextjs-portfolio-cdk/
│
├── README.md                 # 이 파일 / このファイル
├── requirements.md           # 요구사항 정의서 / 要件定義書
│
├── docs/
│   └── plans/                # 설계 문서 / 設計ドキュメント
│
├── rules/                    # 가드레일 설정 / ガードレール設定
│   ├── code-style.md
│   ├── aws-best-practices.md
│   ├── security.md
│   ├── network-security.md
│   └── bilingual-comments.md
│
├── infrastructure/           # AWS CDK 코드 / AWS CDKコード
│   ├── bin/
│   │   └── app.ts
│   └── lib/
│       ├── vpc-stack.ts
│       ├── ec2-stack.ts
│       ├── alb-stack.ts
│       ├── cloudfront-stack.ts
│       └── ecr-stack.ts
│
├── frontend/                 # Next.js 앱 / Next.jsアプリ
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       └── components/
│
├── error-pages/              # Astro 404 페이지 / Astro 404ページ
│   └── src/
│       └── pages/
│           └── 404.astro
│
└── .github/
    └── workflows/            # CI/CD 파이프라인 / CI/CDパイプライン
        ├── deploy-frontend.yml
        └── deploy-error-pages.yml
```

---

## 시작하기 / はじめに

### 사전 요구사항 / 前提条件

- Node.js 18+
- AWS CLI (configured)
- AWS CDK CLI (`npm install -g aws-cdk`)
- Docker

### 인프라 배포 / インフラデプロイ

```bash
# CDK 프로젝트로 이동 / CDKプロジェクトに移動
cd infrastructure

# 의존성 설치 / 依存関係インストール
npm install

# CDK 부트스트랩 (최초 1회) / CDKブートストラップ（初回のみ）
cdk bootstrap

# 인프라 배포 / インフラデプロイ
cdk deploy --all
```

### 프론트엔드 개발 / フロントエンド開発

```bash
# Next.js 프로젝트로 이동 / Next.jsプロジェクトに移動
cd frontend

# 의존성 설치 / 依存関係インストール
npm install

# 개발 서버 실행 / 開発サーバー起動
npm run dev
```

### 에러 페이지 개발 / エラーページ開発

```bash
# Astro 프로젝트로 이동 / Astroプロジェクトに移動
cd error-pages

# 의존성 설치 / 依存関係インストール
npm install

# 개발 서버 실행 / 開発サーバー起動
npm run dev
```

---

## 비용 관리 / コスト管理

이 프로젝트는 AWS FreeTier 범위 내에서 운영되도록 설계되었습니다.

このプロジェクトはAWS FreeTier範囲内で運用されるよう設計されています。

### FreeTier 리소스 / FreeTierリソース

| 리소스 | FreeTier 한도 |
| --- | --- |
| EC2 (t2.micro) | 750시간/월 (12개월) |
| ALB | 750시간/월 (12개월) |
| S3 | 5GB 스토리지, 20,000 GET |
| CloudFront | 1TB 전송, 10,000,000 요청 |
| ECR | 500MB 스토리지 |

### 비용 절감 결정 / コスト削減決定

| 항목 | 결정 | 절감액 |
| --- | --- | --- |
| NAT Gateway | ❌ 제거 | ~$30-45/월 |
| Private Subnet | ❌ 제거 | NAT Gateway 불필요 |
| WAF | ❌ 문서화만 | ~$6-7/월 |
| Route53 | ❌ 문서화만 | ~$0.50/월 |

### 리소스 정리 / リソース整理

면접 종료 후 반드시 리소스를 정리하세요.

面接終了後、必ずリソースを整理してください。

```bash
# 모든 스택 삭제 / 全スタック削除
cd infrastructure
cdk destroy --all
```

---

## 주석 규칙 / コメントルール

이 프로젝트의 모든 코드 주석은 한국어와 일본어로 작성됩니다.

このプロジェクトの全コードコメントは韓国語と日本語で記述されます。

```typescript
// 사용자 인증을 처리하는 함수
// ユーザー認証を処理する関数
function handleAuth() {
  // ...
}
```

---

## 문서 / ドキュメント

| 문서 | 설명 |
| --- | --- |
| [requirements.md](./requirements.md) | 상세 요구사항 정의서 |
| [docs/plans/](./docs/plans/) | 설계 문서 |
| [rules/](./rules/) | 코딩 가드레일 |

---

## 라이선스 / ライセンス

이 프로젝트는 개인 포트폴리오 목적으로 작성되었습니다.

このプロジェクトは個人ポートフォリオ目的で作成されました。
