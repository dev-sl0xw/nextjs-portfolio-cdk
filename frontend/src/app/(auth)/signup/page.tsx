// 회원가입 페이지
// 会員登録ページ

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type UserType = 'jobseeker' | 'company';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading: authLoading } = useAuth();

  // 폼 상태 / フォーム状態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('jobseeker');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 유효성 검사 / パスワードバリデーション
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!/[a-z]/.test(pwd)) {
      return '비밀번호에 소문자가 포함되어야 합니다.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return '비밀번호에 대문자가 포함되어야 합니다.';
    }
    if (!/[0-9]/.test(pwd)) {
      return '비밀번호에 숫자가 포함되어야 합니다.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return '비밀번호에 특수문자가 포함되어야 합니다.';
    }
    return null;
  };

  // 폼 제출 핸들러 / フォーム送信ハンドラー
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인 / パスワード確認
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검사 / パスワードバリデーション
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await signUp({ email, password, userType });
      // 회원가입 성공 시 이메일 인증 페이지로 이동
      // 会員登録成功時メール認証ページへ移動
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const error = err as Error;
      // Cognito 에러 메시지 한글화 / Cognitoエラーメッセージ韓国語化
      if (error.message.includes('User already exists')) {
        setError('이미 등록된 이메일입니다.');
      } else if (error.message.includes('Invalid email')) {
        setError('올바른 이메일 형식이 아닙니다.');
      } else if (error.message.includes('Password did not conform')) {
        setError(
          '비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.'
        );
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
      console.error('SignUp error:', error);
    } finally {
      setIsLoading(false);
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
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              로그인
            </Link>
          </p>
        </div>

        {/* 회원가입 폼 / 会員登録フォーム */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* 에러 메시지 / エラーメッセージ */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 사용자 유형 선택 / ユーザータイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              회원 유형
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                  userType === 'jobseeker'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setUserType('jobseeker')}
              >
                구직자
              </button>
              <button
                type="button"
                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                  userType === 'company'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setUserType('company')}
              >
                기업
              </button>
            </div>
          </div>

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

            {/* 비밀번호 입력 / パスワード入力 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.
              </p>
            </div>

            {/* 비밀번호 확인 / パスワード確認 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* 회원가입 버튼 / 会員登録ボタン */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
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
                  처리 중...
                </span>
              ) : (
                '회원가입'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
