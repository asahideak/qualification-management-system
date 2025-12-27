import { Request, Response } from 'express';
import { CompanyService, DefaultCompanyService } from '../services/company.service';
import logger from '../lib/logger';
import { ApiResponse, Company } from '../types';

export interface CompanyController {
  getAllCompanies(req: Request, res: Response): Promise<void>;
  getCompanyById(req: Request, res: Response): Promise<void>;
}

export class DefaultCompanyController implements CompanyController {
  constructor(private companyService: CompanyService = new DefaultCompanyService()) {}

  async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      logger.info('GET /api/companies - 会社一覧取得開始', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const companies = await this.companyService.getAllCompanies();

      const response: ApiResponse<Company[]> = {
        success: true,
        data: companies,
        message: '会社一覧を取得しました',
      };

      logger.info('GET /api/companies - 会社一覧取得成功', {
        count: companies.length,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/companies - 会社一覧取得エラー', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : String(error)
          : 'サーバーエラーが発生しました',
      };

      res.status(500).json(response);
    }
  }

  async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      logger.info('GET /api/companies/:id - 会社詳細取得開始', {
        companyId: id,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const company = await this.companyService.getCompanyById(id);

      const response: ApiResponse<Company> = {
        success: true,
        data: company,
        message: '会社詳細を取得しました',
      };

      logger.info('GET /api/companies/:id - 会社詳細取得成功', {
        companyId: id,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/companies/:id - 会社詳細取得エラー', {
        companyId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const statusCode = error instanceof Error && error.message.includes('見つかりません') ? 404 : 500;
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : String(error)
          : statusCode === 404 ? '会社が見つかりません' : 'サーバーエラーが発生しました',
      };

      res.status(statusCode).json(response);
    }
  }
}