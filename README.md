# Next.js Portfolio Site with AWS CDK

# Next.js ポートフォリオサイト（AWS CDK）

면접 시연용 포트폴리오 사이트 MVP입니다. AWS CDK를 사용하여 인프라를 구성하고, Next.js로 프론트엔드를 개발합니다.

面接デモ用ポートフォリオサイトMVPです。AWS CDKを使用してインフラを構成し、Next.jsでフロントエンドを開発します。

---

## 🤖 Vibe Coding with Claude Code CLI

이 프로젝트는 **Claude Code CLI**를 사용한 **Vibe Coding**으로 개발되었습니다.

このプロジェクトは**Claude Code CLI**を使用した**Vibe Coding**で開発されました。

### 개발 기간 / 開発期間

| 항목 | 내용 |
| --- | --- |
| 시작일 | 2026-01-25 |
| 완료일 | 2026-01-26 |
| **총 소요 시간** | **약 24시간 (2일에 걸쳐)** |

### Claude Code 설정 / Claude Code設定

#### MCP Servers

| MCP Server | 용도 |
| --- | --- |
| `plugin:github` | GitHub 연동 (PR, Issues, Repository 관리) |
| `plugin:playwright` | 브라우저 자동화 테스트, 스크린샷 |
| `plugin:serena` | 코드베이스 시맨틱 검색 및 분석 |
| `plugin:context7` | 라이브러리 문서 검색 |
| `sequential-thinking` | 복잡한 문제 단계별 사고 |

#### Skills

| Skill | 용도 |
| --- | --- |
| `superpowers:brainstorming` | 아이디어 구체화 및 요구사항 정리 |
| `superpowers:writing-plans` | 구현 계획 수립 |
| `superpowers:executing-plans` | 계획 기반 단계별 구현 |
| `frontend-design:frontend-design` | 고품질 프론트엔드 UI 개발 |

#### Guardrails (rules/)

| 가드레일 | 설명 |
| --- | --- |
| `code-style.md` | 코드 스타일 규칙 |
| `aws-best-practices.md` | AWS 모범 사례 |
| `security.md` | 보안 가드레일 |
| `network-security.md` | 네트워크 보안 (OSI 7계층) |
| `bilingual-comments.md` | 한국어/일본어 이중 주석 규칙 |

### Vibe Coding 워크플로우 / Vibe Codingワークフロー

```text
1. 브레인스토밍 → requirements.md 작성
   ブレインストーミング → requirements.md作成

2. 설계 문서 작성 → docs/plans/
   設計ドキュメント作成 → docs/plans/

3. 가드레일 설정 → rules/
   ガードレール設定 → rules/

4. 인프라 구현 (CDK)
   インフラ実装（CDK）

5. 프론트엔드 개발 (Next.js + Tailwind)
   フロントエンド開発（Next.js + Tailwind）

6. CI/CD 파이프라인 구성 (GitHub Actions)
   CI/CDパイプライン構成（GitHub Actions）

7. 에러 페이지 구현 (Astro)
   エラーページ実装（Astro）

8. 리뷰 및 리팩토링
   レビューおよびリファクタリング
```

### 주요 성과 / 主な成果

- ✅ **1일 만에** AWS 인프라 + 프론트엔드 + CI/CD 완성
- ✅ FreeTier 범위 내 비용 최적화 아키텍처
- ✅ 하이클래스 채용 서비스 스타일 반응형 디자인 (모바일/데스크톱 완전 분리)
- ✅ 자동 배포 파이프라인 (GitHub Actions → ECR → EC2)
- ✅ 커스텀 404 에러 페이지 (CloudFront → S3)

---

## 🌐 라이브 데모 / Live Demo

**CloudFront URL**: [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net)

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
│  │    ▼     │              │              │          │      │  ┌─────────┐
│  │ ┌──────┐ │              │              │          │      │  │   S3    │
│  │ │ EC2  │ │◄─────────────┼──────────────┼──────────┼──────┼──│ (404    │
│  │ │t2.mic│ │              │              │          │      │  │  page)  │
│  │ │Docker│ │              │              │          │      │  │ + OAC   │
│  │ │Next. │ │              │              │          │      │  └─────────┘
│  │ │ js   │ │              │              │          │      │
│  │ └──────┘ │              │              │          │      │  ┌─────────┐
│  │    │     │              │              │          │      │  │  SSM    │
│  │    └─────┼──────────────┼──────────────┼──────────┼──────┼─▶│Parameter│
│  │          │              │              │          │      │  │ Store   │
│  └──────────┘              │              └──────────┘      │  │(API키등)│
└─────────────────────────────────────────────────────────────┘  └─────────┘
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
| 프레임워크 | Next.js 14+ (App Router) |
| 에러 페이지 | Astro |
| 스타일링 | Tailwind CSS |
| 언어 | TypeScript |
| 디자인 | 하이클래스 채용 서비스 스타일 반응형 디자인 |

### 프론트엔드 컴포넌트 / フロントエンドコンポーネント

