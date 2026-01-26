// 프로필 이미지 업로드 컴포넌트
// プロフィール画像アップロードコンポーネント

'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { uploadProfileImage } from '@/lib/upload';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export default function ProfileImageUpload({
  currentImageUrl,
  onUploadComplete,
  onUploadError,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  // ファイル選択ハンドラー
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 미리보기 생성
    // プレビュー生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드 시작
    // アップロード開始
    setIsUploading(true);

    try {
      const result = await uploadProfileImage(file);

      if (result.success && result.publicUrl) {
        onUploadComplete(result.publicUrl);
        setError(null);
      } else {
        const errorMsg = result.error || '업로드 실패 / アップロード失敗';
        setError(errorMsg);
        onUploadError?.(errorMsg);
        setPreviewUrl(null);
      }
    } catch (err) {
      const errorMsg = '업로드 중 오류가 발생했습니다. / アップロード中にエラーが発生しました。';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  // 클릭하여 파일 선택
  // クリックしてファイル選択
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 표시할 이미지 URL
  // 表示する画像URL
  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 이미지 프리뷰 / 画像プレビュー */}
      <div
        onClick={handleClick}
        className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 hover:border-blue-400 cursor-pointer transition-colors bg-gray-100"
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="프로필 이미지"
            fill
            className="object-cover"
            unoptimized={previewUrl !== null} // 미리보기는 최적화 스킵
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        {/* 업로드 중 오버레이 / アップロード中オーバーレイ */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* 호버 오버레이 / ホバーオーバーレイ */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all">
            <svg
              className="w-8 h-8 text-white opacity-0 hover:opacity-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 안내 텍스트 / ガイドテキスト */}
      <p className="text-sm text-gray-500">
        클릭하여 이미지 변경 / クリックして画像を変更
      </p>

      {/* 에러 메시지 / エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* 숨겨진 파일 입력 / 非表示ファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
