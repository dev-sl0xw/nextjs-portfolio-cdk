// Video Section Component - YouTube Embed
// ビデオセクションコンポーネント - YouTube埋め込み
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * VideoSection Component
 * VideoSectionコンポーネント
 *
 * Responsive YouTube video embed section
 * レスポンシブなYouTube動画埋め込みセクション
 *
 * Features:
 * - 16:9 aspect ratio maintained
 * - Fade-in animation on scroll
 * - Full-width responsive design
 *
 * 特徴:
 * - 16:9アスペクト比を維持
 * - スクロール時のフェードインアニメーション
 * - フルワイドレスポンシブデザイン
 */
export default function VideoSection() {
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
      className="relative py-16 md:py-20 bg-white md:bg-slate-950 overflow-hidden"
    >
      {/* Top Divider / 上部ディバイダー */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header / セクションヘッダー */}
        <div
          className={`text-center mb-8 md:mb-10 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-red-600 md:text-amber-500 text-sm font-semibold tracking-widest uppercase">
            Featured Video
          </span>
          <h2 className="mt-3 md:mt-4 text-2xl md:text-4xl font-bold text-slate-900 md:text-white">
            サービス
            <span className="text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
              紹介動画
            </span>
          </h2>
        </div>

        {/* Video Container / ビデオコンテナ */}
        <div
          className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl shadow-slate-200 md:shadow-slate-950/50 border border-slate-200 md:border-slate-800">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/Q-gDoHFVtFA"
              title="ビズリーチ テレビCM 「新カフェ」篇 30秒"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
