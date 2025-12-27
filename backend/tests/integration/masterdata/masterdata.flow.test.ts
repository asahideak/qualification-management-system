import express from 'express';
import cors from 'cors';
import apiRoutes from '../../../src/routes';
import { MilestoneTracker } from '../../utils/MilestoneTracker';
import {
  testDatabaseConnection,
  cleanupTestData,
  createTestCompany,
  createTestDepartment,
  createTestEmployee,
  createTestQualificationMaster,
} from '../../utils/db-test-helper';
import {
  testGetRequest,
  testErrorResponse,
  validateApiResponse,
} from '../../utils/api-test-helper';
import { Company, Department, Employee, QualificationMaster } from '../../../src/types';

// テスト用Expressアプリケーション設定
const createTestApp = (): express.Application => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
};

describe('マスターデータ基盤統合テスト', () => {
  let app: express.Application;
  let testData: {
    companies: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; companyId: string }>;
    employees: Array<{ id: string; name: string; companyId: string; departmentId?: string }>;
    qualificationMasters: Array<{ id: string; name: string; validityPeriod: string }>;
  };

  beforeAll(async () => {
    // テスト前の準備
    app = createTestApp();

    // データベース接続確認
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('データベース接続に失敗しました');
    }

    // テストデータの初期化
    testData = {
      companies: [],
      departments: [],
      employees: [],
      qualificationMasters: [],
    };
  });

  afterAll(async () => {
    // テストデータクリーンアップ
    await cleanupTestData();
  });

  beforeEach(async () => {
    // 各テストケース実行前にテストデータクリーンアップ
    await cleanupTestData();
  });

  describe('会社マスター API (/api/companies)', () => {
    it('会社一覧を正常に取得できる', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      // テストデータ準備
      tracker.setOperation('テストデータ準備');
      const testCompany1 = await createTestCompany('テスト会社A');
      const testCompany2 = await createTestCompany('テスト会社B');
      testData.companies.push(testCompany1, testCompany2);
      tracker.mark('データ準備完了');

      // API呼び出し
      tracker.setOperation('API呼び出し');
      const { response, data } = await testGetRequest<Company[]>(app, '/api/companies');
      tracker.mark('APIレスポンス受信');

      // 検証
      tracker.setOperation('レスポンス検証');
      validateApiResponse<Company[]>(response, (companies) => {
        expect(Array.isArray(companies)).toBe(true);
        expect(companies.length).toBeGreaterThanOrEqual(2);

        // 作成したテスト会社が含まれているか確認
        const companyIds = companies.map(c => c.companyId);
        expect(companyIds).toContain(testCompany1.id);
        expect(companyIds).toContain(testCompany2.id);

        // 各会社データの構造確認
        companies.forEach(company => {
          expect(company).toHaveProperty('companyId');
          expect(company).toHaveProperty('companyName');
          expect(company).toHaveProperty('isActive');
          expect(company).toHaveProperty('createdAt');
          expect(company).toHaveProperty('updatedAt');
          expect(typeof company.companyId).toBe('string');
          expect(typeof company.companyName).toBe('string');
          expect(typeof company.isActive).toBe('boolean');
        });
      });
      tracker.mark('検証完了');

      // 結果サマリー
      tracker.summary();
    });

    it('存在しない会社IDでエラーレスポンスを返す', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('エラーテスト開始');

      await testErrorResponse(app, 'GET', '/api/companies/nonexistent-id', 404);

      tracker.mark('エラーレスポンス検証完了');
      tracker.summary();
    });
  });

  describe('部署マスター API (/api/departments)', () => {
    it('部署一覧を正常に取得できる', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      // テストデータ準備
      tracker.setOperation('テストデータ準備');
      const testCompany = await createTestCompany('テスト会社');
      const testDepartment1 = await createTestDepartment(testCompany.id, 'テスト部署A');
      const testDepartment2 = await createTestDepartment(testCompany.id, 'テスト部署B');
      testData.companies.push(testCompany);
      testData.departments.push(testDepartment1, testDepartment2);
      tracker.mark('データ準備完了');

      // API呼び出し
      tracker.setOperation('API呼び出し');
      const { response, data } = await testGetRequest<Department[]>(app, '/api/departments');
      tracker.mark('APIレスポンス受信');

      // 検証
      tracker.setOperation('レスポンス検証');
      validateApiResponse<Department[]>(response, (departments) => {
        expect(Array.isArray(departments)).toBe(true);
        expect(departments.length).toBeGreaterThanOrEqual(2);

        // 各部署データの構造確認
        departments.forEach(department => {
          expect(department).toHaveProperty('departmentId');
          expect(department).toHaveProperty('departmentName');
          expect(department).toHaveProperty('companyId');
          expect(department).toHaveProperty('isActive');
          expect(department).toHaveProperty('createdAt');
          expect(department).toHaveProperty('updatedAt');
        });
      });
      tracker.mark('検証完了');

      tracker.summary();
    });

    it('会社別部署一覧を正常に取得できる', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      // テストデータ準備
      tracker.setOperation('テストデータ準備');
      const testCompany = await createTestCompany('テスト会社');
      const testDepartment1 = await createTestDepartment(testCompany.id, 'テスト部署A');
      const testDepartment2 = await createTestDepartment(testCompany.id, 'テスト部署B');
      testData.companies.push(testCompany);
      testData.departments.push(testDepartment1, testDepartment2);
      tracker.mark('データ準備完了');

      // API呼び出し
      tracker.setOperation('API呼び出し');
      const { response, data } = await testGetRequest<Department[]>(
        app,
        `/api/departments/company/${testCompany.id}`
      );
      tracker.mark('APIレスポンス受信');

      // 検証
      tracker.setOperation('レスポンス検証');
      validateApiResponse<Department[]>(response, (departments) => {
        expect(Array.isArray(departments)).toBe(true);
        expect(departments.length).toBe(2);
        departments.forEach(dept => {
          expect(dept.companyId).toBe(testCompany.id);
        });
      });
      tracker.mark('検証完了');

      tracker.summary();
    });
  });

  describe('社員マスター API (/api/employees)', () => {
    it('社員一覧を正常に取得できる', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      // テストデータ準備
      tracker.setOperation('テストデータ準備');
      const testCompany = await createTestCompany('テスト会社');
      const testDepartment = await createTestDepartment(testCompany.id, 'テスト部署');
      const testEmployee1 = await createTestEmployee(testCompany.id, 'テスト社員A', testDepartment.id);
      const testEmployee2 = await createTestEmployee(testCompany.id, 'テスト社員B');
      testData.companies.push(testCompany);
      testData.departments.push(testDepartment);
      testData.employees.push(testEmployee1, testEmployee2);
      tracker.mark('データ準備完了');

      // API呼び出し
      tracker.setOperation('API呼び出し');
      const { response, data } = await testGetRequest<Employee[]>(app, '/api/employees');
      tracker.mark('APIレスポンス受信');

      // 検証
      tracker.setOperation('レスポンス検証');
      validateApiResponse<Employee[]>(response, (employees) => {
        expect(Array.isArray(employees)).toBe(true);
        expect(employees.length).toBeGreaterThanOrEqual(2);

        // 各社員データの構造確認
        employees.forEach(employee => {
          expect(employee).toHaveProperty('employeeId');
          expect(employee).toHaveProperty('name');
          expect(employee).toHaveProperty('email');
          expect(employee).toHaveProperty('companyId');
          expect(employee).toHaveProperty('createdAt');
          expect(employee).toHaveProperty('updatedAt');
        });
      });
      tracker.mark('検証完了');

      tracker.summary();
    });
  });

  describe('資格マスター API (/api/qualification-masters)', () => {
    it('資格マスター一覧を正常に取得できる', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      // テストデータ準備
      tracker.setOperation('テストデータ準備');
      const testQualMaster1 = await createTestQualificationMaster({
        name: '基本情報技術者試験',
        validityPeriod: 'permanent',
        category: 'IT'
      });
      const testQualMaster2 = await createTestQualificationMaster({
        name: '普通自動車免許',
        validityPeriod: '3',
        category: '運転'
      });
      testData.qualificationMasters.push(testQualMaster1, testQualMaster2);
      tracker.mark('データ準備完了');

      // API呼び出し
      tracker.setOperation('API呼び出し');
      const { response, data } = await testGetRequest<QualificationMaster[]>(app, '/api/qualification-masters');
      tracker.mark('APIレスポンス受信');

      // 検証
      tracker.setOperation('レスポンス検証');
      validateApiResponse<QualificationMaster[]>(response, (qualMasters) => {
        expect(Array.isArray(qualMasters)).toBe(true);
        expect(qualMasters.length).toBeGreaterThanOrEqual(2);

        // 各資格マスターデータの構造確認
        qualMasters.forEach(master => {
          expect(master).toHaveProperty('qualificationMasterId');
          expect(master).toHaveProperty('masterName');
          expect(master).toHaveProperty('validityPeriod');
          expect(master).toHaveProperty('isActive');
          expect(master).toHaveProperty('createdAt');
          expect(master).toHaveProperty('updatedAt');

          // validityPeriodは数値または'permanent'
          expect(
            typeof master.validityPeriod === 'number' || master.validityPeriod === 'permanent'
          ).toBe(true);
        });
      });
      tracker.mark('検証完了');

      tracker.summary();
    });
  });

  describe('API統合フローテスト', () => {
    it('すべてのマスターデータAPIが正常に連携動作する', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('統合テスト開始');

      // 1. 会社作成
      tracker.setOperation('会社データ準備');
      const company = await createTestCompany('統合テスト会社');
      tracker.mark('会社データ作成完了');

      // 2. 部署作成
      tracker.setOperation('部署データ準備');
      const department = await createTestDepartment(company.id, '統合テスト部署');
      tracker.mark('部署データ作成完了');

      // 3. 社員作成
      tracker.setOperation('社員データ準備');
      const employee = await createTestEmployee(company.id, '統合テスト社員', department.id);
      tracker.mark('社員データ作成完了');

      // 4. 資格マスター作成
      tracker.setOperation('資格マスターデータ準備');
      const qualMaster = await createTestQualificationMaster({
        name: '統合テスト資格',
        validityPeriod: 'permanent'
      });
      tracker.mark('資格マスターデータ作成完了');

      // 5. 各APIの動作確認
      tracker.setOperation('統合API呼び出し');

      // 会社一覧取得
      const { data: companies } = await testGetRequest<Company[]>(app, '/api/companies');
      expect(companies?.some(c => c.companyId === company.id)).toBe(true);

      // 会社別部署一覧取得
      const { data: departments } = await testGetRequest<Department[]>(
        app,
        `/api/departments/company/${company.id}`
      );
      expect(departments?.some(d => d.departmentId === department.id)).toBe(true);

      // 社員一覧取得
      const { data: employees } = await testGetRequest<Employee[]>(app, '/api/employees');
      expect(employees?.some(e => e.employeeId === employee.id)).toBe(true);

      // 資格マスター一覧取得
      const { data: qualMasters } = await testGetRequest<QualificationMaster[]>(
        app,
        '/api/qualification-masters'
      );
      expect(qualMasters?.some(q => q.qualificationMasterId === qualMaster.id)).toBe(true);

      tracker.mark('統合API呼び出し完了');

      // データ関連性の確認
      tracker.setOperation('データ関連性確認');
      const targetEmployee = employees?.find(e => e.employeeId === employee.id);
      expect(targetEmployee?.companyId).toBe(company.id);
      expect(targetEmployee?.departmentId).toBe(department.id);
      tracker.mark('関連性確認完了');

      tracker.summary();
    });
  });
});