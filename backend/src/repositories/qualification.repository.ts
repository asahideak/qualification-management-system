import prisma from '../lib/database';
import logger, { PerformanceTracker } from '../lib/logger';
import {
  Qualification,
  QualificationRegistrationForm,
  QualificationEditForm,
  AllEmployeeQualificationTableRow,
  AllEmployeeQualificationFilter
} from '../types';

export interface QualificationRepository {
  create(data: QualificationRegistrationForm): Promise<Qualification>;
  findById(id: string): Promise<Qualification | null>;
  findByEmployeeId(employeeId: string): Promise<Qualification[]>;
  update(id: string, data: QualificationEditForm): Promise<Qualification>;
  delete(id: string): Promise<void>;
  checkDuplicateQualification(employeeId: string, qualificationName: string, excludeId?: string): Promise<boolean>;
  findAllEmployeeQualifications(filter?: AllEmployeeQualificationFilter): Promise<AllEmployeeQualificationTableRow[]>;
}

export class PrismaQualificationRepository implements QualificationRepository {
  async create(data: QualificationRegistrationForm): Promise<Qualification> {
    const tracker = new PerformanceTracker('Qualification.create');
    try {
      logger.debug('資格登録開始', {
        employeeId: data.employeeId,
        qualificationName: data.qualificationName
      });

      // 資格IDを生成
      const qualificationId = `QUAL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 資格マスターから有効期限を計算（省略した場合は1年とする）
      let expirationDate: string = 'permanent';
      if (data.qualificationMasterId) {
        const master = await prisma.qualification_masters.findUnique({
          where: { qualification_master_id: data.qualificationMasterId },
        });

        if (master && master.validity_period !== 'permanent') {
          const validityYears = parseInt(master.validity_period);
          if (!isNaN(validityYears)) {
            const expDate = new Date(data.acquiredDate);
            expDate.setFullYear(expDate.getFullYear() + validityYears);
            expirationDate = expDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        }
      } else {
        // マスターが指定されていない場合は1年後
        const expDate = new Date(data.acquiredDate);
        expDate.setFullYear(expDate.getFullYear() + 1);
        expirationDate = expDate.toISOString().split('T')[0];
      }

      const qualification = await prisma.qualifications.create({
        data: {
          qualification_id: qualificationId,
          employee_id: data.employeeId,
          qualification_name: data.qualificationName,
          acquired_date: new Date(data.acquiredDate),
          expiration_date: expirationDate,
          qualification_master_id: data.qualificationMasterId || '',
          updated_at: new Date(),
        },
      });

      logger.info('資格登録成功', {
        qualificationId: qualification.qualification_id,
        employeeId: qualification.employee_id,
        qualificationName: qualification.qualification_name,
      });

      const result: Qualification = {
        qualificationId: qualification.qualification_id,
        employeeId: qualification.employee_id,
        qualificationName: qualification.qualification_name,
        acquiredDate: qualification.acquired_date.toISOString().split('T')[0],
        expirationDate: qualification.expiration_date,
        qualificationMasterId: qualification.qualification_master_id,
        createdAt: qualification.created_at.toISOString(),
        updatedAt: qualification.updated_at.toISOString(),
      };

      tracker.end({ qualificationId: qualification.qualification_id });
      return result;
    } catch (error) {
      logger.error('資格登録エラー', {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('資格の登録に失敗しました');
    }
  }

  async findById(id: string): Promise<Qualification | null> {
    const tracker = new PerformanceTracker('Qualification.findById');
    try {
      logger.debug('資格詳細取得開始', { qualificationId: id });

      const qualification = await prisma.qualifications.findUnique({
        where: {
          qualification_id: id,
        },
      });

      if (!qualification) {
        logger.warn('資格が見つかりません', { qualificationId: id });
        tracker.end({ found: false });
        return null;
      }

      logger.info('資格詳細取得成功', { qualificationId: id });

      const result: Qualification = {
        qualificationId: qualification.qualification_id,
        employeeId: qualification.employee_id,
        qualificationName: qualification.qualification_name,
        acquiredDate: qualification.acquired_date.toISOString().split('T')[0],
        expirationDate: qualification.expiration_date,
        qualificationMasterId: qualification.qualification_master_id,
        createdAt: qualification.created_at.toISOString(),
        updatedAt: qualification.updated_at.toISOString(),
      };

      tracker.end({ found: true });
      return result;
    } catch (error) {
      logger.error('資格詳細取得エラー', {
        qualificationId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('資格詳細の取得に失敗しました');
    }
  }

  async findByEmployeeId(employeeId: string): Promise<Qualification[]> {
    const tracker = new PerformanceTracker('Qualification.findByEmployeeId');
    try {
      logger.debug('社員別資格一覧取得開始', { employeeId });

      const qualifications = await prisma.qualifications.findMany({
        where: {
          employee_id: employeeId,
        },
        orderBy: [
          { acquired_date: 'desc' },
          { qualification_name: 'asc' },
        ],
      });

      logger.info('社員別資格一覧取得成功', {
        employeeId,
        count: qualifications.length,
      });

      const result: Qualification[] = qualifications.map(qual => ({
        qualificationId: qual.qualification_id,
        employeeId: qual.employee_id,
        qualificationName: qual.qualification_name,
        acquiredDate: qual.acquired_date.toISOString().split('T')[0],
        expirationDate: qual.expiration_date,
        qualificationMasterId: qual.qualification_master_id,
        createdAt: qual.created_at.toISOString(),
        updatedAt: qual.updated_at.toISOString(),
      }));

      tracker.end({ recordCount: result.length, employeeId });
      return result;
    } catch (error) {
      logger.error('社員別資格一覧取得エラー', {
        employeeId,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('社員別資格一覧の取得に失敗しました');
    }
  }

  async update(id: string, data: QualificationEditForm): Promise<Qualification> {
    const tracker = new PerformanceTracker('Qualification.update');
    try {
      logger.debug('資格更新開始', { qualificationId: id, data });

      // 有効期限の再計算（資格マスターIDが変更された場合）
      let expirationDate: string | undefined;
      if (data.qualificationMasterId) {
        const master = await prisma.qualification_masters.findUnique({
          where: { qualification_master_id: data.qualificationMasterId },
        });

        if (master && master.validity_period !== 'permanent') {
          const validityYears = parseInt(master.validity_period);
          if (!isNaN(validityYears)) {
            const expDate = new Date(data.acquiredDate);
            expDate.setFullYear(expDate.getFullYear() + validityYears);
            expirationDate = expDate.toISOString().split('T')[0];
          }
        } else if (master && master.validity_period === 'permanent') {
          expirationDate = 'permanent';
        }
      }

      const qualification = await prisma.qualifications.update({
        where: {
          qualification_id: id,
        },
        data: {
          qualification_name: data.qualificationName,
          acquired_date: new Date(data.acquiredDate),
          expiration_date: expirationDate,
          qualification_master_id: data.qualificationMasterId,
          updated_at: new Date(),
        },
      });

      logger.info('資格更新成功', {
        qualificationId: qualification.qualification_id,
        updatedFields: Object.keys(data),
      });

      const result: Qualification = {
        qualificationId: qualification.qualification_id,
        employeeId: qualification.employee_id,
        qualificationName: qualification.qualification_name,
        acquiredDate: qualification.acquired_date.toISOString().split('T')[0],
        expirationDate: qualification.expiration_date,
        qualificationMasterId: qualification.qualification_master_id,
        createdAt: qualification.created_at.toISOString(),
        updatedAt: qualification.updated_at.toISOString(),
      };

      tracker.end({ qualificationId: qualification.qualification_id });
      return result;
    } catch (error) {
      logger.error('資格更新エラー', {
        qualificationId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('資格の更新に失敗しました');
    }
  }

  async delete(id: string): Promise<void> {
    const tracker = new PerformanceTracker('Qualification.delete');
    try {
      logger.debug('資格削除開始', { qualificationId: id });

      await prisma.qualifications.delete({
        where: {
          qualification_id: id,
        },
      });

      logger.info('資格削除成功', { qualificationId: id });

      tracker.end({ qualificationId: id });
    } catch (error) {
      logger.error('資格削除エラー', {
        qualificationId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('資格の削除に失敗しました');
    }
  }

  async checkDuplicateQualification(employeeId: string, qualificationName: string, excludeId?: string): Promise<boolean> {
    const tracker = new PerformanceTracker('Qualification.checkDuplicateQualification');
    try {
      logger.debug('重複チェック開始', { employeeId, qualificationName, excludeId });

      const existingQualification = await prisma.qualifications.findFirst({
        where: {
          employee_id: employeeId,
          qualification_name: qualificationName,
          qualification_id: excludeId ? { not: excludeId } : undefined,
        },
      });

      const isDuplicate = existingQualification !== null;

      logger.debug('重複チェック完了', { employeeId, qualificationName, isDuplicate });

      tracker.end({ isDuplicate, employeeId, qualificationName });
      return isDuplicate;
    } catch (error) {
      logger.error('重複チェックエラー', {
        employeeId,
        qualificationName,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('重複チェックに失敗しました');
    }
  }

  async findAllEmployeeQualifications(filter?: AllEmployeeQualificationFilter): Promise<AllEmployeeQualificationTableRow[]> {
    const tracker = new PerformanceTracker('Qualification.findAllEmployeeQualifications');
    try {
      logger.debug('全社員資格一覧取得開始', { filter });

      // Prismaクエリの条件を構築
      const whereConditions: any = {};

      if (filter) {
        if (filter.companyId) {
          whereConditions.employees = {
            company_id: filter.companyId,
          };
        }

        if (filter.departmentId) {
          whereConditions.employees = {
            ...whereConditions.employees,
            department_id: filter.departmentId,
          };
        }

        if (filter.searchKeyword) {
          whereConditions.OR = [
            {
              employees: {
                name: {
                  contains: filter.searchKeyword,
                  mode: 'insensitive',
                },
              },
            },
            {
              qualification_name: {
                contains: filter.searchKeyword,
                mode: 'insensitive',
              },
            },
          ];
        }
      }

      const qualifications = await prisma.qualifications.findMany({
        where: whereConditions,
        include: {
          employees: {
            include: {
              companies: true,
              departments: true,
            },
          },
          qualification_masters: true,
        },
        orderBy: [
          { employees: { companies: { company_name: 'asc' } } },
          { employees: { departments: { department_name: 'asc' } } },
          { employees: { name: 'asc' } },
          { qualification_name: 'asc' },
        ],
      });

      // 結果をテーブル行形式に変換し、期限状況フィルターを適用
      const result: AllEmployeeQualificationTableRow[] = qualifications
        .map(qual => {
          // 期限状況を計算
          let status: 'normal' | 'warning' | 'expired';
          let statusDisplayText: string;

          if (qual.expiration_date === 'permanent') {
            status = 'normal';
            statusDisplayText = '正常';
          } else {
            const expirationDate = new Date(qual.expiration_date);
            const today = new Date();
            const diffTime = expirationDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
              status = 'expired';
              statusDisplayText = '期限切れ';
            } else if (diffDays <= 90) {
              status = 'warning';
              statusDisplayText = '期限間近';
            } else {
              status = 'normal';
              statusDisplayText = '正常';
            }
          }

          return {
            employeeId: qual.employee_id,
            employeeName: qual.employees.name,
            companyId: qual.employees.company_id,
            companyName: qual.employees.companies.company_name,
            departmentId: qual.employees.department_id || undefined,
            departmentName: qual.employees.departments?.department_name || undefined,
            qualificationId: qual.qualification_id,
            qualificationName: qual.qualification_name,
            acquiredDate: qual.acquired_date.toISOString().split('T')[0],
            expirationDate: qual.expiration_date,
            status,
            statusDisplayText,
          };
        })
        .filter(row => {
          // 期限状況フィルターを適用
          if (filter?.expirationStatus) {
            if (filter.expirationStatus === 'expired' ||
                filter.expirationStatus === 'warning' ||
                filter.expirationStatus === 'normal') {
              return row.status === filter.expirationStatus;
            }
          }
          return true;
        });

      logger.info('全社員資格一覧取得成功', {
        filter,
        totalCount: qualifications.length,
        filteredCount: result.length,
      });

      tracker.end({
        recordCount: result.length,
        hasFilter: !!filter
      });
      return result;
    } catch (error) {
      logger.error('全社員資格一覧取得エラー', {
        filter,
        error: error instanceof Error ? error.message : String(error),
      });
      tracker.end({ error: true });
      throw new Error('全社員資格一覧の取得に失敗しました');
    }
  }
}