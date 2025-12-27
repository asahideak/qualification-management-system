# 全社員資格一覧ページAPI仕様書

生成日: 2025-12-25
収集元: frontend/src/services/mock/allEmployeeQualificationListService.ts
@MOCK_TO_APIマーク数: 5
@BACKEND_COMPLEXマーク数: 0

## エンドポイント一覧

### 1. 全社員資格一覧取得
- **エンドポイント**: `GET /api/qualifications/all-employees`
- **説明**: 全社員の資格情報を一覧で取得
- **Request**: クエリパラメータでフィルタリング可能
- **Response**: `AllEmployeeQualificationTableRow[]`

### 2. 会社一覧取得
- **エンドポイント**: `GET /api/companies`
- **説明**: 会社マスターデータを取得
- **Request**: なし
- **Response**: `Company[]`

### 3. 会社別部署一覧取得
- **エンドポイント**: `GET /api/departments/company/:companyId`
- **説明**: 指定した会社の部署一覧を取得
- **Request**: companyId（パスパラメータ）
- **Response**: `Department[]`

### 4. 全部署一覧取得
- **エンドポイント**: `GET /api/departments`
- **説明**: 全部署のマスターデータを取得
- **Request**: なし
- **Response**: `Department[]`

### 5. 資格データエクスポート
- **エンドポイント**: `GET /api/qualifications/export`
- **説明**: 資格データをCSV形式でエクスポート
- **Request**: クエリパラメータでフィルタリング可能
- **Response**: CSVファイル（application/octet-stream）

## データ構造

### AllEmployeeQualificationTableRow
```typescript
{
  employeeId: string;
  employeeName: string;
  companyName: string;
  departmentName?: string;
  qualificationName: string;
  acquiredDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  expirationStatus: 'normal' | 'warning' | 'expired';
}
```

### Company
```typescript
{
  companyId: string;
  companyName: string;
  isActive: boolean;
}
```

### Department
```typescript
{
  departmentId: string;
  departmentName: string;
  companyId: string;
}
```

## フィルタリング機能

### サポートされるクエリパラメータ
- `companyId`: 会社ID
- `departmentId`: 部署ID
- `expirationStatus`: 期限状況（normal/warning/expired）
- `keyword`: 検索キーワード（社員名・資格名）

## モックサービス参照
```typescript
// 実装時はこのモックサービスの挙動を参考にする
frontend/src/services/mock/allEmployeeQualificationListService.ts
```