"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
// Jest グローバルセットアップ
beforeAll(() => {
    // テスト環境の確認
    if (process.env.NODE_ENV !== 'development') {
        console.warn('⚠️ テストは development 環境で実行してください');
    }
    // 必要な環境変数の確認
    const requiredEnvVars = ['DATABASE_URL'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`環境変数 ${envVar} が設定されていません`);
        }
    }
    console.log('🧪 統合テスト環境セットアップ完了');
    console.log(`📊 データベース接続先: ${process.env.DATABASE_URL?.split('@')[1] || 'Unknown'}`);
});
afterAll(() => {
    console.log('✅ 統合テスト実行完了');
});
//# sourceMappingURL=setup.js.map