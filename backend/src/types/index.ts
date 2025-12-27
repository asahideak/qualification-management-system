// 5社統合資格管理システム - 型定義ファイル
// バックエンドと完全同期させる必要があります

// APIエンドポイント定数
export const API_PATHS = {
  EMPLOYEES: {
    LIST: '/api/employees',
    DETAIL: (id: string): string => `/api/employees/${id}`,
  },
  QUALIFICATIONS: {
    LIST: '/api/qualifications',
    CREATE: '/api/qualifications',
    UPDATE: (id: string): string => `/api/qualifications/${id}`,
    DELETE: (id: string): string => `/api/qualifications/${id}`,
    BY_EMPLOYEE: (employeeId: string): string => `/api/qualifications/employee/${employeeId}`,
    ALL_EMPLOYEES_LIST: '/api/qualifications/all-employees', // 全社員資格一覧用
    EXPORT: '/api/qualifications/export', // CSVエクスポート用
  },
  QUALIFICATION_MASTERS: {
    LIST: '/api/qualification-masters',
    DETAIL: (id: string): string => `/api/qualification-masters/${id}`,
  },
  COMPANIES: {
    LIST: '/api/companies',
    DETAIL: (id: string): string => `/api/companies/${id}`,
  },
  DEPARTMENTS: {
    LIST: '/api/departments',
    BY_COMPANY: (companyId: string): string => `/api/departments/company/${companyId}`,
  },
} as const;

