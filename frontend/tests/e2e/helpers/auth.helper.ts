import { Page } from '@playwright/test';

/**
 * 認証ヘルパー関数
 * 現在はMVP（認証なし）のため、将来の拡張用として骨組みのみ実装
 */

/**
 * MVP版: 認証なしでトップページに直接アクセス
 */
export async function loginAsMVPUser(page: Page) {
  // MVP版では認証がないため、直接トップページにアクセス
  await page.goto('/');

  // ページが読み込まれるまで待機
  await page.waitForLoadState('networkidle');
}

/**
 * 将来の拡張用: ログイン処理（Phase 11で実装予定）
 */
export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string
) {
  // TODO: Phase 11で実装
  // await page.goto('/login');
  // await page.fill('[data-testid="email"]', email);
  // await page.fill('[data-testid="password"]', password);
  // await page.click('[data-testid="login-button"]');
  // await page.waitForURL('/dashboard');

  throw new Error('認証機能はPhase 11で実装予定です');
}

/**
 * 将来の拡張用: 管理者としてログイン
 */
export async function loginAsAdmin(page: Page) {
  // TODO: Phase 11で実装
  throw new Error('管理者認証機能はPhase 11で実装予定です');
}

/**
 * 将来の拡張用: ログアウト処理
 */
export async function logout(page: Page) {
  // TODO: Phase 11で実装
  throw new Error('ログアウト機能はPhase 11で実装予定です');
}