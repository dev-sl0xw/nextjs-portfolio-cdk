// 히어로 섹션 컴포넌트 - 메인 비주얼
// ヒーローセクションコンポーネント - メインビジュアル
"use client";

import { useEffect, useState } from "react";

/**
 * HeroSection 컴포넌트
 * HeroSectionコンポーネント
 *
 * 첫 인상을 결정하는 메인 비주얼 영역
 * 第一印象を決定するメインビジュアル領域
 *
 * 디자인 포인트:
 * - 다크 네이비 + 골드 조합으로 고급스러움 표현
 * - 미세한 그라데이션과 그레인 텍스처로 깊이감
 * - 타이핑 애니메이션으로 시선 유도
 *
 * デザインポイント:
 * - ダークネイビー + ゴールドの組み合わせで高級感を表現
 * - 微細なグラデーションとグレインテクスチャで深みを演出
 * - タイピングアニメーションで視線誘導
 */
export default function HeroSection() {
  // 텍스트 페이드인 애니메이션 상태
  // テキストフェードインアニメーション状態
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 마운트 후 애니메이션 시작
    // マウント後アニメーション開始
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* 배경 그라데이션 레이어 / 背景グラデーションレイヤー */}
      <div className="absolute inset-0">
        {/* 메인 그라데이션 / メイングラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* 골드 액센트 그라데이션 / ゴールドアクセントグラデーション */}
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

        {/* 그리드 패턴 오버레이 / グリッドパターンオーバーレイ */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* 노이즈 텍스처 / ノイズテクスチャ */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 메인 콘텐츠 / メインコンテンツ */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* 서브 헤드라인 / サブヘッドライン */}
        <div
          className={`transform transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Available for Work
          </span>
        </div>

        {/* 메인 헤드라인 / メインヘッドライン */}
        <h1
          className={`mt-8 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white transform transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="block">Creative</span>
          <span className="block mt-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            Developer
          </span>
        </h1>

        {/* 설명 텍스트 / 説明テキスト */}
        <p
          className={`mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed transform transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Building exceptional digital experiences with modern technologies.
          <br className="hidden md:block" />
          Specialized in{" "}
          <span className="text-white font-medium">React</span>,{" "}
          <span className="text-white font-medium">TypeScript</span>, and{" "}
          <span className="text-white font-medium">AWS</span>.
        </p>

        {/* CTA 버튼 그룹 / CTAボタングループ */}
        <div
          className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 transform transition-all duration-1000 delay-800 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* 프라이머리 버튼 / プライマリボタン */}
          <a
            href="#projects"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1"
          >
            <span className="relative z-10">View Projects</span>
            <svg
              className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            {/* 호버 글로우 / ホバーグロー */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>

          {/* 세컨더리 버튼 / セカンダリボタン */}
          <a
            href="#about"
            className="group inline-flex items-center gap-3 px-8 py-4 border border-slate-700 text-white font-medium rounded-xl hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300"
          >
            <span>Learn More</span>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* 스크롤 인디케이터 / スクロールインジケーター */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transform transition-all duration-1000 delay-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-500 tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-700 flex justify-center pt-2">
            <div className="w-1 h-2 bg-amber-500 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
