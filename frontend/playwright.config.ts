// Playwright 설정
// Playwright設定

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 테스트 디렉토리
  // テストディレクトリ
  testDir: './e2e',

  // 병렬 실행 비활성화 (인증 테스트는 순차 실행)
  // 並列実行無効化（認証テストは順次実行）
  fullyParallel: false,

  // CI 환경에서 재시도 비활성화
  // CI環境でリトライ無効化
  forbidOnly: !!process.env.CI,

  // 재시도 횟수
  // リトライ回数
  retries: process.env.CI ? 2 : 0,

  // 워커 수 (순차 실행을 위해 1로 설정)
  // ワーカー数（順次実行のため1に設定）
  workers: 1,

  // 리포터 설정
  // レポーター設定
  reporter: 'html',

  // 공통 설정
  // 共通設定
  use: {
    // 베이스 URL
    // ベースURL
    baseURL: 'http://localhost:3000',

    // 추적 설정 (실패 시에만)
    // トレース設定（失敗時のみ）
    trace: 'on-first-retry',

    // 스크린샷 설정 (실패 시에만)
    // スクリーンショット設定（失敗時のみ）
    screenshot: 'only-on-failure',
  },

  // 프로젝트 설정
  // プロジェクト設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 개발 서버 설정
  // 開発サーバー設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
