# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: 5社統合資格管理システム
開始日: 2025-12-24
技術スタック:
  frontend: React 18 + TypeScript 5 + MUI v6
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

MUI v6:
  - Material Design 3対応
  - パフォーマンス改善
  - TypeScript強化

PostgreSQL 16:
  - JSON処理性能向上
  - セキュリティ強化
  - Neonでの最新版対応

Neon:
  - サーバーレスPostgreSQL
  - ブランチ機能で開発環境分離
  - 無料枠0.5GB十分な容量
```