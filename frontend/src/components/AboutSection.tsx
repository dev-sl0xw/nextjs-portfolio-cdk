// About Section Component - Project Technology Stack
// Aboutセクションコンポーネント - プロジェクト技術スタック
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AboutSection Component
 * AboutSectionコンポーネント
 *
 * Displays the technologies used in this project
 * このプロジェクトで使用された技術を表示
 *
 * Design Points:
 * - Left-right split layout for visual balance
 * - Hover interaction on skill cards
 * - Sequential appearance on scroll
 *
 * デザインポイント:
 * - 左右分割レイアウトで視覚的バランス
 * - スキルカードにホバーインタラクション
 * - スクロール時に要素別順次登場
 */

// Technology Stack Data
// 技術スタックデータ
const skills = [
  {
    category: "Frontend",
    items: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS"],
    color: "from-blue-500 to-cyan-500",
    // 모바일: 흰색 배경, 데스크톱: 컬러 배경
    cardClass: "bg-white md:bg-blue-500/10 border-slate-200 md:border-blue-500/20",
  },
  {
    category: "Infrastructure",
    items: ["AWS CDK", "CloudFront", "ALB", "EC2", "S3", "ECR"],
    color: "from-orange-500 to-amber-500",
    cardClass: "bg-white md:bg-orange-500/10 border-slate-200 md:border-orange-500/20",
  },
  {
    category: "DevOps & Tools",
    items: ["Docker", "GitHub Actions", "SSM Parameter Store"],
    color: "from-green-500 to-emerald-500",
    cardClass: "bg-white md:bg-green-500/10 border-slate-200 md:border-green-500/20",
  },
  {
    category: "Error Pages",
    items: ["Astro", "Static HTML"],
    color: "from-purple-500 to-pink-500",
    cardClass: "bg-white md:bg-purple-500/10 border-slate-200 md:border-purple-500/20",
  },
];

export default function AboutSection() {
  // Scroll visibility state
  // スクロール可視性状態
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
      id="about"
      className="relative py-12 md:py-32 bg-slate-100 md:bg-slate-900 overflow-hidden"
    >
      {/* Background Decoration / 背景装飾 */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="hidden md:block absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header / セクションヘッダー */}
        <div
          className={`text-center mb-8 md:mb-20 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-red-600 md:text-amber-500 text-sm font-semibold tracking-widest uppercase">
            About This Project
          </span>
          <h2 className="mt-3 md:mt-4 text-xl md:text-4xl font-bold text-slate-900 md:text-white">
            このプロジェクトで使用した
            <span className="text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
              技術スタック
            </span>
          </h2>
        </div>

        {/* Main Content Grid / メインコンテンツグリッド */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
          {/* Left: Introduction Text / 左側: 紹介テキスト */}
          <div
            className={`space-y-4 md:space-y-6 transform transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              {/* Decoration Line / 装飾線 */}
              <div className="absolute -left-3 md:-left-4 top-0 w-1 h-full bg-gradient-to-b from-red-500 md:from-amber-500 to-red-600 md:to-amber-600 rounded-full" />

              <p className="text-sm md:text-lg text-slate-700 md:text-slate-300 leading-relaxed pl-4 md:pl-6">
                このポートフォリオサイトは、モダンなWeb技術とAWSクラウドサービスを
                活用して構築されています。フロントエンドからインフラまで、
                フルスタックな技術力をデモンストレーションするプロジェクトです。
              </p>
            </div>

            <p className="text-slate-600 md:text-slate-400 text-sm md:text-base leading-relaxed">
              Next.js 14のApp Routerを採用し、サーバーサイドレンダリングと
              静的サイト生成を組み合わせた最適なパフォーマンスを実現。
              AWS CDKによるInfrastructure as Codeで、再現性のある
              インフラ構築を実践しています。
            </p>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4 md:pt-8">
              {[
                { value: "14+", label: "Tech Stack" },
                { value: "6", label: "AWS Services" },
                { value: "100%", label: "TypeScript" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center p-3 md:p-4 bg-white md:bg-slate-800/50 rounded-xl border border-slate-200 md:border-slate-700/50 transform transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="text-xl md:text-3xl font-bold text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* GitHub Repository Button */}
            <div
              className={`pt-4 md:pt-6 transform transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "700ms" }}
            >
              <a
                href="https://github.com/dev-sl0xw/nextjs-portfolio-cdk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-red-600 md:bg-gradient-to-r md:from-amber-500 md:to-amber-600 text-white md:text-slate-900 font-semibold rounded-xl hover:bg-red-700 md:hover:from-amber-400 md:hover:to-amber-500 transition-all duration-300 shadow-lg shadow-red-500/25 md:shadow-amber-500/25 hover:shadow-red-500/40 md:hover:shadow-amber-500/40 hover:-translate-y-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          {/* Right: Skill Cards / 右側: スキルカード */}
          <div className="space-y-3 md:space-y-4">
            {skills.map((skill, index) => (
              <div
                key={skill.category}
                className={`group relative p-4 md:p-6 rounded-xl md:rounded-2xl border ${skill.cardClass} backdrop-blur-sm transform transition-all duration-700 hover:scale-[1.02] hover:shadow-xl ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
              >
                {/* Hover Gradient Border / ホバー時グラデーションボーダー */}
                <div
                  className={`absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative">
                  <h3
                    className={`text-base md:text-lg font-semibold bg-gradient-to-r ${skill.color} bg-clip-text text-transparent`}
                  >
                    {skill.category}
                  </h3>

                  <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                      <span
                        key={item}
                        className="px-2 md:px-3 py-1 md:py-1.5 bg-slate-100 md:bg-slate-800/80 text-slate-700 md:text-slate-300 text-xs md:text-sm rounded-lg border border-slate-200 md:border-slate-700/50 hover:border-slate-300 md:hover:border-slate-600 transition-colors duration-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
