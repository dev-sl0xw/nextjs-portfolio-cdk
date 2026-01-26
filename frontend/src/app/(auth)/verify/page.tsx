// 이메일 인증 페이지
// メール認証ページ

'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// SearchParams를 사용하는 컴포넌트를 분리
// SearchParamsを使用するコンポーネントを分離
function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmSignUp, resendConfirmationCode, isLoading: authLoading } = useAuth();

  // URL에서 이메일 파라미터 가져오기
  // URLからメールパラメータを取得
  const emailParam = searchParams.get('email') || '';

  // 폼 상태 / フォーム状態
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // URL 파라미터로 이메일 설정
  // URLパラメータでメール設定
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // 인증 코드 제출 핸들러 / 認証コード送信ハンドラー
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await confirmSignUp({ email, code });
      setSuccess('이메일 인증이 완료되었습니다. 로그인해주세요.');
      // 2초 후 로그인 페이지로 이동
      // 2秒後ログインページへ移動
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const error = err as Error;
      // Cognito 에러 메시지 한글화 / Cognitoエラーメッセージ韓国語化
      if (error.message.includes('Invalid verification code')) {
        setError('인증 코드가 올바르지 않습니다.');
      } else if (error.message.includes('Code has expired')) {
        setError('인증 코드가 만료되었습니다. 새 코드를 요청해주세요.');
      } else if (
        error.message.includes('User cannot be confirmed. Current status is CONFIRMED')
      ) {
        setSuccess('이미 인증된 계정입니다. 로그인해주세요.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('인증에 실패했습니다. 다시 시도해주세요.');
      }
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 코드 재전송 핸들러 / 認証コード再送信ハンドラー
  const handleResendCode = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      await resendConfirmationCode(email);
      setSuccess('인증 코드가 재전송되었습니다. 이메일을 확인해주세요.');
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('User is already confirmed')) {
        setSuccess('이미 인증된 계정입니다. 로그인해주세요.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('인증 코드 재전송에 실패했습니다.');
      }
      console.error('Resend code error:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 / ヘッダー */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            이메일 인증
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이메일로 전송된 6자리 인증 코드를 입력해주세요.
          </p>
        </div>

        {/* 인증 폼 / 認証フォーム */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* 에러 메시지 / エラーメッセージ */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 성공 메시지 / 成功メッセージ */}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* 이메일 입력 / メール入力 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* 인증 코드 입력 / 認証コード入力 */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                인증 코드
              </label>
              <input
                id="code"
                name="code"
                type="text"
                autoComplete="one-time-code"
                required
                maxLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center tracking-widest text-lg"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          </div>

          {/* 인증 버튼 / 認証ボタン */}
          <div>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  확인 중...
                </span>
              ) : (
                '인증 확인'
              )}
            </button>
          </div>

          {/* 인증 코드 재전송 / 認証コード再送信 */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              {isResending ? '전송 중...' : '인증 코드 재전송'}
            </button>
          </div>

          {/* 로그인 링크 / ログインリンク */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
// Suspense用ローディングフォールバック
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main page component with Suspense wrapper
// Suspenseラッパー付きメインページコンポーネント
export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyForm />
    </Suspense>
  );
}
