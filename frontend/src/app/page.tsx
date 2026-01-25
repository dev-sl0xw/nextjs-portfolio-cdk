// 메인 페이지 컴포넌트
// メインページコンポーネント

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

/**
 * Home 페이지
 * Homeページ
 *
 * 포트폴리오 사이트의 메인 랜딩 페이지
 * ポートフォリオサイトのメインランディングページ
 *
 * 구성:
 * - Header: 네비게이션
 * - HeroSection: 첫 인상 (메인 비주얼)
 * - AboutSection: 자기 소개 및 스킬
 * - Footer: 연락처 및 소셜 링크
 *
 * 構成:
 * - Header: ナビゲーション
 * - HeroSection: 第一印象（メインビジュアル）
 * - AboutSection: 自己紹介とスキル
 * - Footer: 連絡先とソーシャルリンク
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
