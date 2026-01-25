// 비디오 플레이어 컴포넌트
// ビデオプレイヤーコンポーネント
"use client";

import { useRef, useState, useEffect } from "react";

/**
 * VideoPlayer Props
 * ビデオプレイヤープロップス
 */
interface VideoPlayerProps {
  // 비디오 소스 URL (S3 CloudFront URL)
  // ビデオソースURL（S3 CloudFront URL）
  src?: string;

  // 포스터 이미지 URL
  // ポスター画像URL
  poster?: string;

  // 클래스명
  // クラス名
  className?: string;
}

/**
 * VideoPlayer 컴포넌트
 * VideoPlayerコンポーネント
 *
 * S3에서 호스팅되는 비디오를 재생하는 커스텀 플레이어
 * S3からホスティングされるビデオを再生するカスタムプレイヤー
 *
 * 특징:
 * - 커스텀 재생/일시정지 컨트롤
 * - 음소거/음소거 해제 토글
 * - 자동 재생 (음소거 상태)
 * - 반응형 디자인
 *
 * 特徴:
 * - カスタム再生/一時停止コントロール
 * - ミュート/ミュート解除トグル
 * - 自動再生（ミュート状態）
 * - レスポンシブデザイン
 */
export default function VideoPlayer({
  src,
  poster,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);

  // 비디오 소스 확인
  // ビデオソース確認
  useEffect(() => {
    setHasVideo(!!src);
  }, [src]);

  // 재생/일시정지 토글
  // 再生/一時停止トグル
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 음소거 토글
  // ミュートトグル
  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // 비디오가 없을 때 플레이스홀더 표시
  // ビデオがない時はプレースホルダー表示
  if (!hasVideo) {
    return (
      <div
        className={`relative w-full aspect-video bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 ${className}`}
      >
        {/* 플레이스홀더 콘텐츠 / プレースホルダーコンテンツ */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* 비디오 아이콘 / ビデオアイコン */}
          <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* 안내 텍스트 / ガイドテキスト */}
          <p className="text-slate-400 text-sm">
            動画コンテンツをアップロードしてください
          </p>
          <p className="text-slate-500 text-xs mt-1">
            S3: /videos/hero-video.mp4
          </p>
        </div>

        {/* 그라데이션 오버레이 / グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 group ${className}`}
    >
      {/* 비디오 엘리먼트 / ビデオエレメント */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        poster={poster}
        muted={isMuted}
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 그라데이션 오버레이 / グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

      {/* 컨트롤 오버레이 / コントロールオーバーレイ */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* 재생/일시정지 버튼 / 再生/一時停止ボタン */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-500 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-amber-500/30"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg
              className="w-6 h-6 text-slate-900"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-slate-900 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* 하단 컨트롤 바 / 下部コントロールバー */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-t from-slate-950 to-transparent">
        {/* 재생 상태 표시 / 再生状態表示 */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-white text-sm font-medium">
            {isPlaying ? "再生中" : "一時停止"}
          </span>
        </div>

        {/* 음소거 버튼 / ミュートボタン */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
