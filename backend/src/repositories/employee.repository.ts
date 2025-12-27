import prisma from '../lib/database';
import logger, { PerformanceTracker } from '../lib/logger';
import { Employee } from '../types';

export interface EmployeeRepository {
  findAll(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  findByCompanyId(companyId: string): Promise<Employee[]>;
}

export class PrismaEmployeeRepository implements EmployeeRepository {
  async findAll(): Promise<Employee[]> {
    const tracker = new PerformanceTracker('Employee.findAll');
    try {
      logger.debug('社員マスター一覧取得開始');

      const employees = await prisma.employees.findMany({
        include: {
          companies: true,
          departments: true,
        },
        orderBy: [
          { companies: { company_name: 'asc' } },
          { departments: { department_name: 'asc' } },
          { name: 'asc' },
        ],
      });

      logger.info('社員マスター一覧取得成功', {
        count: employees.length,
      });

      // Prismaモデルから型定義に変換
      const result: Employee[] = employees.map(emp => ({
        employeeId: emp.employee_id,
        name: emp.name,
        email: emp.email,
        companyId: emp.company_id,
        departmentId: emp.department_id || undefined,
        createdAt: emp.created_at.toISOString(),
        updatedAt: emp.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length });
      return result;
    } catch (error) {
      logger.error('社員マスター一覧取得エラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('社員一覧の取得に失敗しました');
    }
  }

  async findById(id: string): Promise<Employee | null> {
    const tracker = new PerformanceTracker('Employee.findById');
    try {
      logger.debug('社員マスター詳細取得開始', { employeeId: id });

      const employee = await prisma.employees.findUnique({
        where: {
          employee_id: id,
        },
        include: {
          companies: true,
          departments: true,
        },
      });

      if (!employee) {
        logger.warn('社員マスターが見つかりません', { employeeId: id });
        tracker.end({ found: false });
        return null;
      }

      logger.info('社員マスター詳細取得成功', { employeeId: id });

      const result: Employee = {
        employeeId: employee.employee_id,
        name: employee.name,
        email: employee.email,
        companyId: employee.company_id,
        departmentId: employee.department_id || undefined,
        createdAt: employee.created_at.toISOString(),
        updatedAt: employee.updated_at.toISOString(),
      };

      tracker.end({ found: true });
      return result;
    } catch (error) {
      logger.error('社員マスター詳細取得エラー', {
        employeeId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('社員詳細の取得に失敗しました');
    }
  }

  async findByCompanyId(companyId: string): Promise<Employee[]> {
    const tracker = new PerformanceTracker('Employee.findByCompanyId');
    try {
      logger.debug('会社別社員一覧取得開始', { companyId });

      const employees = await prisma.employees.findMany({
        where: {
          company_id: companyId,
        },
        include: {
          departments: true,
        },
        orderBy: [
          { departments: { department_name: 'asc' } },
          { name: 'asc' },
        ],
      });

      logger.info('会社別社員一覧取得成功', {
        companyId,
        count: employees.length,
      });

      const result: Employee[] = employees.map(emp => ({
        employeeId: emp.employee_id,
        name: emp.name,
        email: emp.email,
        companyId: emp.company_id,
        departmentId: emp.department_id || undefined,
        createdAt: emp.created_at.toISOString(),
        updatedAt: emp.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length, companyId });
      return result;
    } catch (error) {
      logger.error('会社別社員一覧取得エラー', {
        companyId,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('会社別社員一覧の取得に失敗しました');
    }
  }
}