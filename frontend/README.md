# フロントエンド（Next.js）

[🇰🇷 한국어](./README.ko.md)

BizReachスタイルのレスポンシブポートフォリオサイトです。

---

## 🌐 ライブデモ

**CloudFront URL**: [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net)

---

## 技術スタック

| 区分 | 技術 |
| --- | --- |
| フレームワーク | Next.js 14+ (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| フォント | Inter (Google Fonts) |
| デプロイ | Docker + EC2 + CloudFront |

---

## コンポーネント構造

```text
src/
├── app/
│   ├── layout.tsx      # ルートレイアウト（メタデータ、フォント）
│   ├── page.tsx        # メインページ
│   ├── globals.css     # グローバルスタイル（CSS変数、ユーティリティ）
│   └── favicon.ico
│
└── components/
    ├── Header.tsx              # ナビゲーションヘッダー
    ├── HeroSection.tsx         # メインビジュアルセクション
    ├── VideoSection.tsx        # YouTubeビデオセクション
    ├── VideoPlayer.tsx         # ビデオプレーヤーコンポーネント
    ├── CompanyLogosSection.tsx # 企業ロゴセクション
    ├── ValuePropositionSection.tsx # バリュープロポジションセクション
    ├── ProcessFlowSection.tsx  # プロセスフローセクション
    ├── FAQSection.tsx          # FAQアコーディオンセクション
    ├── AboutSection.tsx        # 紹介セクション
    └── Footer.tsx              # フッター
```

---

## レスポンシブデザインパターン

### 1. モバイル/デスクトップ完全分離レイアウト

```tsx
{/* モバイル専用 */}
<section className="md:hidden ...">
  {/* Mobile Layout */}
</section>

{/* デスクトップ専用 */}
<section className="hidden md:flex ...">
  {/* Desktop Layout */}
</section>
```

### 2. デバイス別テーマ分岐

```tsx
// モバイル: 明るい背景 + 赤色アクセント
// デスクトップ: ダーク背景 + amberアクセント
className="bg-white md:bg-slate-950"
className="text-red-600 md:text-amber-500"
```

### 3. 縦画面（Portrait）対応

```tsx
// 縦モニターで画像フォーカス調整
className="object-center portrait:object-[70%_center]"
```

### 4. レスポンシブスケールシステム

```tsx
// タイポグラフィ
className="text-xl md:text-5xl lg:text-6xl"

// スペーシング
className="py-12 md:py-24"
className="gap-3 md:gap-6"

// アイコン/ボタンサイズ
className="w-10 h-10 md:w-12 md:h-12"
```

---

## 主要機能

### Header
- スクロール時背景ブラー効果
- 固定位置（sticky navigation）

### HeroSection
- モバイル: 画像背景 + テキストオーバーレイ
- デスクトップ: フルスクリーンヒーロー画像
- スタガーアニメーションで順次登場

### VideoSection
- YouTube iframe埋め込み
- 16:9比率維持（`aspect-video`）
- スクロールトリガーアニメーション

### ProcessFlowSection
- 4段階プロセスカード
- レスポンシブグリッド（2列 → 4列）
- 接続線アニメーション

### FAQSection
- アコーディオンUI
- 状態管理で開閉制御

---

## 開発サーバー

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プロダクションサーバー
npm run start

# リント
npm run lint
```

開発サーバー: [http://localhost:3000](http://localhost:3000)

---

## Dockerビルド

```bash
# イメージビルド
docker build -t portfolio-frontend .

# コンテナ実行
docker run -p 3000:3000 portfolio-frontend
```

---

## ディレクトリ構造

```text
frontend/
├── README.md           # このファイル
├── README.ko.md        # 韓国語版
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── Dockerfile
├── public/
│   ├── favicon.ico
│   ├── logo_bizreach.png
│   └── bizreach-banner-model-grok.png
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── favicon.ico
    └── components/
        ├── Header.tsx
        ├── HeroSection.tsx
        ├── VideoSection.tsx
        ├── VideoPlayer.tsx
        ├── CompanyLogosSection.tsx
        ├── ValuePropositionSection.tsx
        ├── ProcessFlowSection.tsx
        ├── FAQSection.tsx
        ├── AboutSection.tsx
        └── Footer.tsx
```

---

## CSS変数

`globals.css`で定義されたデザイントークン:

```css
:root {
  --color-primary: #f59e0b;        /* Amber 500 */
  --color-primary-light: #fbbf24;  /* Amber 400 */
  --color-primary-dark: #d97706;   /* Amber 600 */

  --color-bg-primary: #020617;     /* Slate 950 */
  --color-bg-secondary: #0f172a;   /* Slate 900 */
  --color-bg-tertiary: #1e293b;    /* Slate 800 */

  --color-text-primary: #f8fafc;   /* Slate 50 */
  --color-text-secondary: #94a3b8; /* Slate 400 */
  --color-text-muted: #64748b;     /* Slate 500 */

  --color-border: #334155;         /* Slate 700 */
  --color-border-light: #475569;   /* Slate 600 */
}
```

---

## 参考ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
