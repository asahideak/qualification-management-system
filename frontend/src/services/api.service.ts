// 5社統合資格管理システム - 実API統合サービス
// モック実装から実APIへの統合

import {
  API_PATHS,
  Company,
  Department,
  Employee,
  EmployeeSelectOption,
  Qualification,
  QualificationMaster,
  QualificationRegistrationForm,
  QualificationEditForm,
  QualificationTableRow,
  QualificationSuggestion,
  ExpirationCalculation,
  AllEmployeeQualificationFilter,
  AllEmployeeQualificationTableRow,
  ApiResponse,
  QUALIFICATION_STATUS_TEXT,
  QualificationStatus
} from '@/types';
import { logger } from '@/lib/logger';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8432';

export class ApiService {
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${BASE_URL}${endpoint}`;
      logger.debug('API request', { url, method: options.method || 'GET' });

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('API request failed', {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const apiResponse = await response.json() as ApiResponse<T>;

      // デバッグ: APIレスポンスの詳細をログ出力（ブラウザコンソールでも確認可能）
      console.log(`[API Response] ${url}:`, apiResponse);
      console.error(`[API Response DEBUG] ${url}:`, {
        success: apiResponse.success,
        dataType: typeof apiResponse.data,
        isArray: Array.isArray(apiResponse.data),
        dataLength: Array.isArray(apiResponse.data) ? apiResponse.data.length : 'N/A',
        dataKeys: typeof apiResponse.data === 'object' ? Object.keys(apiResponse.data || {}) : 'N/A',
        firstItem: Array.isArray(apiResponse.data) ? apiResponse.data[0] : 'Not array'
      });
      logger.debug('API response received', {
        url,
        success: apiResponse.success,
        dataType: typeof apiResponse.data,
        isArray: Array.isArray(apiResponse.data),
        data: apiResponse.data
      });

      if (!apiResponse.success) {
        logger.error('API returned error', { url, message: apiResponse.message });
        throw new Error(apiResponse.message || 'API returned an error');
      }

      return apiResponse.data;
    } catch (error) {
      logger.error('API request error', { endpoint, error });
      // デバッグ: ブラウザコンソールにもエラーを出力
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // スライス1: マスターデータ基盤 API統合
  async getCompanies(): Promise<Company[]> {
    logger.debug('Fetching companies from API', { endpoint: API_PATHS.COMPANIES.LIST });
    return await this.fetchApi<Company[]>(API_PATHS.COMPANIES.LIST);
  }

  async getDepartments(): Promise<Department[]> {
    logger.debug('Fetching departments from API', { endpoint: API_PATHS.DEPARTMENTS.LIST });
    return await this.fetchApi<Department[]>(API_PATHS.DEPARTMENTS.LIST);
  }

  async getDepartmentsByCompany(companyId: string): Promise<Department[]> {
    const endpoint = API_PATHS.DEPARTMENTS.BY_COMPANY(companyId);
    logger.debug('Fetching departments by company from API', { companyId, endpoint });
    return await this.fetchApi<Department[]>(endpoint);
  }

  async getEmployees(): Promise<Employee[]> {
    logger.debug('Fetching employees from API', { endpoint: API_PATHS.EMPLOYEES.LIST });
    return await this.fetchApi<Employee[]>(API_PATHS.EMPLOYEES.LIST);
  }

  async getQualificationMasters(): Promise<QualificationMaster[]> {
    logger.debug('Fetching qualification masters from API', { endpoint: API_PATHS.QUALIFICATION_MASTERS.LIST });
    return await this.fetchApi<QualificationMaster[]>(API_PATHS.QUALIFICATION_MASTERS.LIST);
  }

  // スライス2: 資格管理コア API統合
  async createQualification(form: QualificationRegistrationForm): Promise<Qualification> {
    logger.debug('Creating qualification via API', { employeeId: form.employeeId, qualificationName: form.qualificationName });
    return await this.fetchApi<Qualification>(API_PATHS.QUALIFICATIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(form),
    });
  }

  async updateQualification(form: QualificationEditForm): Promise<Qualification> {
    const endpoint = API_PATHS.QUALIFICATIONS.UPDATE(form.qualificationId);
    logger.debug('Updating qualification via API', { qualificationId: form.qualificationId, endpoint });
    return await this.fetchApi<Qualification>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        qualificationName: form.qualificationName,
        acquiredDate: form.acquiredDate,
        qualificationMasterId: form.qualificationMasterId,
      }),
    });
  }

  async deleteQualification(qualificationId: string): Promise<void> {
    const endpoint = API_PATHS.QUALIFICATIONS.DELETE(qualificationId);
    logger.debug('Deleting qualification via API', { qualificationId, endpoint });
    await this.fetchApi<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // スライス3: 個人資格参照 API統合
  async getQualificationsByEmployee(employeeId: string): Promise<Qualification[]> {
    const endpoint = API_PATHS.QUALIFICATIONS.BY_EMPLOYEE(employeeId);
    logger.debug('Fetching qualifications by employee from API', { employeeId, endpoint });
    return await this.fetchApi<Qualification[]>(endpoint);
  }

  // スライス4-A: 全社員資格一覧 API統合
  async getAllEmployeeQualifications(filter?: AllEmployeeQualificationFilter): Promise<AllEmployeeQualificationTableRow[]> {
    const endpoint = API_PATHS.QUALIFICATIONS.ALL_EMPLOYEES_LIST;
    logger.debug('Fetching all employee qualifications from API', { filter, endpoint });

    const params = new URLSearchParams();
    if (filter) {
      if (filter.companyId) params.append('companyId', filter.companyId);
      if (filter.departmentId) params.append('departmentId', filter.departmentId);
      if (filter.expirationStatus) params.append('expirationStatus', filter.expirationStatus);
      if (filter.searchKeyword) params.append('searchKeyword', filter.searchKeyword);
    }

    const fullEndpoint = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
    return await this.fetchApi<AllEmployeeQualificationTableRow[]>(fullEndpoint);
  }

  // スライス5: データエクスポート API統合
  async exportQualificationsToCSV(filter?: AllEmployeeQualificationFilter): Promise<{ url: string; filename: string }> {
    const endpoint = API_PATHS.QUALIFICATIONS.EXPORT;
    logger.debug('Exporting qualifications to CSV via API', { filter, endpoint });

    const params = new URLSearchParams();
    if (filter) {
      if (filter.companyId) params.append('companyId', filter.companyId);
      if (filter.departmentId) params.append('departmentId', filter.departmentId);
      if (filter.expirationStatus) params.append('expirationStatus', filter.expirationStatus);
      if (filter.searchKeyword) params.append('searchKeyword', filter.searchKeyword);
    }

    const fullEndpoint = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

    try {
      const response = await fetch(`${BASE_URL}${fullEndpoint}`);

      if (!response.ok) {
        throw new Error(`CSV export failed: ${response.status} ${response.statusText}`);
      }

      // CSVデータをBlobとして取得
      const blob = await response.blob();

      // ファイル名をレスポンスヘッダーから取得、または生成
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'qualifications_export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        // デフォルトのファイル名生成
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
        filename = `qualifications_export_${dateStr}_${timeStr}.csv`;
      }

      // Blob URLを作成
      const url = URL.createObjectURL(blob);

      logger.info('CSV export completed successfully', { filename, size: blob.size });
      return { url, filename };
    } catch (error) {
      logger.error('Failed to export CSV', { error, endpoint: fullEndpoint });
      throw error;
    }
  }

  // ユーティリティメソッド（フロントエンド専用）
  async getEmployeeOptions(): Promise<EmployeeSelectOption[]> {
    logger.debug('Building employee options from API data');

    try {
      const [employees, companies, departments] = await Promise.all([
        this.getEmployees(),
        this.getCompanies(),
        this.getDepartments(),
      ]);

      // デバッグ: 取得したデータの型と値を詳細にログ出力
      console.log('[Employee Options] API data received:', {
        employees: { type: typeof employees, isArray: Array.isArray(employees), length: employees?.length, value: employees },
        companies: { type: typeof companies, isArray: Array.isArray(companies), length: companies?.length, value: companies },
        departments: { type: typeof departments, isArray: Array.isArray(departments), length: departments?.length, value: departments }
      });

      // 強制的にエラーログでも出力
      console.error('[Employee Options DEBUG] API data check:', {
        employees: { type: typeof employees, isArray: Array.isArray(employees) },
        companies: { type: typeof companies, isArray: Array.isArray(companies) },
        departments: { type: typeof departments, isArray: Array.isArray(departments) }
      });
      logger.debug('API data received', {
        employees: { type: typeof employees, isArray: Array.isArray(employees), value: employees },
        companies: { type: typeof companies, isArray: Array.isArray(companies), value: companies },
        departments: { type: typeof departments, isArray: Array.isArray(departments), value: departments }
      });

      // 防御的プログラミング: データが配列でない場合の修正
      const safeEmployees = Array.isArray(employees) ? employees : [];
      const safeCompanies = Array.isArray(companies) ? companies : [];
      const safeDepartments = Array.isArray(departments) ? departments : [];

      // デバッグ情報をログ出力
      if (!Array.isArray(employees)) {
        logger.error(`employees is not an array. Type: ${typeof employees}, converted to empty array`);
        console.error('[Employee Options] employees is not an array:', { type: typeof employees, value: employees });
      }
      if (!Array.isArray(companies)) {
        logger.error(`companies is not an array. Type: ${typeof companies}, converted to empty array`);
        console.error('[Employee Options] companies is not an array:', { type: typeof companies, value: companies });
      }
      if (!Array.isArray(departments)) {
        logger.error(`departments is not an array. Type: ${typeof departments}, converted to empty array`);
        console.error('[Employee Options] departments is not an array:', { type: typeof departments, value: departments });
      }

      const options: EmployeeSelectOption[] = safeEmployees.map(employee => {
        const company = safeCompanies.find(c => c.companyId === employee.companyId);
        const department = employee.departmentId
          ? safeDepartments.find(d => d.departmentId === employee.departmentId)
          : undefined;

        return {
          employeeId: employee.employeeId,
          name: employee.name,
          companyName: company?.companyName || '不明',
          departmentName: department?.departmentName,
          displayName: `${employee.name}（${company?.companyName || '不明'}・${department?.departmentName || '不明'}）`
        };
      });

      logger.info('Employee options built successfully', { count: options.length });
      return options;
    } catch (error) {
      logger.error('Failed to build employee options', { error });
      throw error;
    }
  }

  async getQualificationSuggestions(): Promise<QualificationSuggestion[]> {
    logger.debug('Building qualification suggestions from API data');

    try {
      const masters = await this.getQualificationMasters();

      // 防御的プログラミング: mastersが配列でない場合の修正
      const safeMasters = Array.isArray(masters) ? masters : [];

      // デバッグ情報をログ出力
      if (!Array.isArray(masters)) {
        logger.error(`masters is not an array. Type: ${typeof masters}, converted to empty array`);
        console.error('[Qualification Suggestions] masters is not an array:', { type: typeof masters, value: masters });
      }

      const suggestions: QualificationSuggestion[] = safeMasters
        .filter(master => master.isActive)
        .map(master => ({
          qualificationMasterId: master.qualificationMasterId,
          masterName: master.masterName,
          validityPeriod: master.validityPeriod
        }));

      logger.info('Qualification suggestions built successfully', { count: suggestions.length });
      return suggestions;
    } catch (error) {
      logger.error('Failed to build qualification suggestions', { error });
      throw error;
    }
  }

  async getQualificationsByEmployeeForTable(employeeId: string): Promise<QualificationTableRow[]> {
    logger.debug('Building qualification table rows from API data', { employeeId });

    try {
      const qualifications = await this.getQualificationsByEmployee(employeeId);

      // 防御的プログラミング: qualificationsが配列でない場合の修正
      const safeQualifications = Array.isArray(qualifications) ? qualifications : [];

      // デバッグ情報をログ出力
      if (!Array.isArray(qualifications)) {
        logger.error(`qualifications is not an array. Type: ${typeof qualifications}, converted to empty array`);
        console.error('[Qualification Table] qualifications is not an array:', { type: typeof qualifications, value: qualifications });
      }

      const tableRows: QualificationTableRow[] = safeQualifications.map(qual => {
        const status = this.calculateQualificationStatus(qual.expirationDate);
        return {
          qualificationId: qual.qualificationId,
          qualificationName: qual.qualificationName,
          acquiredDate: this.formatDateForDisplay(qual.acquiredDate),
          expirationDate: qual.expirationDate === 'permanent'
            ? '永続'
            : this.formatDateForDisplay(qual.expirationDate),
          status,
          statusText: QUALIFICATION_STATUS_TEXT[status]
        };
      });

      logger.info('Qualification table rows built successfully', { employeeId, count: tableRows.length });
      return tableRows;
    } catch (error) {
      logger.error('Failed to build qualification table rows', { error, employeeId });
      throw error;
    }
  }

  calculateExpiration(qualificationName: string, acquiredDate: string): ExpirationCalculation {
    logger.debug('Calculating expiration (client-side)', { qualificationName, acquiredDate });

    try {
      // CLAUDE.mdの資格マスターデータに基づく期限計算
      const qualificationPeriods: Record<string, string | number> = {
        // 永続資格
        '基本情報技術者試験': 'permanent',
        '応用情報技術者試験': 'permanent',
        '日商簿記検定2級': 'permanent',
        'ファイナンシャル・プランニング技能士2級': 'permanent',

        // 期限付き資格
        '普通自動車第一種運転免許': 3,

        // その他の期限付き資格（将来追加予定）
        '第二種運転免許': 3,
        '大型自動車第一種運転免許': 3,
        '建設機械運転技能講習': 5,
        '危険物取扱者乙種': 5,
        'フォークリフト運転技能講習': 'permanent'
      };

      const period = qualificationPeriods[qualificationName];

      if (!period) {
        // 未知の資格の場合は永続扱い
        logger.error('Unknown qualification, defaulting to permanent', { qualificationName });
        return {
          expirationDate: 'permanent',
          displayText: '永続'
        };
      }

      if (period === 'permanent') {
        return {
          expirationDate: 'permanent',
          displayText: '永続'
        };
      }

      // 期限付き資格の場合の計算
      const acquired = new Date(acquiredDate);
      const expiration = new Date(acquired);
      expiration.setFullYear(acquired.getFullYear() + Number(period));

      const expirationDateString = expiration.toISOString().split('T')[0];
      const displayText = expiration.toLocaleDateString('ja-JP');

      logger.debug('Expiration calculated successfully', {
        qualificationName,
        acquiredDate,
        period: `${period}年`,
        expirationDate: expirationDateString,
        displayText
      });

      return {
        expirationDate: expirationDateString,
        displayText: displayText
      };
    } catch (error) {
      logger.error('Failed to calculate expiration', { error, qualificationName, acquiredDate });

      // エラー時は計算エラーを返す
      return {
        expirationDate: 'error',
        displayText: '計算エラー'
      };
    }
  }

  // プライベートユーティリティメソッド
  private calculateQualificationStatus(expirationDate: string | 'permanent'): QualificationStatus {
    if (expirationDate === 'permanent') {
      return 'valid';
    }

    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'expired';
    } else if (diffDays <= 90) {
      return 'expiring';
    } else {
      return 'valid';
    }
  }

  private formatDateForDisplay(dateString: string): string {
    if (!dateString || dateString === 'permanent') {
      return dateString;
    }

    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  }
}

// シングルトンインスタンス
export const apiService = new ApiService();