# ============================================================
# Next.js Docker Multi-stage Build
# Next.js Dockerマルチステージビルド
#
# 이 Dockerfile은 최적화된 프로덕션 이미지를 생성합니다.
# このDockerfileは最適化されたプロダクションイメージを生成します。
#
# 빌드 전략:
# 1. deps: 의존성 설치
# 2. builder: Next.js 빌드
# 3. runner: 프로덕션 실행
#
# ビルド戦略:
# 1. deps: 依存関係インストール
# 2. builder: Next.jsビルド
# 3. runner: プロダクション実行
# ============================================================

# ============================================================
# Stage 1: Dependencies (의존성 설치 / 依存関係インストール)
# ============================================================
FROM node:20-alpine AS deps

# libc6-compat 설치 (Alpine Linux 호환성)
# libc6-compatインストール（Alpine Linux互換性）
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
# パッケージファイルコピーおよび依存関係インストール
COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Stage 2: Builder (빌드 / ビルド)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 복사
# 依存関係コピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 텔레메트리 비활성화
# Next.jsテレメトリ無効化
ENV NEXT_TELEMETRY_DISABLED=1

# 프로덕션 빌드
# プロダクションビルド
RUN npm run build

# ============================================================
# Stage 3: Runner (프로덕션 실행 / プロダクション実行)
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 환경 설정
# プロダクション環境設定
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 보안: 비루트 사용자 생성
# セキュリティ: 非rootユーザー作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# public 폴더 복사
# publicフォルダコピー
COPY --from=builder /app/public ./public

# standalone 출력 및 static 파일 복사
# standalone出力およびstaticファイルコピー
# Next.js의 output: 'standalone' 설정 필요
# Next.jsのoutput: 'standalone'設定が必要
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 비루트 사용자로 전환
# 非rootユーザーに切り替え
USER nextjs

# 포트 노출
# ポート公開
EXPOSE 3000

# 환경 변수
# 環境変数
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 서버 시작
# サーバー起動
CMD ["node", "server.js"]
