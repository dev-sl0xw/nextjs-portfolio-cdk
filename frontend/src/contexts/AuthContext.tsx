// 인증 컨텍스트
// 認証コンテキスト
//
// 전역 인증 상태 관리를 위한 React Context
// グローバル認証状態管理のためのReact Context

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  signUp as cognitoSignUp,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  confirmSignUp as cognitoConfirmSignUp,
  getCurrentUser,
  resendConfirmationCode as cognitoResendCode,
  SignUpParams,
  SignInParams,
  ConfirmSignUpParams,
  AuthUser,
} from '@/lib/cognito';

// ============================================================
// 타입 정의
// 型定義
// ============================================================
interface AuthContextType {
  // 상태 / 状態
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 인증 함수 / 認証関数
  signUp: (params: SignUpParams) => Promise<void>;
  signIn: (params: SignInParams) => Promise<void>;
  signOut: () => void;
  confirmSignUp: (params: ConfirmSignUpParams) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;

  // 상태 갱신 / 状態更新
  refreshUser: () => Promise<void>;
}

// ============================================================
// Context 생성
// Context作成
// ============================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider 컴포넌트
// Providerコンポーネント
// ============================================================
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------------------------
  // 사용자 정보 갱신
  // ユーザー情報更新
  // ------------------------------------------------------------
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  }, []);

  // ------------------------------------------------------------
  // 초기 로드 시 세션 확인
  // 初期ロード時にセッション確認
  // ------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ------------------------------------------------------------
  // 회원가입
  // 会員登録
  // ------------------------------------------------------------
  const signUp = async (params: SignUpParams): Promise<void> => {
    await cognitoSignUp(params);
    // 회원가입 후 이메일 인증이 필요하므로 바로 로그인하지 않음
    // 会員登録後メール認証が必要なのですぐにはログインしない
  };

  // ------------------------------------------------------------
  // 이메일 인증 코드 확인
  // メール認証コード確認
  // ------------------------------------------------------------
  const confirmSignUp = async (params: ConfirmSignUpParams): Promise<void> => {
    await cognitoConfirmSignUp(params);
  };

  // ------------------------------------------------------------
  // 로그인
  // ログイン
  // ------------------------------------------------------------
  const signIn = async (params: SignInParams): Promise<void> => {
    await cognitoSignIn(params);
    await refreshUser();
  };

  // ------------------------------------------------------------
  // 로그아웃
  // ログアウト
  // ------------------------------------------------------------
  const signOut = (): void => {
    cognitoSignOut();
    setUser(null);
  };

  // ------------------------------------------------------------
  // 인증 코드 재전송
  // 認証コード再送信
  // ------------------------------------------------------------
  const resendConfirmationCode = async (email: string): Promise<void> => {
    await cognitoResendCode(email);
  };

  // ------------------------------------------------------------
  // Context 값
  // Context値
  // ------------------------------------------------------------
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    confirmSignUp,
    resendConfirmationCode,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// useAuth Hook
// useAuth Hook
//
// 컴포넌트에서 인증 상태와 함수에 접근하기 위한 커스텀 훅
// コンポーネントで認証状態と関数にアクセスするためのカスタムフック
// ============================================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
