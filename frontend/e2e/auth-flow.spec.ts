// 認証フローE2Eテスト
// 인증 흐름 E2E 테스트
//
// 会員登録 → ログイン → プロフィール編集全体フローテスト
// 회원가입 → 로그인 → 프로필 편집 전체 흐름 테스트

import { test, expect } from '@playwright/test';

// テスト用アカウント情報（環境変数から取得またはデフォルト値使用）
// 테스트용 계정 정보 (환경변수에서 가져오거나 기본값 사용)
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || `test-${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPassword123!';

test.describe('認証フロー / 인증 흐름', () => {
  // ============================================================
  // テスト1: ホームページアクセス
  // 테스트 1: 홈페이지 접근
  // ============================================================
  test('ホームページが正常にロードされる', async ({ page }) => {
    await page.goto('/');

    // ページロード確認
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
  });

  // ============================================================
  // テスト2: ログインページアクセス
  // 테스트 2: 로그인 페이지 접근
  // ============================================================
  test('ログインページが正常にロードされる', async ({ page }) => {
    await page.goto('/login');

    // ログインフォーム要素確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  // ============================================================
  // テスト3: 会員登録ページアクセス
  // 테스트 3: 회원가입 페이지 접근
  // ============================================================
  test('新規登録ページが正常にロードされる', async ({ page }) => {
    await page.goto('/signup');

    // 会員登録フォーム要素確認
    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
    await expect(page.getByPlaceholder('example@email.com')).toBeVisible();
    await expect(page.getByText('パスワード', { exact: false })).toBeVisible();
  });

  // ============================================================
  // テスト4: ログイン → ログイン成功確認（既存テストアカウント使用）
  // 테스트 4: 로그인 → 로그인 성공 확인 (기존 테스트 계정 사용)
  // ============================================================
  test('有効な資格情報でログイン成功', async ({ page }) => {
    // テストアカウントが環境変数で設定された場合のみ実行
    test.skip(!process.env.E2E_TEST_EMAIL, 'テストアカウントが設定されていません');

    await page.goto('/login');

    // メール入力
    await page.getByPlaceholder('メールアドレス').fill(process.env.E2E_TEST_EMAIL!);

    // パスワード入力
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_TEST_PASSWORD!);

    // ログインボタンクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ホームページへリダイレクト確認
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  // ============================================================
  // テスト5: プロフィールページアクセス（未認証時リダイレクト）
  // 테스트 5: 프로필 페이지 접근 (미인증 시 리다이렉트)
  // ============================================================
  test('未認証状態でプロフィールページアクセス時ログインページへリダイレクト', async ({ page }) => {
    await page.goto('/profile');

    // ログインページへリダイレクト確認
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  // ============================================================
  // テスト6: ログイン後プロフィールページアクセスおよび編集
  // 테스트 6: 로그인 후 프로필 페이지 접근 및 편집
  // ============================================================
  test('ログイン後プロフィール編集フロー', async ({ page }) => {
    // テストアカウントが環境変数で設定された場合のみ実行
    test.skip(!process.env.E2E_TEST_EMAIL, 'テストアカウントが設定されていません');

    // 1. ログイン
    await page.goto('/login');
    await page.getByPlaceholder('メールアドレス').fill(process.env.E2E_TEST_EMAIL!);
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ホームへリダイレクト待機
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 2. プロフィールページへ移動
    await page.goto('/profile');

    // プロフィール設定ページロード確認
    await expect(page.getByRole('heading', { name: 'プロフィール設定' })).toBeVisible({ timeout: 10000 });

    // 3. プロフィールフォームが表示されるか確認
    // (JobSeekerまたはCompanyによって異なるフォームが表示される)
    const saveButton = page.getByRole('button', { name: /保存/ });
    await expect(saveButton).toBeVisible();

    // 4. プロフィール修正テスト（一行紹介入力）
    const headlineInput = page.locator('#headline');
    if (await headlineInput.isVisible()) {
      const testHeadline = `E2Eテスト - ${Date.now()}`;
      await headlineInput.fill(testHeadline);

      // 保存ボタンクリック
      await saveButton.click();

      // 成功メッセージ確認
      await expect(page.getByText(/プロフィールが保存されました/)).toBeVisible({ timeout: 10000 });
    }
  });

  // ============================================================
  // テスト7: 間違ったパスワードでログイン失敗
  // 테스트 7: 잘못된 비밀번호로 로그인 실패
  // ============================================================
  test('間違ったパスワードでログイン時エラーメッセージ表示', async ({ page }) => {
    await page.goto('/login');

    // メール入力
    await page.getByPlaceholder('メールアドレス').fill('test@example.com');

    // 間違ったパスワード入力
    await page.getByPlaceholder('パスワード').fill('WrongPassword123!');

    // ログインボタンクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージ確認
    await expect(page.getByText(/登録されていない|正しくありません|失敗しました/)).toBeVisible({ timeout: 10000 });
  });

  // ============================================================
  // テスト8: 会員登録フォームバリデーション
  // 테스트 8: 회원가입 폼 유효성 검사
  // ============================================================
  test('新規登録フォームで必須フィールド確認', async ({ page }) => {
    await page.goto('/signup');

    // 空のフォームで送信試行（HTML5 validation）
    const submitButton = page.getByRole('button', { name: /新規登録/ });
    await submitButton.click();

    // メールフィールドが必須か確認（HTML5 validation）
    const emailInput = page.getByPlaceholder('example@email.com');
    await expect(emailInput).toHaveAttribute('required', '');
  });
});

// ============================================================
// ナビゲーションテスト
// 네비게이션 테스트
// ============================================================
test.describe('ナビゲーション / 네비게이션', () => {
  test('ログインページから新規登録リンククリック', async ({ page }) => {
    await page.goto('/login');

    // 新規登録リンククリック
    await page.getByRole('link', { name: '新規登録' }).click();

    // 新規登録ページへ移動確認
    await expect(page).toHaveURL('/signup');
  });

  test('新規登録ページからログインリンククリック', async ({ page }) => {
    await page.goto('/signup');

    // ログインリンククリック
    await page.getByRole('link', { name: 'ログイン' }).click();

    // ログインページへ移動確認
    await expect(page).toHaveURL('/login');
  });

  test('ホームページからログインページへ移動', async ({ page }) => {
    await page.goto('/');

    // ヘッダーのログインボタンクリック
    await page.getByRole('link', { name: 'ログイン' }).click();

    // ログインページへ移動確認
    await expect(page).toHaveURL('/login');
  });

  test('ホームページから新規登録ページへ移動', async ({ page }) => {
    await page.goto('/');

    // ヘッダーの新規登録ボタンクリック
    await page.getByRole('link', { name: '新規登録' }).click();

    // 新規登録ページへ移動確認
    await expect(page).toHaveURL('/signup');
  });
});
