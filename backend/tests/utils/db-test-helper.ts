import prisma from '../../src/lib/database';
import logger from '../../src/lib/logger';

/**
 * データベーステストヘルパー - @9統合テスト成功請負人向け
 * 実際のデータベース環境でテスト分離とデータ管理を提供
 */

export interface TestCompany {
  id: string;
  name: string;
  isActive: boolean;
}

export interface TestDepartment {
  id: string;
  name: string;
  companyId: string;
  isActive: boolean;
}

export interface TestEmployee {
  id: string;
  name: string;
  email: string;
  companyId: string;
  departmentId?: string;
}

export interface TestQualificationMaster {
  id: string;
  name: string;
  validityPeriod: string; // 数値文字列または'permanent'
  category?: string;
  isActive: boolean;
}

export interface TestQualification {
  id: string;
  employeeId: string;
  qualificationName: string;
  acquiredDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD または 'permanent'
  qualificationMasterId: string;
}

/**
 * ユニークなテストデータを生成するためのIDジェネレーター
 */
export function generateUniqueId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * ユニークなメールアドレスを生成
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const uniqueId = generateUniqueId();
  return `${prefix}-${uniqueId}@test.example.com`;
}

/**
 * テスト用会社データを作成
 */
export async function createTestCompany(name?: string): Promise<TestCompany> {
  const uniqueId = generateUniqueId();
  const testName = name || `テスト会社-${uniqueId}`;

  logger.debug('テスト用会社データ作成開始', { name: testName });

  try {
    const company = await prisma.company.create({
      data: {
        name: testName,
        isActive: true,
      },
    });

    logger.info('テスト用会社データ作成成功', {
      id: company.id,
      name: company.name,
    });

    return {
      id: company.id,
      name: company.name,
      isActive: company.isActive,
    };
  } catch (error) {
    logger.error('テスト用会社データ作成エラー', {
      name: testName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * テスト用部署データを作成
 */
export async function createTestDepartment(companyId: string, name?: string): Promise<TestDepartment> {
  const uniqueId = generateUniqueId();
  const testName = name || `テスト部署-${uniqueId}`;

  logger.debug('テスト用部署データ作成開始', { name: testName, companyId });

  try {
    const department = await prisma.department.create({
      data: {
        name: testName,
        companyId,
        isActive: true,
      },
    });

    logger.info('テスト用部署データ作成成功', {
      id: department.id,
      name: department.name,
      companyId: department.companyId,
    });

    return {
      id: department.id,
      name: department.name,
      companyId: department.companyId,
      isActive: department.isActive,
    };
  } catch (error) {
    logger.error('テスト用部署データ作成エラー', {
      name: testName,
      companyId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * テスト用社員データを作成
 */
export async function createTestEmployee(
  companyId: string,
  name?: string,
  departmentId?: string
): Promise<TestEmployee> {
  const uniqueId = generateUniqueId();
  const testName = name || `テスト社員-${uniqueId}`;
  const testEmail = generateUniqueEmail('employee');

  logger.debug('テスト用社員データ作成開始', {
    name: testName,
    email: testEmail,
    companyId,
    departmentId,
  });

  try {
    const employee = await prisma.employee.create({
      data: {
        name: testName,
        email: testEmail,
        companyId,
        departmentId,
      },
    });

    logger.info('テスト用社員データ作成成功', {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      companyId: employee.companyId,
      departmentId: employee.departmentId,
    });

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      companyId: employee.companyId,
      departmentId: employee.departmentId,
    };
  } catch (error) {
    logger.error('テスト用社員データ作成エラー', {
      name: testName,
      email: testEmail,
      companyId,
      departmentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * テスト用資格マスターデータを作成
 */
export async function createTestQualificationMaster(data: {
  name?: string;
  validityPeriod?: string | number;
  category?: string;
}): Promise<TestQualificationMaster> {
  const { name, validityPeriod = 'permanent', category } = data;
  const uniqueId = generateUniqueId();
  const testName = name || `テスト資格-${uniqueId}`;
  const validityPeriodStr = typeof validityPeriod === 'number' ? validityPeriod.toString() : validityPeriod;

  logger.debug('テスト用資格マスターデータ作成開始', {
    name: testName,
    validityPeriod: validityPeriodStr,
    category,
  });

  try {
    const master = await prisma.qualificationMaster.create({
      data: {
        name: testName,
        validityPeriod: validityPeriodStr,
        category,
        isActive: true,
      },
    });

    logger.info('テスト用資格マスターデータ作成成功', {
      id: master.id,
      name: master.name,
      validityPeriod: master.validityPeriod,
      category: master.category,
    });

    return {
      id: master.id,
      name: master.name,
      validityPeriod: master.validityPeriod,
      category: master.category,
      isActive: master.isActive,
    };
  } catch (error) {
    logger.error('テスト用資格マスターデータ作成エラー', {
      name: testName,
      validityPeriod,
      category,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * テスト用資格データを作成
 */
export async function createTestQualification(data: {
  employeeId: string;
  qualificationName: string;
  acquiredDate: string;
  qualificationMasterId: string;
}): Promise<TestQualification> {
  const { employeeId, qualificationName, acquiredDate, qualificationMasterId } = data;

  logger.debug('テスト用資格データ作成開始', {
    employeeId,
    qualificationName,
    acquiredDate,
    qualificationMasterId,
  });

  try {
    // 資格マスターから有効期限を計算
    const master = await prisma.qualificationMaster.findUnique({
      where: { id: qualificationMasterId },
    });

    if (!master) {
      throw new Error(`指定された資格マスターが見つかりません: ${qualificationMasterId}`);
    }

    let expirationDate = 'permanent';
    if (master.validityPeriod !== 'permanent') {
      const acquired = new Date(acquiredDate);
      const expiration = new Date(acquired);
      expiration.setFullYear(expiration.getFullYear() + parseInt(master.validityPeriod));
      expirationDate = expiration.toISOString().split('T')[0];
    }

    const qualification = await prisma.qualification.create({
      data: {
        employeeId,
        qualificationName,
        acquiredDate: new Date(acquiredDate),
        expirationDate,
        qualificationMasterId,
      },
    });

    logger.info('テスト用資格データ作成成功', {
      id: qualification.id,
      employeeId: qualification.employeeId,
      qualificationName: qualification.qualificationName,
      expirationDate: qualification.expirationDate,
    });

    return {
      id: qualification.id,
      employeeId: qualification.employeeId,
      qualificationName: qualification.qualificationName,
      acquiredDate: qualification.acquiredDate.toISOString().split('T')[0],
      expirationDate: qualification.expirationDate,
      qualificationMasterId: qualification.qualificationMasterId,
    };
  } catch (error) {
    logger.error('テスト用資格データ作成エラー', {
      employeeId,
      qualificationName,
      acquiredDate,
      qualificationMasterId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * テスト用データを一括削除（テスト後クリーンアップ）
 */
export async function cleanupTestData(ids?: {
  qualificationIds?: string[];
  employeeIds?: string[];
  departmentIds?: string[];
  companyIds?: string[];
  qualificationMasterIds?: string[];
}): Promise<void> {
  logger.info('テストデータクリーンアップ開始', { ids });

  try {
    // 外部キー制約を考慮した削除順序

    // 資格データの削除
    if (ids?.qualificationIds?.length) {
      await prisma.qualification.deleteMany({
        where: {
          id: { in: ids.qualificationIds },
        },
      });
    } else {
      // 従来のパターンマッチ削除
      await prisma.qualification.deleteMany({
        where: {
          employee: {
            email: {
              contains: '@test.example.com',
            },
          },
        },
      });
    }

    // 社員データの削除
    if (ids?.employeeIds?.length) {
      await prisma.employee.deleteMany({
        where: {
          id: { in: ids.employeeIds },
        },
      });
    } else {
      await prisma.employee.deleteMany({
        where: {
          email: {
            contains: '@test.example.com',
          },
        },
      });
    }

    // 部署データの削除
    if (ids?.departmentIds?.length) {
      await prisma.department.deleteMany({
        where: {
          id: { in: ids.departmentIds },
        },
      });
    } else {
      await prisma.department.deleteMany({
        where: {
          name: {
            startsWith: 'テスト部署-test-',
          },
        },
      });
    }

    // 会社データの削除
    if (ids?.companyIds?.length) {
      await prisma.company.deleteMany({
        where: {
          id: { in: ids.companyIds },
        },
      });
    } else {
      await prisma.company.deleteMany({
        where: {
          name: {
            startsWith: 'テスト会社-test-',
          },
        },
      });
    }

    // 資格マスターデータの削除
    if (ids?.qualificationMasterIds?.length) {
      await prisma.qualificationMaster.deleteMany({
        where: {
          id: { in: ids.qualificationMasterIds },
        },
      });
    } else {
      await prisma.qualificationMaster.deleteMany({
        where: {
          name: {
            startsWith: 'テスト資格-test-',
          },
        },
      });
    }

    logger.info('テストデータクリーンアップ完了');
  } catch (error) {
    logger.error('テストデータクリーンアップエラー', {
      ids,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * データベース接続テスト
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('テスト用データベース接続成功');
    return true;
  } catch (error) {
    logger.error('テスト用データベース接続失敗', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}