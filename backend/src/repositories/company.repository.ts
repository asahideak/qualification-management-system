import prisma from '../lib/database';
import logger, { PerformanceTracker } from '../lib/logger';
import { Company } from '../types';

export interface CompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
}

export class PrismaCompanyRepository implements CompanyRepository {
  async findAll(): Promise<Company[]> {
    const tracker = new PerformanceTracker('Company.findAll');
    try {
      logger.debug('会社マスター一覧取得開始');

      const companies = await prisma.companies.findMany({
        where: {
          is_active: true,
        },
        orderBy: {
          company_name: 'asc',
        },
      });

      logger.info('会社マスター一覧取得成功', {
        count: companies.length,
      });

      // Prismaモデルから型定義に変換
      const result: Company[] = companies.map((company) => ({
        companyId: company.company_id,
        companyName: company.company_name,
        isActive: company.is_active,
        createdAt: company.created_at.toISOString(),
        updatedAt: company.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length });
      return result;
    } catch (error) {
      logger.error('会社マスター一覧取得エラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('会社一覧の取得に失敗しました');
    }
  }

  async findById(id: string): Promise<Company | null> {
    const tracker = new PerformanceTracker('Company.findById');
    try {
      logger.debug('会社マスター詳細取得開始', { companyId: id });

      const company = await prisma.companies.findUnique({
        where: {
          company_id: id,
          is_active: true,
        },
      });

      if (!company) {
        logger.warn('会社マスターが見つかりません', { companyId: id });
        tracker.end({ found: false });
        return null;
      }

      logger.info('会社マスター詳細取得成功', { companyId: id });

      const result: Company = {
        companyId: company.company_id,
        companyName: company.company_name,
        isActive: company.is_active,
        createdAt: company.created_at.toISOString(),
        updatedAt: company.updated_at.toISOString(),
      };

      tracker.end({ found: true });
      return result;
    } catch (error) {
      logger.error('会社マスター詳細取得エラー', {
        companyId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('会社詳細の取得に失敗しました');
    }
  }
}