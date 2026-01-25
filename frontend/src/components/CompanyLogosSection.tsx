// Company Logos Section - Trust Indicators
// 企業ロゴセクション - 信頼性表示
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CompanyLogosSection Component
 * CompanyLogosSectionコンポーネント
 *
 * Displays partner/customer company logos to emphasize trust
 * パートナー企業/導入企業ロゴを表示して信頼性を強調
 *
 * BizReach Style: "他では出会えない希少な求人を多数掲載"
 * BizReachスタイル: "他では出会えない希少な求人を多数掲載"
 */

// Japanese Major Company Data with Simple Icons slugs
// 日本の大手企業データ (Simple Icons スラッグ付き)
const companies = [
  { name: "Toyota", slug: "toyota", initial: "T" },
  { name: "Sony", slug: "sony", initial: "S" },
  { name: "Honda", slug: "honda", initial: "H" },
  { name: "Panasonic", slug: "panasonic", initial: "P" },
  { name: "Mazda", slug: "mazda", initial: "M" },
  { name: "Suzuki", slug: "suzuki", initial: "S" },
  { name: "Subaru", slug: "subaru", initial: "S" },
  { name: "Nissan", slug: "nissan", initial: "N" },
  { name: "SEGA", slug: "sega", initial: "S" },
  { name: "LINE", slug: "line", initial: "L" },
  { name: "Mitsubishi", slug: "mitsubishi", initial: "M" },
  { name: "Nikon", slug: "nikon", initial: "N" },
];

// Logo component with error fallback
function CompanyLogo({ company }: { company: typeof companies[0] }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="text-xl md:text-2xl font-bold text-slate-400 md:text-slate-500 group-hover:text-red-500 md:group-hover:text-amber-500 transition-colors duration-300">
        {company.initial}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Dark logo / モバイル: ダークロゴ */}
      <img
        src={`https://cdn.simpleicons.org/${company.slug}/64748b`}
        alt={company.name}
        className="md:hidden object-contain max-h-6 max-w-[60px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
        onError={() => setHasError(true)}
      />
      {/* Desktop: White logo / デスクトップ: ホワイトロゴ */}
      <img
        src={`https://cdn.simpleicons.org/${company.slug}/white`}
        alt={company.name}
        className="hidden md:block object-contain max-h-8 max-w-[70px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        onError={() => setHasError(true)}
      />
    </>
  );
}

export default function CompanyLogosSection() {
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
      className="relative py-12 md:py-20 bg-slate-100 md:bg-slate-900 overflow-hidden"
    >
      {/* Top Divider / 上部ディバイダー */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header / セクションヘッダー */}
        <div
          className={`text-center mb-8 md:mb-12 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-red-600 md:text-amber-500 text-sm font-semibold tracking-widest uppercase mb-3 md:mb-4">
            Trusted By Industry Leaders
          </p>
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 md:text-white">
            他では出会えない
            <span className="text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
              希少な求人
            </span>
            を多数掲載
          </h2>
        </div>

        {/* Logo Grid / ロゴグリッド */}
        <div
          className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 transform transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="group relative flex items-center justify-center p-3 md:p-4 h-16 md:h-20 bg-white md:bg-slate-800/30 rounded-lg md:rounded-xl border border-slate-200 md:border-slate-700/50 hover:border-red-300 md:hover:border-amber-500/30 hover:bg-slate-50 md:hover:bg-slate-800/50 transition-all duration-300"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {/* Company Logo with fallback */}
              <CompanyLogo company={company} />

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-xs text-slate-500 md:text-slate-400 whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Text / 追加テキスト */}
        <p
          className={`text-center mt-6 md:mt-8 text-slate-500 text-xs md:text-sm transform transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          ※ 上記は導入企業の一部です。40,000社以上の企業が利用中。
        </p>
      </div>
    </section>
  );
}
