// 헤더 컴포넌트 - 네비게이션 및 브랜딩
// ヘッダーコンポーネント - ナビゲーションとブランディング
"use client";

import { useState, useEffect } from "react";

/**
 * Header 컴포넌트
 * Headerコンポーネント
 *
 * BizReach 스타일의 미니멀한 네비게이션 헤더
 * BizReachスタイルのミニマルなナビゲーションヘッダー
 *
 * 특징:
 * - 스크롤 시 배경 블러 효과
 * - 섬세한 호버 애니메이션
 * - 반응형 디자인
 *
 * 特徴:
 * - スクロール時の背景ブラー効果
 * - 繊細なホバーアニメーション
 * - レスポンシブデザイン
 */
export default function Header() {
  // 스크롤 상태 관리
  // スクロール状態管理
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 네비게이션 링크 목록
  // ナビゲーションリンク一覧
  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#skills", label: "Skills" },
    { href: "#projects", label: "Projects" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-slate-950/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* 로고 / ロゴ */}
          <a
            href="#"
            className="group relative font-semibold text-xl tracking-tight text-white"
          >
            <span className="relative z-10">Portfolio</span>
            {/* 골드 액센트 언더라인 / ゴールドアクセントアンダーライン */}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full" />
          </a>

          {/* 네비게이션 링크 / ナビゲーションリンク */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300 py-2"
                >
                  <span>{link.label}</span>
                  {/* 호버 시 골드 도트 / ホバー時ゴールドドット */}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500 opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
                </a>
              </li>
            ))}
          </ul>

          {/* CTA 버튼 / CTAボタン */}
          <a
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-sm font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            Contact Me
          </a>

          {/* 모바일 메뉴 버튼 / モバイルメニューボタン */}
          <button
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span className="w-6 h-0.5 bg-white rounded-full transition-transform" />
            <span className="w-6 h-0.5 bg-white rounded-full transition-opacity" />
            <span className="w-6 h-0.5 bg-white rounded-full transition-transform" />
          </button>
        </div>
      </nav>
    </header>
  );
}
