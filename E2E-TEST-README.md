# E2Eテスト実行ガイド

## ✅ 正しい実行方法

E2Eテスト（Playwright）は必ずfrontendディレクトリから実行してください：

```bash
# frontendディレクトリに移動
cd frontend

# 特定のテストを実行
npm run test:e2e -- --grep "E2E-QUAL-008"

# 全E2Eテストを実行
npm run test:e2e

# UIモードで実行
npm run test:e2e:ui
```

## ❌ 避けるべき実行方法

ルートディレクトリからのPlaywright実行は**設定エラー**が発生します：

```bash
# ❌ これはエラーになります
cd 資格管理  # ルートディレクトリ
npx playwright test
```

## エラーの原因

ルートディレクトリには以下のファイルが混在しており、Playwrightが異なる構文のテストファイルを読み込むためです：

- `backend/tests/` - Jest/Vitestテストファイル (`describe()` 構文)
- `frontend/tests/e2e/` - Playwrightテストファイル (`test()` 構文)

## テスト状況

- ✅ E2E-QUAL-001～E2E-QUAL-007: Pass済み
- ✅ E2E-QUAL-008: ステータスチップ表示確認 - **正常動作中**

## 修正完了

E2E-QUAL-008は実際には正常に動作しており、Playwright構成エラーは実行ディレクトリの問題でした。