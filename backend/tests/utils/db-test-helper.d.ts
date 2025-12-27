/**
 * データベーステストヘルパー - @9統合テスト成功請負人向け
 * 実際のデータベース環境でテスト分離とデータ管理を提供
 */
export interface TestCompany {
    id: string;
    name: string;
    isActive: boolean;
}
export interface TestDepartment {
    id: string;
    name: string;
    companyId: string;
    isActive: boolean;
}
export interface TestEmployee {
    id: string;
    name: string;
    email: string;
    companyId: string;
    departmentId?: string;
}
export interface TestQualificationMaster {
    id: string;
    name: string;
    validityPeriod: string;
    category?: string;
    isActive: boolean;
}
export interface TestQualification {
    id: string;
    employeeId: string;
    qualificationName: string;
    acquiredDate: string;
    expirationDate: string;
    qualificationMasterId: string;
}
/**
 * ユニークなテストデータを生成するためのIDジェネレーター
 */
export declare function generateUniqueId(): string;
/**
 * ユニークなメールアドレスを生成
 */
export declare function generateUniqueEmail(prefix?: string): string;
/**
 * テスト用会社データを作成
 */
export declare function createTestCompany(name?: string): Promise<TestCompany>;
/**
 * テスト用部署データを作成
 */
export declare function createTestDepartment(companyId: string, name?: string): Promise<TestDepartment>;
/**
 * テスト用社員データを作成
 */
export declare function createTestEmployee(companyId: string, name?: string, departmentId?: string): Promise<TestEmployee>;
/**
 * テスト用資格マスターデータを作成
 */
export declare function createTestQualificationMaster(data: {
    name?: string;
    validityPeriod?: string | number;
    category?: string;
}): Promise<TestQualificationMaster>;
/**
 * テスト用資格データを作成
 */
export declare function createTestQualification(data: {
    employeeId: string;
    qualificationName: string;
    acquiredDate: string;
    qualificationMasterId: string;
}): Promise<TestQualification>;
/**
 * テスト用データを一括削除（テスト後クリーンアップ）
 */
export declare function cleanupTestData(ids?: {
    qualificationIds?: string[];
    employeeIds?: string[];
    departmentIds?: string[];
    companyIds?: string[];
    qualificationMasterIds?: string[];
}): Promise<void>;
/**
 * データベース接続テスト
 */
export declare function testDatabaseConnection(): Promise<boolean>;
//# sourceMappingURL=db-test-helper.d.ts.map