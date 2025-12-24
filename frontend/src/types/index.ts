// 5社統合資格管理システム - 型定義ファイル
// バックエンドと完全同期させる必要があります

// 会社情報
export interface Company {
  companyId: string;
  companyName: string;
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

// 資格マスター情報
export interface QualificationMaster {
  qualificationMasterId: string;
  masterName: string;
  validityPeriod: number; // 年数
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 資格情報
export interface Qualification {
  qualificationId: string;
  employeeId: string;
  qualificationName: string;
  acquiredDate: string; // ISO date string
  expirationDate: string; // ISO date string (自動計算)
  qualificationMasterId: string;
  createdAt: string;
  updatedAt: string;
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

// 資格状況ステータス
export type QualificationStatus = 'active' | 'warning' | 'expired';

// 拡張された資格情報（表示用）
export interface QualificationWithDetails extends Qualification {
  employee: Employee;
  company: Company;
  qualificationMaster: QualificationMaster;
  status: QualificationStatus;
  daysUntilExpiration: number;
}