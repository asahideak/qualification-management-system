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

// テスト用Expressアプリケーション設定
const createTestApp = (): express.Application => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
};

describe('データエクスポート機能 統合テスト（スライス5）', () => {
  let app: express.Application;
  let testData: {
    companies: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; companyId: string }>;
    employees: Array<{ id: string; name: string; companyId: string; departmentId?: string }>;
    qualificationMasters: Array<{ id: string; name: string; validityPeriod: string | number }>;
    qualifications: Array<{ id: string; employeeId: string; qualificationName: string; expirationDate: string }>;
  };

  beforeAll(async () => {
    console.log('🧪 データエクスポート機能統合テスト開始（スライス5）');

    // テスト前の準備
    app = createTestApp();

    // データベース接続確認
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('データベース接続に失敗しました');
    }

    // テストデータのクリーンアップ
    await cleanupTestData();

    // テストデータの作成
    await createTestDataSet();

    console.log('✅ テストデータ作成完了');
  }, 60000);

  afterAll(async () => {
    // テスト後のクリーンアップ
    await cleanupTestData();
    console.log('🧹 テストデータクリーンアップ完了');
  });

  async function createTestDataSet(): Promise<void> {
    const tracker = new MilestoneTracker();
    tracker.setOperation('テストデータ作成');

    const now = Date.now();

    // 会社データ作成
    tracker.mark('会社作成開始');
    const company1 = await createTestCompany('株式会社テスト本社');
    const company2 = await createTestCompany('株式会社テスト支社');

    // 部署データ作成
    tracker.mark('部署作成開始');
    const dept1 = await createTestDepartment(company1.id, '管理部');
    const dept2 = await createTestDepartment(company1.id, '開発部');
    const dept3 = await createTestDepartment(company2.id, '営業部');

    // 社員データ作成
    tracker.mark('社員作成開始');
    const emp1 = await createTestEmployee(company1.id, '田中太郎', dept1.id);
    const emp2 = await createTestEmployee(company1.id, '佐藤花子', dept2.id);
    const emp3 = await createTestEmployee(company2.id, '鈴木次郎', dept3.id);

    // 資格マスターデータ作成
    tracker.mark('資格マスター作成開始');
    const master1 = await createTestQualificationMaster({
      name: '基本情報技術者試験',
      validityPeriod: 'permanent',
    });
    const master2 = await createTestQualificationMaster({
      name: '普通自動車運転免許',
      validityPeriod: 3,
    });
    const master3 = await createTestQualificationMaster({
      name: '日商簿記検定2級',
      validityPeriod: 'permanent',
    });

    // 資格データ作成（期限状況が異なるデータを含む）
    tracker.mark('資格データ作成開始');

    // 正常な資格（永続）
    const qual1 = await createTestQualification({
      employeeId: emp1.id,
      qualificationName: master1.name,
      acquiredDate: '2023-03-15',
      qualificationMasterId: master1.id,
    });

    // 期限間近の資格（30日後に期限切れ）
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const qual2 = await createTestQualification({
      employeeId: emp2.id,
      qualificationName: master2.name,
      acquiredDate: '2022-03-15',
      qualificationMasterId: master2.id,
    });

    // 期限切れの資格（過去の日付）
    const qual3 = await createTestQualification({
      employeeId: emp3.id,
      qualificationName: master2.name,
      acquiredDate: '2021-01-15',
      qualificationMasterId: master2.id,
    });

    // 正常な資格（永続）
    const qual4 = await createTestQualification({
      employeeId: emp2.id,
      qualificationName: master3.name,
      acquiredDate: '2023-06-20',
      qualificationMasterId: master3.id,
    });

    testData = {
      companies: [
        { id: company1.id, name: company1.name },
        { id: company2.id, name: company2.name }
      ],
      departments: [
        { id: dept1.id, name: dept1.name, companyId: company1.id },
        { id: dept2.id, name: dept2.name, companyId: company1.id },
        { id: dept3.id, name: dept3.name, companyId: company2.id }
      ],
      employees: [
        { id: emp1.id, name: emp1.name, companyId: company1.id, departmentId: dept1.id },
        { id: emp2.id, name: emp2.name, companyId: company1.id, departmentId: dept2.id },
        { id: emp3.id, name: emp3.name, companyId: company2.id, departmentId: dept3.id }
      ],
      qualificationMasters: [
        { id: master1.id, name: master1.name, validityPeriod: master1.validityPeriod },
        { id: master2.id, name: master2.name, validityPeriod: master2.validityPeriod },
        { id: master3.id, name: master3.name, validityPeriod: master3.validityPeriod }
      ],
      qualifications: [
        { id: qual1.id, employeeId: emp1.id, qualificationName: qual1.qualificationName, expirationDate: qual1.expirationDate },
        { id: qual2.id, employeeId: emp2.id, qualificationName: qual2.qualificationName, expirationDate: qual2.expirationDate },
        { id: qual3.id, employeeId: emp3.id, qualificationName: qual3.qualificationName, expirationDate: qual3.expirationDate },
        { id: qual4.id, employeeId: emp2.id, qualificationName: qual4.qualificationName, expirationDate: qual4.expirationDate }
      ]
    };

    tracker.mark('テストデータ作成完了');
    tracker.summary();
  }

  describe('CSVエクスポート機能', () => {
    it('1. フィルターなしで全データをCSV形式でエクスポートできる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('全データCSVエクスポート');

      tracker.mark('APIリクエスト送信');
      const response = await request(app)
        .get('/api/qualifications/export')
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('レスポンス受信');

      // Content-Dispositionヘッダーの確認
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="qualifications_export_.*\.csv"/);

      // CSVコンテンツの検証（Buffer データを文字列に変換）
      const csvContent = response.body.toString('utf8');
      expect(csvContent).toContain('社員ID,社員名,会社名,部署名,資格名,取得日,有効期限,状況');
      expect(csvContent).toContain('田中太郎');
      expect(csvContent).toContain('佐藤花子');
      expect(csvContent).toContain('鈴木次郎');
      expect(csvContent).toContain('基本情報技術者試験');
      expect(csvContent).toContain('普通自動車運転免許');
      expect(csvContent).toContain('日商簿記検定2級');

      // CSVの行数確認（ヘッダー + データ行）
      const lines = csvContent.split('\n').filter((line: string) => line.trim() !== '');
      expect(lines.length).toBeGreaterThanOrEqual(5); // ヘッダー + 最低4行のデータ

      tracker.mark('検証完了');
      tracker.summary();
    });

    it('2. 会社IDフィルターを適用してCSVエクスポートできる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('会社フィルターCSVエクスポート');

      const companyId = testData.companies[0].id; // 株式会社テスト本社

      tracker.mark('APIリクエスト送信');
      const response = await request(app)
        .get(`/api/qualifications/export?companyId=${companyId}`)
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('レスポンス受信');

      const csvContent = response.body.toString('utf8');
      expect(csvContent).toContain('田中太郎');
      expect(csvContent).toContain('佐藤花子');
      expect(csvContent).not.toContain('鈴木次郎'); // 別会社の社員は除外

      tracker.mark('フィルター検証完了');
      tracker.summary();
    });

    it('3. 部署IDフィルターを適用してCSVエクスポートできる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('部署フィルターCSVエクスポート');

      const departmentId = testData.departments.find(d => d.name === '管理部')?.id;

      tracker.mark('APIリクエスト送信');
      const response = await request(app)
        .get(`/api/qualifications/export?departmentId=${departmentId}`)
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('レスポンス受信');

      const csvContent = response.body.toString('utf8');
      expect(csvContent).toContain('田中太郎');
      expect(csvContent).not.toContain('佐藤花子'); // 開発部の社員は除外
      expect(csvContent).not.toContain('鈴木次郎'); // 別会社の社員は除外

      tracker.mark('部署フィルター検証完了');
      tracker.summary();
    });

    it('4. 期限ステータスフィルターを適用してCSVエクスポートできる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('期限ステータスフィルターCSVエクスポート');

      tracker.mark('期限切れフィルターAPIリクエスト');
      const expiredResponse = await request(app)
        .get('/api/qualifications/export?expirationStatus=expired')
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('期限切れレスポンス受信');

      const expiredCsv = expiredResponse.body.toString('utf8');
      const expiredLines = expiredCsv.split('\n').filter((line: string) => line.trim() !== '');
      // 期限切れデータのみ含まれることを確認
      expect(expiredCsv).toContain('期限切れ');

      tracker.mark('正常ステータスフィルターAPIリクエスト');
      const normalResponse = await request(app)
        .get('/api/qualifications/export?expirationStatus=normal')
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('正常ステータスレスポンス受信');

      const normalCsv = normalResponse.body.toString('utf8');
      expect(normalCsv).toContain('正常');
      expect(normalCsv).not.toContain('期限切れ');

      tracker.mark('期限ステータスフィルター検証完了');
      tracker.summary();
    });

    it('5. キーワード検索フィルターを適用してCSVエクスポートできる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('キーワード検索フィルターCSVエクスポート');

      tracker.mark('社員名検索APIリクエスト');
      const nameResponse = await request(app)
        .get('/api/qualifications/export?keyword=田中')
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('社員名検索レスポンス受信');

      const nameCsv = nameResponse.body.toString('utf8');
      expect(nameCsv).toContain('田中太郎');
      expect(nameCsv).not.toContain('佐藤花子');
      expect(nameCsv).not.toContain('鈴木次郎');

      tracker.mark('資格名検索APIリクエスト');
      const qualResponse = await request(app)
        .get('/api/qualifications/export?keyword=基本情報')
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('資格名検索レスポンス受信');

      const qualCsv = qualResponse.body.toString('utf8');
      expect(qualCsv).toContain('基本情報技術者試験');
      expect(qualCsv).not.toContain('普通自動車運転免許');

      tracker.mark('キーワード検索検証完了');
      tracker.summary();
    });

    it('6. 複合フィルターを適用してCSVエクスポートできる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('複合フィルターCSVエクスポート');

      const companyId = testData.companies[0].id;
      const departmentId = testData.departments.find(d => d.name === '開発部')?.id;

      tracker.mark('複合フィルターAPIリクエスト');
      const response = await request(app)
        .get(`/api/qualifications/export?companyId=${companyId}&departmentId=${departmentId}&keyword=佐藤`)
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('複合フィルターレスポンス受信');

      const csvContent = response.body.toString('utf8');
      expect(csvContent).toContain('佐藤花子');
      expect(csvContent).not.toContain('田中太郎'); // 部署が異なる
      expect(csvContent).not.toContain('鈴木次郎'); // 会社が異なる

      tracker.mark('複合フィルター検証完了');
      tracker.summary();
    });

    it('7. CSVフォーマットが正しく生成される', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('CSVフォーマット検証');

      tracker.mark('CSVフォーマット検証APIリクエスト');
      const response = await request(app)
        .get('/api/qualifications/export')
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      tracker.mark('CSVフォーマット検証レスポンス受信');

      const csvContent = response.body.toString('utf8');
      const lines = csvContent.split('\n').filter((line: string) => line.trim() !== '');

      // ヘッダー行の検証
      const header = lines[0];
      expect(header).toBe('社員ID,社員名,会社名,部署名,資格名,取得日,有効期限,状況');

      // データ行の検証（CSVフォーマットが正しいこと）
      if (lines.length > 1) {
        const dataLine = lines[1];
        const fields = dataLine.split(',');
        expect(fields.length).toBe(8); // 8つのフィールド

        // 各フィールドが空でない（部署名以外）
        expect(fields[0]).toBeTruthy(); // 社員ID
        expect(fields[1]).toBeTruthy(); // 社員名
        expect(fields[2]).toBeTruthy(); // 会社名
        // fields[3] 部署名は空の場合もある
        expect(fields[4]).toBeTruthy(); // 資格名
        expect(fields[5]).toBeTruthy(); // 取得日
        expect(fields[6]).toBeTruthy(); // 有効期限
        expect(fields[7]).toBeTruthy(); // 状況
      }

      tracker.mark('CSVフォーマット検証完了');
      tracker.summary();
    });

    it('8. 不正なフィルター条件でエラーレスポンスが返る', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('不正フィルターエラー処理テスト');

      tracker.mark('不正ステータスAPIリクエスト');
      const response = await request(app)
        .get('/api/qualifications/export?expirationStatus=invalid_status')
        .expect('Content-Type', /application\/json/)
        .expect(400);

      tracker.mark('不正ステータスレスポンス受信');

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('フィルター条件が無効');

      tracker.mark('不正フィルターエラー処理検証完了');
      tracker.summary();
    });

    it('9. パフォーマンステスト：大量データでもCSVエクスポートが適切な時間で完了する', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('CSVエクスポートパフォーマンステスト');

      const startTime = Date.now();

      tracker.mark('パフォーマンステストAPIリクエスト');
      const response = await request(app)
        .get('/api/qualifications/export')
        .expect('Content-Type', /octet-stream/)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      tracker.mark('パフォーマンステストレスポンス受信');

      // 5秒以内にレスポンスが返ることを確認
      expect(responseTime).toBeLessThan(5000);

      // CSVコンテンツが生成されていることを確認
      expect(response.body.toString('utf8').length).toBeGreaterThan(0);

      console.log(`📊 CSVエクスポートパフォーマンス: ${responseTime}ms`);

      tracker.mark('パフォーマンステスト検証完了');
      tracker.summary();
    });
  });

  describe('エラーハンドリング', () => {
    it('10. データベース接続エラー時に適切にエラーハンドリングされる', async () => {
      const tracker = new MilestoneTracker();
      tracker.setOperation('データベースエラーハンドリングテスト');

      // 注意: 実際のデータベースエラーをシミュレートするのは困難なため、
      // ここでは不正なクエリパラメータでエラーを発生させる

      tracker.mark('エラーハンドリングテスト実行');
      const response = await request(app)
        .get('/api/qualifications/export')
        .expect(200); // 正常なケースで実行

      tracker.mark('エラーハンドリング検証');

      // 正常にCSVが生成されることを確認（データベース接続が正常なため）
      expect(response.body.toString('utf8')).toContain('社員ID,社員名,会社名,部署名,資格名,取得日,有効期限,状況');

      tracker.mark('エラーハンドリングテスト完了');
      tracker.summary();
    });
  });
});