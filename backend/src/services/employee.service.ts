import { Employee } from '../types';
import { EmployeeRepository, PrismaEmployeeRepository } from '../repositories/employee.repository';
import logger, { PerformanceTracker } from '../lib/logger';

export interface EmployeeService {
  getAllEmployees(): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee>;
  getEmployeesByCompanyId(companyId: string): Promise<Employee[]>;
}

export class DefaultEmployeeService implements EmployeeService {
  constructor(
    private employeeRepository: EmployeeRepository = new PrismaEmployeeRepository()
  ) {}

  async getAllEmployees(): Promise<Employee[]> {
    const tracker = new PerformanceTracker('EmployeeService.getAllEmployees');
    try {
      logger.info('社員一覧取得サービス開始');

      const employees = await this.employeeRepository.findAll();

      logger.info('社員一覧取得サービス成功', {
        count: employees.length,
      });

      tracker.end({ count: employees.length });
      return employees;
    } catch (error) {
      logger.error('社員一覧取得サービスエラー', {
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const tracker = new PerformanceTracker('EmployeeService.getEmployeeById');
    try {
      logger.info('社員詳細取得サービス開始', { employeeId: id });

      if (!id) {
        throw new Error('社員IDが指定されていません');
      }

      const employee = await this.employeeRepository.findById(id);
      if (!employee) {
        throw new Error('指定された社員が見つかりません');
      }

      logger.info('社員詳細取得サービス成功', { employeeId: id });

      tracker.end({ found: true });
      return employee;
    } catch (error) {
      logger.error('社員詳細取得サービスエラー', {
        employeeId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }

  async getEmployeesByCompanyId(companyId: string): Promise<Employee[]> {
    const tracker = new PerformanceTracker('EmployeeService.getEmployeesByCompanyId');
    try {
      logger.info('会社別社員一覧取得サービス開始', { companyId });

      if (!companyId) {
        throw new Error('会社IDが指定されていません');
      }

      const employees = await this.employeeRepository.findByCompanyId(companyId);

      logger.info('会社別社員一覧取得サービス成功', {
        companyId,
        count: employees.length,
      });

      tracker.end({ count: employees.length, companyId });
      return employees;
    } catch (error) {
      logger.error('会社別社員一覧取得サービスエラー', {
        companyId,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw error;
    }
  }
}