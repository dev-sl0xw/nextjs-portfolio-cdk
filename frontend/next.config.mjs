// Next.js 설정
// Next.js設定
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 빌드를 위한 standalone 출력 모드
  // Dockerビルドのためのstandalone出力モード
  // 최소한의 파일만 포함하여 이미지 크기 최적화
  // 最小限のファイルのみ含めてイメージサイズ最適化
  output: "standalone",

  // 외부 이미지 도메인 허용
  // 外部画像ドメイン許可
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      // S3 프로필 이미지 버킷
      // S3プロフィール画像バケット
      {
        protocol: "https",
        hostname: "portfolio-dev-profile-images-810766399241.s3.ap-northeast-1.amazonaws.com",
      },
      // S3 버킷 와일드카드 (다른 환경 대응)
      // S3バケットワイルドカード（他環境対応）
      {
        protocol: "https",
        hostname: "*.s3.ap-northeast-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
