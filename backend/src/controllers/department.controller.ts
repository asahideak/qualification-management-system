import { Request, Response } from 'express';
import { DepartmentService, DefaultDepartmentService } from '../services/department.service';
import logger from '../lib/logger';
import { ApiResponse, Department } from '../types';

export interface DepartmentController {
  getAllDepartments(req: Request, res: Response): Promise<void>;
  getDepartmentsByCompanyId(req: Request, res: Response): Promise<void>;
  getDepartmentById(req: Request, res: Response): Promise<void>;
}

export class DefaultDepartmentController implements DepartmentController {
  constructor(private departmentService: DepartmentService = new DefaultDepartmentService()) {}

  async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      logger.info('GET /api/departments - 部署一覧取得開始', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const departments = await this.departmentService.getAllDepartments();

      const response: ApiResponse<Department[]> = {
        success: true,
        data: departments,
        message: '部署一覧を取得しました',
      };

      logger.info('GET /api/departments - 部署一覧取得成功', {
        count: departments.length,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/departments - 部署一覧取得エラー', {
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

  async getDepartmentsByCompanyId(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      logger.info('GET /api/departments/company/:companyId - 会社別部署一覧取得開始', {
        companyId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const departments = await this.departmentService.getDepartmentsByCompanyId(companyId);

      const response: ApiResponse<Department[]> = {
        success: true,
        data: departments,
        message: '会社別部署一覧を取得しました',
      };

      logger.info('GET /api/departments/company/:companyId - 会社別部署一覧取得成功', {
        companyId,
        count: departments.length,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/departments/company/:companyId - 会社別部署一覧取得エラー', {
        companyId: req.params.companyId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const statusCode = error instanceof Error && error.message.includes('指定されていません') ? 400 : 500;
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : String(error)
          : statusCode === 400 ? '無効なリクエストです' : 'サーバーエラーが発生しました',
      };

      res.status(statusCode).json(response);
    }
  }

  async getDepartmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      logger.info('GET /api/departments/:id - 部署詳細取得開始', {
        departmentId: id,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const department = await this.departmentService.getDepartmentById(id);

      const response: ApiResponse<Department> = {
        success: true,
        data: department,
        message: '部署詳細を取得しました',
      };

      logger.info('GET /api/departments/:id - 部署詳細取得成功', {
        departmentId: id,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/departments/:id - 部署詳細取得エラー', {
        departmentId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const statusCode = error instanceof Error && error.message.includes('見つかりません') ? 404 : 500;
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : String(error)
          : statusCode === 404 ? '部署が見つかりません' : 'サーバーエラーが発生しました',
      };

      res.status(statusCode).json(response);
    }
  }
}