// Header Component - Navigation and Branding
// ヘッダーコンポーネント - ナビゲーションとブランディング
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Header Component
 * Headerコンポーネント
 *
 * BizReach style minimal navigation header
 * BizReachスタイルのミニマルなナビゲーションヘッダー
 *
 * Features:
 * - Background blur effect on scroll
 * - Subtle hover animations
 * - Responsive design
 * - Login navigation link
 *
 * 特徴:
 * - スクロール時の背景ブラー効果
 * - 繊細なホバーアニメーション
 * - レスポンシブデザイン
 * - ログインナビゲーションリンク
 */
export default function Header() {
  // Scroll state management
  // スクロール状態管理
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          {/* Logo */}
          <Link href="/" className="relative">
            <Image
              src="/logo_bizreach.png"
              alt="Logo"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Login Button */}
          {/* ログインボタン */}
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-6 py-2.5 border border-slate-500 text-white text-sm font-medium rounded-lg hover:bg-slate-800/50 hover:border-slate-400 transition-all duration-300"
          >
            <span>ログイン</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
