// 비디오 플레이어 컴포넌트 (YouTube 임베드)
// ビデオプレイヤーコンポーネント（YouTube埋め込み）
"use client";

/**
 * VideoPlayer Props
 * ビデオプレイヤープロップス
 */
interface VideoPlayerProps {
  // YouTube 비디오 ID
  // YouTubeビデオID
  videoId: string;

  // 비디오 제목 (접근성용)
  // ビデオタイトル（アクセシビリティ用）
  title?: string;

  // 클래스명
  // クラス名
  className?: string;
}

/**
 * VideoPlayer 컴포넌트
 * VideoPlayerコンポーネント
 *
 * YouTube 비디오를 iframe으로 임베드하는 컴포넌트
 * YouTubeビデオをiframeで埋め込むコンポーネント
 *
 * 특징:
 * - 16:9 비율 유지
 * - 반응형 디자인
 * - 보안 설정 (strict-origin-when-cross-origin)
 *
 * 特徴:
 * - 16:9比率維持
 * - レスポンシブデザイン
 * - セキュリティ設定（strict-origin-when-cross-origin）
 */
export default function VideoPlayer({
  videoId,
  title = "Video",
  className = "",
}: VideoPlayerProps) {
  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-amber-500/10 ${className}`}
    >
      {/* YouTube iframe 임베드 / YouTube iframe埋め込み */}
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />

      {/* 코너 장식 / コーナー装飾 */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/30 rounded-tl-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/30 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/30 rounded-bl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/30 rounded-br-2xl pointer-events-none" />
    </div>
  );
}
