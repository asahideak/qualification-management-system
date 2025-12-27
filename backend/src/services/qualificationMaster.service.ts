import { QualificationMaster } from '../types';
import { QualificationMasterRepository, PrismaQualificationMasterRepository } from '../repositories/qualificationMaster.repository';
import logger, { PerformanceTracker } from '../lib/logger';

export interface QualificationMasterService {
  getAllQualificationMasters(): Promise<QualificationMaster[]>;
  getQualificationMasterById(id: string): Promise<QualificationMaster>;
  getQualificationMastersByCategory(category: string): Promise<QualificationMaster[]>;
}

export class DefaultQualificationMasterService implements QualificationMasterService {
  constructor(
    private qualificationMasterRepository: QualificationMasterRepository = new PrismaQualificationMasterRepository()
  ) {}

  async getAllQualificationMasters(): Promise<QualificationMaster[]> {
    const tracker = new PerformanceTracker('QualificationMasterService.getAllQualificationMasters');
    try {
      logger.info('資格マスター一覧取得サービス開始');

      const qualificationMasters = await this.qualificationMasterRepository.findAll();

      logger.info('資格マスター一覧取得サービス成功', {
        count: qualificationMasters.length,
      });

      tracker.end({ count: qualificationMasters.length });
      return qualificationMasters;
    } catch (error) {
      logger.error('資格マスター一覧取得サービスエラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getQualificationMasterById(id: string): Promise<QualificationMaster> {
    const tracker = new PerformanceTracker('QualificationMasterService.getQualificationMasterById');
    try {
      logger.info('資格マスター詳細取得サービス開始', { qualificationMasterId: id });

      if (!id) {
        throw new Error('資格マスターIDが指定されていません');
      }

      const qualificationMaster = await this.qualificationMasterRepository.findById(id);
      if (!qualificationMaster) {
        throw new Error('指定された資格マスターが見つかりません');
      }

      logger.info('資格マスター詳細取得サービス成功', { qualificationMasterId: id });

      tracker.end({ found: true });
      return qualificationMaster;
    } catch (error) {
      logger.error('資格マスター詳細取得サービスエラー', {
        qualificationMasterId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getQualificationMastersByCategory(category: string): Promise<QualificationMaster[]> {
    const tracker = new PerformanceTracker('QualificationMasterService.getQualificationMastersByCategory');
    try {
      logger.info('カテゴリ別資格マスター取得サービス開始', { category });

      if (!category) {
        throw new Error('カテゴリが指定されていません');
      }

      const qualificationMasters = await this.qualificationMasterRepository.findByCategory(category);

      logger.info('カテゴリ別資格マスター取得サービス成功', {
        category,
        count: qualificationMasters.length,
      });

      tracker.end({ count: qualificationMasters.length, category });
      return qualificationMasters;
    } catch (error) {
      logger.error('カテゴリ別資格マスター取得サービスエラー', {
        category,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }
}