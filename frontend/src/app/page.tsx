// Main Page Component (BizReach Style)
// メインページコンポーネント（BizReachスタイル）

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import CompanyLogosSection from "@/components/CompanyLogosSection";
import ValuePropositionSection from "@/components/ValuePropositionSection";
import ProcessFlowSection from "@/components/ProcessFlowSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

/**
 * Home Page
 * Homeページ
 *
 * BizReach style landing page
 * BizReachスタイルのランディングページ
 *
 * Structure (BizReach reference):
 * 構成（BizReach参考）:
 *
 * 1. Header: Navigation / ナビゲーション
 * 2. HeroSection: Main visual + CTA / メインビジュアル + CTA
 * 3. CompanyLogosSection: Partner company logos / 導入企業ロゴ
 * 4. ValuePropositionSection: 3 core values / 3つの核心価値
 * 5. ProcessFlowSection: 4-step usage flow / 4ステップ利用フロー
 * 6. AboutSection: Detailed introduction / 詳細紹介
 * 7. FAQSection: Frequently asked questions / よくある質問
 * 8. Footer: Contact and links / 連絡先とリンク
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero: Banner image + Main message */}
        {/* ヒーロー: バナー画像 + メインメッセージ */}
        <HeroSection />

        {/* Video: Service introduction video */}
        {/* ビデオ: サービス紹介動画 */}
        <VideoSection />

        {/* Company Logos: Trust emphasis */}
        {/* 企業ロゴ: 信頼性強調 */}
        <CompanyLogosSection />

        {/* Value Proposition: Core metrics emphasis */}
        {/* バリュープロポジション: 核心数値強調 */}
        <ValuePropositionSection />

        {/* Process Flow: Service usage flow */}
        {/* プロセスフロー: サービス利用フロー */}
        <ProcessFlowSection />

        {/* FAQ: Frequently asked questions */}
        {/* FAQ: よくある質問 */}
        <FAQSection />

        {/* Detailed Introduction: Skills and experience */}
        {/* 詳細紹介: スキルと経験 */}
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
