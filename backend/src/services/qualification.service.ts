import {
  Qualification,
  QualificationRegistrationForm,
  QualificationEditForm,
  AllEmployeeQualificationTableRow,
  AllEmployeeQualificationFilter,
} from '../types';
import { QualificationRepository, PrismaQualificationRepository } from '../repositories/qualification.repository';
import { EmployeeRepository, PrismaEmployeeRepository } from '../repositories/employee.repository';
import { QualificationMasterRepository, PrismaQualificationMasterRepository } from '../repositories/qualificationMaster.repository';
import logger, { PerformanceTracker } from '../lib/logger';
import {
  validateQualificationRegistrationForm,
  validateQualificationEditForm,
  validateQualificationId,
} from '../validators/qualification.validator';
import { isValidAllEmployeeQualificationFilter } from '../types';

export interface QualificationService {
  createQualification(data: unknown): Promise<Qualification>;
  updateQualification(id: string, data: unknown): Promise<Qualification>;
  deleteQualification(id: string): Promise<void>;
  getQualificationById(id: string): Promise<Qualification>;
  getQualificationsByEmployeeId(employeeId: string): Promise<Qualification[]>;
  getAllEmployeeQualifications(filter?: unknown): Promise<AllEmployeeQualificationTableRow[]>;
  exportQualificationsCsv(filter?: unknown): Promise<string>;
}

export class DefaultQualificationService implements QualificationService {
  constructor(
    private qualificationRepository: QualificationRepository = new PrismaQualificationRepository(),
    private employeeRepository: EmployeeRepository = new PrismaEmployeeRepository(),
    private qualificationMasterRepository: QualificationMasterRepository = new PrismaQualificationMasterRepository()
  ) {}

