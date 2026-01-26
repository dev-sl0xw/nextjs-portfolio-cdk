// 프로필 이미지 업로드 유틸리티 (클라이언트용)
// プロフィール画像アップロードユーティリティ（クライアント用）
//
// Presigned URL을 사용한 S3 직접 업로드
// Presigned URLを使用したS3直接アップロード

import { getIdToken } from './cognito';

// ============================================================
// 타입 정의
// 型定義
// ============================================================
interface PresignedUrlResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresIn: number;
  maxFileSize: number;
}

interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

// ============================================================
// 프로필 이미지 업로드
// プロフィール画像アップロード
//
// 사용법:
// const result = await uploadProfileImage(file);
// if (result.success) {
//   console.log('Image URL:', result.publicUrl);
// }
// ============================================================
export async function uploadProfileImage(file: File): Promise<UploadResult> {
  try {
    // 파일 유효성 검사
    // ファイルバリデーション
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `허용되지 않는 파일 형식입니다. (허용: ${allowedTypes.join(', ')}) / 許可されないファイル形式です。`,
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `파일 크기가 너무 큽니다. (최대 5MB) / ファイルサイズが大きすぎます。`,
      };
    }

    // 인증 토큰 가져오기
    // 認証トークン取得
    const idToken = await getIdToken();
    if (!idToken) {
      return {
        success: false,
        error: '로그인이 필요합니다. / ログインが必要です。',
      };
    }

    // Step 1: Presigned URL 요청
    // Step 1: Presigned URLリクエスト
    const presignedResponse = await fetch('/api/upload/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        contentType: file.type,
        fileSize: file.size,
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json();
      return {
        success: false,
        error: errorData.error || 'Presigned URL 발급 실패 / Presigned URL発行失敗',
      };
    }

    const presignedData: PresignedUrlResponse = await presignedResponse.json();

    // Step 2: S3에 직접 업로드
    // Step 2: S3に直接アップロード
    const uploadResponse = await fetch(presignedData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        error: `S3 업로드 실패 (${uploadResponse.status}) / S3アップロード失敗`,
      };
    }

    // Step 3: 성공 응답
    // Step 3: 成功レスポンス
    return {
      success: true,
      publicUrl: presignedData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: '업로드 중 오류가 발생했습니다. / アップロード中にエラーが発生しました。',
    };
  }
}

// ============================================================
// 이미지 리사이즈 (선택적 전처리)
// 画像リサイズ（オプショナル前処理）
//
// 업로드 전 클라이언트에서 이미지 크기 조절
// アップロード前にクライアントで画像サイズ調整
// ============================================================
export async function resizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 비율 계산
      // 比率計算
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(
              new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
            );
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Image load failed'));
    };

    img.src = URL.createObjectURL(file);
  });
}
