import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

/**
 * Cognito 스택 Props
 * CognitoスタックProps
 */
export interface CognitoStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
}

/**
 * Cognito 인증 스택
 * Cognito認証スタック
 *
 * Amazon Cognito User Pool을 사용한 사용자 인증 관리
 * Amazon Cognito User Poolを使用したユーザー認証管理
 *
 * Cognito 선택 이유:
 * - FreeTier: 50,000 MAU 무료
 * - 완전 관리형 인증 서비스
 * - OAuth 2.0 / OIDC 표준 지원
 * - 이메일 인증 기본 제공 (SES 불필요)
 *
 * Cognito選択理由:
 * - FreeTier: 50,000 MAU無料
 * - 完全マネージド認証サービス
 * - OAuth 2.0 / OIDC標準サポート
 * - メール認証デフォルト提供（SES不要）
 */
export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const { projectName, environment } = props;

    // ============================================================
    // User Pool 생성
    // User Pool作成
    //
    // 이메일 기반 로그인 + 커스텀 속성으로 사용자 유형 구분
    // メールベースログイン + カスタム属性でユーザータイプ区分
    // ============================================================
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${projectName}-${environment}-user-pool`,

      // 로그인 식별자: 이메일만 사용
      // ログイン識別子: メールのみ使用
      signInAliases: {
        email: true,
        username: false,
      },

      // 자동 인증: 이메일 인증 필수
      // 自動検証: メール検証必須
      autoVerify: {
        email: true,
      },

      // 셀프 서비스 회원가입 허용
      // セルフサービス会員登録許可
      selfSignUpEnabled: true,

      // 비밀번호 정책: 8자 이상, 대소문자+숫자
      // パスワードポリシー: 8文字以上、大小文字+数字
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false, // MVP에서는 심볼 불필요
        tempPasswordValidity: cdk.Duration.days(7),
      },

      // 이메일 설정: Cognito 기본 이메일 사용 (SES 불필요)
      // メール設定: Cognitoデフォルトメール使用（SES不要）
      // FreeTier: 일 50건 (시연용 충분)
      // FreeTier: 日50件（デモ用十分）
      email: cognito.UserPoolEmail.withCognito(),

      // MFA 비활성화 (MVP)
      // MFA無効化（MVP）
      mfa: cognito.Mfa.OFF,

      // 계정 복구: 이메일만
      // アカウント復旧: メールのみ
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

      // 사용자 속성: 이름, 이메일
      // ユーザー属性: 名前、メール
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: false,
          mutable: true,
        },
      },

      // 커스텀 속성: 사용자 유형 (jobseeker/company)
      // カスタム属性: ユーザータイプ（jobseeker/company）
      customAttributes: {
        userType: new cognito.StringAttribute({
          minLen: 1,
          maxLen: 20,
          mutable: true,
        }),
      },

      // 사용자 이름 대소문자 구분 안함
      // ユーザー名大小文字区別なし
      signInCaseSensitive: false,

      // 개발 환경: 스택 삭제 시 User Pool도 삭제
      // 開発環境: スタック削除時にUser Poolも削除
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ============================================================
    // User Pool Client 생성
    // User Pool Client作成
    //
    // Next.js 애플리케이션에서 사용할 클라이언트
    // Next.jsアプリケーションで使用するクライアント
    // ============================================================
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `${projectName}-${environment}-client`,

      // 인증 흐름 설정
      // 認証フロー設定
      authFlows: {
        // SRP: Secure Remote Password (권장)
        // SRP: セキュアリモートパスワード（推奨）
        userSrp: true,

        // 커스텀 인증 흐름 (향후 확장용)
        // カスタム認証フロー（今後の拡張用）
        custom: true,

        // 관리자 인증 (서버 사이드용)
        // 管理者認証（サーバーサイド用）
        adminUserPassword: true,
      },

      // OAuth 설정 (향후 소셜 로그인 확장용)
      // OAuth設定（今後のソーシャルログイン拡張用）
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/api/auth/callback/cognito',
          `https://${projectName}.${environment}.com/api/auth/callback/cognito`,
        ],
        logoutUrls: [
          'http://localhost:3000',
          `https://${projectName}.${environment}.com`,
        ],
      },

      // 토큰 유효 기간
      // トークン有効期間
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),

      // 클라이언트 시크릿 생성 안함 (SPA용)
      // クライアントシークレット生成なし（SPA用）
      generateSecret: false,

      // 읽기/쓰기 가능 속성
      // 読み取り/書き込み可能属性
      readAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({
          email: true,
          emailVerified: true,
          fullname: true,
        })
        .withCustomAttributes('userType'),
      writeAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({
          email: true,
          fullname: true,
        })
        .withCustomAttributes('userType'),

      // 토큰 취소 활성화
      // トークン取り消し有効化
      enableTokenRevocation: true,

      // 호스팅 UI에서 ID 프로바이더 선택 방지
      // ホスティングUIでIDプロバイダー選択防止
      preventUserExistenceErrors: true,
    });

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${projectName}-${environment}-cognito-user-pool-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
      exportName: `${projectName}-${environment}-cognito-user-pool-arn`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${projectName}-${environment}-cognito-client-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolProviderUrl', {
      value: this.userPool.userPoolProviderUrl,
      description: 'Cognito User Pool Provider URL',
      exportName: `${projectName}-${environment}-cognito-provider-url`,
    });
  }
}
