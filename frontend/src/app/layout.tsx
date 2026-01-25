// 루트 레이아웃 컴포넌트
// ルートレイアウトコンポーネント
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter 폰트 설정
// Interフォント設定
const inter = Inter({ subsets: ["latin"] });

/**
 * 메타데이터 설정
 * メタデータ設定
 *
 * SEO 최적화를 위한 기본 메타 태그 정의
 * SEO最適化のための基本メタタグ定義
 */
export const metadata: Metadata = {
  title: "転職ならビズリーチ｜選ばれた人だけのハイクラス転職サイト",
  description:
    "ハイクラス求人と出会える転職サイト。あなたの経歴を登録するだけで、厳選された企業から直接スカウトが届きます。",
  keywords: ["転職", "ハイクラス", "スカウト", "求人", "キャリア", "ビズリーチ"],
  authors: [{ name: "Portfolio Developer" }],
  openGraph: {
    title: "転職ならビズリーチ｜選ばれた人だけのハイクラス転職サイト",
    description: "ハイクラス求人と出会える転職サイト。厳選された企業から直接スカウトが届きます。",
    type: "website",
  },
};

/**
 * RootLayout 컴포넌트
 * RootLayoutコンポーネント
 *
 * 모든 페이지에 공통으로 적용되는 레이아웃
 * すべてのページに共通で適用されるレイアウト
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
