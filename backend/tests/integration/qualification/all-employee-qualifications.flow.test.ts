import express from 'express';
import cors from 'cors';
import request from 'supertest';
import apiRoutes from '../../../src/routes';
import { MilestoneTracker } from '../../utils/MilestoneTracker';
import {
  testDatabaseConnection,
  cleanupTestData,
  createTestCompany,
  createTestDepartment,
  createTestEmployee,
  createTestQualificationMaster,
  createTestQualification,
} from '../../utils/db-test-helper';
import {
  testGetRequest,
  validateApiResponse,
} from '../../utils/api-test-helper';
import {
  AllEmployeeQualificationTableRow,
  AllEmployeeQualificationFilter,
} from '../../../src/types';

// テスト用Expressアプリケーション設定
const createTestApp = (): express.Application => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
};

describe('全社員資格一覧API統合テスト（スライス4-A）', () => {
  let app: express.Application;
  let testData: {
    companies: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; companyId: string }>;
    employees: Array<{ id: string; name: string; companyId: string; departmentId?: string }>;
    qualificationMasters: Array<{ id: string; name: string; validityPeriod: string | number }>;
    qualifications: Array<{ id: string; employeeId: string; qualificationName: string; expirationDate: string }>;
  };

  beforeAll(async () => {
    console.log('🧪 全社員資格一覧API統合テスト開始（スライス4-A）');

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
      qualifications: [],
    };

    // ユニークなデータセット作成
    const timestamp = Date.now();
    const uniqueSuffix = Math.random().toString(36).substring(7);

    // 複数の会社、部署、社員を作成してフィルターテスト用データを準備

    // 会社A作成
    const companyA = await createTestCompany(`本社-全社員テスト-${timestamp}-${uniqueSuffix}`);
    testData.companies.push({ id: companyA.id, name: companyA.name });

    // 会社B作成
    const companyB = await createTestCompany(`関連会社A-全社員テスト-${timestamp}-${uniqueSuffix}`);
    testData.companies.push({ id: companyB.id, name: companyB.name });

    // 部署作成（各会社に1つずつ）
    const deptA = await createTestDepartment(companyA.id, `技術部-${timestamp}-${uniqueSuffix}`);
    testData.departments.push({ id: deptA.id, name: deptA.name, companyId: companyA.id });

    const deptB = await createTestDepartment(companyB.id, `営業部-${timestamp}-${uniqueSuffix}`);
    testData.departments.push({ id: deptB.id, name: deptB.name, companyId: companyB.id });

    // 社員作成（各部署に2名ずつ、計4名）
    const employees = [];

    // 本社技術部
    for (let i = 1; i <= 2; i++) {
      const emp = await createTestEmployee(
        companyA.id,
        `田中太郎${i}-${timestamp}-${uniqueSuffix}`,
        deptA.id
      );
      employees.push(emp);
      testData.employees.push({
        id: emp.id,
        name: emp.name,
        companyId: emp.companyId,
        departmentId: emp.departmentId,
      });
    }

    // 関連会社A営業部
    for (let i = 1; i <= 2; i++) {
      const emp = await createTestEmployee(
        companyB.id,
        `佐藤花子${i}-${timestamp}-${uniqueSuffix}`,
        deptB.id
      );
      employees.push(emp);
      testData.employees.push({
        id: emp.id,
        name: emp.name,
        companyId: emp.companyId,
        departmentId: emp.departmentId,
      });
    }

    // 資格マスター作成（期限パターンを複数作成）

    // 永続資格
    const permanentMaster = await createTestQualificationMaster({
      name: `基本情報技術者試験-${timestamp}-${uniqueSuffix}`,
      validityPeriod: 'permanent',
    });
    testData.qualificationMasters.push({
      id: permanentMaster.id,
      name: permanentMaster.name,
      validityPeriod: permanentMaster.validityPeriod,
    });

    // 3年有効期限資格
    const threeYearMaster = await createTestQualificationMaster({
      name: `運転免許証-${timestamp}-${uniqueSuffix}`,
      validityPeriod: 3,
    });
    testData.qualificationMasters.push({
      id: threeYearMaster.id,
      name: threeYearMaster.name,
      validityPeriod: threeYearMaster.validityPeriod,
    });

    // 1年有効期限資格（期限切れ・警告テスト用）
    const oneYearMaster = await createTestQualificationMaster({
      name: `安全講習修了証-${timestamp}-${uniqueSuffix}`,
      validityPeriod: 1,
    });
    testData.qualificationMasters.push({
      id: oneYearMaster.id,
      name: oneYearMaster.name,
      validityPeriod: oneYearMaster.validityPeriod,
    });

    // 資格登録（異なる期限ステータスを作成）

    // 社員1: 永続資格（正常）
    const qual1 = await createTestQualification({
      employeeId: employees[0].id,
      qualificationName: permanentMaster.name,
      acquiredDate: '2023-06-01',
      qualificationMasterId: permanentMaster.id,
    });
    testData.qualifications.push({
      id: qual1.id,
      employeeId: qual1.employeeId,
      qualificationName: qual1.qualificationName,
      expirationDate: qual1.expirationDate,
    });

    // 社員1: 期限切れ資格（expired）
    const expiredDate = new Date();
    expiredDate.setFullYear(expiredDate.getFullYear() - 2); // 2年前取得 → 1年期限なので期限切れ
    const qual2 = await createTestQualification({
      employeeId: employees[0].id,
      qualificationName: oneYearMaster.name,
      acquiredDate: expiredDate.toISOString().split('T')[0],
      qualificationMasterId: oneYearMaster.id,
    });
    testData.qualifications.push({
      id: qual2.id,
      employeeId: qual2.employeeId,
      qualificationName: qual2.qualificationName,
      expirationDate: qual2.expirationDate,
    });

    // 社員2: 期限間近資格（warning）
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() - 335); // 335日前取得 → 30日後に期限切れ（警告範囲）
    const qual3 = await createTestQualification({
      employeeId: employees[1].id,
      qualificationName: oneYearMaster.name,
      acquiredDate: warningDate.toISOString().split('T')[0],
      qualificationMasterId: oneYearMaster.id,
    });
    testData.qualifications.push({
      id: qual3.id,
      employeeId: qual3.employeeId,
      qualificationName: qual3.qualificationName,
      expirationDate: qual3.expirationDate,
    });

    // 社員3: 正常資格（normal）
    const normalDate = new Date();
    normalDate.setFullYear(normalDate.getFullYear() - 2); // 2年前取得 → 3年期限なので正常
    const qual4 = await createTestQualification({
      employeeId: employees[2].id,
      qualificationName: threeYearMaster.name,
      acquiredDate: normalDate.toISOString().split('T')[0],
      qualificationMasterId: threeYearMaster.id,
    });
    testData.qualifications.push({
      id: qual4.id,
      employeeId: qual4.employeeId,
      qualificationName: qual4.qualificationName,
      expirationDate: qual4.expirationDate,
    });

    console.log(`✅ テストデータ準備完了:
      - 会社: ${testData.companies.length}件
      - 部署: ${testData.departments.length}件
      - 社員: ${testData.employees.length}件
      - 資格マスター: ${testData.qualificationMasters.length}件
      - 資格: ${testData.qualifications.length}件`);
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    console.log('🧹 テストデータクリーンアップ開始');

    try {
      await cleanupTestData({
        qualificationIds: testData.qualifications.map(q => q.id),
        employeeIds: testData.employees.map(e => e.id),
        departmentIds: testData.departments.map(d => d.id),
        companyIds: testData.companies.map(c => c.id),
        qualificationMasterIds: testData.qualificationMasters.map(qm => qm.id),
      });
      console.log('✅ テストデータクリーンアップ完了');
    } catch (error) {
      console.error('❌ テストデータクリーンアップエラー:', error);
    }
  });

  describe('GET /api/qualifications/all-employees', () => {
    it('フィルターなしで全社員資格一覧を正常に取得できる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('フィルターなし全社員資格一覧取得');

      tracker.mark('API呼び出し開始');
      const result = await testGetRequest(app, '/api/qualifications/all-employees');
      tracker.mark('API呼び出し完了');

      // レスポンス形式の検証
      expect(result.response.status).toBe(200);
      validateApiResponse(result.response.body);
      expect(Array.isArray(result.response.body.data)).toBe(true);
      tracker.mark('基本形式検証完了');

      // データ件数確認（最低でもテストデータ分は存在）
      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];
      expect(qualifications.length).toBeGreaterThanOrEqual(testData.qualifications.length);
      tracker.mark('データ件数確認完了');

      // データ構造の検証
      qualifications.forEach((qual, index) => {
        expect(qual).toHaveProperty('employeeId');
        expect(qual).toHaveProperty('employeeName');
        expect(qual).toHaveProperty('companyName');
        expect(qual).toHaveProperty('qualificationName');
        expect(qual).toHaveProperty('acquiredDate');
        expect(qual).toHaveProperty('expirationDate');
        expect(qual).toHaveProperty('status');
        expect(qual).toHaveProperty('statusDisplayText');
        expect(['normal', 'warning', 'expired']).toContain(qual.status);

        if (index < 5) { // 最初の5件のみログ出力
          console.log(`資格データ${index + 1}: ${qual.employeeName} - ${qual.qualificationName} (${qual.status})`);
        }
      });
      tracker.mark('データ構造検証完了');

      tracker.summary();
    }, 30000);

    it('会社フィルターが正常に動作する', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('会社フィルター機能テスト');

      // テスト会社Aのみで絞り込み
      const companyAId = testData.companies[0].id;
      tracker.mark('会社A資格一覧API呼び出し開始');

      const result = await testGetRequest(app, `/api/qualifications/all-employees?companyId=${companyAId}`);
      tracker.mark('会社A資格一覧API呼び出し完了');

      expect(result.response.status).toBe(200);
      validateApiResponse(result.response.body);

      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];

      // 全ての資格が会社Aの社員のものであることを確認
      qualifications.forEach(qual => {
        expect(qual.companyId).toBe(companyAId);
        expect(qual.companyName).toBe(testData.companies[0].name);
      });

      console.log(`✅ 会社フィルター動作確認: 会社A(${testData.companies[0].name})の資格 ${qualifications.length}件を取得`);
      tracker.mark('会社フィルター検証完了');

      tracker.summary();
    }, 20000);

    it('部署フィルターが正常に動作する', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('部署フィルター機能テスト');

      // テスト部署1のみで絞り込み
      const deptId = testData.departments[0].id;
      tracker.mark('部署絞り込みAPI呼び出し開始');

      const result = await testGetRequest(app, `/api/qualifications/all-employees?departmentId=${deptId}`);
      tracker.mark('部署絞り込みAPI呼び出し完了');

      expect(result.response.status).toBe(200);
      validateApiResponse(result.response.body);

      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];

      // 全ての資格が指定部署の社員のものであることを確認
      qualifications.forEach(qual => {
        expect(qual.departmentId).toBe(deptId);
        expect(qual.departmentName).toBe(testData.departments[0].name);
      });

      console.log(`✅ 部署フィルター動作確認: 部署(${testData.departments[0].name})の資格 ${qualifications.length}件を取得`);
      tracker.mark('部署フィルター検証完了');

      tracker.summary();
    }, 20000);

    it('期限ステータスフィルター（期限切れ）が正常に動作する', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('期限切れフィルター機能テスト');

      tracker.mark('期限切れ資格API呼び出し開始');
      const result = await testGetRequest(app, '/api/qualifications/all-employees?expirationStatus=expired');
      tracker.mark('期限切れ資格API呼び出し完了');

      expect(result.response.status).toBe(200);
      validateApiResponse(result.response.body);

      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];

      // 全ての資格が期限切れであることを確認
      qualifications.forEach(qual => {
        expect(qual.status).toBe('expired');
        expect(qual.statusDisplayText).toBe('期限切れ');

        // permanent以外の場合、実際に期限が過ぎていることを確認
        if (qual.expirationDate !== 'permanent') {
          const expirationDate = new Date(qual.expirationDate);
          const today = new Date();
          expect(expirationDate).toBeInstanceOf(Date);
          expect(expirationDate.getTime()).toBeLessThan(today.getTime());
        }
      });

      console.log(`✅ 期限切れフィルター動作確認: 期限切れ資格 ${qualifications.length}件を取得`);
      tracker.mark('期限切れフィルター検証完了');

      tracker.summary();
    }, 20000);

    it('期限ステータスフィルター（期限間近）が正常に動作する', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('期限間近フィルター機能テスト');

      tracker.mark('期限間近資格API呼び出し開始');
      const result = await testGetRequest(app, '/api/qualifications/all-employees?expirationStatus=warning');
      tracker.mark('期限間近資格API呼び出し完了');

      expect(result.response.status).toBe(200);
      validateApiResponse(result.response.body);

      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];

      // 全ての資格が期限間近であることを確認
      qualifications.forEach(qual => {
        expect(qual.status).toBe('warning');
        expect(qual.statusDisplayText).toBe('期限間近');

        // permanent以外の場合、90日以内に期限が切れることを確認
        if (qual.expirationDate !== 'permanent') {
          const expirationDate = new Date(qual.expirationDate);
          const today = new Date();
          const warningThreshold = new Date();
          warningThreshold.setDate(warningThreshold.getDate() + 90);

          expect(expirationDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
          expect(expirationDate.getTime()).toBeLessThanOrEqual(warningThreshold.getTime());
        }
      });

      console.log(`✅ 期限間近フィルター動作確認: 期限間近資格 ${qualifications.length}件を取得`);
      tracker.mark('期限間近フィルター検証完了');

      tracker.summary();
    }, 20000);

    it('キーワード検索が正常に動作する', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('キーワード検索機能テスト');

      // 社員名での検索
      const searchKeyword = '田中';
      tracker.mark('キーワード検索API呼び出し開始');
      const result = await testGetRequest(app, `/api/qualifications/all-employees?keyword=${encodeURIComponent(searchKeyword)}`);
      tracker.mark('キーワード検索API呼び出し完了');

      expect(result.response.status).toBe(200);
      validateApiResponse(result.response.body);

      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];

      // 検索結果が社員名または資格名にキーワードを含むことを確認
      qualifications.forEach(qual => {
        const containsKeyword =
          qual.employeeName.includes(searchKeyword) ||
          qual.qualificationName.includes(searchKeyword);
        expect(containsKeyword).toBe(true);
      });

      console.log(`✅ キーワード検索動作確認: "${searchKeyword}"で${qualifications.length}件を取得`);
      tracker.mark('キーワード検索検証完了');

      tracker.summary();
    }, 20000);

    it('複合フィルター（会社+期限ステータス）が正常に動作する', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('複合フィルター機能テスト');

      // 会社Aの正常資格のみ
      const companyAId = testData.companies[0].id;
      tracker.mark('複合フィルターAPI呼び出し開始');
      const result = await testGetRequest(app, `/api/qualifications/all-employees?companyId=${companyAId}&expirationStatus=normal`);
      tracker.mark('複合フィルターAPI呼び出し完了');

      expect(result.response.status).toBe(200);
      validateApiResponse(result.response.body);

      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];

      // 全ての資格が会社Aかつ正常ステータスであることを確認
      qualifications.forEach(qual => {
        expect(qual.companyId).toBe(companyAId);
        expect(qual.status).toBe('normal');
        expect(qual.statusDisplayText).toBe('正常');
      });

      console.log(`✅ 複合フィルター動作確認: 会社A + 正常資格で ${qualifications.length}件を取得`);
      tracker.mark('複合フィルター検証完了');

      tracker.summary();
    }, 20000);

    it('無効なフィルター条件でエラーが返される', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('無効フィルター条件エラーテスト');

      tracker.mark('無効フィルターAPI呼び出し開始');
      const response = await request(app)
        .get('/api/qualifications/all-employees?expirationStatus=invalid');
      tracker.mark('無効フィルターAPI呼び出し完了');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('フィルター条件が無効');

      console.log(`✅ 無効フィルター条件エラー動作確認: ${response.body.message}`);
      tracker.mark('無効フィルターエラー検証完了');

      tracker.summary();
    }, 15000);
  });

  describe('パフォーマンステスト', () => {
    it('大量データでもレスポンス時間が許容範囲内である', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('パフォーマンス測定');

      tracker.mark('パフォーマンステスト開始');
      const startTime = Date.now();

      const result = await testGetRequest(app, '/api/qualifications/all-employees');

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      tracker.mark('パフォーマンステスト完了');

      expect(result.response.status).toBe(200);

      // レスポンス時間が5秒以内であることを確認（大量データ想定）
      expect(responseTime).toBeLessThan(5000);

      const qualifications = result.response.body.data as AllEmployeeQualificationTableRow[];

      console.log(`✅ パフォーマンステスト結果:
        - レスポンス時間: ${responseTime}ms
        - 取得件数: ${qualifications.length}件
        - 1件あたり平均処理時間: ${(responseTime / Math.max(qualifications.length, 1)).toFixed(2)}ms`);

      tracker.mark('パフォーマンス分析完了');
      tracker.summary();
    }, 30000);
  });
});