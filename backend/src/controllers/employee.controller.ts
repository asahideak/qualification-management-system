import { Request, Response } from 'express';
import { EmployeeService, DefaultEmployeeService } from '../services/employee.service';
import logger from '../lib/logger';
import { ApiResponse, Employee } from '../types';

export interface EmployeeController {
  getAllEmployees(req: Request, res: Response): Promise<void>;
  getEmployeeById(req: Request, res: Response): Promise<void>;
  getEmployeesByCompanyId(req: Request, res: Response): Promise<void>;
}

export class DefaultEmployeeController implements EmployeeController {
  constructor(private employeeService: EmployeeService = new DefaultEmployeeService()) {}

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      logger.info('GET /api/employees - 社員一覧取得開始', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const employees = await this.employeeService.getAllEmployees();

      const response: ApiResponse<Employee[]> = {
        success: true,
        data: employees,
        message: '社員一覧を取得しました',
      };

      logger.info('GET /api/employees - 社員一覧取得成功', {
        count: employees.length,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/employees - 社員一覧取得エラー', {
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

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      logger.info('GET /api/employees/:id - 社員詳細取得開始', {
        employeeId: id,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const employee = await this.employeeService.getEmployeeById(id);

      const response: ApiResponse<Employee> = {
        success: true,
        data: employee,
        message: '社員詳細を取得しました',
      };

      logger.info('GET /api/employees/:id - 社員詳細取得成功', {
        employeeId: id,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/employees/:id - 社員詳細取得エラー', {
        employeeId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const statusCode = error instanceof Error && error.message.includes('見つかりません') ? 404 : 500;
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : String(error)
          : statusCode === 404 ? '社員が見つかりません' : 'サーバーエラーが発生しました',
      };

      res.status(statusCode).json(response);
    }
  }

  async getEmployeesByCompanyId(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      logger.info('GET /api/employees/company/:companyId - 会社別社員一覧取得開始', {
        companyId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      const employees = await this.employeeService.getEmployeesByCompanyId(companyId);

      const response: ApiResponse<Employee[]> = {
        success: true,
        data: employees,
        message: '会社別社員一覧を取得しました',
      };

      logger.info('GET /api/employees/company/:companyId - 会社別社員一覧取得成功', {
        companyId,
        count: employees.length,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('GET /api/employees/company/:companyId - 会社別社員一覧取得エラー', {
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
}