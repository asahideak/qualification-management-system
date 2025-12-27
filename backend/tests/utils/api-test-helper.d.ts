import request from 'supertest';
import express from 'express';
/**
 * APIテストヘルパー - @9統合テスト成功請負人向け
 * 実際のAPIエンドポイントテスト支援ユーティリティ
 */
export interface ApiTestOptions {
    expectedStatus?: number;
    expectSuccess?: boolean;
    logResponse?: boolean;
}
/**
 * GETリクエストテストヘルパー
 */
export declare function testGetRequest<T>(app: express.Application, path: string, options?: ApiTestOptions): Promise<{
    response: request.Response;
    data: T | null;
}>;
/**
 * POSTリクエストテストヘルパー
 */
export declare function testPostRequest<T, U>(app: express.Application, path: string, requestData: T, options?: ApiTestOptions): Promise<{
    response: request.Response;
    data: U | null;
}>;
/**
 * PUTリクエストテストヘルパー
 */
export declare function testPutRequest<T, U>(app: express.Application, path: string, requestData: T, options?: ApiTestOptions): Promise<{
    response: request.Response;
    data: U | null;
}>;
/**
 * DELETEリクエストテストヘルパー
 */
export declare function testDeleteRequest(app: express.Application, path: string, options?: ApiTestOptions): Promise<{
    response: request.Response;
}>;
/**
 * エラーレスポンステストヘルパー
 */
export declare function testErrorResponse(app: express.Application, method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, expectedStatus: number, requestData?: any): Promise<void>;
/**
 * APIレスポンス構造検証ヘルパー
 */
export declare function validateApiResponse<T>(response: request.Response, expectedDataValidator?: (data: T) => void): void;
//# sourceMappingURL=api-test-helper.d.ts.map