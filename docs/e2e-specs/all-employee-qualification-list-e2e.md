# 全社員資格一覧ページ E2Eテスト仕様書

生成日: 2025-12-25
対象ページ: `/list`
権限レベル: 認証不要（MVP設計）

---

## テスト環境

```yaml
URL: http://localhost:3247/list
認証: 不要（認証なし設計）
プロジェクト仕様: 5社統合資格管理システム（MVP）
```

---

## 統合テストでカバー済み（E2Eから除外）

- ✅ API基本動作（200）: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ データ構造検証: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ 会社フィルター機能: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ 部署フィルター機能: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ 期限ステータスフィルター: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ キーワード検索機能: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ 複合フィルター機能: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ バリデーションエラー（400）: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts
- ✅ パフォーマンステスト: backend/tests/integration/qualification/all-employee-qualifications.flow.test.ts

---

## E2Eテスト項目一覧（UIフローのみ: 7項目）

| ID | テスト項目 | 期待結果 |
|----|----------|---------|
| E2E-LIST-001 | ページアクセス・初期表示 | /listアクセス時にページタイトル「全社員資格一覧」、フィルターセクション、テーブルヘッダー（社員名、会社、部署、資格名、取得日、有効期限、状況）が表示される |
| E2E-LIST-002 | 基本テーブル表示・データ構造 | 初期表示時に資格データがテーブルに表示され、各行にチップ（会社、ステータス）が適切な色で表示され、下部に「X件の資格が表示されています」が表示される |
| E2E-LIST-003 | フィルター操作フロー | 会社セレクト選択時に部署セレクトが更新され、検索ボタンクリック時に絞り込み結果がテーブルに反映され、件数表示も更新される |
| E2E-LIST-004 | 検索・クリアフロー | 検索フィールドに入力後検索ボタンクリックで絞り込み実行、クリアボタンクリック時にフィルターと検索フィールドが初期化され全データが表示される |
| E2E-LIST-005 | 期限ステータスフィルターフロー | 期限状況セレクト（期限切れ/期限間近/正常）選択後検索実行で対象データのみ表示、ステータスチップの色（error/warning/success）が適切に表示される |
| E2E-LIST-006 | 更新ボタンフロー | 🔄更新ボタンクリック時に一時的にローディング状態となり、データがリフレッシュされてテーブル表示が最新状態に更新される |
| E2E-LIST-007 | CSVエクスポートフロー | フィルター適用状態で📥CSVエクスポートボタンクリック時に、CSVファイルのダウンロードが開始される（ファイル名形式：qualifications_YYYYMMDD_HHMMSS.csv） |

---

## テストデータ要件

- 5社のサンプル会社データ（株式会社本社、関連会社A-D）
- 各社2-3名の社員データ（田中太郎、佐藤花子、鈴木次郎等）
- 複数の資格データ（基本情報技術者、運転免許等）
- 異なる期限ステータス（正常、期限間近、期限切れ）を含むデータセット

---

## 画面要素セレクター（Playwright用）

```typescript
// ページ要素
const pageTitle = 'h4:has-text("全社員資格一覧")';
const filterSection = 'div[role="paper"]:has([label="会社"])';

// フィルター要素
const companySelect = '[label="会社"]';
const departmentSelect = '[label="部署"]';
const statusSelect = '[label="期限状況"]';
const searchField = '[placeholder="社員名または資格名で検索"]';
const searchButton = 'button:has-text("検索")';
const clearButton = 'button:has-text("クリア")';

// アクション要素
const refreshButton = 'button:has-text("🔄 更新")';
const exportButton = 'button:has-text("📥 CSVエクスポート")';

// テーブル要素
const qualificationTable = 'table';
const tableHeaders = 'th:has-text("社員名"), th:has-text("会社"), th:has-text("部署"), th:has-text("資格名"), th:has-text("取得日"), th:has-text("有効期限"), th:has-text("状況")';
const tableRows = 'tbody tr';
const resultCount = 'text=/\\d+件の資格が表示されています/';

// ステータスチップ
const normalChip = '.MuiChip-colorSuccess:has-text("正常")';
const warningChip = '.MuiChip-colorWarning:has-text("期限間近")';
const expiredChip = '.MuiChip-colorError:has-text("期限切れ")';
```

---

## 実行コマンド

```bash
npx playwright test tests/e2e/all-employee-qualification-list.spec.ts
```

---

## 備考

- 本テストはUIフローの確認に特化し、APIレスポンス内容の詳細検証は統合テストで実施済み
- 認証なし設計のため、ログイン/認証関連のテストは含まない
- レスポンシブデザイン、アクセシビリティテストは別途実施
- CSV実際のファイル内容検証は統合テストまたは別途APIテストで実施