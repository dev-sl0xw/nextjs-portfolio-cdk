// Process Flow Section - Service Usage Flow
// プロセスフローセクション - サービス利用フロー
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ProcessFlowSection Component
 * ProcessFlowSectionコンポーネント
 *
 * BizReach style 4-step service usage flow
 * BizReachスタイルの4ステップサービス利用フロー
 *
 * 1. 職務経歴書作成
 * 2. スカウト受取
 * 3. 面談
 * 4. 内定
 */

const steps = [
  {
    number: "01",
    title: "会員登録",
    subtitle: "無料・3分で完了",
    description: "基本情報と職務経歴を入力。詳細な経歴を登録するほど、より多くのスカウトが届きます。",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "スカウト受信",
    subtitle: "待つだけでOK",
    description: "企業やヘッドハンターから直接スカウトが届きます。あなたに興味を持った企業からのオファーです。",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "面談・選考",
    subtitle: "興味のある企業と",
    description: "気になるスカウトに返信して、企業との面談へ。カジュアル面談から始めることも可能です。",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "内定・入社",
    subtitle: "新しいキャリアへ",
    description: "条件交渉や入社日の調整もサポート。理想のキャリアへの第一歩を踏み出しましょう。",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

export default function ProcessFlowSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative py-12 md:py-24 bg-slate-100 md:bg-slate-900 overflow-hidden"
    >
      {/* Top Divider / 上部ディバイダー */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header / セクションヘッダー */}
        <div
          className={`text-center mb-8 md:mb-16 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-red-600 md:text-amber-500 text-sm font-semibold tracking-widest uppercase">
            How It Works
          </span>
          <h2 className="mt-3 md:mt-4 text-2xl md:text-4xl font-bold text-slate-900 md:text-white">
            <span className="text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
              かんたん4ステップ
            </span>
            で転職
          </h2>
        </div>

        {/* Step Grid / ステップグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`group relative transform transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Connection Line (except last item) / 接続線（最後のアイテム除外） */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent z-0" />
              )}

              <div className="relative p-4 md:p-6 bg-white md:bg-slate-800/30 rounded-xl md:rounded-2xl border border-slate-200 md:border-slate-700/50 hover:border-red-300 md:hover:border-amber-500/30 hover:bg-slate-50 md:hover:bg-slate-800/50 transition-all duration-300 h-full">
                {/* Step Number / ステップ番号 */}
                <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 md:from-amber-500 md:to-amber-600 flex items-center justify-center text-white md:text-slate-900 font-bold text-xs md:text-sm shadow-lg shadow-red-500/30 md:shadow-amber-500/30">
                  {step.number}
                </div>

                {/* Icon / アイコン */}
                <div className="mt-3 md:mt-4 mb-3 md:mb-4 text-red-600 md:text-amber-500">
                  {step.icon}
                </div>

                {/* Title / タイトル */}
                <h3 className="text-base md:text-xl font-semibold text-slate-900 md:text-white mb-1">
                  {step.title}
                </h3>

                {/* Subtitle / サブタイトル */}
                <p className="text-red-600 md:text-amber-500 text-xs md:text-sm font-medium mb-2 md:mb-3">
                  {step.subtitle}
                </p>

                {/* Description / 説明 */}
                <p className="text-slate-600 md:text-slate-400 text-xs md:text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button / CTAボタン */}
        <div
          className={`text-center mt-8 md:mt-12 transform transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <a
            href="/signup"
            className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-10 py-4 md:py-5 bg-red-600 md:bg-gradient-to-r md:from-amber-500 md:to-amber-600 text-white md:text-slate-900 font-bold text-base md:text-lg rounded-xl hover:bg-red-700 md:hover:from-amber-400 md:hover:to-amber-500 transition-all duration-300 shadow-lg shadow-red-500/25 md:shadow-amber-500/25 hover:shadow-red-500/40 md:hover:shadow-amber-500/40 hover:-translate-y-1"
          >
            今すぐ無料で登録
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