| 컴포넌트 | 설명 |
| --- | --- |
| `Header` | 네비게이션, 스크롤 시 블러 효과 |
| `HeroSection` | 메인 비주얼, 모바일/데스크톱 완전 분리 레이아웃 |
| `VideoSection` | YouTube 임베드, 반응형 16:9 비율 |
| `CompanyLogosSection` | 기업 로고 캐러셀 |
| `ValuePropositionSection` | 가치 제안 카드 그리드 |
| `ProcessFlowSection` | 4단계 프로세스 플로우 |
| `FAQSection` | 아코디언 형태 FAQ |
| `AboutSection` | 소개 섹션 |
| `Footer` | 푸터, 소셜 링크 |

### 반응형 디자인 특징 / レスポンシブデザイン特徴

- **모바일/데스크톱 완전 분리**: `md:hidden` / `hidden md:flex` 패턴
- **디바이스별 테마 분기**: 모바일(밝은 배경 + 빨간색) / 데스크톱(다크 + amber)
- **세로 화면 대응**: `portrait:` 수정자로 이미지 초점 조정
- **반응형 스케일**: 타이포그래피, 스페이싱, 아이콘 크기 일관된 비율

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
├── .claude/
│   └── skills/               # Claude Code 스킬 / スキル
│       └── frontend-design.md
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
│   ├── README.md
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
│   ├── README.md
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       └── components/
│           ├── Header.tsx
│           ├── HeroSection.tsx
│           ├── VideoSection.tsx
│           ├── CompanyLogosSection.tsx
│           ├── ValuePropositionSection.tsx
│           ├── ProcessFlowSection.tsx
│           ├── FAQSection.tsx
│           ├── AboutSection.tsx
│           └── Footer.tsx
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

## 시크릿 관리 / シークレット管理

이 프로젝트는 AWS Systems Manager Parameter Store를 활용하여 민감한 정보를 관리합니다.

このプロジェクトはAWS Systems Manager Parameter Storeを活用して機密情報を管理します。

### 왜 Parameter Store인가? / なぜParameter Storeなのか？

| 서비스 | Free Tier | 용도 |
| --- | --- | --- |
| **Parameter Store** | ✅ 무료 (Standard) | 환경변수, API 키 |
| Secrets Manager | ❌ 유료 ($0.40/시크릿/월) | 자동 로테이션 필요 시 |

Parameter Store의 **SecureString** 타입은 KMS로 암호화되어 Secrets Manager와 유사한 보안 수준을 제공합니다.

Parameter Storeの**SecureString**タイプはKMSで暗号化され、Secrets Managerと同様のセキュリティレベルを提供します。

### 현재 상태 / 現在の状態

현재 MVP는 정적 포트폴리오 사이트로, Parameter Store가 필수는 아닙니다.

現在のMVPは静的ポートフォリオサイトであり、Parameter Storeは必須ではありません。

### 서비스 확장 시 활용 시나리오 / サービス拡張時の活用シナリオ

```text
┌─────────────────────────────────────────────────────────────────┐
│  확장 기능                    │  Parameter Store 활용           │
├─────────────────────────────────────────────────────────────────┤
│  컨택트 폼 (문의 양식)        │  이메일 서비스 API 키            │
│  방문자 분석                  │  Google Analytics API 키        │
│  CMS 연동                     │  Contentful/Strapi API 키       │
│  데이터베이스 연결            │  RDS 접속 정보                  │
│  영상 스트리밍                │  S3 Presigned URL 설정          │
│  OAuth 인증                   │  Client ID/Secret               │
└─────────────────────────────────────────────────────────────────┘
```

### 파라미터 네이밍 규칙 / パラメータ命名規則

```text
/portfolio/{environment}/{service}/{key}

예시 / 例:
/portfolio/prod/analytics/api-key
/portfolio/prod/email/sendgrid-key
/portfolio/dev/database/connection-string
```

### CDK 구현 예시 / CDK実装例

```typescript
import * as ssm from 'aws-cdk-lib/aws-ssm';

// 일반 설정값 (String)
// 一般設定値 (String)
new ssm.StringParameter(this, 'ApiEndpoint', {
  parameterName: '/portfolio/prod/api/endpoint',
  stringValue: 'https://api.example.com',
  description: 'API 엔드포인트 / APIエンドポイント',
});

// 민감한 정보 (SecureString - KMS 암호화)
// 機密情報 (SecureString - KMS暗号化)
new ssm.StringParameter(this, 'AnalyticsKey', {
  parameterName: '/portfolio/prod/analytics/api-key',
  stringValue: 'your-api-key',
  type: ssm.ParameterType.SECURE_STRING,
  description: 'Analytics API 키 / Analytics APIキー',
});
```

### EC2에서 파라미터 조회 / EC2からパラメータ取得

```typescript
// Next.js API Route 또는 서버 컴포넌트에서
// Next.js API Routeまたはサーバーコンポーネントで
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'ap-northeast-1' });

const response = await client.send(new GetParameterCommand({
  Name: '/portfolio/prod/analytics/api-key',
  WithDecryption: true,  // SecureString 복호화 / SecureString復号化
}));

const apiKey = response.Parameter?.Value;
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
