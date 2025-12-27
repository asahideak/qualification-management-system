"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testGetRequest = testGetRequest;
exports.testPostRequest = testPostRequest;
exports.testPutRequest = testPutRequest;
exports.testDeleteRequest = testDeleteRequest;
exports.testErrorResponse = testErrorResponse;
exports.validateApiResponse = validateApiResponse;
const supertest_1 = __importDefault(require("supertest"));
const logger_1 = __importDefault(require("../../src/lib/logger"));
/**
 * GETリクエストテストヘルパー
 */
async function testGetRequest(app, path, options = {}) {
    const { expectedStatus = 200, expectSuccess = true, logResponse = true, } = options;
    logger_1.default.debug('GET APIテスト開始', { path, expectedStatus });
    try {
        const response = await (0, supertest_1.default)(app)
            .get(path)
            .expect(expectedStatus);
        if (logResponse) {
            logger_1.default.info('GET APIテスト成功', {
                path,
                status: response.status,
                success: response.body?.success,
                dataCount: Array.isArray(response.body?.data) ? response.body.data.length : undefined,
            });
        }
        // レスポンスの基本検証
        if (expectSuccess) {
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        }
        return {
            response,
            data: response.body?.data || null,
        };
    }
    catch (error) {
        logger_1.default.error('GET APIテストエラー', {
            path,
            expectedStatus,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
/**
 * POSTリクエストテストヘルパー
 */
async function testPostRequest(app, path, requestData, options = {}) {
    const { expectedStatus = 201, expectSuccess = true, logResponse = true, } = options;
    logger_1.default.debug('POST APIテスト開始', {
        path,
        expectedStatus,
        requestDataKeys: Object.keys(requestData),
    });
    try {
        const response = await (0, supertest_1.default)(app)
            .post(path)
            .send(requestData)
            .expect(expectedStatus);
        if (logResponse) {
            logger_1.default.info('POST APIテスト成功', {
                path,
                status: response.status,
                success: response.body?.success,
                responseDataKeys: response.body?.data ? Object.keys(response.body.data) : [],
            });
        }
        // レスポンスの基本検証
        if (expectSuccess) {
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        }
        return {
            response,
            data: response.body?.data || null,
        };
    }
    catch (error) {
        logger_1.default.error('POST APIテストエラー', {
            path,
            expectedStatus,
            requestDataKeys: Object.keys(requestData),
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
/**
 * PUTリクエストテストヘルパー
 */
async function testPutRequest(app, path, requestData, options = {}) {
    const { expectedStatus = 200, expectSuccess = true, logResponse = true, } = options;
    logger_1.default.debug('PUT APIテスト開始', {
        path,
        expectedStatus,
        requestDataKeys: Object.keys(requestData),
    });
    try {
        const response = await (0, supertest_1.default)(app)
            .put(path)
            .send(requestData)
            .expect(expectedStatus);
        if (logResponse) {
            logger_1.default.info('PUT APIテスト成功', {
                path,
                status: response.status,
                success: response.body?.success,
                responseDataKeys: response.body?.data ? Object.keys(response.body.data) : [],
            });
        }
        // レスポンスの基本検証
        if (expectSuccess) {
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        }
        return {
            response,
            data: response.body?.data || null,
        };
    }
    catch (error) {
        logger_1.default.error('PUT APIテストエラー', {
            path,
            expectedStatus,
            requestDataKeys: Object.keys(requestData),
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
/**
 * DELETEリクエストテストヘルパー
 */
async function testDeleteRequest(app, path, options = {}) {
    const { expectedStatus = 200, expectSuccess = true, logResponse = true, } = options;
    logger_1.default.debug('DELETE APIテスト開始', { path, expectedStatus });
    try {
        const response = await (0, supertest_1.default)(app)
            .delete(path)
            .expect(expectedStatus);
        if (logResponse) {
            logger_1.default.info('DELETE APIテスト成功', {
                path,
                status: response.status,
                success: response.body?.success,
            });
        }
        // レスポンスの基本検証
        if (expectSuccess) {
            expect(response.body.success).toBe(true);
        }
        return { response };
    }
    catch (error) {
        logger_1.default.error('DELETE APIテストエラー', {
            path,
            expectedStatus,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
/**
 * エラーレスポンステストヘルパー
 */
async function testErrorResponse(app, method, path, expectedStatus, requestData) {
    logger_1.default.debug('エラーレスポンステスト開始', {
        method,
        path,
        expectedStatus,
    });
    try {
        let response;
        switch (method) {
            case 'GET':
                response = await (0, supertest_1.default)(app).get(path).expect(expectedStatus);
                break;
            case 'POST':
                response = await (0, supertest_1.default)(app).post(path).send(requestData).expect(expectedStatus);
                break;
            case 'PUT':
                response = await (0, supertest_1.default)(app).put(path).send(requestData).expect(expectedStatus);
                break;
            case 'DELETE':
                response = await (0, supertest_1.default)(app).delete(path).expect(expectedStatus);
                break;
        }
        // エラーレスポンスの基本検証
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
        logger_1.default.info('エラーレスポンステスト成功', {
            method,
            path,
            status: response.status,
            message: response.body.message,
        });
    }
    catch (error) {
        logger_1.default.error('エラーレスポンステストエラー', {
            method,
            path,
            expectedStatus,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
/**
 * APIレスポンス構造検証ヘルパー
 */
function validateApiResponse(response, expectedDataValidator) {
    // 基本的なApiResponse構造の検証
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('data');
    expect(typeof response.body.success).toBe('boolean');
    // データの詳細検証（オプション）
    if (expectedDataValidator && response.body.data) {
        expectedDataValidator(response.body.data);
    }
}
//# sourceMappingURL=api-test-helper.js.map