# エラーページ（Astro）

[🇰🇷 한국어](./README.ko.md)

CloudFrontから提供されるカスタムエラーページです。

---

## 🌐 デプロイ先

S3バケット → CloudFront → [https://d2opqv3ja0x6v5.cloudfront.net/404.html](https://d2opqv3ja0x6v5.cloudfront.net/404.html)

---

## 技術スタック

| 区分 | 技術 |
| --- | --- |
| フレームワーク | Astro |
| スタイリング | Tailwind CSS |
| デプロイ | S3 + CloudFront |

---

## エラーページ一覧

| ページ | 説明 |
| --- | --- |
| `404.astro` | ページが見つかりません (Not Found) |

---

## ビルドとデプロイ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# ビルド結果プレビュー
npm run preview
```

### S3デプロイ（手動）

```bash
# ビルド
npm run build

# S3にアップロード（バケット名確認必要）
aws s3 sync dist/ s3://portfolio-dev-error-pages-{ACCOUNT_ID}/ --delete
```

### GitHub Actions（自動）

`.github/workflows/deploy-error-pages.yml`で自動デプロイされます。

---

## ディレクトリ構造

```text
error-pages/
├── README.md           # このファイル
├── README.ko.md        # 韓国語版
├── package.json
├── astro.config.mjs    # Astro設定
├── tailwind.config.mjs # Tailwind設定
├── tsconfig.json
├── public/             # 静的アセット
├── src/
│   └── pages/
│       └── 404.astro   # 404エラーページ
└── dist/               # ビルド出力
    ├── 404.html
    └── _astro/         # バンドルされたCSS/JS
```

---

## CloudFront連携

CloudFrontで以下のようにエラー応答が設定されています:

```text
HTTP 404 → /404.html (S3)
HTTP 403 → /404.html (S3)
```

### CloudFront Behaviors

| パス | Origin |
| --- | --- |
| `/404.html` | S3 (Error Pages Bucket) |
| `/_astro/*` | S3 (Error Pages Bucket) |
| `/*` (デフォルト) | ALB (Next.js) |

---

## 参考ドキュメント

- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
