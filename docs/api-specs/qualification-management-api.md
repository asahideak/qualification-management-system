# 資格登録・管理ページAPI仕様書

生成日: 2025-12-25
収集元: frontend/src/services/mock/QualificationManagementService.ts
@MOCK_TO_APIマーク数: 6
ページルート: /register

## エンドポイント一覧

### 1. 社員一覧取得
- **エンドポイント**: `GET /api/employees`
- **APIパス定数**: `API_PATHS.EMPLOYEES.LIST`
- **Request**: なし
- **Response**: `Employee[]`
- **説明**: 社員選択ドロップダウン用の全社員情報を取得

### 2. 社員別資格一覧取得
- **エンドポイント**: `GET /api/employees/:employeeId/qualifications`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.BY_EMPLOYEE(employeeId)`
- **Request**: なし
- **Response**: `Qualification[]`
- **説明**: 特定社員が保有する資格一覧を取得

### 3. 資格マスター一覧取得
- **エンドポイント**: `GET /api/qualification-masters`
- **APIパス定数**: `API_PATHS.QUALIFICATION_MASTERS.LIST`
- **Request**: なし
- **Response**: `QualificationMaster[]`
- **説明**: 資格名サジェスト用の資格マスターデータを取得

### 4. 資格登録
- **エンドポイント**: `POST /api/qualifications`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.CREATE`
- **Request**: `QualificationRegistrationForm`
- **Response**: `Qualification`
- **説明**: 新規資格を登録し、有効期限を自動計算

#### Request例
```typescript
{
  employeeId: "EMP001",
  qualificationName: "基本情報技術者試験",
  acquiredDate: "2024-04-15",
  qualificationMasterId: "QM001"
}
```

#### Response例
```typescript
{
  qualificationId: "QUAL001",
  employeeId: "EMP001",
  qualificationName: "基本情報技術者試験",
  acquiredDate: "2024-04-15",
  expirationDate: "permanent",
  qualificationMasterId: "QM001",
  createdAt: "2025-12-25T00:00:00Z",
  updatedAt: "2025-12-25T00:00:00Z"
}
```

### 5. 資格更新
- **エンドポイント**: `PUT /api/qualifications/:id`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.UPDATE(qualificationId)`
- **Request**: `QualificationEditForm`
- **Response**: `Qualification`
- **説明**: 既存資格情報を更新

#### Request例
```typescript
{
  qualificationId: "QUAL001",
  qualificationName: "応用情報技術者試験",
  acquiredDate: "2024-10-20",
  qualificationMasterId: "QM002"
}
```

### 6. 資格削除
- **エンドポイント**: `DELETE /api/qualifications/:id`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.DELETE(qualificationId)`
- **Request**: なし
- **Response**: `void`
- **説明**: 指定した資格を削除

## 型定義参照

### 主要データ型

#### Employee（社員）
```typescript
interface Employee {
  employeeId: string;
  name: string;
  email: string;
  companyId: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Qualification（資格）
```typescript
interface Qualification {
  qualificationId: string;
  employeeId: string;
  qualificationName: string;
  acquiredDate: string;
  expirationDate: string | 'permanent';
  qualificationMasterId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### QualificationMaster（資格マスター）
```typescript
interface QualificationMaster {
  qualificationMasterId: string;
  masterName: string;
  validityPeriod: number | 'permanent';
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### QualificationRegistrationForm（資格登録フォーム）
```typescript
interface QualificationRegistrationForm {
  employeeId: string;
  qualificationName: string;
  acquiredDate: string;
  qualificationMasterId: string;
}
```

#### QualificationEditForm（資格編集フォーム）
```typescript
interface QualificationEditForm {
  qualificationId: string;
  qualificationName: string;
  acquiredDate: string;
  qualificationMasterId: string;
}
```

## ビジネスロジック

### 有効期限自動計算
- **永続資格**: `validityPeriod: 'permanent'` の場合、`expirationDate: 'permanent'`
- **期限付き資格**: `validityPeriod: number` の場合、取得日 + 年数で計算

### 資格状況判定
- **有効**: `expirationDate === 'permanent'` または現在日時より未来
- **期限間近**: 有効期限まで30日以内
- **期限切れ**: 現在日時を過ぎている

## エラーハンドリング

### 想定エラー
- 400 Bad Request: 無効なパラメータ
- 404 Not Found: 社員・資格・資格マスターが存在しない
- 409 Conflict: 同一資格の重複登録
- 500 Internal Server Error: サーバー内部エラー

## モックサービス参照
```typescript
// 実装時はこのモックサービスの挙動を参考にする
frontend/src/services/mock/QualificationManagementService.ts
frontend/src/types/index.ts
```

## API統合時の切り替え
```typescript
// frontend/src/services/index.ts で環境による切り替え
import { QualificationManagementService as MockService } from './mock/QualificationManagementService';
import { QualificationManagementService as ApiService } from './api/QualificationManagementService';

export const QualificationManagementService =
  process.env.NODE_ENV === 'development' ? MockService : ApiService;
```