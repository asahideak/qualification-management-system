import { Company } from '../types';
import { CompanyRepository, PrismaCompanyRepository } from '../repositories/company.repository';
import logger, { PerformanceTracker } from '../lib/logger';

export interface CompanyService {
  getAllCompanies(): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company>;
}

export class DefaultCompanyService implements CompanyService {
  constructor(private companyRepository: CompanyRepository = new PrismaCompanyRepository()) {}

  async getAllCompanies(): Promise<Company[]> {
    const tracker = new PerformanceTracker('CompanyService.getAllCompanies');
    try {
      logger.info('会社一覧取得サービス開始');

      const companies = await this.companyRepository.findAll();

      logger.info('会社一覧取得サービス成功', {
        count: companies.length,
      });

      tracker.end({ count: companies.length });
      return companies;
    } catch (error) {
      logger.error('会社一覧取得サービスエラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    const tracker = new PerformanceTracker('CompanyService.getCompanyById');
    try {
      logger.info('会社詳細取得サービス開始', { companyId: id });

      if (!id) {
        throw new Error('会社IDが指定されていません');
      }

      const company = await this.companyRepository.findById(id);
      if (!company) {
        throw new Error('指定された会社が見つかりません');
      }

      logger.info('会社詳細取得サービス成功', { companyId: id });

      tracker.end({ found: true });
      return company;
    } catch (error) {
      logger.error('会社詳細取得サービスエラー', {
        companyId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }
}