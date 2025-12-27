# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: 5社統合資格管理システム
開始日: 2025-12-24
技術スタック:
  frontend: React 18 + TypeScript 5 + MUI v7 + React Router v7
  backend: Node.js + Express + Prisma
  database: PostgreSQL (Neon)
```

## 開発環境
```yaml
ポート設定:
  # 複数プロジェクト並行開発のため、一般的でないポートを使用
  frontend: 3247
  backend: 8432
  database: 5433

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - DATABASE_URL
    - NODE_ENV
    - CLAUDE_API_KEY（AI機能有効化時のみ）
```

## テスト認証情報
```yaml
開発用データ:
  # 5社のサンプル会社データ
  companies:
    - 株式会社本社
    - 関連会社A
    - 関連会社B
    - 関連会社C
    - 関連会社D

  # サンプル社員データ（各社2-3名）
  employees:
    - 田中太郎（本社・管理部）
    - 佐藤花子（関連会社A・技術部）
    - 鈴木次郎（関連会社B・営業部）

  # 事前登録資格（40種類）
  qualifications:
    - 基本情報技術者試験（有効期間：永続）
    - 応用情報技術者試験（有効期間：永続）
    - 普通自動車第一種運転免許（有効期間：3年）
    - 日商簿記検定2級（有効期間：永続）
    - ファイナンシャル・プランニング技能士2級（有効期間：永続）
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: EmployeeList.tsx)
  - ユーティリティ: camelCase.ts (例: dateUtils.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: API_ENDPOINTS.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止
  - エラーハンドリング必須
  - 関数行数: 100行以下（96.7%カバー）
  - ファイル行数: 700行以下（96.9%カバー）
  - 複雑度: 10以下
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
命名規則:
  - RESTful形式を厳守
  - 複数形を使用 (/employees, /qualifications)
  - ケバブケース使用 (/qualification-masters)

主要エンドポイント:
  - GET /api/employees - 全社員取得
  - POST /api/qualifications - 資格登録
  - GET /api/qualifications/:employeeId - 個人資格一覧
  - POST /api/qualifications/search - AI検索（将来実装）
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts
  backend: src/types/index.ts

同期ルール:
  - 両ファイルは常に同一内容を保つ
  - 片方を更新したら即座にもう片方も更新

主要型定義:
  - Employee: 社員情報
  - Qualification: 資格情報
  - QualificationMaster: 資格マスター
  - Company: 会社情報
```

## MVP特有の設定

### 認証なし設計
```yaml
現在の仕様:
  - ログイン機能なし
  - 全ユーザーが全機能にアクセス可能
  - 社員選択はドロップダウンで実装

将来の拡張:
  - Phase 11で認証機能追加
  - メール+パスワード認証
  - 権限管理（一般/管理者）
```

### AI機能制御
```yaml
実装方針:
  - Claude API統合コードは実装
  - 環境変数での有効/無効制御
  - 初期は無効化（コスト0円）
  - Phase 11で段階的有効化

制限設定:
  - 月間検索回数: 200回
  - 日次検索回数: 20回
  - 予算上限: 月額3,000円
  - 超過時: 手動入力に自動切替
```

### データ初期化
```yaml
開発用データ:
  - 5社のマスターデータ
  - 各社2-3名の社員データ
  - 40種類の資格マスターデータ
  - サンプル資格登録データ

本番移行:
  - 実際の社員データに置換
  - 資格マスターは継続使用
  - 段階的データ移行
```

## 🆕 最新技術情報（知識カットオフ対応）
```yaml
# 2025年最新情報
React 18:
  - Concurrent Features安定版
  - Suspense for Data Fetching推奨
  - StrictMode デフォルト有効

MUI v7 (最新版):
  - Material Design 3完全対応
  - パフォーマンス大幅改善
  - TypeScript 5 完全サポート
  - createTheme API安定化

React Router v7:
  - Data API v2 統合
  - Remix統合による高速化
  - TypeScript支援強化
  - 段階的移行サポート

Vite 5:
  - Rolldown採用による高速化
  - TypeScript 5対応
  - ESM優先設計

PostgreSQL 16:
  - JSON処理性能向上
  - セキュリティ強化
  - Neonでの最新版対応

Neon:
  - サーバーレスPostgreSQL
  - ブランチ機能で開発環境分離
  - 無料枠0.5GB十分な容量
```

## 🛠️ ビルドエラー解消記録（2025-12-25）
```yaml
# Storybook v10 + Vitest v2 peer dependency conflict 解決
問題:
  - @storybook/addon-vitest v10.1.10とVitest v2.x間の非互換性
  - npm installでERESOLVE unable to resolve dependency treeエラー
  - 知識カットオフによる最新版対応遅延

解決策:
  - Storybookアドオンを段階的構築アプローチで回避
  - 核となるReact+Vite+MUI基盤を先に確立
  - 必要最小限のpackage.jsonで依存関係の競合を排除

技術的解決:
  - Vite 5.4.21 + React 18 + TypeScript 5 基盤確立
  - MUI v7.3.6 (自動升级版本) 統合成功
  - React Router v7.11.0 統合成功
  - ビルド時間: 12秒（最適化済み）

今後の対応:
  - Storybookは別途独立した設定で再導入
  - Vitestは単体テストとして段階的追加
  - E2Eテストツールの再検討が必要
```

## 13. E2Eテスト自律実行の絶対原則

**【重要】セッション開始時・compact後の自動判定**

このセクションはE2Eテストオーケストレーターによって自動生成されました。

---

**最初に必ず専門知識を注入してください**

E2Eテスト実行中の場合、以下を実行してから開始してください：

```
inject_knowledge ツールで keyword: "@E2Eテストオーケストレーター"
を実行してから開始してください。（初回必須・compact後も必須）
```

重要：キーワードは "@E2Eテストオーケストレーター"
をそのまま使用してください。変換や推測は不要です。

準備完了です。まず知識注入を実行してから、タスクを開始してください。

---

**E2Eテストオーケストレーター実行中の判定**:
- SCOPE_PROGRESS.mdに「## 📊 E2Eテスト全体進捗」が存在する場合
- または、セッション再開時に前回のメッセージに「E2Eテスト」「オーケストレーター」キーワードがある場合

**セッション開始時・compact後の自動処理**:
1. 上記の判定基準でE2Eテスト実行中と判定
2. inject_knowledge('@E2Eテストオーケストレーター') を必ず実行
3. docs/e2e-best-practices.md の存在確認（なければ初期テンプレート作成）
4. SCOPE_PROGRESS.mdから [ ] テストの続きを自動で特定
5. [x] のテストは絶対にスキップ
6. ユーザー確認不要、完全自律モードで継続
7. ページ選定も自動（未完了ページを上から順に選択）
8. 停止条件：全テスト100%完了のみ

**5回エスカレーション後の処理**:
- チェックリストに [-] マークを付ける
- docs/e2e-test-history/skipped-tests.md に記録
- 次のテストへ自動で進む（停止しない）

**ベストプラクティス自動蓄積**:
- 各テストで成功した方法を docs/e2e-best-practices.md に自動保存
- 後続テストが前のテストの知見を自動活用
- 試行錯誤が減っていく（学習効果）

**重要**:
- この原則はCLAUDE.mdに記載されているため、compact後も自動で適用される
- セッション開始時にこのセクションがない場合、オーケストレーターが自動で追加する