  async createQualification(data: unknown): Promise<Qualification> {
    const tracker = new PerformanceTracker('QualificationService.createQualification');
    try {
      logger.info('資格登録サービス開始');

      // バリデーション
      if (!validateQualificationRegistrationForm(data)) {
        throw new Error('入力データが無効です');
      }

      const formData = data as QualificationRegistrationForm;

      // 社員存在チェック
      const employee = await this.employeeRepository.findById(formData.employeeId);
      if (!employee) {
        logger.warn('指定された社員が見つかりません', { employeeId: formData.employeeId });
        throw new Error('指定された社員が見つかりません');
      }

      // 資格マスター存在チェック（指定されている場合）
      if (formData.qualificationMasterId) {
        const master = await this.qualificationMasterRepository.findById(formData.qualificationMasterId);
        if (!master) {
          logger.warn('指定された資格マスターが見つかりません', {
            qualificationMasterId: formData.qualificationMasterId,
          });
          throw new Error('指定された資格マスターが見つかりません');
        }

        if (!master.isActive) {
          logger.warn('指定された資格マスターは無効です', {
            qualificationMasterId: formData.qualificationMasterId,
          });
          throw new Error('指定された資格マスターは無効です');
        }
      }

      // 重複チェック
      const isDuplicate = await this.qualificationRepository.checkDuplicateQualification(
        formData.employeeId,
        formData.qualificationName
      );
      if (isDuplicate) {
        logger.warn('同じ社員に同じ名前の資格が既に登録されています', {
          employeeId: formData.employeeId,
          qualificationName: formData.qualificationName,
        });
        throw new Error('同じ社員に同じ名前の資格が既に登録されています');
      }

      // 資格登録実行
      const qualification = await this.qualificationRepository.create(formData);

      logger.info('資格登録サービス成功', {
        qualificationId: qualification.qualificationId,
        employeeId: qualification.employeeId,
        qualificationName: qualification.qualificationName,
      });

      tracker.end({
        qualificationId: qualification.qualificationId,
        employeeId: qualification.employeeId,
      });
      return qualification;
    } catch (error) {
      logger.error('資格登録サービスエラー', {
        error: error instanceof Error ? error.message : String(error),
        inputData: data,
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async updateQualification(id: string, data: unknown): Promise<Qualification> {
    const tracker = new PerformanceTracker('QualificationService.updateQualification');
    try {
      logger.info('資格更新サービス開始', { qualificationId: id });

      // ID検証
      if (!validateQualificationId(id)) {
        throw new Error('無効な資格IDです');
      }

      // 入力データ検証
      if (!validateQualificationEditForm(data)) {
        throw new Error('入力データが無効です');
      }

      const editData = data as QualificationEditForm;

      // 既存資格の存在確認
      const existingQualification = await this.qualificationRepository.findById(id);
      if (!existingQualification) {
        logger.warn('更新対象の資格が見つかりません', { qualificationId: id });
        throw new Error('更新対象の資格が見つかりません');
      }

      // 資格マスター存在チェック（指定されている場合）
      if (editData.qualificationMasterId) {
        const master = await this.qualificationMasterRepository.findById(editData.qualificationMasterId);
        if (!master) {
          logger.warn('指定された資格マスターが見つかりません', {
            qualificationMasterId: editData.qualificationMasterId,
          });
          throw new Error('指定された資格マスターが見つかりません');
        }

        if (!master.isActive) {
          logger.warn('指定された資格マスターは無効です', {
            qualificationMasterId: editData.qualificationMasterId,
          });
          throw new Error('指定された資格マスターは無効です');
        }
      }

      // 重複チェック（資格名が変更される場合）
      if (editData.qualificationName && editData.qualificationName !== existingQualification.qualificationName) {
        const isDuplicate = await this.qualificationRepository.checkDuplicateQualification(
          existingQualification.employeeId,
          editData.qualificationName,
          id
        );
        if (isDuplicate) {
          logger.warn('同じ社員に同じ名前の資格が既に登録されています', {
            employeeId: existingQualification.employeeId,
            qualificationName: editData.qualificationName,
          });
          throw new Error('同じ社員に同じ名前の資格が既に登録されています');
        }
      }

      // 更新実行
      const updatedQualification = await this.qualificationRepository.update(id, editData);

      logger.info('資格更新サービス成功', {
        qualificationId: id,
        updatedFields: Object.keys(editData),
      });

      tracker.end({
        qualificationId: id,
        updatedFields: Object.keys(editData),
      });
      return updatedQualification;
    } catch (error) {
      logger.error('資格更新サービスエラー', {
        qualificationId: id,
        error: error instanceof Error ? error.message : String(error),
        inputData: data,
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async deleteQualification(id: string): Promise<void> {
    const tracker = new PerformanceTracker('QualificationService.deleteQualification');
    try {
      logger.info('資格削除サービス開始', { qualificationId: id });

      // ID検証
      if (!validateQualificationId(id)) {
        throw new Error('無効な資格IDです');
      }

      // 既存資格の存在確認
      const existingQualification = await this.qualificationRepository.findById(id);
      if (!existingQualification) {
        logger.warn('削除対象の資格が見つかりません', { qualificationId: id });
        throw new Error('削除対象の資格が見つかりません');
      }

      // 削除実行
      await this.qualificationRepository.delete(id);

      logger.info('資格削除サービス成功', {
        qualificationId: id,
        employeeId: existingQualification.employeeId,
        qualificationName: existingQualification.qualificationName,
      });

      tracker.end({ qualificationId: id });
    } catch (error) {
      logger.error('資格削除サービスエラー', {
        qualificationId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getQualificationById(id: string): Promise<Qualification> {
    const tracker = new PerformanceTracker('QualificationService.getQualificationById');
    try {
      logger.info('資格詳細取得サービス開始', { qualificationId: id });

      // ID検証
      if (!validateQualificationId(id)) {
        throw new Error('無効な資格IDです');
      }

      const qualification = await this.qualificationRepository.findById(id);
      if (!qualification) {
        logger.warn('指定された資格が見つかりません', { qualificationId: id });
        throw new Error('指定された資格が見つかりません');
      }

      logger.info('資格詳細取得サービス成功', { qualificationId: id });

      tracker.end({ qualificationId: id, found: true });
      return qualification;
    } catch (error) {
      logger.error('資格詳細取得サービスエラー', {
        qualificationId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getQualificationsByEmployeeId(employeeId: string): Promise<Qualification[]> {
    const tracker = new PerformanceTracker('QualificationService.getQualificationsByEmployeeId');
    try {
      logger.info('社員別資格一覧取得サービス開始', { employeeId });

      if (!employeeId) {
        throw new Error('社員IDが指定されていません');
      }

      // 社員存在チェック
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        logger.warn('指定された社員が見つかりません', { employeeId });
        throw new Error('指定された社員が見つかりません');
      }

      const qualifications = await this.qualificationRepository.findByEmployeeId(employeeId);

      logger.info('社員別資格一覧取得サービス成功', {
        employeeId,
        count: qualifications.length,
      });

      tracker.end({
        employeeId,
        count: qualifications.length,
      });
      return qualifications;
    } catch (error) {
      logger.error('社員別資格一覧取得サービスエラー', {
        employeeId,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getAllEmployeeQualifications(filter?: unknown): Promise<AllEmployeeQualificationTableRow[]> {
    const tracker = new PerformanceTracker('QualificationService.getAllEmployeeQualifications');
    try {
      logger.info('全社員資格一覧取得サービス開始', { filter });

      // フィルター検証
      let validatedFilter: AllEmployeeQualificationFilter | undefined;
      if (filter !== undefined) {
        if (!isValidAllEmployeeQualificationFilter(filter)) {
          throw new Error('フィルター条件が無効です');
        }
        validatedFilter = filter as AllEmployeeQualificationFilter;
      }

      // リポジトリから全社員資格一覧を取得
      const qualifications = await this.qualificationRepository.findAllEmployeeQualifications(validatedFilter);

      logger.info('全社員資格一覧取得サービス成功', {
        filter: validatedFilter,
        count: qualifications.length,
      });

      tracker.end({
        recordCount: qualifications.length,
        hasFilter: !!validatedFilter,
      });
      return qualifications;
    } catch (error) {
      logger.error('全社員資格一覧取得サービスエラー', {
        filter,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async exportQualificationsCsv(filter?: unknown): Promise<string> {
    const tracker = new PerformanceTracker('QualificationService.exportQualificationsCsv');
    try {
      logger.info('資格データCSVエクスポートサービス開始', { filter });

      // フィルター検証
      let validatedFilter: AllEmployeeQualificationFilter | undefined;
      if (filter !== undefined) {
        if (!isValidAllEmployeeQualificationFilter(filter)) {
          throw new Error('フィルター条件が無効です');
        }
        validatedFilter = filter as AllEmployeeQualificationFilter;
      }

      // 全社員資格データを取得（既存のgetAllEmployeeQualificationsメソッドを使用）
      const qualifications = await this.getAllEmployeeQualifications(validatedFilter);

      // CSVヘッダーを定義
      const csvHeaders = [
        '社員ID',
        '社員名',
        '会社名',
        '部署名',
        '資格名',
        '取得日',
        '有効期限',
        '状況'
      ];

      // CSVデータを生成
      let csvContent = csvHeaders.join(',') + '\n';

      for (const row of qualifications) {
        const csvRow = [
          this.escapeCSVField(row.employeeId),
          this.escapeCSVField(row.employeeName),
          this.escapeCSVField(row.companyName),
          this.escapeCSVField(row.departmentName || ''),
          this.escapeCSVField(row.qualificationName),
          this.escapeCSVField(row.acquiredDate),
          this.escapeCSVField(row.expirationDate),
          this.escapeCSVField(row.statusDisplayText)
        ];
        csvContent += csvRow.join(',') + '\n';
      }

      logger.info('資格データCSVエクスポートサービス成功', {
        filter: validatedFilter,
        recordCount: qualifications.length,
        csvSizeBytes: csvContent.length
      });

      tracker.end({
        recordCount: qualifications.length,
        csvSizeBytes: csvContent.length,
        hasFilter: !!validatedFilter
      });

      return csvContent;
    } catch (error) {
      logger.error('資格データCSVエクスポートサービスエラー', {
        filter,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  /**
   * CSVフィールドをエスケープする（カンマ、改行、ダブルクォートを含む値）
   * RFC 4180に準拠したCSVフォーマット
   */
  private escapeCSVField(value: string): string {
    // null、undefined、空文字の場合は空文字を返す
    if (!value) {
      return '';
    }

    const stringValue = String(value);

    // カンマ、改行、ダブルクォートが含まれる場合はダブルクォートで囲む
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r') || stringValue.includes('"')) {
      // ダブルクォートを2つにエスケープしてダブルクォートで囲む
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }

    return stringValue;
  }
}