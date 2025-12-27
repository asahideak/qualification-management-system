import prisma from '../lib/database';
import logger, { PerformanceTracker } from '../lib/logger';
import { Department } from '../types';

export interface DepartmentRepository {
  findAll(): Promise<Department[]>;
  findByCompanyId(companyId: string): Promise<Department[]>;
  findById(id: string): Promise<Department | null>;
}

export class PrismaDepartmentRepository implements DepartmentRepository {
  async findAll(): Promise<Department[]> {
    const tracker = new PerformanceTracker('Department.findAll');
    try {
      logger.debug('部署マスター一覧取得開始');

      const departments = await prisma.departments.findMany({
        where: {
          is_active: true,
        },
        include: {
          companies: true,
        },
        orderBy: [
          { companies: { company_name: 'asc' } },
          { department_name: 'asc' },
        ],
      });

      logger.info('部署マスター一覧取得成功', {
        count: departments.length,
      });

      // Prismaモデルから型定義に変換
      const result: Department[] = departments.map(dept => ({
        departmentId: dept.department_id,
        departmentName: dept.department_name,
        companyId: dept.company_id,
        isActive: dept.is_active,
        createdAt: dept.created_at.toISOString(),
        updatedAt: dept.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length });
      return result;
    } catch (error) {
      logger.error('部署マスター一覧取得エラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('部署一覧の取得に失敗しました');
    }
  }

  async findByCompanyId(companyId: string): Promise<Department[]> {
    const tracker = new PerformanceTracker('Department.findByCompanyId');
    try {
      logger.debug('会社別部署一覧取得開始', { companyId });

      const departments = await prisma.departments.findMany({
        where: {
          company_id: companyId,
          is_active: true,
        },
        orderBy: {
          department_name: 'asc',
        },
      });

      logger.info('会社別部署一覧取得成功', {
        companyId,
        count: departments.length,
      });

      // Prismaモデルから型定義に変換
      const result: Department[] = departments.map(dept => ({
        departmentId: dept.department_id,
        departmentName: dept.department_name,
        companyId: dept.company_id,
        isActive: dept.is_active,
        createdAt: dept.created_at.toISOString(),
        updatedAt: dept.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length, companyId });
      return result;
    } catch (error) {
      logger.error('会社別部署一覧取得エラー', {
        companyId,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('会社別部署一覧の取得に失敗しました');
    }
  }

  async findById(id: string): Promise<Department | null> {
    const tracker = new PerformanceTracker('Department.findById');
    try {
      logger.debug('部署マスター詳細取得開始', { departmentId: id });

      const department = await prisma.departments.findUnique({
        where: {
          department_id: id,
          is_active: true,
        },
      });

      if (!department) {
        logger.warn('部署マスターが見つかりません', { departmentId: id });
        tracker.end({ found: false });
        return null;
      }

      logger.info('部署マスター詳細取得成功', { departmentId: id });

      const result: Department = {
        departmentId: department.department_id,
        departmentName: department.department_name,
        companyId: department.company_id,
        isActive: department.is_active,
        createdAt: department.created_at.toISOString(),
        updatedAt: department.updated_at.toISOString(),
      };

      tracker.end({ found: true });
      return result;
    } catch (error) {
      logger.error('部署マスター詳細取得エラー', {
        departmentId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('部署詳細の取得に失敗しました');
    }
  }
}