import { test, expect } from '@playwright/test';
import { loginAsMVPUser } from './helpers/auth.helper';

/**
 * ダッシュボード機能テスト
 * 現在はMVP開発中のため基本テストのみ実装
 * 将来の主要機能テストの骨組みを含む
 */

test.describe('ダッシュボード基本機能', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMVPUser(page);
  });

  test('ダッシュボードが正常に表示される', async ({ page }) => {
    // ページが読み込まれることを確認
    await expect(page).toHaveURL('/');

    // システム名が表示されていることを確認
    const systemName = page.locator('text=5社統合資格管理システム');
    await expect(systemName).toBeVisible();

    // 現在の開発状態（Coming Soon）を確認
    const developmentStatus = page.locator('text=Coming Soon');
    if (await developmentStatus.isVisible()) {
      console.log('開発中: Coming Soonページが表示されています');
    }
  });

  test('ヘッダーナビゲーションが表示される', async ({ page }) => {
    // ヘッダーが存在することを確認
    const header = page.locator('header, [role="banner"], h1');
    await expect(header).toBeVisible();

    // システム名がヘッダーに含まれることを確認
    await expect(header).toContainText('5社統合資格管理システム');
  });
});

/**
 * 将来実装予定の機能テスト（Phase 3以降）
 */
test.describe.skip('資格管理機能（将来実装）', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMVPUser(page);
  });

  test('社員選択ドロップダウンが表示される', async ({ page }) => {
    // TODO: Phase 3で実装
    // const employeeDropdown = page.locator('[data-testid="employee-select"]');
    // await expect(employeeDropdown).toBeVisible();
  });

  test('資格登録フォームが機能する', async ({ page }) => {
    // TODO: Phase 3で実装
    // 社員選択
    // await page.selectOption('[data-testid="employee-select"]', '田中太郎');

    // 資格名入力
    // await page.fill('[data-testid="qualification-name"]', '基本情報技術者試験');

    // 取得日入力
    // await page.fill('[data-testid="acquired-date"]', '2023-10-15');

    // 登録ボタンクリック
    // await page.click('[data-testid="register-button"]');

    // 成功メッセージの確認
    // await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('資格一覧が表示される', async ({ page }) => {
    // TODO: Phase 3で実装
    // await page.selectOption('[data-testid="employee-select"]', '田中太郎');
    // const qualificationList = page.locator('[data-testid="qualification-list"]');
    // await expect(qualificationList).toBeVisible();
  });

  test('資格編集機能が動作する', async ({ page }) => {
    // TODO: Phase 3で実装
    // 編集ボタンクリック
    // await page.click('[data-testid="edit-qualification-1"]');

    // 編集フォームが表示されることを確認
    // const editForm = page.locator('[data-testid="edit-form"]');
    // await expect(editForm).toBeVisible();
  });

  test('資格削除機能が動作する', async ({ page }) => {
    // TODO: Phase 3で実装
    // 削除ボタンクリック
    // await page.click('[data-testid="delete-qualification-1"]');

    // 確認ダイアログが表示されることを確認
    // const confirmDialog = page.locator('[data-testid="confirm-delete"]');
    // await expect(confirmDialog).toBeVisible();

    // 削除確認
    // await page.click('[data-testid="confirm-delete-button"]');

    // 資格が削除されることを確認
    // await expect(page.locator('[data-testid="qualification-1"]')).not.toBeVisible();
  });
});

test.describe.skip('全社員資格一覧（将来実装）', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMVPUser(page);
  });

  test('全社員資格一覧ページが表示される', async ({ page }) => {
    // TODO: Phase 3で実装
    // await page.goto('/all-qualifications');
    // const pageTitle = page.locator('h1');
    // await expect(pageTitle).toContainText('全社員資格一覧');
  });

  test('フィルター機能が動作する', async ({ page }) => {
    // TODO: Phase 3で実装
    // 会社フィルター
    // await page.selectOption('[data-testid="company-filter"]', '株式会社本社');

    // フィルター適用後の結果確認
    // const filteredResults = page.locator('[data-testid="filtered-qualifications"]');
    // await expect(filteredResults).toBeVisible();
  });

  test('CSVエクスポート機能が動作する', async ({ page }) => {
    // TODO: Phase 3で実装
    // エクスポートボタンクリック
    // const downloadPromise = page.waitForEvent('download');
    // await page.click('[data-testid="csv-export"]');
    // const download = await downloadPromise;
    // expect(download.suggestedFilename()).toContain('.csv');
  });
});

test.describe.skip('AI検索機能（Phase 3以降）', () => {
  test('AI資格検索が機能する', async ({ page }) => {
    // TODO: Phase 3でAI機能実装時
    // await loginAsMVPUser(page);
    // await page.fill('[data-testid="qualification-search"]', 'プロジェクト');
    // await page.click('[data-testid="ai-search-button"]');
    // const searchResults = page.locator('[data-testid="ai-search-results"]');
    // await expect(searchResults).toBeVisible();
  });
});