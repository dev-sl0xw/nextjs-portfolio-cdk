// API Route 인증 유틸리티
// API Route認証ユーティリティ
//
// Cognito ID Token 검증 및 사용자 정보 추출
// Cognito IDトークン検証およびユーザー情報抽出

import { NextRequest } from 'next/server';

// ============================================================
// 타입 정의
// 型定義
// ============================================================
export interface AuthenticatedUser {
  sub: string; // Cognito sub (고유 식별자)
  email: string;
  userType: 'jobseeker' | 'company';
}

export interface AuthError {
  error: string;
  status: number;
}

// ============================================================
// JWT 디코딩 (간단한 구현)
// JWTデコード（簡単な実装）
//
// 참고: 프로덕션에서는 jose 또는 jsonwebtoken 라이브러리 사용 권장
// 注意: 本番ではjoseまたはjsonwebtokenライブラリ使用推奨
//
// Cognito ID Token은 3부분으로 구성: header.payload.signature
// 여기서는 payload만 디코딩하여 사용자 정보 추출
// ============================================================
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64URL 디코딩
    // Base64URLデコード
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ============================================================
// 토큰 만료 확인
// トークン有効期限確認
// ============================================================
function isTokenExpired(exp: number): boolean {
  // exp는 Unix timestamp (초 단위)
  // expはUnixタイムスタンプ（秒単位）
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= exp;
}

// ============================================================
// API Route에서 인증된 사용자 가져오기
// API Routeで認証済みユーザー取得
//
// 사용법:
// const user = await getAuthenticatedUser(request);
// if ('error' in user) {
//   return NextResponse.json({ error: user.error }, { status: user.status });
// }
// ============================================================
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | AuthError> {
  // Authorization 헤더 확인
  // Authorizationヘッダー確認
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return {
      error: '인증이 필요합니다. / 認証が必要です。',
      status: 401,
    };
  }

  // Bearer 토큰 추출
  // Bearerトークン抽出
  if (!authHeader.startsWith('Bearer ')) {
    return {
      error: '잘못된 인증 형식입니다. / 不正な認証形式です。',
      status: 401,
    };
  }

  const token = authHeader.slice(7); // "Bearer " 이후 부분

  // JWT 디코딩
  // JWTデコード
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return {
      error: '유효하지 않은 토큰입니다. / 無効なトークンです。',
      status: 401,
    };
  }

  // 토큰 만료 확인
  // トークン有効期限確認
  if (typeof payload.exp === 'number' && isTokenExpired(payload.exp)) {
    return {
      error: '토큰이 만료되었습니다. / トークンが期限切れです。',
      status: 401,
    };
  }

  // Cognito ID Token 필드 추출
  // Cognito IDトークンフィールド抽出
  const sub = payload.sub as string | undefined;
  const email = payload.email as string | undefined;
  const userType = payload['custom:userType'] as string | undefined;

  if (!sub || !email) {
    return {
      error: '토큰에 필수 정보가 없습니다. / トークンに必須情報がありません。',
      status: 401,
    };
  }

  // userType이 없으면 기본값 설정
  // userTypeがない場合デフォルト値設定
  const validUserType =
    userType === 'company' || userType === 'jobseeker' ? userType : 'jobseeker';

  return {
    sub,
    email,
    userType: validUserType,
  };
}

// ============================================================
// 인증 에러 체크 헬퍼
// 認証エラーチェックヘルパー
// ============================================================
export function isAuthError(
  result: AuthenticatedUser | AuthError
): result is AuthError {
  return 'error' in result;
}
