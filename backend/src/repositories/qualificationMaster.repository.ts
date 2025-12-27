import prisma from '../lib/database';
import logger, { PerformanceTracker } from '../lib/logger';
import { QualificationMaster } from '../types';

export interface QualificationMasterRepository {
  findAll(): Promise<QualificationMaster[]>;
  findById(id: string): Promise<QualificationMaster | null>;
  findByCategory(category: string): Promise<QualificationMaster[]>;
  findActiveOnly(): Promise<QualificationMaster[]>;
}

export class PrismaQualificationMasterRepository implements QualificationMasterRepository {
  async findAll(): Promise<QualificationMaster[]> {
    const tracker = new PerformanceTracker('QualificationMaster.findAll');
    try {
      logger.debug('資格マスター一覧取得開始');

      const qualificationMasters = await prisma.qualification_masters.findMany({
        orderBy: [
          { category: 'asc' },
          { master_name: 'asc' },
        ],
      });

      logger.info('資格マスター一覧取得成功', {
        count: qualificationMasters.length,
      });

      // Prismaモデルから型定義に変換
      const result: QualificationMaster[] = qualificationMasters.map(master => ({
        qualificationMasterId: master.qualification_master_id,
        masterName: master.master_name,
        validityPeriod: master.validity_period === 'permanent' ? 'permanent' : parseInt(master.validity_period),
        category: master.category || undefined,
        isActive: master.is_active,
        createdAt: master.created_at.toISOString(),
        updatedAt: master.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length });
      return result;
    } catch (error) {
      logger.error('資格マスター一覧取得エラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('資格マスター一覧の取得に失敗しました');
    }
  }

  async findById(id: string): Promise<QualificationMaster | null> {
    const tracker = new PerformanceTracker('QualificationMaster.findById');
    try {
      logger.debug('資格マスター詳細取得開始', { qualificationMasterId: id });

      const qualificationMaster = await prisma.qualification_masters.findUnique({
        where: {
          qualification_master_id: id,
        },
      });

      if (!qualificationMaster) {
        logger.warn('資格マスターが見つかりません', { qualificationMasterId: id });
        tracker.end({ found: false });
        return null;
      }

      logger.info('資格マスター詳細取得成功', { qualificationMasterId: id });

      const result: QualificationMaster = {
        qualificationMasterId: qualificationMaster.qualification_master_id,
        masterName: qualificationMaster.master_name,
        validityPeriod: qualificationMaster.validity_period === 'permanent' ? 'permanent' : parseInt(qualificationMaster.validity_period),
        category: qualificationMaster.category || undefined,
        isActive: qualificationMaster.is_active,
        createdAt: qualificationMaster.created_at.toISOString(),
        updatedAt: qualificationMaster.updated_at.toISOString(),
      };

      tracker.end({ found: true });
      return result;
    } catch (error) {
      logger.error('資格マスター詳細取得エラー', {
        qualificationMasterId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('資格マスター詳細の取得に失敗しました');
    }
  }

  async findByCategory(category: string): Promise<QualificationMaster[]> {
    const tracker = new PerformanceTracker('QualificationMaster.findByCategory');
    try {
      logger.debug('カテゴリ別資格マスター取得開始', { category });

      const qualificationMasters = await prisma.qualification_masters.findMany({
        where: {
          category: category,
          is_active: true, // アクティブなものだけ取得
        },
        orderBy: {
          master_name: 'asc',
        },
      });

      logger.info('カテゴリ別資格マスター取得成功', {
        category,
        count: qualificationMasters.length,
      });

      // Prismaモデルから型定義に変換
      const result: QualificationMaster[] = qualificationMasters.map(master => ({
        qualificationMasterId: master.qualification_master_id,
        masterName: master.master_name,
        validityPeriod: master.validity_period === 'permanent' ? 'permanent' : parseInt(master.validity_period),
        category: master.category || undefined,
        isActive: master.is_active,
        createdAt: master.created_at.toISOString(),
        updatedAt: master.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length, category });
      return result;
    } catch (error) {
      logger.error('カテゴリ別資格マスター取得エラー', {
        category,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('カテゴリ別資格マスター一覧の取得に失敗しました');
    }
  }

  async findActiveOnly(): Promise<QualificationMaster[]> {
    const tracker = new PerformanceTracker('QualificationMaster.findActiveOnly');
    try {
      logger.debug('有効な資格マスター一覧取得開始');

      const qualificationMasters = await prisma.qualification_masters.findMany({
        where: {
          is_active: true,
        },
        orderBy: [
          { category: 'asc' },
          { master_name: 'asc' },
        ],
      });

      logger.info('有効な資格マスター一覧取得成功', {
        count: qualificationMasters.length,
      });

      // Prismaモデルから型定義に変換
      const result: QualificationMaster[] = qualificationMasters.map(master => ({
        qualificationMasterId: master.qualification_master_id,
        masterName: master.master_name,
        validityPeriod: master.validity_period === 'permanent' ? 'permanent' : parseInt(master.validity_period),
        category: master.category || undefined,
        isActive: master.is_active,
        createdAt: master.created_at.toISOString(),
        updatedAt: master.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length });
      return result;
    } catch (error) {
      logger.error('有効な資格マスター一覧取得エラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('有効な資格マスター一覧の取得に失敗しました');
    }
  }
}