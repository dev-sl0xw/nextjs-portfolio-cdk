// S3 클라이언트 설정 및 유틸리티
// S3クライアント設定およびユーティリティ
//
// 프로필 이미지 업로드를 위한 Presigned URL 생성
// プロフィール画像アップロードのためのPresigned URL生成

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ============================================================
// S3 클라이언트 초기화
// S3クライアント初期化
//
// EC2 인스턴스에서 실행 시 Instance Profile (IAM Role)을 자동 사용
// 로컬 개발 시 ~/.aws/credentials 또는 환경변수 사용
//
// EC2インスタンスで実行時はInstance Profile（IAM Role）を自動使用
// ローカル開発時は~/.aws/credentialsまたは環境変数使用
// ============================================================
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-1',
});

// ============================================================
// 상수 정의
// 定数定義
// ============================================================
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'portfolio-dev-profile-images-810766399241';

// 허용되는 이미지 MIME 타입
// 許可される画像MIMEタイプ
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// 최대 파일 크기 (5MB)
// 最大ファイルサイズ（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Presigned URL 유효 시간 (5분)
// Presigned URL有効時間（5分）
const PRESIGNED_URL_EXPIRES_IN = 300;

// ============================================================
// Presigned URL 생성
// Presigned URL生成
//
// @param userSub - Cognito sub (사용자 고유 ID)
// @param contentType - 업로드할 파일의 MIME 타입
// @param userType - jobseeker | company
// ============================================================
export async function generatePresignedUrl(
  userSub: string,
  contentType: string,
  userType: 'jobseeker' | 'company'
): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string } | { error: string }> {
  // MIME 타입 검증
  // MIMEタイプ検証
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return {
      error: `허용되지 않는 파일 형식입니다. (허용: ${ALLOWED_IMAGE_TYPES.join(', ')}) / 許可されないファイル形式です。`,
    };
  }

  // 파일 확장자 결정
  // ファイル拡張子決定
  const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  const extension = extensionMap[contentType];

  // S3 오브젝트 키 생성
  // S3オブジェクトキー生成
  // 구조: jobseekers/{cognito_sub}/profile.{ext}
  // 구조: companies/{cognito_sub}/logo.{ext}
  const folder = userType === 'jobseeker' ? 'jobseekers' : 'companies';
  const fileName = userType === 'jobseeker' ? 'profile' : 'logo';
  const objectKey = `${folder}/${userSub}/${fileName}.${extension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
      // 메타데이터
      Metadata: {
        'user-sub': userSub,
        'user-type': userType,
        'uploaded-at': new Date().toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });

    // CloudFront URL 생성 (읽기용)
    // CloudFront URL生成（読み取り用）
    // 참고: CloudFront 도메인은 환경변수로 설정
    // 注意: CloudFrontドメインは環境変数で設定
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || `${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com`;
    const publicUrl = `https://${cloudfrontDomain}/${objectKey}`;

    return {
      uploadUrl,
      objectKey,
      publicUrl,
    };
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return {
      error: 'Presigned URL 생성에 실패했습니다. / Presigned URL生成に失敗しました。',
    };
  }
}

// ============================================================
// S3 오브젝트 삭제
// S3オブジェクト削除
//
// 프로필 이미지 변경 시 기존 이미지 삭제용
// プロフィール画像変更時、既存画像削除用
// ============================================================
export async function deleteS3Object(objectKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      error: '파일 삭제에 실패했습니다. / ファイル削除に失敗しました。',
    };
  }
}

// ============================================================
// 설정값 내보내기
// 設定値エクスポート
// ============================================================
export const S3_CONFIG = {
  BUCKET_NAME,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  PRESIGNED_URL_EXPIRES_IN,
};
