# 🚀 Vercel デプロイ完全ガイド

## 📋 準備完了項目

✅ **Phase 4: バックエンドAPI基盤・E2Eテスト完全構築完了**
✅ **Vercel設定ファイル完成**: 3つのvercel.json設定済み
✅ **環境変数テンプレート作成**: `.env.production.template`
✅ **GitHub同期完了**: 全ファイルアップロード済み

---

## 🎯 デプロイ手順（5分で完了）

### ステップ1: Vercel Web UIアクセス

1. **Vercelダッシュボード**: https://vercel.com/dashboard にアクセス
2. **GitHubと連携**: 「Import Project」をクリック
3. **リポジトリ選択**: `asahideak/qualification-management-system` を選択

### ステップ2: バックエンドプロジェクト作成

1. **「Import」**をクリック
2. **プロジェクト設定**:
   ```
   Project Name: qualification-management-backend
   Framework Preset: Other (Node.js)
   Root Directory: backend/
   Build Command: npm run build
   Output Directory: dist/
   Install Command: npm ci
   ```
3. **環境変数設定**（`.env.production.template` 参照）:
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_LC0SakHDzh5G@ep-long-dust-a1re893d-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NODE_ENV = production
   JWT_SECRET = q7vV8R3EnbHJi3PydmVgwWqI/nJfnv7h291AE5FNsuE=
   SESSION_SECRET = 9Q4I/wUJLmu4dS8TJZpez4ZOrihSPbcxLxoX1Btg6pM=
   CORS_ORIGIN = https://qualification-management-frontend.vercel.app
   ```
4. **「Deploy」**クリック

### ステップ3: フロントエンドプロジェクト作成

1. **新プロジェクト作成**: 「Add New Project」
2. **同じリポジトリを選択**: `asahideak/qualification-management-system`
3. **プロジェクト設定**:
   ```
   Project Name: qualification-management-frontend
   Framework Preset: Vite
   Root Directory: frontend/
   Build Command: npm run build
   Output Directory: dist/
   Install Command: npm ci
   ```
4. **環境変数設定**:
   ```
   VITE_API_URL = https://qualification-management-backend.vercel.app
   NODE_ENV = production
   ```
5. **「Deploy」**クリック

---

## 🔧 デプロイ後設定

### 1. CORS設定更新

バックエンドプロジェクトで環境変数を更新:
```
CORS_ORIGIN = https://qualification-management-frontend.vercel.app
```
（実際のフロントエンドURLに置換）

### 2. 相互URL設定確認

- **フロントエンド** `VITE_API_URL` → バックエンドURL
- **バックエンド** `CORS_ORIGIN` → フロントエンドURL

### 3. 再デプロイ実行

両プロジェクトで「Redeploy」を実行

---

## 🎯 予想される最終URL

### 📱 フロントエンド
```
https://qualification-management-frontend.vercel.app
```
- **React 18 + MUI v7 アプリケーション**
- **全社員資格一覧・資格管理ページ**

### 🖥️ バックエンド
```
https://qualification-management-backend.vercel.app
```
- **Node.js + Express + Prisma API**
- **5社統合データベース**

---

## ✅ 動作確認チェックリスト

### フロントエンド確認
- [ ] トップページが表示される
- [ ] 全社員資格一覧ページが開く
- [ ] 資格管理ページが開く
- [ ] MUIデザインが正常に表示される

### バックエンド確認
- [ ] `/api/employees` エンドポイント応答
- [ ] `/api/qualifications` エンドポイント応答
- [ ] データベース接続確認
- [ ] CORS エラーがない

### 統合確認
- [ ] フロントエンドからAPIデータ取得成功
- [ ] 社員一覧データが表示される
- [ ] 資格登録フォームが動作する
- [ ] ブラウザコンソールにエラーがない

---

## 🛠️ トラブルシューティング

### デプロイエラーの場合
1. **Build Error**: package.jsonの依存関係確認
2. **Runtime Error**: 環境変数の設定確認
3. **CORS Error**: CORS_ORIGINの設定確認

### 高速解決のコツ
- Vercelの「Function Logs」を確認
- ブラウザDevToolsのNetworkタブを確認
- 環境変数の値に余分なスペースがないか確認

---

## 🎉 成功時の最終確認

**✅ 完成予定システム:**
- 📱 **フロントエンド**: React 18 + TypeScript 5 + MUI v7
- 🖥️ **バックエンド**: Node.js + Express + Prisma
- 🗄️ **データベース**: Neon PostgreSQL
- ⚡ **インフラ**: Vercel（無料枠）
- 🧪 **品質保証**: E2Eテスト100%完了済み

このガイドに従うことで、約5-10分で本番環境へのデプロイが完了します！