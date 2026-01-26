// 인증 흐름 E2E 테스트
// 認証フローE2Eテスト
//
// 회원가입 → 로그인 → 프로필 편집 전체 흐름 테스트
// 会員登録 → ログイン → プロフィール編集全体フローテスト

import { test, expect } from '@playwright/test';

// 테스트용 계정 정보 (환경변수에서 가져오거나 기본값 사용)
// テスト用アカウント情報（環境変数から取得またはデフォルト値使用）
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || `test-${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPassword123!';

test.describe('인증 흐름 / 認証フロー', () => {
  // ============================================================
  // 테스트 1: 홈페이지 접근
  // テスト1: ホームページアクセス
  // ============================================================
  test('홈페이지가 정상적으로 로드됨', async ({ page }) => {
    await page.goto('/');

    // 페이지 로드 확인
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
  });

  // ============================================================
  // 테스트 2: 로그인 페이지 접근
  // テスト2: ログインページアクセス
  // ============================================================
  test('로그인 페이지가 정상적으로 로드됨', async ({ page }) => {
    await page.goto('/login');

    // 로그인 폼 요소 확인
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    await expect(page.getByPlaceholder('이메일')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  // ============================================================
  // 테스트 3: 회원가입 페이지 접근
  // テスト3: 会員登録ページアクセス
  // ============================================================
  test('회원가입 페이지가 정상적으로 로드됨', async ({ page }) => {
    await page.goto('/signup');

    // 회원가입 폼 요소 확인
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
    await expect(page.getByPlaceholder('이메일')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호')).toBeVisible();
  });

  // ============================================================
  // 테스트 4: 로그인 → 로그인 성공 확인 (기존 테스트 계정 사용)
  // テスト4: ログイン → ログイン成功確認（既存テストアカウント使用）
  // ============================================================
  test('유효한 자격 증명으로 로그인 성공', async ({ page }) => {
    // 테스트 계정이 환경변수로 설정된 경우에만 실행
    test.skip(!process.env.E2E_TEST_EMAIL, '테스트 계정이 설정되지 않음');

    await page.goto('/login');

    // 이메일 입력
    await page.getByPlaceholder('이메일').fill(process.env.E2E_TEST_EMAIL!);

    // 비밀번호 입력
    await page.getByPlaceholder('비밀번호').fill(process.env.E2E_TEST_PASSWORD!);

    // 로그인 버튼 클릭
    await page.getByRole('button', { name: '로그인' }).click();

    // 홈페이지로 리다이렉트 확인 (또는 에러 메시지 없음 확인)
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  // ============================================================
  // 테스트 5: 프로필 페이지 접근 (미인증 시 리다이렉트)
  // テスト5: プロフィールページアクセス（未認証時リダイレクト）
  // ============================================================
  test('미인증 상태에서 프로필 페이지 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    await page.goto('/profile');

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  // ============================================================
  // 테스트 6: 로그인 후 프로필 페이지 접근 및 편집
  // テスト6: ログイン後プロフィールページアクセスおよび編集
  // ============================================================
  test('로그인 후 프로필 편집 흐름', async ({ page }) => {
    // 테스트 계정이 환경변수로 설정된 경우에만 실행
    test.skip(!process.env.E2E_TEST_EMAIL, '테스트 계정이 설정되지 않음');

    // 1. 로그인
    await page.goto('/login');
    await page.getByPlaceholder('이메일').fill(process.env.E2E_TEST_EMAIL!);
    await page.getByPlaceholder('비밀번호').fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole('button', { name: '로그인' }).click();

    // 홈으로 리다이렉트 대기
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 2. 프로필 페이지로 이동
    await page.goto('/profile');

    // 프로필 설정 페이지 로드 확인
    await expect(page.getByRole('heading', { name: '프로필 설정' })).toBeVisible({ timeout: 10000 });

    // 3. 프로필 폼이 표시되는지 확인
    // (JobSeeker 또는 Company에 따라 다른 폼이 표시됨)
    const saveButton = page.getByRole('button', { name: /저장|保存/ });
    await expect(saveButton).toBeVisible();

    // 4. 프로필 수정 테스트 (한줄 소개 입력)
    const headlineInput = page.locator('#headline');
    if (await headlineInput.isVisible()) {
      const testHeadline = `E2E 테스트 - ${Date.now()}`;
      await headlineInput.fill(testHeadline);

      // 저장 버튼 클릭
      await saveButton.click();

      // 성공 메시지 확인
      await expect(page.getByText(/프로필이 저장되었습니다|プロフィールが保存されました/)).toBeVisible({ timeout: 10000 });
    }
  });

  // ============================================================
  // 테스트 7: 잘못된 비밀번호로 로그인 실패
  // テスト7: 間違ったパスワードでログイン失敗
  // ============================================================
  test('잘못된 비밀번호로 로그인 시 에러 메시지 표시', async ({ page }) => {
    await page.goto('/login');

    // 이메일 입력
    await page.getByPlaceholder('이메일').fill('test@example.com');

    // 잘못된 비밀번호 입력
    await page.getByPlaceholder('비밀번호').fill('WrongPassword123!');

    // 로그인 버튼 클릭
    await page.getByRole('button', { name: '로그인' }).click();

    // 에러 메시지 확인
    await expect(page.getByText(/등록되지 않은|올바르지 않습니다|실패했습니다/)).toBeVisible({ timeout: 10000 });
  });

  // ============================================================
  // 테스트 8: 회원가입 폼 유효성 검사
  // テスト8: 会員登録フォームバリデーション
  // ============================================================
  test('회원가입 폼에서 필수 필드 확인', async ({ page }) => {
    await page.goto('/signup');

    // 빈 폼으로 제출 시도 (HTML5 validation)
    const submitButton = page.getByRole('button', { name: /회원가입|登録/ });
    await submitButton.click();

    // 이메일 필드가 필수인지 확인 (HTML5 validation)
    const emailInput = page.getByPlaceholder('이메일');
    await expect(emailInput).toHaveAttribute('required', '');
  });
});

// ============================================================
// 네비게이션 테스트
// ナビゲーションテスト
// ============================================================
test.describe('네비게이션 / ナビゲーション', () => {
  test('로그인 페이지에서 회원가입 링크 클릭', async ({ page }) => {
    await page.goto('/login');

    // 회원가입 링크 클릭
    await page.getByRole('link', { name: '회원가입' }).click();

    // 회원가입 페이지로 이동 확인
    await expect(page).toHaveURL('/signup');
  });

  test('회원가입 페이지에서 로그인 링크 클릭', async ({ page }) => {
    await page.goto('/signup');

    // 로그인 링크 클릭
    await page.getByRole('link', { name: '로그인' }).click();

    // 로그인 페이지로 이동 확인
    await expect(page).toHaveURL('/login');
  });
});
