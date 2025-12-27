# 資格登録・管理ページAPI仕様書

生成日: 2025-12-25
収集元: frontend/src/services/mock/QualificationManagementService.ts
@MOCK_TO_APIマーク数: 6
@BACKEND_COMPLEXマーク数: 0

## エンドポイント一覧

### 1. 社員一覧取得
- **エンドポイント**: `GET {API_PATHS.EMPLOYEES.LIST}`
- **APIパス定数**: `API_PATHS.EMPLOYEES.LIST`
- **説明**: 全社員の一覧を取得
- **Request**: なし
- **Response**: `Employee[]`

### 2. 社員別資格一覧取得
- **エンドポイント**: `GET {API_PATHS.QUALIFICATIONS.BY_EMPLOYEE(employeeId)}`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.BY_EMPLOYEE(employeeId)`
- **説明**: 指定した社員の資格一覧を取得
- **Request**: employeeId（パスパラメータ）
- **Response**: `Qualification[]`

### 3. 資格マスター一覧取得
- **エンドポイント**: `GET {API_PATHS.QUALIFICATION_MASTERS.LIST}`
- **APIパス定数**: `API_PATHS.QUALIFICATION_MASTERS.LIST`
- **説明**: 資格マスターデータを取得
- **Request**: なし
- **Response**: `QualificationMaster[]`

### 4. 資格登録
- **エンドポイント**: `POST {API_PATHS.QUALIFICATIONS.CREATE}`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.CREATE`
- **説明**: 新規資格を登録
- **Request**: `QualificationCreateRequest`
- **Response**: `Qualification`

### 5. 資格更新
- **エンドポイント**: `PUT {API_PATHS.QUALIFICATIONS.UPDATE(qualificationId)}`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.UPDATE(qualificationId)`
- **説明**: 既存資格情報を更新
- **Request**: `QualificationUpdateRequest`
- **Response**: `Qualification`

### 6. 資格削除
- **エンドポイント**: `DELETE {API_PATHS.QUALIFICATIONS.DELETE(qualificationId)}`
- **APIパス定数**: `API_PATHS.QUALIFICATIONS.DELETE(qualificationId)`
- **説明**: 資格情報を削除
- **Request**: qualificationId（パスパラメータ）
- **Response**: `void`

## モックサービス参照
```typescript
// 実装時はこのモックサービスの挙動を参考にする
frontend/src/services/mock/QualificationManagementService.ts
```
