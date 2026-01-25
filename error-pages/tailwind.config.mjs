// Tailwind CSS 설정 (Astro 에러 페이지용)
// Tailwind CSS設定（Astroエラーページ用）
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
      },
    },
  },
  plugins: [],
};
