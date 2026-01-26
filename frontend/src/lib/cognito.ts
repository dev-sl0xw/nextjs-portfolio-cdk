// Cognito 설정 및 인증 유틸리티
// Cognito設定および認証ユーティリティ
//
// Amazon Cognito User Pool을 사용한 인증 관리
// Amazon Cognito User Poolを使用した認証管理

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
  ISignUpResult,
} from 'amazon-cognito-identity-js';

// ============================================================
// Cognito 설정 (지연 초기화)
// Cognito設定（遅延初期化）
//
// 빌드 시점에는 환경변수가 없으므로 런타임에만 초기화
// ビルド時には環境変数がないのでランタイムでのみ初期化
// ============================================================
let userPoolInstance: CognitoUserPool | null = null;

// 브라우저 환경 체크 / ブラウザ環境チェック
const isBrowser = typeof window !== 'undefined';

const getUserPool = (): CognitoUserPool | null => {
  // SSR/빌드 시에는 null 반환
  // SSR/ビルド時はnullを返す
  if (!isBrowser) {
    return null;
  }

  if (userPoolInstance) {
    return userPoolInstance;
  }

  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

  if (!userPoolId || !clientId) {
    console.warn(
      'Cognito configuration is missing. Please set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID environment variables.'
    );
    return null;
  }

  userPoolInstance = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });

  return userPoolInstance;
};

// ============================================================
// 타입 정의
// 型定義
// ============================================================
export interface SignUpParams {
  email: string;
  password: string;
  userType: 'jobseeker' | 'company';
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ConfirmSignUpParams {
  email: string;
  code: string;
}

export interface AuthUser {
  email: string;
  sub: string;
  userType: string;
}

// ============================================================
// 회원가입
// 会員登録
// ============================================================
export const signUp = ({
  email,
  password,
  userType,
}: SignUpParams): Promise<ISignUpResult> => {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) {
      reject(new Error('Cognito is not configured'));
      return;
    }

    // 커스텀 속성 설정 (userType)
    // カスタム属性設定（userType）
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
      new CognitoUserAttribute({
        Name: 'custom:userType',
        Value: userType,
      }),
    ];

    pool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (result) {
        resolve(result);
      }
    });
  });
};

// ============================================================
// 이메일 인증 코드 확인
// メール認証コード確認
// ============================================================
export const confirmSignUp = ({
  email,
  code,
}: ConfirmSignUpParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) {
      reject(new Error('Cognito is not configured'));
      return;
    }

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

// ============================================================
// 로그인
// ログイン
// ============================================================
export const signIn = ({
  email,
  password,
}: SignInParams): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) {
      reject(new Error('Cognito is not configured'));
      return;
    }

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

// ============================================================
// 로그아웃
// ログアウト
// ============================================================
export const signOut = (): void => {
  const pool = getUserPool();
  if (!pool) return;

  const cognitoUser = pool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};

// ============================================================
// 현재 사용자 세션 가져오기
// 現在のユーザーセッション取得
// ============================================================
export const getCurrentSession = (): Promise<CognitoUserSession | null> => {
  return new Promise((resolve) => {
    const pool = getUserPool();
    if (!pool) {
      resolve(null);
      return;
    }

    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
          return;
        }
        resolve(session);
      }
    );
  });
};

// ============================================================
// 현재 사용자 정보 가져오기
// 現在のユーザー情報取得
// ============================================================
export const getCurrentUser = (): Promise<AuthUser | null> => {
  return new Promise((resolve) => {
    const pool = getUserPool();
    if (!pool) {
      resolve(null);
      return;
    }

    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
          return;
        }

        cognitoUser.getUserAttributes((attrErr, attributes) => {
          if (attrErr || !attributes) {
            resolve(null);
            return;
          }

          const user: AuthUser = {
            email: '',
            sub: '',
            userType: '',
          };

          attributes.forEach((attr) => {
            if (attr.getName() === 'email') {
              user.email = attr.getValue();
            }
            if (attr.getName() === 'sub') {
              user.sub = attr.getValue();
            }
            if (attr.getName() === 'custom:userType') {
              user.userType = attr.getValue();
            }
          });

          resolve(user);
        });
      }
    );
  });
};

// ============================================================
// 인증 코드 재전송
// 認証コード再送信
// ============================================================
export const resendConfirmationCode = (email: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    if (!pool) {
      reject(new Error('Cognito is not configured'));
      return;
    }

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

// ============================================================
// ID 토큰 가져오기 (API 호출용)
// IDトークン取得（API呼び出し用）
// ============================================================
export const getIdToken = async (): Promise<string | null> => {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }
  return session.getIdToken().getJwtToken();
};
