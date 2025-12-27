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
} from '../../utils/db-test-helper';
import {
  testGetRequest,
  testPostRequest,
  testPutRequest,
  testDeleteRequest,
  testErrorResponse,
  validateApiResponse,
} from '../../utils/api-test-helper';
import {
  Company,
  Department,
  Employee,
  QualificationMaster,
  Qualification,
  QualificationRegistrationForm,
  QualificationEditForm,
} from '../../../src/types';

// テスト用Expressアプリケーション設定
const createTestApp = (): express.Application => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
};

describe('資格管理コア統合テスト', () => {
  let app: express.Application;
  let testData: {
    companies: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; companyId: string }>;
    employees: Array<{ id: string; name: string; companyId: string; departmentId?: string }>;
    qualificationMasters: Array<{ id: string; name: string; validityPeriod: string }>;
    qualifications: Array<{ id: string; employeeId: string; qualificationName: string; qualificationMasterId: string }>;
  };

  beforeAll(async () => {
    console.log('🧪 資格管理コア統合テスト開始');

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

    // 前提となるマスターデータを準備
    const timestamp = Date.now();
    const uniqueSuffix = Math.random().toString(36).substring(7);

    // テスト会社作成
    const company = await createTestCompany(`テスト会社-資格管理-${timestamp}-${uniqueSuffix}`);
    testData.companies.push({ id: company.id, name: company.name });

    // テスト部署作成
    const department = await createTestDepartment(company.id, `テスト部署-資格管理-${timestamp}-${uniqueSuffix}`);
    testData.departments.push({
      id: department.id,
      name: department.name,
      companyId: department.companyId
    });

    // テスト社員作成（複数人）
    for (let i = 1; i <= 3; i++) {
      const employee = await createTestEmployee(company.id, `テスト社員${i}-${timestamp}-${uniqueSuffix}`, department.id);
      testData.employees.push({
        id: employee.id,
        name: employee.name,
        companyId: employee.companyId,
        departmentId: employee.departmentId,
      });
    }

    // テスト資格マスター作成
    const masters = [
      {
        name: `基本情報技術者試験-${timestamp}-${uniqueSuffix}`,
        validityPeriod: 'permanent'
      },
      {
        name: `普通自動車免許-${timestamp}-${uniqueSuffix}`,
        validityPeriod: '3'
      },
      {
        name: `応用情報技術者試験-${timestamp}-${uniqueSuffix}`,
        validityPeriod: 'permanent'
      }
    ];

    for (const masterData of masters) {
      const master = await createTestQualificationMaster(masterData);
      testData.qualificationMasters.push({
        id: master.id,
        name: master.name,
        validityPeriod: master.validityPeriod,
      });
    }

    console.log('✅ テストデータ準備完了', {
      companies: testData.companies.length,
      departments: testData.departments.length,
      employees: testData.employees.length,
      qualificationMasters: testData.qualificationMasters.length,
    });
  });

  afterAll(async () => {
    console.log('🧹 テストデータクリーンアップ開始');

    // 登録した資格データをクリーンアップ
    for (const qualification of testData.qualifications) {
      try {
        await request(app)
          .delete(`/api/qualifications/${qualification.id}`)
          .expect((res) => {
            // 404は既に削除済みまたは存在しない場合なので、エラーとしない
            if (res.status !== 200 && res.status !== 404) {
              throw new Error(`資格削除失敗: ${res.status}`);
            }
          });
      } catch (error) {
        console.warn(`資格削除エラー（継続）: ${qualification.id}`, error);
      }
    }

    // マスターデータのクリーンアップ
    await cleanupTestData();
    console.log('✅ クリーンアップ完了');
  });

  describe('POST /api/qualifications - 資格登録', () => {
    it('正常な資格登録フロー（永続資格）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const employee = testData.employees[0];
      const master = testData.qualificationMasters.find(m => m.validityPeriod === 'permanent')!;

      const registrationForm: QualificationRegistrationForm = {
        employeeId: employee.id,
        qualificationName: master.name,
        acquiredDate: '2024-04-15',
        qualificationMasterId: master.id,
      };

      tracker.setOperation('資格登録API実行');
      const response = await request(app)
        .post('/api/qualifications')
        .send(registrationForm)
        .expect(201);

      tracker.mark('レスポンス受信');

      // レスポンス検証
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('qualificationId');
      expect(response.body.data.employeeId).toBe(employee.id);
      expect(response.body.data.qualificationName).toBe(master.name);
      expect(response.body.data.acquiredDate).toBe('2024-04-15');
      expect(response.body.data.expirationDate).toBe('permanent');
      expect(response.body.data.qualificationMasterId).toBe(master.id);

      // テストデータに追加（クリーンアップ用）
      testData.qualifications.push({
        id: response.body.data.qualificationId,
        employeeId: employee.id,
        qualificationName: master.name,
        qualificationMasterId: master.id,
      });

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('正常な資格登録フロー（期限付き資格）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const employee = testData.employees[1];
      const master = testData.qualificationMasters.find(m => m.validityPeriod === '3')!;

      const registrationForm: QualificationRegistrationForm = {
        employeeId: employee.id,
        qualificationName: master.name,
        acquiredDate: '2024-01-15',
        qualificationMasterId: master.id,
      };

      tracker.setOperation('期限付き資格登録API実行');
      const response = await request(app)
        .post('/api/qualifications')
        .send(registrationForm)
        .expect(201);

      tracker.mark('レスポンス受信');

      // レスポンス検証
      expect(response.body.success).toBe(true);
      expect(response.body.data.expirationDate).toBe('2027-01-15'); // 3年後

      // テストデータに追加
      testData.qualifications.push({
        id: response.body.data.qualificationId,
        employeeId: employee.id,
        qualificationName: master.name,
        qualificationMasterId: master.id,
      });

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('資格マスターIDなしでの登録（自動マスター作成）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const employee = testData.employees[2];
      const uniqueName = `カスタム資格-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const registrationForm = {
        employeeId: employee.id,
        qualificationName: uniqueName,
        acquiredDate: '2024-06-01',
        // qualificationMasterIdを省略
      };

      tracker.setOperation('マスターIDなし資格登録API実行');
      const response = await request(app)
        .post('/api/qualifications')
        .send(registrationForm)
        .expect(201);

      tracker.mark('レスポンス受信');

      // レスポンス検証
      expect(response.body.success).toBe(true);
      expect(response.body.data.qualificationName).toBe(uniqueName);
      expect(response.body.data.expirationDate).toBe('permanent'); // デフォルトで永続
      expect(response.body.data).toHaveProperty('qualificationMasterId'); // 自動生成されたマスターID

      // テストデータに追加
      testData.qualifications.push({
        id: response.body.data.qualificationId,
        employeeId: employee.id,
        qualificationName: uniqueName,
        qualificationMasterId: response.body.data.qualificationMasterId,
      });

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('重複資格登録エラー（409 Conflict）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const existingQualification = testData.qualifications[0];
      const employee = testData.employees.find(e => e.id === existingQualification.employeeId)!;

      const duplicateForm: QualificationRegistrationForm = {
        employeeId: employee.id,
        qualificationName: existingQualification.qualificationName,
        acquiredDate: '2024-04-20',
        qualificationMasterId: existingQualification.qualificationMasterId,
      };

      tracker.setOperation('重複資格登録API実行');
      const response = await request(app)
        .post('/api/qualifications')
        .send(duplicateForm)
        .expect(409);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('既に同じ資格が登録されています');

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('無効な社員IDエラー（404 Not Found）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const invalidForm: QualificationRegistrationForm = {
        employeeId: 'invalid-employee-id',
        qualificationName: 'テスト資格',
        acquiredDate: '2024-04-15',
      };

      tracker.setOperation('無効社員ID資格登録API実行');
      const response = await request(app)
        .post('/api/qualifications')
        .send(invalidForm)
        .expect(404);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('見つかりません');

      tracker.mark('検証完了');
      tracker.summary();
    });
  });

  describe('PUT /api/qualifications/:id - 資格更新', () => {
    it('正常な資格更新フロー', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const qualification = testData.qualifications[0];
      const newMaster = testData.qualificationMasters.find(m => m.id !== qualification.qualificationMasterId)!;

      const updateForm: QualificationEditForm = {
        qualificationId: qualification.id,
        qualificationName: newMaster.name,
        acquiredDate: '2024-05-01',
        qualificationMasterId: newMaster.id,
      };

      tracker.setOperation('資格更新API実行');
      const response = await request(app)
        .put(`/api/qualifications/${qualification.id}`)
        .send(updateForm)
        .expect(200);

      tracker.mark('レスポンス受信');

      expect(response.body.success).toBe(true);
      expect(response.body.data.qualificationName).toBe(newMaster.name);
      expect(response.body.data.acquiredDate).toBe('2024-05-01');
      expect(response.body.data.qualificationMasterId).toBe(newMaster.id);

      // テストデータを更新
      const qualificationIndex = testData.qualifications.findIndex(q => q.id === qualification.id);
      if (qualificationIndex >= 0) {
        testData.qualifications[qualificationIndex] = {
          ...testData.qualifications[qualificationIndex],
          qualificationName: newMaster.name,
          qualificationMasterId: newMaster.id,
        };
      }

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('存在しない資格更新エラー（404 Not Found）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const updateForm: QualificationEditForm = {
        qualificationId: 'invalid-qualification-id',
        qualificationName: 'テスト資格',
        acquiredDate: '2024-05-01',
      };

      tracker.setOperation('存在しない資格更新API実行');
      const response = await request(app)
        .put('/api/qualifications/invalid-qualification-id')
        .send(updateForm)
        .expect(404);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('見つかりません');

      tracker.mark('検証完了');
      tracker.summary();
    });
  });

  describe('GET /api/qualifications/:id - 資格詳細取得', () => {
    it('正常な資格詳細取得', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const qualification = testData.qualifications[0];

      tracker.setOperation('資格詳細取得API実行');
      const response = await request(app)
        .get(`/api/qualifications/${qualification.id}`)
        .expect(200);

      tracker.mark('レスポンス受信');

      expect(response.body.success).toBe(true);
      expect(response.body.data.qualificationId).toBe(qualification.id);
      expect(response.body.data.employeeId).toBe(qualification.employeeId);

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('存在しない資格詳細取得エラー（404 Not Found）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      tracker.setOperation('存在しない資格詳細取得API実行');
      const response = await request(app)
        .get('/api/qualifications/invalid-qualification-id')
        .expect(404);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('見つかりません');

      tracker.mark('検証完了');
      tracker.summary();
    });
  });

  describe('GET /api/employees/:employeeId/qualifications - 社員別資格一覧取得', () => {
    it('正常な社員別資格一覧取得', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const employee = testData.employees[0];

      tracker.setOperation('社員別資格一覧取得API実行');
      const response = await request(app)
        .get(`/api/employees/${employee.id}/qualifications`)
        .expect(200);

      tracker.mark('レスポンス受信');

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // この社員の資格が含まれているかチェック
      const employeeQualifications = testData.qualifications.filter(q => q.employeeId === employee.id);
      expect(response.body.data.length).toBeGreaterThanOrEqual(employeeQualifications.length);

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('存在しない社員の資格一覧取得エラー（404 Not Found）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      tracker.setOperation('存在しない社員の資格一覧取得API実行');
      const response = await request(app)
        .get('/api/employees/invalid-employee-id/qualifications')
        .expect(404);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('見つかりません');

      tracker.mark('検証完了');
      tracker.summary();
    });
  });

  describe('DELETE /api/qualifications/:id - 資格削除', () => {
    it('正常な資格削除フロー', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      // 削除用の資格を一つ作成
      const employee = testData.employees[0];
      const master = testData.qualificationMasters[0];
      const uniqueName = `削除テスト資格-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const createResponse = await request(app)
        .post('/api/qualifications')
        .send({
          employeeId: employee.id,
          qualificationName: uniqueName,
          acquiredDate: '2024-07-01',
          qualificationMasterId: master.id,
        })
        .expect(201);

      const qualificationId = createResponse.body.data.qualificationId;

      tracker.setOperation('資格削除API実行');
      const deleteResponse = await request(app)
        .delete(`/api/qualifications/${qualificationId}`)
        .expect(200);

      tracker.mark('削除レスポンス受信');

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('削除しました');

      // 削除確認
      tracker.setOperation('削除確認取得API実行');
      await request(app)
        .get(`/api/qualifications/${qualificationId}`)
        .expect(404);

      tracker.mark('削除確認完了');
      tracker.summary();
    });

    it('存在しない資格削除エラー（404 Not Found）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      tracker.setOperation('存在しない資格削除API実行');
      const response = await request(app)
        .delete('/api/qualifications/invalid-qualification-id')
        .expect(404);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('見つかりません');

      tracker.mark('検証完了');
      tracker.summary();
    });
  });

  describe('統合フローテスト', () => {
    it('完全な資格管理フロー（登録→取得→更新→削除）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('統合フロー開始');

      const employee = testData.employees[1];
      const master1 = testData.qualificationMasters[0];
      const master2 = testData.qualificationMasters[1];
      const uniqueName1 = `統合フロー資格1-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const uniqueName2 = `統合フロー資格2-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // 1. 資格登録
      tracker.setOperation('統合フロー - 資格登録');
      const createResponse = await request(app)
        .post('/api/qualifications')
        .send({
          employeeId: employee.id,
          qualificationName: uniqueName1,
          acquiredDate: '2024-08-01',
          qualificationMasterId: master1.id,
        })
        .expect(201);

      const qualificationId = createResponse.body.data.qualificationId;
      expect(createResponse.body.data.qualificationName).toBe(uniqueName1);
      tracker.mark('登録完了');

      // 2. 詳細取得
      tracker.setOperation('統合フロー - 詳細取得');
      const getResponse = await request(app)
        .get(`/api/qualifications/${qualificationId}`)
        .expect(200);

      expect(getResponse.body.data.qualificationId).toBe(qualificationId);
      tracker.mark('取得完了');

      // 3. 更新
      tracker.setOperation('統合フロー - 資格更新');
      const updateResponse = await request(app)
        .put(`/api/qualifications/${qualificationId}`)
        .send({
          qualificationId,
          qualificationName: uniqueName2,
          acquiredDate: '2024-08-15',
          qualificationMasterId: master2.id,
        })
        .expect(200);

      expect(updateResponse.body.data.qualificationName).toBe(uniqueName2);
      expect(updateResponse.body.data.qualificationMasterId).toBe(master2.id);
      tracker.mark('更新完了');

      // 4. 社員別資格一覧で確認
      tracker.setOperation('統合フロー - 一覧確認');
      const listResponse = await request(app)
        .get(`/api/employees/${employee.id}/qualifications`)
        .expect(200);

      const qualification = listResponse.body.data.find((q: any) => q.qualificationId === qualificationId);
      expect(qualification).toBeDefined();
      expect(qualification.qualificationName).toBe(uniqueName2);
      tracker.mark('一覧確認完了');

      // 5. 削除
      tracker.setOperation('統合フロー - 削除');
      await request(app)
        .delete(`/api/qualifications/${qualificationId}`)
        .expect(200);

      tracker.mark('削除完了');

      // 6. 削除確認
      tracker.setOperation('統合フロー - 削除確認');
      await request(app)
        .get(`/api/qualifications/${qualificationId}`)
        .expect(404);

      tracker.mark('統合フロー完了');
      tracker.summary();
    });
  });

  // バリデーションテスト
  describe('バリデーションテスト', () => {
    it('不正な日付形式エラー（400 Bad Request）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const employee = testData.employees[0];
      const master = testData.qualificationMasters[0];

      const invalidForm = {
        employeeId: employee.id,
        qualificationName: master.name,
        acquiredDate: '2024/04/15', // 不正な形式
        qualificationMasterId: master.id,
      };

      tracker.setOperation('不正日付形式API実行');
      const response = await request(app)
        .post('/api/qualifications')
        .send(invalidForm)
        .expect(400);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無効');

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('未来の取得日エラー（400 Bad Request）', async () => {
      const tracker = new MilestoneTracker();
      tracker.mark('テスト開始');

      const employee = testData.employees[0];
      const master = testData.qualificationMasters[0];

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const invalidForm = {
        employeeId: employee.id,
        qualificationName: master.name,
        acquiredDate: futureDateString, // 未来の日付
        qualificationMasterId: master.id,
      };

      tracker.setOperation('未来日付API実行');
      const response = await request(app)
        .post('/api/qualifications')
        .send(invalidForm)
        .expect(400);

      tracker.mark('エラーレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('入力データが無効です');

      tracker.mark('検証完了');
      tracker.summary();
    });
  });
});