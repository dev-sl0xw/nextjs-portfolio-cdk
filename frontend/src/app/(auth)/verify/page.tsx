// メール認証ページ
// 이메일 인증 페이지

'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// SearchParamsを使用するコンポーネントを分離
// SearchParams를 사용하는 컴포넌트를 분리
function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmSignUp, resendConfirmationCode, isLoading: authLoading } = useAuth();

  // URLからメールパラメータを取得
  // URL에서 이메일 파라미터 가져오기
  const emailParam = searchParams.get('email') || '';

  // フォーム状態 / 폼 상태
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // URLパラメータでメール設定
  // URL 파라미터로 이메일 설정
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // 認証コード送信ハンドラー / 인증 코드 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await confirmSignUp({ email, code });
      setSuccess('メール認証が完了しました。ログインしてください。');
      // 2秒後ログインページへ移動
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const error = err as Error;
      // Cognitoエラーメッセージ日本語化 / Cognito 에러 메시지 일본어화
      if (error.message.includes('Invalid verification code')) {
        setError('認証コードが正しくありません。');
      } else if (error.message.includes('Code has expired')) {
        setError('認証コードの有効期限が切れました。新しいコードを要求してください。');
      } else if (
        error.message.includes('User cannot be confirmed. Current status is CONFIRMED')
      ) {
        setSuccess('すでに認証されたアカウントです。ログインしてください。');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('認証に失敗しました。もう一度お試しください。');
      }
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 認証コード再送信ハンドラー / 인증 코드 재전송 핸들러
  const handleResendCode = async () => {
    if (!email) {
      setError('メールアドレスを入力してください。');
      return;
    }

    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      await resendConfirmationCode(email);
      setSuccess('認証コードを再送信しました。メールをご確認ください。');
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('User is already confirmed')) {
        setSuccess('すでに認証されたアカウントです。ログインしてください。');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('認証コードの再送信に失敗しました。');
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
        {/* ヘッダー / 헤더 */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            メール認証
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            メールで送信された6桁の認証コードを入力してください。
          </p>
        </div>

        {/* 認証フォーム / 인증 폼 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* エラーメッセージ / 에러 메시지 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 成功メッセージ / 성공 메시지 */}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* メール入力 / 이메일 입력 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
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

            {/* 認証コード入力 / 인증 코드 입력 */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                認証コード
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

          {/* 認証ボタン / 인증 버튼 */}
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
                  確認中...
                </span>
              ) : (
                '認証確認'
              )}
            </button>
          </div>

          {/* 認証コード再送信 / 인증 코드 재전송 */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              {isResending ? '送信中...' : '認証コードを再送信'}
            </button>
          </div>

          {/* ログインリンク / 로그인 링크 */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              ログインページへ戻る
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
