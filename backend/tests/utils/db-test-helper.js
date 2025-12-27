"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueId = generateUniqueId;
exports.generateUniqueEmail = generateUniqueEmail;
exports.createTestCompany = createTestCompany;
exports.createTestDepartment = createTestDepartment;
exports.createTestEmployee = createTestEmployee;
exports.createTestQualificationMaster = createTestQualificationMaster;
exports.createTestQualification = createTestQualification;
exports.cleanupTestData = cleanupTestData;
exports.testDatabaseConnection = testDatabaseConnection;
const database_1 = __importDefault(require("../../src/lib/database"));
const logger_1 = __importDefault(require("../../src/lib/logger"));
/**
 * ユニークなテストデータを生成するためのIDジェネレーター
 */
function generateUniqueId() {
    return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
/**
 * ユニークなメールアドレスを生成
 */
function generateUniqueEmail(prefix = 'test') {
    const uniqueId = generateUniqueId();
    return `${prefix}-${uniqueId}@test.example.com`;
}
/**
 * テスト用会社データを作成
 */
async function createTestCompany(name) {
    const uniqueId = generateUniqueId();
    const testName = name || `テスト会社-${uniqueId}`;
    logger_1.default.debug('テスト用会社データ作成開始', { name: testName });
    try {
        const company = await database_1.default.company.create({
            data: {
                name: testName,
                isActive: true,
            },
        });
        logger_1.default.info('テスト用会社データ作成成功', {
            id: company.id,
            name: company.name,
        });
        return {
            id: company.id,
            name: company.name,
            isActive: company.isActive,
        };
    }
    catch (error) {
        logger_1.default.error('テスト用会社データ作成エラー', {
            name: testName,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
/**
 * テスト用部署データを作成
 */
async function createTestDepartment(companyId, name) {
    const uniqueId = generateUniqueId();
    const testName = name || `テスト部署-${uniqueId}`;
    logger_1.default.debug('テスト用部署データ作成開始', { name: testName, companyId });
    try {
        const department = await database_1.default.department.create({
            data: {
                name: testName,
                companyId,
                isActive: true,
            },
        });
        logger_1.default.info('テスト用部署データ作成成功', {
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
    }
    catch (error) {
        logger_1.default.error('テスト用部署データ作成エラー', {
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
async function createTestEmployee(companyId, name, departmentId) {
    const uniqueId = generateUniqueId();
    const testName = name || `テスト社員-${uniqueId}`;
    const testEmail = generateUniqueEmail('employee');
    logger_1.default.debug('テスト用社員データ作成開始', {
        name: testName,
        email: testEmail,
        companyId,
        departmentId,
    });
    try {
        const employee = await database_1.default.employee.create({
            data: {
                name: testName,
                email: testEmail,
                companyId,
                departmentId,
            },
        });
        logger_1.default.info('テスト用社員データ作成成功', {
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
    }
    catch (error) {
        logger_1.default.error('テスト用社員データ作成エラー', {
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
async function createTestQualificationMaster(data) {
    const { name, validityPeriod = 'permanent', category } = data;
    const uniqueId = generateUniqueId();
    const testName = name || `テスト資格-${uniqueId}`;
    const validityPeriodStr = typeof validityPeriod === 'number' ? validityPeriod.toString() : validityPeriod;
    logger_1.default.debug('テスト用資格マスターデータ作成開始', {
        name: testName,
        validityPeriod: validityPeriodStr,
        category,
    });
    try {
        const master = await database_1.default.qualificationMaster.create({
            data: {
                name: testName,
                validityPeriod: validityPeriodStr,
                category,
                isActive: true,
            },
        });
        logger_1.default.info('テスト用資格マスターデータ作成成功', {
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
    }
    catch (error) {
        logger_1.default.error('テスト用資格マスターデータ作成エラー', {
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
async function createTestQualification(data) {
    const { employeeId, qualificationName, acquiredDate, qualificationMasterId } = data;
    logger_1.default.debug('テスト用資格データ作成開始', {
        employeeId,
        qualificationName,
        acquiredDate,
        qualificationMasterId,
    });
    try {
        // 資格マスターから有効期限を計算
        const master = await database_1.default.qualificationMaster.findUnique({
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
        const qualification = await database_1.default.qualification.create({
            data: {
                employeeId,
                qualificationName,
                acquiredDate: new Date(acquiredDate),
                expirationDate,
                qualificationMasterId,
            },
        });
        logger_1.default.info('テスト用資格データ作成成功', {
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
    }
    catch (error) {
        logger_1.default.error('テスト用資格データ作成エラー', {
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
async function cleanupTestData(ids) {
    logger_1.default.info('テストデータクリーンアップ開始', { ids });
    try {
        // 外部キー制約を考慮した削除順序
        // 資格データの削除
        if (ids?.qualificationIds?.length) {
            await database_1.default.qualification.deleteMany({
                where: {
                    id: { in: ids.qualificationIds },
                },
            });
        }
        else {
            // 従来のパターンマッチ削除
            await database_1.default.qualification.deleteMany({
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
            await database_1.default.employee.deleteMany({
                where: {
                    id: { in: ids.employeeIds },
                },
            });
        }
        else {
            await database_1.default.employee.deleteMany({
                where: {
                    email: {
                        contains: '@test.example.com',
                    },
                },
            });
        }
        // 部署データの削除
        if (ids?.departmentIds?.length) {
            await database_1.default.department.deleteMany({
                where: {
                    id: { in: ids.departmentIds },
                },
            });
        }
        else {
            await database_1.default.department.deleteMany({
                where: {
                    name: {
                        startsWith: 'テスト部署-test-',
                    },
                },
            });
        }
        // 会社データの削除
        if (ids?.companyIds?.length) {
            await database_1.default.company.deleteMany({
                where: {
                    id: { in: ids.companyIds },
                },
            });
        }
        else {
            await database_1.default.company.deleteMany({
                where: {
                    name: {
                        startsWith: 'テスト会社-test-',
                    },
                },
            });
        }
        // 資格マスターデータの削除
        if (ids?.qualificationMasterIds?.length) {
            await database_1.default.qualificationMaster.deleteMany({
                where: {
                    id: { in: ids.qualificationMasterIds },
                },
            });
        }
        else {
            await database_1.default.qualificationMaster.deleteMany({
                where: {
                    name: {
                        startsWith: 'テスト資格-test-',
                    },
                },
            });
        }
        logger_1.default.info('テストデータクリーンアップ完了');
    }
    catch (error) {
        logger_1.default.error('テストデータクリーンアップエラー', {
            ids,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
/**
 * データベース接続テスト
 */
async function testDatabaseConnection() {
    try {
        await database_1.default.$connect();
        logger_1.default.info('テスト用データベース接続成功');
        return true;
    }
    catch (error) {
        logger_1.default.error('テスト用データベース接続失敗', {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}
//# sourceMappingURL=db-test-helper.js.map