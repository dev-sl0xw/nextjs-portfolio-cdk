# Next.js ポートフォリオサイト（AWS CDK）

[🇰🇷 한국어](./README.ko.md)

面接デモ用ポートフォリオサイトMVPです。AWS CDKを使用してインフラを構成し、Next.jsでフロントエンドを開発します。

---

## 🤖 Vibe Coding with Claude Code CLI

このプロジェクトは**Claude Code CLI**を使用した**Vibe Coding**で開発されました。

### 開発期間

| 項目 | 内容 |
| --- | --- |
| 開始日 | 2026-01-25 |
| 完了日 | 2026-01-26 |
| **総所要時間** | **約24時間（2日間）** |

### Claude Code設定

#### MCP Servers

| MCP Server | 用途 |
| --- | --- |
| `plugin:github` | GitHub連携（PR、Issues、Repository管理） |
| `plugin:playwright` | ブラウザ自動化テスト、スクリーンショット |
| `plugin:serena` | コードベースセマンティック検索・分析 |
| `plugin:context7` | ライブラリドキュメント検索 |
| `sequential-thinking` | 複雑な問題の段階的思考 |

#### Skills

| Skill | 用途 |
| --- | --- |
| `superpowers:brainstorming` | アイデア具体化・要件整理 |
| `superpowers:writing-plans` | 実装計画策定 |
| `superpowers:executing-plans` | 計画に基づく段階的実装 |
| `frontend-design:frontend-design` | 高品質フロントエンドUI開発 |

#### Guardrails (rules/)

| ガードレール | 説明 |
| --- | --- |
| `code-style.md` | コードスタイルルール |
| `aws-best-practices.md` | AWSベストプラクティス |
| `security.md` | セキュリティガードレール |
| `network-security.md` | ネットワークセキュリティ（OSI 7層） |
| `bilingual-comments.md` | 韓国語/日本語バイリンガルコメントルール |

### Vibe Codingワークフロー

```text
1. ブレインストーミング → requirements.md作成
2. 設計ドキュメント作成 → docs/plans/
3. ガードレール設定 → rules/
4. インフラ実装（CDK）
5. フロントエンド開発（Next.js + Tailwind）
6. CI/CDパイプライン構成（GitHub Actions）
7. エラーページ実装（Astro）
8. レビューおよびリファクタリング
```

### 主な成果

- ✅ **1日で** AWSインフラ + フロントエンド + CI/CD完成
- ✅ FreeTier範囲内コスト最適化アーキテクチャ
- ✅ ハイクラス採用サービススタイルレスポンシブデザイン（モバイル/デスクトップ完全分離）
- ✅ 自動デプロイパイプライン（GitHub Actions → ECR → EC2）
- ✅ カスタム404エラーページ（CloudFront → S3）

---

## 🌐 ライブデモ

