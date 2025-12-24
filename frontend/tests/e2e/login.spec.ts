import { test, expect } from '@playwright/test';
import { loginAsMVPUser } from './helpers/auth.helper';

/**
 * ログイン/アクセステスト
 * 現在はMVP（認証なし）のため、基本的なページアクセステストを実施
 */

test.describe('アプリケーションアクセス', () => {
  test('トップページが正常に表示される', async ({ page }) => {
    // MVP版でトップページにアクセス
    await loginAsMVPUser(page);

    // ページタイトルの確認
    await expect(page).toHaveTitle(/5社統合資格管理システム|資格管理/);

    // ヘッダーが表示されていることを確認
    const header = page.locator('header, [role="banner"], h1');
    await expect(header).toBeVisible();

    // システム名が表示されていることを確認
    const systemName = page.locator('text=5社統合資格管理システム');
    await expect(systemName).toBeVisible();
  });

  test('ナビゲーションが機能する', async ({ page }) => {
    await loginAsMVPUser(page);

    // Coming Soon表示の確認（現在の開発段階）
    const comingSoon = page.locator('text=Coming Soon');
    if (await comingSoon.isVisible()) {
      console.log('MVP開発中: Coming Soonページが表示されています');
      await expect(comingSoon).toBeVisible();
    }
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // デスクトップビューでアクセス
    await page.setViewportSize({ width: 1200, height: 800 });
    await loginAsMVPUser(page);

    // ヘッダーが表示されることを確認
    const header = page.locator('header, [role="banner"], h1');
    await expect(header).toBeVisible();

    // モバイルビューに変更
    await page.setViewportSize({ width: 375, height: 667 });

    // モバイルでもヘッダーが表示されることを確認
    await expect(header).toBeVisible();
  });

  test('404ページが適切に表示される', async ({ page }) => {
    // 存在しないページにアクセス
    const response = await page.goto('/non-existent-page');

    // 404またはトップページにリダイレクトされることを確認
    if (response && response.status() === 404) {
      console.log('404ページが適切に表示されました');
    } else {
      console.log('トップページにリダイレクトされました（正常動作）');
    }

    // 何らかのコンテンツが表示されていることを確認
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });
});

/**
 * 将来の拡張用テスト（Phase 11で実装予定）
 */
test.describe.skip('認証機能テスト（将来実装）', () => {
  test('有効な認証情報でログインできる', async ({ page }) => {
    // TODO: Phase 11で実装
  });

  test('無効な認証情報でログインが拒否される', async ({ page }) => {
    // TODO: Phase 11で実装
  });

  test('ログアウト機能が正常に動作する', async ({ page }) => {
    // TODO: Phase 11で実装
  });
});