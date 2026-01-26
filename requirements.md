# 要件定義書

[🇰🇷 한국어](./requirements.ko.md)

---

## 1. プロジェクト概要

### 1.1 目的

- 面接での自己アピールのためのポートフォリオサイトMVP開発

### 1.2 ターゲット

- ターゲット企業: BizReach (https://www.bizreach.jp/)

### 1.3 開発原則

- 小さく素早く始めて段階的に改善
- AWS FreeTier範囲内でコスト最適化
- すべての技術選択について根拠をコメントで明記

---

## 2. 技術スタック

### 2.1 インフラ

| 区分 | 技術 | バージョン |
| --- | --- | --- |
| IaC | AWS CDK | 2.x |
| 言語 | TypeScript | 5.x |
| クラウド | AWS (FreeTier) | - |

### 2.2 フロントエンド

| 区分 | 技術 | 用途 |
| --- | --- | --- |
| メインサイト | Next.js 14+ | ランディングページ (Dockerコンテナ) |
| エラーページ | Astro | 404ページ (静的ビルド) |
| スタイリング | Tailwind CSS | ユーティリティベースCSS |
| 言語 | TypeScript | 型安全性 |

### 2.3 CI/CD

| 区分 | 技術 |
| --- | --- |
| パイプライン | GitHub Actions |
| コンテナレジストリ | Amazon ECR |

---

## 3. AWSアーキテクチャ

### 3.1 ネットワーク構成

#### VPC

| 項目 | 値 | 備考 |
| --- | --- | --- |
| VPC CIDR | 10.0.0.0/16 | 65,536 IPs |
| Public Subnet AZ-a | 10.0.1.0/24 | ALB + EC2 |
| Public Subnet AZ-c | 10.0.2.0/24 | ALB (高可用性) |

#### 設計決定事項

| 項目 | 決定 | 理由 |
| --- | --- | --- |
| Private Subnet | ❌ 削除 | NAT Gatewayコスト削減 (~$30-45/月) |
| NAT Gateway | ❌ 削除 | FreeTier範囲維持 |

### 3.2 コンピューティング

#### EC2

| 項目 | 値 |
| --- | --- |
| インスタンスタイプ | t2.micro または t3.micro (FreeTier) |
| 配置 | Public Subnet AZ-a |
| 実行環境 | Docker + Next.jsコンテナ |

#### ロードバランサー

| 項目 | 値 | 理由 |
| --- | --- | --- |
| タイプ | ALB (Application Load Balancer) | L7でHTTPヘッダー分析必要 |
| 配置 | Public Subnet (2 AZ) | AWS要件: 最低2 AZ |

### 3.3 CDNとストレージ

#### CloudFront

| 項目 | 値 |
| --- | --- |
| ドメイン | CloudFrontデフォルトドメイン (*.cloudfront.net) |
| SSL/TLS | ACM証明書 (HTTPS) |
| Origin | ALB (メイン), S3 (エラーページ) |
| エラー応答 | 404 → S3の404.htmlへリダイレクト |

#### S3

| 項目 | 値 |
| --- | --- |
| 用途 | 404エラーページホスティング、プロフィール画像ホスティング |
| アクセス制御 | OAC (Origin Access Control) |
| パブリックアクセス | ブロック (CloudFront経由のみ) |

### 3.6 認証 (Cognito)

#### User Pool

| 項目 | 値 |
| --- | --- |
| 認証方式 | メールベースログイン |
| MFA | OFF (MVP) |
| パスワードポリシー | 8文字以上、大小文字+数字 |
| カスタム属性 | userType (jobseeker/company) |
| FreeTier | 50,000 MAU無料（永久） |

### 3.7 データベース (RDS)

#### RDS PostgreSQL

| 項目 | 値 |
| --- | --- |
| エンジン | PostgreSQL 15 |
| インスタンスタイプ | db.t3.micro (FreeTier) |
| ストレージ | 20GB (FreeTier) |
| 配置 | Public Subnet（コスト最適化） |
| アクセス制御 | Security GroupでEC2からのみ許可 |
| 認証情報 | Secrets Manager（自動生成） |

#### 設計決定事項

| 項目 | 決定 | 理由 |
| --- | --- | --- |
| Public Subnet配置 | ✅ 採用 | NAT Gatewayコスト削減（~$30-45/月） |
| Multi-AZ | ❌ 無効 | 開発環境、コスト削減 |

#### Production推奨構成

| 項目 | MVP（現在） | Production推奨 |
| --- | --- | --- |
| RDS配置 | Public Subnet (単一AZ) | Private Subnet (Multi-AZ) |
| Failover | なし | 自動Failover (1-2分) |
| Read Replica | なし | 読み取り分散用に推奨 |
| サブネット | 10.0.1.0/24, 10.0.2.0/24 | +10.0.11.0/24 (Primary), 10.0.21.0/24 (Replica) |
| バックアップ | 7日間 | 30日間 + クロスリージョン |

### 3.8 プロフィール画像 (S3)

#### 二元化戦略

| 対象 | 方式 | 説明 |
| --- | --- | --- |
| 求職者 | Presigned URL | 動的アップロード（5分有効期限） |
| 企業ロゴ | GitHub Actions | 静的デプロイ |

#### バケット構造

```text
portfolio-profile-images-{account-id}/
├── jobseekers/           ← Presigned URLで動的アップロード
│   └── {cognito_sub}/
│       └── profile.jpg
└── companies/            ← GitHub Actionsで静的デプロイ
    ├── company-a.png
    └── company-b.png
```

### 3.4 セキュリティ

#### Security Group (Stateful)

| 対象 | Inbound | Outbound |
| --- | --- | --- |
| ALB SG | CloudFront → 80 | 自動許可 (Stateful) |
| EC2 SG | ALB SG → 3000 | 自動許可 (Stateful) |

#### NACL (Stateless)

| 方向 | ポート | 用途 |
| --- | --- | --- |
| Inbound | 80 | HTTPトラフィック |
| Outbound | 1024-65535 | Ephemeralポート応答 |

#### WAF

| 項目 | 値 |
| --- | --- |
| 適用有無 | ❌ ドキュメント化のみ (コスト削減) |
| 推奨事項 | 本番環境ではAWSManagedRulesCommonRuleSet適用推奨 |

### 3.5 DNS（ドキュメントのみ）

#### Route53

| 項目 | 値 |
| --- | --- |
| 適用有無 | ❌ ドキュメント化のみ |
| 理由 | 面接デモにカスタムドメイン不要、コスト削減 |
| 推奨事項 | 本番環境ではRoute53 + カスタムドメイン適用推奨 |

---

## 4. CI/CDパイプライン

### 4.1 Next.jsデプロイワークフロー

```text
Push to main → Test (lint, test) → Docker Build → Push to ECR → Deploy to EC2
```

| ステップ | 説明 |
| --- | --- |
| Test | ESLint, TypeScript検査、単体テスト |
| Docker Build | Next.jsアプリDockerイメージビルド |
| Push to ECR | Amazon ECRにイメージプッシュ |
| Deploy to EC2 | SSHでEC2接続 → docker pull → docker run |

### 4.2 Astroデプロイワークフロー

```text
Push to main → Build Astro → Upload to S3
```

| ステップ | 説明 |
| --- | --- |
| Build | Astro静的ビルド |
| Upload | S3バケットに404.htmlアップロード |

---

## 5. フロントエンド要件

### 5.1 コンポーネント構成

| コンポーネント | 内容 |
| --- | --- |
| `Header` | ナビゲーション、スクロール時ブラー効果、ロゴ |
| `HeroSection` | メインビジュアル、モバイル/デスクトップ完全分離レイアウト、CTAボタン |
| `VideoSection` | YouTube埋め込み、レスポンシブ16:9比率、スクロールアニメーション |
| `CompanyLogosSection` | 企業ロゴカルーセル、自動スライド |
| `ValuePropositionSection` | 3つの核心価値カード、数値強調 |
| `ProcessFlowSection` | 4段階サービス利用フロー、接続線 |
| `FAQSection` | アコーディオン形式FAQ、展開/折りたたみアニメーション |
| `AboutSection` | 紹介セクション |
| `Footer` | 著作権表示、ソーシャルリンク |

### 5.2 レスポンシブデザイン戦略

#### モバイル/デスクトップ完全分離パターン

```tsx
{/* モバイル専用 */}
<section className="md:hidden">
  {/* モバイルレイアウト */}
</section>

{/* デスクトップ専用 */}
<section className="hidden md:flex">
  {/* デスクトップレイアウト */}
</section>
```

#### デバイス別テーマ分岐

| デバイス | 背景 | アクセントカラー |
| --- | --- | --- |
| モバイル | 明るい背景 (white, slate-100) | 赤色 (red-600) |
| デスクトップ | ダーク背景 (slate-900, slate-950) | amber系 (amber-400~600) |

#### クロスプラットフォーム対応

| 項目 | Tailwind修飾子 | 用途 |
| --- | --- | --- |
| ブレークポイント | `md:`, `lg:` | タブレット/デスクトップ分岐 |
| 縦画面対応 | `portrait:` | 縦モード画像フォーカス調整 |
| レスポンシブスケール | `text-sm md:text-base` | タイポグラフィサイズ調整 |
| 間隔調整 | `p-4 md:p-8` | スペーシングサイズ調整 |

### 5.3 アニメーション

| 効果 | 実装 |
| --- | --- |
| スクロールフェードイン | `IntersectionObserver` + CSS transition |
| Staggered reveal | `transitionDelay`活用順次登場 |
| ホバー効果 | `group-hover:`, `hover:`ユーティリティ |
| ボタンインタラクション | `hover:-translate-y-1`, `shadow`変化 |

### 5.4 動画挿入

| 項目 | 値 |
| --- | --- |
| 方式 | YouTube iframe埋め込み |
| 比率 | 16:9 (`aspect-video`) |
| レスポンシブ | `w-full` + `aspect-video`組み合わせ |

### 5.5 デザインガイド

| 項目 | 値 |
| --- | --- |
| 参考 | BizReach (https://www.bizreach.jp/) |
| トーン | ハイクラス採用サービススタイル - 高級感と専門性 |
| 色彩 | モバイル: red系 / デスクトップ: amber + ダーク背景 |
| フォント | システムフォント + 日本語対応 |
| モーション | スクロールベースstaggered revealアニメーション |

### 5.6 言語

| 対象 | 言語 |
| --- | --- |
| ランディングページコンテンツ | 日本語 |
| コードコメント | 韓国語 + 日本語 (バイリンガル) |

---

## 6. ドキュメントルール

### 6.1 README作成ルール

| ファイル | 言語 | 備考 |
| --- | --- | --- |
| `README.md` | 日本語 (メイン) | プロジェクトメインREADME |
| `README.ko.md` | 韓国語 | 韓国語版 |

#### 相互リンク

各README上部に他言語版リンクを追加:

```markdown
# README.md (日本語)
[🇰🇷 한국어](./README.ko.md)

# README.ko.md (韓国語)
[🇯🇵 日本語](./README.md)
```

#### 内容同期

- 両ファイルの内容は常に同期維持
- 一方のファイル修正時、もう一方も同時修正
- 言語混用禁止 (各ファイルは単一言語で記述)

### 6.2 コードコメントルール

- 韓国語コメントの直下に日本語翻訳
- ビジネスレベル (N1~) 日本語使用
- 直訳禁止、自然な意訳推奨

```typescript
// ユーザー認証を処理する関数
function handleAuth() {
  // ...
}
```

---

## 7. ガードレール (rules/)

### 7.1 ファイル構造

```text
rules/
├── code-style.md           # TypeScript, 命名規則
├── aws-best-practices.md   # タグ、リソース命名、コスト
├── security.md             # シークレット禁止、最小権限
├── network-security.md     # SG/NACL, Stateful/Stateless, OSI 7層
└── bilingual-comments.md   # 韓国語/日本語コメントルール
```

### 7.2 主要ルール

#### code-style.md

- TypeScript strict mode必須
- コンポーネント: PascalCase, 関数/変数: camelCase, 定数: UPPER_SNAKE_CASE

#### aws-best-practices.md

- 全リソースにタグ必須 (Project, Environment, ManagedBy)
- 技術選択根拠をコメントで明記
- FreeTier超過リソース使用時はコスト明記

#### security.md

- ハードコードされたシークレット/APIキー絶対禁止
- .envファイルgitコミット禁止
- Security Group: 最小権限原則

#### network-security.md

- OSI 7層とAWSサービスマッピング理解
- Security Group (Stateful) vs NACL (Stateless) 区別
- CDKコードにトラフィックフローコメント必須

#### bilingual-comments.md

- 韓国語コメントの直下に日本語翻訳
- ビジネスレベル (N1~) 日本語使用
- 直訳禁止、自然な意訳推奨

---

## 8. プロジェクト構造

```text
nextjs-portfolio-cdk/
├── README.md                 # 日本語 (メイン)
├── README.ko.md              # 韓国語版
├── requirements.md           # このファイル (日本語)
├── requirements.ko.md        # 韓国語版
├── docs/plans/
├── rules/
├── infrastructure/           # CDK
│   ├── bin/
│   └── lib/
│       ├── vpc-stack.ts
│       ├── ec2-stack.ts
│       ├── alb-stack.ts
│       ├── cloudfront-stack.ts
│       ├── certificate-stack.ts
│       ├── ecr-stack.ts
│       ├── cognito-stack.ts
│       ├── rds-stack.ts
│       └── profile-bucket-stack.ts
├── frontend/                 # Next.js
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
├── error-pages/              # Astro
│   └── src/pages/404.astro
└── .github/workflows/
    ├── deploy-frontend.yml
    └── deploy-error-pages.yml
```

---

## 9. 面接後の整理

- 面接終了後、`cdk destroy`で全AWSリソースを削除
- コスト発生防止のためCloudFormationスタック完全削除を確認
