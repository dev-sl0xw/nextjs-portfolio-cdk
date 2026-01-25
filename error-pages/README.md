# Error Pages (Astro)

# エラーページ（Astro）

CloudFront에서 제공되는 커스텀 에러 페이지입니다.

CloudFrontから提供されるカスタムエラーページです。

---

## 🌐 배포 위치 / デプロイ先

S3 버킷 → CloudFront → [https://d2opqv3ja0x6v5.cloudfront.net/404.html](https://d2opqv3ja0x6v5.cloudfront.net/404.html)

---

## 기술 스택 / 技術スタック

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | Astro |
| 스타일링 | Tailwind CSS |
| 배포 | S3 + CloudFront |

---

## 에러 페이지 목록 / エラーページ一覧

| 페이지 | 설명 |
| --- | --- |
| `404.astro` | 페이지를 찾을 수 없음 (Not Found) |

---

## 빌드 및 배포 / ビルドとデプロイ

```bash
# 의존성 설치 / 依存関係インストール
npm install

# 개발 서버 실행 / 開発サーバー起動
npm run dev

# 빌드 / ビルド
npm run build

# 빌드 결과물 미리보기 / ビルド結果プレビュー
npm run preview
```

### S3 배포 (수동)

```bash
# 빌드
npm run build

# S3에 업로드 (버킷명 확인 필요)
aws s3 sync dist/ s3://portfolio-dev-error-pages-{ACCOUNT_ID}/ --delete
```

### GitHub Actions (자동)

`.github/workflows/deploy-error-pages.yml`로 자동 배포됩니다.

---

## 디렉토리 구조 / ディレクトリ構造

```text
error-pages/
├── README.md           # 이 파일 / このファイル
├── package.json
├── astro.config.mjs    # Astro 설정
├── tailwind.config.mjs # Tailwind 설정
├── tsconfig.json
├── public/             # 정적 에셋
├── src/
│   └── pages/
│       └── 404.astro   # 404 에러 페이지
└── dist/               # 빌드 출력
    ├── 404.html
    └── _astro/         # 번들된 CSS/JS
```

---

## CloudFront 연동 / CloudFront連携

CloudFront에서 다음과 같이 에러 응답이 설정되어 있습니다:

```text
HTTP 404 → /404.html (S3)
HTTP 403 → /404.html (S3)
```

### CloudFront Behaviors

| 경로 | Origin |
| --- | --- |
| `/404.html` | S3 (Error Pages Bucket) |
| `/_astro/*` | S3 (Error Pages Bucket) |
| `/*` (기본) | ALB (Next.js) |

---

## 참고 문서 / 参考ドキュメント

- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
