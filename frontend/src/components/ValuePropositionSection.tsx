// Value Proposition Section - Core Metrics Emphasis
// バリュープロポジションセクション - 核心数値強調
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ValuePropositionSection Component
 * ValuePropositionSectionコンポーネント
 *
 * BizReach style 3 core values emphasized with numbers
 * BizReachスタイルの3つの核心価値を数字で強調
 *
 * - 年収1,000万円以上求人が4割以上
 * - 導入企業40,000社以上
 * - 登録ヘッドハンター9,300人以上
 */

const valueProps = [
  {
    number: "1,000万円",
    suffix: "以上",
    label: "年収求人が4割以上",
    description: "ハイクラス求人を多数掲載。あなたの市場価値に見合った求人が見つかります。",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "40,000",
    suffix: "社以上",
    label: "導入企業数",
    description: "大手企業からスタートアップまで、幅広い企業が人材を探しています。",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    number: "9,300",
    suffix: "人以上",
    label: "登録ヘッドハンター",
    description: "経験豊富なヘッドハンターがあなたのキャリアをサポートします。",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function ValuePropositionSection() {
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
      className="relative py-12 md:py-24 bg-white md:bg-slate-950 overflow-hidden"
    >
      {/* Background Decoration / 背景装飾 */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="hidden md:block absolute -top-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="hidden md:block absolute -bottom-40 -right-40 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header / セクションヘッダー */}
        <div
          className={`text-center mb-8 md:mb-16 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-red-600 md:text-amber-500 text-sm font-semibold tracking-widest uppercase">
            Why Choose Us
          </span>
          <h2 className="mt-3 md:mt-4 text-2xl md:text-4xl font-bold text-slate-900 md:text-white">
            選ばれる
            <span className="text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
              3つの理由
            </span>
          </h2>
        </div>

        {/* Value Card Grid / バリューカードグリッド */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          {valueProps.map((prop, index) => (
            <div
              key={prop.label}
              className={`group relative p-6 md:p-8 bg-slate-50 md:bg-slate-900/50 rounded-xl md:rounded-2xl border border-slate-200 md:border-slate-800 hover:border-red-300 md:hover:border-amber-500/30 transition-all duration-500 transform ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* 호버 글로우 / ホバーグロー */}
              <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500/5 md:from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                {/* 아이콘 / アイコン */}
                <div className="inline-flex items-center justify-center w-12 md:w-14 h-12 md:h-14 rounded-xl bg-red-100 md:bg-amber-500/10 text-red-600 md:text-amber-500 mb-4 md:mb-6">
                  {prop.icon}
                </div>

                {/* 숫자 / 数字 */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl md:text-5xl font-bold text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
                    {prop.number}
                  </span>
                  <span className="text-base md:text-lg text-red-500 md:text-amber-500 font-medium">
                    {prop.suffix}
                  </span>
                </div>

                {/* 라벨 / ラベル */}
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 md:text-white mb-2 md:mb-3">
                  {prop.label}
                </h3>

                {/* 설명 / 説明 */}
                <p className="text-slate-600 md:text-slate-400 text-sm md:text-base leading-relaxed">
                  {prop.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
