// Presigned URL 발급 API
// Presigned URL発行API
//
// POST /api/upload/presigned-url
// 프로필 이미지 업로드를 위한 Presigned URL 생성
// プロフィール画像アップロードのためのPresigned URL生成

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth';
import { generatePresignedUrl, S3_CONFIG } from '@/lib/s3';

// ============================================================
// POST /api/upload/presigned-url
//
// 요청 바디:
// {
//   "contentType": "image/jpeg",
//   "fileSize": 1234567 // bytes
// }
//
// 응답:
// {
//   "uploadUrl": "https://s3.amazonaws.com/...",
//   "objectKey": "jobseekers/{sub}/profile.jpg",
//   "publicUrl": "https://cloudfront.../jobseekers/{sub}/profile.jpg"
// }
// ============================================================
export async function POST(request: NextRequest) {
  // 인증 확인
  // 認証確認
  const authResult = await getAuthenticatedUser(request);

  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { sub, userType } = authResult;

  try {
    // 요청 바디 파싱
    // リクエストボディ解析
    const body = await request.json();
    const { contentType, fileSize } = body;

    // 필수 필드 검증
    // 必須フィールド検証
    if (!contentType) {
      return NextResponse.json(
        { error: 'contentType은 필수입니다. / contentTypeは必須です。' },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    // ファイルサイズ検証
    if (fileSize && fileSize > S3_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `파일 크기가 너무 큽니다. (최대 ${S3_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB) / ファイルサイズが大きすぎます。`,
          maxSize: S3_CONFIG.MAX_FILE_SIZE,
        },
        { status: 400 }
      );
    }

    // Content-Type 검증
    // Content-Type検証
    if (!S3_CONFIG.ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: `허용되지 않는 파일 형식입니다. / 許可されないファイル形式です。`,
          allowedTypes: S3_CONFIG.ALLOWED_IMAGE_TYPES,
        },
        { status: 400 }
      );
    }

    // Presigned URL 생성
    // Presigned URL生成
    const result = await generatePresignedUrl(sub, contentType, userType);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      objectKey: result.objectKey,
      publicUrl: result.publicUrl,
      expiresIn: S3_CONFIG.PRESIGNED_URL_EXPIRES_IN,
      maxFileSize: S3_CONFIG.MAX_FILE_SIZE,
    });
  } catch (error) {
    console.error('Presigned URL API error:', error);
    return NextResponse.json(
      { error: 'Presigned URL 생성 중 오류가 발생했습니다. / Presigned URL生成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