// 会社情報
export interface Company {
  companyId: string;
  companyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 部署情報
export interface Department {
  departmentId: string;
  departmentName: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 社員情報
export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  companyId: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}

// 社員選択表示用（ドロップダウン用）
export interface EmployeeSelectOption {
  employeeId: string;
  displayName: string; // 「田中太郎（本社・管理部）」形式
  name: string;
  companyName: string;
  departmentName?: string;
}

// 資格マスター情報
export interface QualificationMaster {
  qualificationMasterId: string;
  masterName: string;
  validityPeriod: number | 'permanent'; // 年数または「永続」
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 資格マスター表示用（サジェスト用）
export interface QualificationSuggestion {
  qualificationMasterId: string;
  masterName: string;
  validityPeriod: number | 'permanent';
}

// 資格情報
export interface Qualification {
  qualificationId: string;
  employeeId: string;
  qualificationName: string;
  acquiredDate: string; // ISO date string (YYYY-MM-DD)
  expirationDate: string | 'permanent'; // ISO date string または「永続」
  qualificationMasterId: string;
  createdAt: string;
  updatedAt: string;
}

// 資格登録フォーム用
export interface QualificationRegistrationForm {
  employeeId: string;
  qualificationName: string;
  acquiredDate: string; // YYYY-MM-DD形式
  qualificationMasterId?: string; // 資格マスターID（省略可）
}

// 資格編集フォーム用
export interface QualificationEditForm {
  qualificationId: string;
  qualificationName: string;
  acquiredDate: string; // YYYY-MM-DD形式
  qualificationMasterId?: string; // 資格マスターID（省略可）
}

// ユーザーロール（将来実装用）
export type UserRole = 'user' | 'admin';

// 認証ユーザー（将来実装用）
export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
}

// API レスポンス
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ページネーション
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// フィルター条件
export interface QualificationFilter {
  companyId?: string;
  departmentId?: string;
  isExpired?: boolean;
  isExpiringSoon?: boolean; // 90日以内
  searchKeyword?: string;
}

// 全社員資格一覧フィルター（AllEmployeeQualificationList専用）
export interface AllEmployeeQualificationFilter {
  companyId?: string; // 会社フィルター
  departmentId?: string; // 部署フィルター
  expirationStatus?: 'expired' | 'warning' | 'normal' | ''; // 期限状況フィルター
  searchKeyword?: string; // 社員名または資格名での検索
}

// 資格状況ステータス（モックアップに基づく）
export type QualificationStatus = 'valid' | 'expiring' | 'expired';

// 資格状況ステータス表示テキスト
export const QUALIFICATION_STATUS_TEXT: Record<QualificationStatus, string> = {
  valid: '有効',
  expiring: '期限間近',
  expired: '期限切れ',
} as const;

// 拡張された資格情報（表示用）
export interface QualificationWithDetails extends Qualification {
  employee: Employee;
  company: Company;
  qualificationMaster: QualificationMaster;
  status: QualificationStatus;
  daysUntilExpiration: number;
}

// 資格一覧テーブル行用（モックアップに基づく）
export interface QualificationTableRow {
  qualificationId: string;
  qualificationName: string;
  acquiredDate: string; // 表示用フォーマット（YYYY/MM/DD）
  expirationDate: string; // 表示用フォーマット（YYYY/MM/DD または「永続」）
  status: QualificationStatus;
  statusText: string; // 日本語表示用
}

// 全社員資格一覧テーブル行用（AllEmployeeQualificationListページ専用）
export interface AllEmployeeQualificationTableRow {
  employeeId: string;
  employeeName: string; // 社員名
  companyId: string;
  companyName: string; // 会社名
  departmentId?: string;
  departmentName?: string; // 部署名
  qualificationId: string;
  qualificationName: string; // 資格名
  acquiredDate: string; // 取得日（YYYY-MM-DD形式）
  expirationDate: string; // 有効期限（YYYY-MM-DD形式または「永続」）
  status: 'normal' | 'warning' | 'expired'; // 状況（モックアップに基づく）
  statusDisplayText: string; // 状況表示テキスト（「正常」「期限間近」「期限切れ」）
}

// 有効期限計算結果
export interface ExpirationCalculation {
  expirationDate: string | 'permanent';
  displayText: string; // 表示用テキスト
}

// 型ガード関数
export function isQualificationStatus(value: string): value is QualificationStatus {
  return ['valid', 'expiring', 'expired'].includes(value);
}

export function isValidEmployee(obj: unknown): obj is Employee {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const employee = obj as Record<string, unknown>;
  return (
    typeof employee.employeeId === 'string' &&
    typeof employee.name === 'string' &&
    typeof employee.email === 'string' &&
    typeof employee.companyId === 'string' &&
    typeof employee.createdAt === 'string' &&
    typeof employee.updatedAt === 'string'
  );
}

export function isValidQualification(obj: unknown): obj is Qualification {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const qual = obj as Record<string, unknown>;
  return (
    typeof qual.qualificationId === 'string' &&
    typeof qual.employeeId === 'string' &&
    typeof qual.qualificationName === 'string' &&
    typeof qual.acquiredDate === 'string' &&
    (typeof qual.expirationDate === 'string' || qual.expirationDate === 'permanent') &&
    typeof qual.qualificationMasterId === 'string' &&
    typeof qual.createdAt === 'string' &&
    typeof qual.updatedAt === 'string'
  );
}

export function isValidQualificationMaster(obj: unknown): obj is QualificationMaster {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const master = obj as Record<string, unknown>;
  return (
    typeof master.qualificationMasterId === 'string' &&
    typeof master.masterName === 'string' &&
    (typeof master.validityPeriod === 'number' || master.validityPeriod === 'permanent') &&
    typeof master.isActive === 'boolean' &&
    typeof master.createdAt === 'string' &&
    typeof master.updatedAt === 'string'
  );
}

export function isValidAllEmployeeQualificationFilter(obj: unknown): obj is AllEmployeeQualificationFilter {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const filter = obj as Record<string, unknown>;
  return (
    (filter.companyId === undefined || typeof filter.companyId === 'string') &&
    (filter.departmentId === undefined || typeof filter.departmentId === 'string') &&
    (filter.expirationStatus === undefined ||
     ['expired', 'warning', 'normal', ''].includes(filter.expirationStatus as string)) &&
    (filter.searchKeyword === undefined || typeof filter.searchKeyword === 'string')
  );
}

export function isValidAllEmployeeQualificationTableRow(obj: unknown): obj is AllEmployeeQualificationTableRow {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const row = obj as Record<string, unknown>;
  return (
    typeof row.employeeId === 'string' &&
    typeof row.employeeName === 'string' &&
    typeof row.companyId === 'string' &&
    typeof row.companyName === 'string' &&
    (row.departmentId === undefined || typeof row.departmentId === 'string') &&
    (row.departmentName === undefined || typeof row.departmentName === 'string') &&
    typeof row.qualificationId === 'string' &&
    typeof row.qualificationName === 'string' &&
    typeof row.acquiredDate === 'string' &&
    typeof row.expirationDate === 'string' &&
    ['normal', 'warning', 'expired'].includes(row.status as string) &&
    typeof row.statusDisplayText === 'string'
  );
}