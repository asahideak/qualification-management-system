import { Department } from '../types';
import { DepartmentRepository, PrismaDepartmentRepository } from '../repositories/department.repository';
import logger, { PerformanceTracker } from '../lib/logger';

export interface DepartmentService {
  getAllDepartments(): Promise<Department[]>;
  getDepartmentsByCompanyId(companyId: string): Promise<Department[]>;
  getDepartmentById(id: string): Promise<Department>;
}

export class DefaultDepartmentService implements DepartmentService {
  constructor(
    private departmentRepository: DepartmentRepository = new PrismaDepartmentRepository()
  ) {}

  async getAllDepartments(): Promise<Department[]> {
    const tracker = new PerformanceTracker('DepartmentService.getAllDepartments');
    try {
      logger.info('部署一覧取得サービス開始');

      const departments = await this.departmentRepository.findAll();

      logger.info('部署一覧取得サービス成功', {
        count: departments.length,
      });

      tracker.end({ count: departments.length });
      return departments;
    } catch (error) {
      logger.error('部署一覧取得サービスエラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getDepartmentsByCompanyId(companyId: string): Promise<Department[]> {
    const tracker = new PerformanceTracker('DepartmentService.getDepartmentsByCompanyId');
    try {
      logger.info('会社別部署一覧取得サービス開始', { companyId });

      if (!companyId) {
        throw new Error('会社IDが指定されていません');
      }

      const departments = await this.departmentRepository.findByCompanyId(companyId);

      logger.info('会社別部署一覧取得サービス成功', {
        companyId,
        count: departments.length,
      });

      tracker.end({ count: departments.length, companyId });
      return departments;
    } catch (error) {
      logger.error('会社別部署一覧取得サービスエラー', {
        companyId,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getDepartmentById(id: string): Promise<Department> {
    const tracker = new PerformanceTracker('DepartmentService.getDepartmentById');
    try {
      logger.info('部署詳細取得サービス開始', { departmentId: id });

      if (!id) {
        throw new Error('部署IDが指定されていません');
      }

      const department = await this.departmentRepository.findById(id);
      if (!department) {
        throw new Error('指定された部署が見つかりません');
      }

      logger.info('部署詳細取得サービス成功', { departmentId: id });

      tracker.end({ found: true });
      return department;
    } catch (error) {
      logger.error('部署詳細取得サービスエラー', {
        departmentId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }
}