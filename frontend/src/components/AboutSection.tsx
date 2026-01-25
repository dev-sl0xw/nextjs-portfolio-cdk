// 소개 섹션 컴포넌트 - 자기 소개 및 스킬
// 紹介セクションコンポーネント - 自己紹介とスキル
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AboutSection 컴포넌트
 * AboutSectionコンポーネント
 *
 * 개발자 소개 및 기술 스택 표시 영역
 * 開発者紹介と技術スタック表示領域
 *
 * 디자인 포인트:
 * - 좌우 분할 레이아웃으로 시각적 밸런스
 * - 스킬 카드에 호버 인터랙션
 * - 스크롤 시 요소별 순차 등장
 *
 * デザインポイント:
 * - 左右分割レイアウトで視覚的バランス
 * - スキルカードにホバーインタラクション
 * - スクロール時に要素別順次登場
 */

// 기술 스택 데이터
// 技術スタックデータ
const skills = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    category: "Backend",
    items: ["Node.js", "Python", "PostgreSQL", "Redis"],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    category: "Cloud & DevOps",
    items: ["AWS CDK", "Docker", "GitHub Actions", "Terraform"],
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
];

export default function AboutSection() {
  // 스크롤 가시성 상태
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
      className="relative py-32 bg-slate-900 overflow-hidden"
    >
      {/* 배경 장식 / 背景装飾 */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        {/* 섹션 헤더 / セクションヘッダー */}
        <div
          className={`text-center mb-20 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-amber-500 text-sm font-semibold tracking-widest uppercase">
            About Me
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
            Passionate about
            <span className="block mt-2 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Building Great Products
            </span>
          </h2>
        </div>

        {/* 메인 콘텐츠 그리드 / メインコンテンツグリッド */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* 좌측: 소개 텍스트 / 左側: 紹介テキスト */}
          <div
            className={`space-y-6 transform transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              {/* 장식 선 / 装飾線 */}
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600 rounded-full" />

              <p className="text-lg text-slate-300 leading-relaxed pl-6">
                5년 이상의 웹 개발 경험을 보유한 풀스택 개발자입니다. 사용자
                중심의 인터페이스 설계와 확장 가능한 백엔드 아키텍처 구축에
                전문성을 갖추고 있습니다.
              </p>
            </div>

            <p className="text-slate-400 leading-relaxed">
              복잡한 비즈니스 요구사항을 심플하고 우아한 기술 솔루션으로 풀어내는
              것을 즐깁니다. AWS 클라우드 인프라를 활용한 서비스 배포부터
              CI/CD 파이프라인 구축까지, 프로젝트의 전체 라이프사이클을
              경험했습니다.
            </p>

            {/* 통계 카드 / 統計カード */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { value: "5+", label: "Years Exp." },
                { value: "50+", label: "Projects" },
                { value: "99%", label: "Satisfaction" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 transform transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 스킬 카드 / 右側: スキルカード */}
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div
                key={skill.category}
                className={`group relative p-6 rounded-2xl border ${skill.borderColor} ${skill.bgColor} backdrop-blur-sm transform transition-all duration-700 hover:scale-[1.02] hover:shadow-xl ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
              >
                {/* 호버 시 그라데이션 보더 / ホバー時グラデーションボーダー */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative">
                  <h3
                    className={`text-lg font-semibold bg-gradient-to-r ${skill.color} bg-clip-text text-transparent`}
                  >
                    {skill.category}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1.5 bg-slate-800/80 text-slate-300 text-sm rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors duration-200"
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
