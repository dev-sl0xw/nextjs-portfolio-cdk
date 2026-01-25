// Next.js 설정
// Next.js設定
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 빌드를 위한 standalone 출력 모드
  // Dockerビルドのためのstandalone出力モード
  // 최소한의 파일만 포함하여 이미지 크기 최적화
  // 最小限のファイルのみ含めてイメージサイズ最適化
  output: "standalone",
};

export default nextConfig;
