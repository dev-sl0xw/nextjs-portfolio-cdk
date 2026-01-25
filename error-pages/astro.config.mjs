// Astro 설정
// Astro設定
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  // 정적 HTML 출력 (S3 호스팅용)
  // 静的HTML出力（S3ホスティング用）
  output: "static",
});
