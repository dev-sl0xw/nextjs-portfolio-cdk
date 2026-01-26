// Hero Section Component - Main Visual (BizReach Style)
// ヒーローセクションコンポーネント - メインビジュアル（BizReachスタイル）
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * HeroSection Component
 * HeroSectionコンポーネント
 *
 * BizReach style impactful hero section
 * BizReachスタイルのインパクトのあるヒーローセクション
 *
 * Design Points:
 * - Mobile: Side-by-side layout with text left, model right
 * - Desktop: Full-screen banner image for strong first impression
 *
 * デザインポイント:
 * - モバイル: テキスト左、モデル右の横並びレイアウト
 * - デスクトップ: フルスクリーンバナー画像で強烈な第一印象
 */
export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Mobile Layout / モバイルレイアウト */}
      <section className="md:hidden relative overflow-hidden">
        <div className="relative min-h-[45vh]">
          {/* Background: Model Image / 背景: モデル画像 */}
          <div className="absolute inset-0">
            <Image
              src="/bizreach-banner-model-grok.png"
              alt="ハイクラス転職サービス"
              fill
              className="object-cover object-[70%_25%]"
              priority
              sizes="100vw"
            />
            {/* Left side gradient overlay / 左側グラデーションオーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 via-red-900/60 to-transparent" />
          </div>

          {/* Text Content / テキストコンテンツ */}
          <div className="relative flex flex-col justify-center px-4 py-6 z-10 w-[60%] min-h-[45vh]">
            <h1
              className={`text-xl font-bold text-white leading-tight transform transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="block">登録するだけで</span>
              <span className="block">驚きのスカウトが届く</span>
            </h1>
            <p
              className={`mt-3 text-2xl font-black text-amber-400 transform transition-all duration-1000 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              ビズリーチ
            </p>
          </div>
        </div>
      </section>

      {/* Mobile CTA Section / モバイルCTAセクション */}
      <section className="md:hidden">
        <div
          className={`bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-6 py-6 transform transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-xl font-bold text-slate-900 text-center mb-3">
            無料で会員登録
          </h2>
          <p className="text-sm text-slate-600 text-center mb-5">
            無料でスカウト受信、求人の閲覧が可能です。
          </p>

          {/* Email Registration Form / メール登録フォーム */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label htmlFor="email-mobile" className="block text-sm font-medium text-slate-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email-mobile"
                placeholder="example@bizreach.co.jp"
                className="w-full px-4 py-4 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              <a href="#" className="text-red-600 hover:underline">個人情報の取り扱い</a>
              、及び、
              <a href="#" className="text-red-600 hover:underline">利用規約</a>
              に同意して
            </p>
            <button
              type="submit"
              className="block w-full py-4 bg-red-600 text-white font-bold text-lg text-center rounded-lg hover:bg-red-700 transition-colors"
            >
              会員登録（無料）する
            </button>
          </form>
        </div>
      </section>

      {/* Desktop Layout / デスクトップレイアウト */}
      <section className="hidden md:flex relative min-h-screen items-center justify-center overflow-hidden">
        {/* Background Image / 背景画像 */}
        <div className="absolute inset-0 bg-slate-950">
          <Image
            src="/bizreach-banner-model-grok.png"
            alt="ハイクラス転職サービス"
            fill
            className="object-cover object-center portrait:object-[70%_center]"
            priority
            sizes="100vw"
          />
          {/* Dark Overlay Gradient / ダークオーバーレイグラデーション */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
        </div>

        {/* Main Content / メインコンテンツ */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content / 左側: テキストコンテンツ */}
            <div className="text-left">
              {/* Sub Headline / サブヘッドライン */}
              <div
                className={`transform transition-all duration-1000 delay-200 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  選ばれた人だけの転職サイト
                </span>
              </div>

              {/* Main Headline / メインヘッドライン */}
              <h1
                className={`mt-8 text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight transform transition-all duration-1000 delay-400 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <span className="block">登録するだけで</span>
                <span className="block mt-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  驚きのスカウトが届く
                </span>
              </h1>

              {/* Description / 説明テキスト */}
              <p
                className={`mt-8 text-xl text-slate-300 max-w-xl leading-relaxed transform transition-all duration-1000 delay-600 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                ハイクラス求人と出会える転職サイト。
                <br />
                あなたの経歴を登録するだけで、厳選された企業から直接スカウトが届きます。
              </p>

              {/* CTA Button Group / CTAボタングループ */}
              <div
                className={`mt-10 flex items-start gap-4 transform transition-all duration-1000 delay-800 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                {/* Primary Button - 会員登録ページへリンク */}
                <a
                  href="/signup"
                  className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1"
                >
                  <span className="relative z-10">無料で会員登録</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>

                {/* Secondary Button */}
                <a
                  href="#process"
                  className="group inline-flex items-center px-8 py-5 border border-slate-500 text-white font-medium text-lg rounded-xl hover:bg-slate-800/50 hover:border-slate-400 transition-all duration-300"
                >
                  <span>詳しく見る</span>
                </a>
              </div>

              {/* Trust Indicators / 信頼指標 */}
              <div
                className={`mt-10 flex items-center gap-6 transform transition-all duration-1000 delay-1000 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-slate-400 text-sm">完全無料</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-slate-400 text-sm">会員数200万人以上</span>
                </div>
              </div>
            </div>

            {/* Right: Empty space (to show image) / 右側: 空白（画像が見えるように） */}
            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Scroll Indicator / スクロールインジケーター */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transform transition-all duration-1000 delay-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400 tracking-widest uppercase">
              Scroll
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
              <div className="w-1 h-2 bg-amber-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