| ページ | URL |
| --- | --- |
| **メインサイト** | [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net) |
| **404エラーページ** | [https://d2opqv3ja0x6v5.cloudfront.net/404.html](https://d2opqv3ja0x6v5.cloudfront.net/404.html) |

---

## アーキテクチャ

```text
                              Internet
                                  │
                                  ▼
                         ┌───────────────┐
                         │  CloudFront   │
                         │  (HTTPS/ACM)  │
                         └───────────────┘
                          │           │
                    (メイントラフィック)  (エラー時)
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
│  └──────────┘              │              └──────────┘      │  │(APIキー等)│
└─────────────────────────────────────────────────────────────┘  └─────────┘
```

---

## 技術スタック

### インフラ

| 区分 | 技術 |
| --- | --- |
| IaC | AWS CDK (TypeScript) |
| CDN | CloudFront + ACM |
| コンピューティング | EC2 (t2.micro, FreeTier) + Docker |
| ロードバランサー | ALB (Application Load Balancer) |
| ストレージ | S3 (エラーページ、動画) |
| ネットワーク | VPC, Public Subnet, Internet Gateway |

### フロントエンド

| 区分 | 技術 |
| --- | --- |
| フレームワーク | Next.js 14+ (App Router) |
| エラーページ | Astro |
| スタイリング | Tailwind CSS |
| 言語 | TypeScript |
| デザイン | ハイクラス採用サービススタイルレスポンシブデザイン |

### フロントエンドコンポーネント

| コンポーネント | 説明 |
| --- | --- |
| `Header` | ナビゲーション、スクロール時ブラー効果 |
| `HeroSection` | メインビジュアル、モバイル/デスクトップ完全分離レイアウト |
| `VideoSection` | YouTube埋め込み、レスポンシブ16:9比率 |
| `CompanyLogosSection` | 企業ロゴカルーセル |
| `ValuePropositionSection` | 価値提案カードグリッド |
| `ProcessFlowSection` | 4段階プロセスフロー |
| `FAQSection` | アコーディオン形式FAQ |
| `AboutSection` | 紹介セクション |
| `Footer` | フッター、ソーシャルリンク |

### レスポンシブデザイン特徴

- **モバイル/デスクトップ完全分離**: `md:hidden` / `hidden md:flex` パターン
- **デバイス別テーマ分岐**: モバイル（明るい背景 + 赤）/ デスクトップ（ダーク + amber）
- **縦画面対応**: `portrait:` 修飾子で画像フォーカス調整
- **レスポンシブスケール**: タイポグラフィ、スペーシング、アイコンサイズ一貫した比率

### CI/CD

| 区分 | 技術 |
| --- | --- |
| パイプライン | GitHub Actions |
| コンテナレジストリ | Amazon ECR |

---

## プロジェクト構造

```text
nextjs-portfolio-cdk/
│
├── README.md                 # このファイル
├── README.ko.md              # 韓国語版
├── requirements.md           # 要件定義書
│
├── .claude/
│   └── skills/               # Claude Codeスキル
│       └── frontend-design.md
│
├── docs/
│   └── plans/                # 設計ドキュメント
│
├── rules/                    # ガードレール設定
│   ├── code-style.md
│   ├── aws-best-practices.md
│   ├── security.md
│   ├── network-security.md
│   └── bilingual-comments.md
│
├── infrastructure/           # AWS CDKコード
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
├── frontend/                 # Next.jsアプリ
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
├── error-pages/              # Astro 404ページ
│   └── src/
│       └── pages/
│           └── 404.astro
│
└── .github/
    └── workflows/            # CI/CDパイプライン
        ├── deploy-frontend.yml
        └── deploy-error-pages.yml
```

---

## はじめに

### 前提条件

- Node.js 18+
- AWS CLI (configured)
- AWS CDK CLI (`npm install -g aws-cdk`)
- Docker

### インフラデプロイ

```bash
# CDKプロジェクトに移動
cd infrastructure

# 依存関係インストール
npm install

# CDKブートストラップ（初回のみ）
cdk bootstrap

# インフラデプロイ
cdk deploy --all
```

### フロントエンド開発

```bash
# Next.jsプロジェクトに移動
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### エラーページ開発

```bash
# Astroプロジェクトに移動
cd error-pages

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

---

## コスト管理

このプロジェクトはAWS FreeTier範囲内で運用されるよう設計されています。

### FreeTierリソース

| リソース | FreeTier限度 |
| --- | --- |
| EC2 (t2.micro) | 750時間/月（12ヶ月） |
| ALB | 750時間/月（12ヶ月） |
| S3 | 5GBストレージ、20,000 GET |
| CloudFront | 1TB転送、10,000,000リクエスト |
| ECR | 500MBストレージ |

### コスト削減決定

| 項目 | 決定 | 削減額 |
| --- | --- | --- |
| NAT Gateway | ❌ 削除 | ~$30-45/月 |
| Private Subnet | ❌ 削除 | NAT Gateway不要 |
| WAF | ❌ ドキュメント化のみ | ~$6-7/月 |
| Route53 | ❌ ドキュメント化のみ | ~$0.50/月 |

### リソース整理

面接終了後、必ずリソースを整理してください。

```bash
# 全スタック削除
cd infrastructure
cdk destroy --all
```

---

## シークレット管理

このプロジェクトはAWS Systems Manager Parameter Storeを活用して機密情報を管理します。

### なぜParameter Storeなのか？

| サービス | Free Tier | 用途 |
| --- | --- | --- |
| **Parameter Store** | ✅ 無料 (Standard) | 環境変数、APIキー |
| Secrets Manager | ❌ 有料 ($0.40/シークレット/月) | 自動ローテーション必要時 |

Parameter Storeの**SecureString**タイプはKMSで暗号化され、Secrets Managerと同様のセキュリティレベルを提供します。

### 現在の状態

現在のMVPは静的ポートフォリオサイトであり、Parameter Storeは必須ではありません。

### サービス拡張時の活用シナリオ

```text
┌─────────────────────────────────────────────────────────────────┐
│  拡張機能                    │  Parameter Store活用             │
├─────────────────────────────────────────────────────────────────┤
│  コンタクトフォーム（お問い合わせ）│  メールサービスAPIキー          │
│  訪問者分析                  │  Google Analytics APIキー        │
│  CMS連携                     │  Contentful/Strapi APIキー       │
│  データベース接続            │  RDS接続情報                     │
│  動画ストリーミング          │  S3 Presigned URL設定            │
│  OAuth認証                   │  Client ID/Secret                │
└─────────────────────────────────────────────────────────────────┘
```

### パラメータ命名規則

```text
/portfolio/{environment}/{service}/{key}

例:
/portfolio/prod/analytics/api-key
/portfolio/prod/email/sendgrid-key
/portfolio/dev/database/connection-string
```

### CDK実装例

```typescript
import * as ssm from 'aws-cdk-lib/aws-ssm';

// 一般設定値 (String)
new ssm.StringParameter(this, 'ApiEndpoint', {
  parameterName: '/portfolio/prod/api/endpoint',
  stringValue: 'https://api.example.com',
  description: 'APIエンドポイント',
});

// 機密情報 (SecureString - KMS暗号化)
new ssm.StringParameter(this, 'AnalyticsKey', {
  parameterName: '/portfolio/prod/analytics/api-key',
  stringValue: 'your-api-key',
  type: ssm.ParameterType.SECURE_STRING,
  description: 'Analytics APIキー',
});
```

### EC2からパラメータ取得

```typescript
// Next.js API Routeまたはサーバーコンポーネントで
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'ap-northeast-1' });

const response = await client.send(new GetParameterCommand({
  Name: '/portfolio/prod/analytics/api-key',
  WithDecryption: true,  // SecureString復号化
}));

const apiKey = response.Parameter?.Value;
```

---

## コメントルール

このプロジェクトの全コードコメントは韓国語と日本語で記述されます。

```typescript
// 사용자 인증을 처리하는 함수
// ユーザー認証を処理する関数
function handleAuth() {
  // ...
}
```

---

## ドキュメント

| ドキュメント | 説明 |
| --- | --- |
| [requirements.md](./requirements.md) | 詳細要件定義書 |
| [docs/plans/](./docs/plans/) | 設計ドキュメント |
| [rules/](./rules/) | コーディングガードレール |

---

## ライセンス

このプロジェクトは個人ポートフォリオ目的で作成されました。
