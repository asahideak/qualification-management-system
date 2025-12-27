import request from 'supertest';
import express from 'express';
import logger from '../../src/lib/logger';
import { ApiResponse } from '../../src/types';

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
export async function testGetRequest<T>(
  app: express.Application,
  path: string,
  options: ApiTestOptions = {}
): Promise<{ response: request.Response; data: T | null }> {
  const {
    expectedStatus = 200,
    expectSuccess = true,
    logResponse = true,
  } = options;

  logger.debug('GET APIテスト開始', { path, expectedStatus });

  try {
    const response = await request(app)
      .get(path)
      .expect(expectedStatus);

    if (logResponse) {
      logger.info('GET APIテスト成功', {
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
  } catch (error) {
    logger.error('GET APIテストエラー', {
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
export async function testPostRequest<T, U>(
  app: express.Application,
  path: string,
  requestData: T,
  options: ApiTestOptions = {}
): Promise<{ response: request.Response; data: U | null }> {
  const {
    expectedStatus = 201,
    expectSuccess = true,
    logResponse = true,
  } = options;

  logger.debug('POST APIテスト開始', {
    path,
    expectedStatus,
    requestDataKeys: Object.keys(requestData as any),
  });

  try {
    const response = await request(app)
      .post(path)
      .send(requestData)
      .expect(expectedStatus);

    if (logResponse) {
      logger.info('POST APIテスト成功', {
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
  } catch (error) {
    logger.error('POST APIテストエラー', {
      path,
      expectedStatus,
      requestDataKeys: Object.keys(requestData as any),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * PUTリクエストテストヘルパー
 */
export async function testPutRequest<T, U>(
  app: express.Application,
  path: string,
  requestData: T,
  options: ApiTestOptions = {}
): Promise<{ response: request.Response; data: U | null }> {
  const {
    expectedStatus = 200,
    expectSuccess = true,
    logResponse = true,
  } = options;

  logger.debug('PUT APIテスト開始', {
    path,
    expectedStatus,
    requestDataKeys: Object.keys(requestData as any),
  });

  try {
    const response = await request(app)
      .put(path)
      .send(requestData)
      .expect(expectedStatus);

    if (logResponse) {
      logger.info('PUT APIテスト成功', {
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
  } catch (error) {
    logger.error('PUT APIテストエラー', {
      path,
      expectedStatus,
      requestDataKeys: Object.keys(requestData as any),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * DELETEリクエストテストヘルパー
 */
export async function testDeleteRequest(
  app: express.Application,
  path: string,
  options: ApiTestOptions = {}
): Promise<{ response: request.Response }> {
  const {
    expectedStatus = 200,
    expectSuccess = true,
    logResponse = true,
  } = options;

  logger.debug('DELETE APIテスト開始', { path, expectedStatus });

  try {
    const response = await request(app)
      .delete(path)
      .expect(expectedStatus);

    if (logResponse) {
      logger.info('DELETE APIテスト成功', {
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
  } catch (error) {
    logger.error('DELETE APIテストエラー', {
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
export async function testErrorResponse(
  app: express.Application,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  expectedStatus: number,
  requestData?: any
): Promise<void> {
  logger.debug('エラーレスポンステスト開始', {
    method,
    path,
    expectedStatus,
  });

  try {
    let response: request.Response;

    switch (method) {
      case 'GET':
        response = await request(app).get(path).expect(expectedStatus);
        break;
      case 'POST':
        response = await request(app).post(path).send(requestData).expect(expectedStatus);
        break;
      case 'PUT':
        response = await request(app).put(path).send(requestData).expect(expectedStatus);
        break;
      case 'DELETE':
        response = await request(app).delete(path).expect(expectedStatus);
        break;
    }

    // エラーレスポンスの基本検証
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeDefined();

    logger.info('エラーレスポンステスト成功', {
      method,
      path,
      status: response.status,
      message: response.body.message,
    });
  } catch (error) {
    logger.error('エラーレスポンステストエラー', {
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
export function validateApiResponse<T>(
  response: request.Response,
  expectedDataValidator?: (data: T) => void
): void {
  // 基本的なApiResponse構造の検証
  expect(response.body).toHaveProperty('success');
  expect(response.body).toHaveProperty('data');
  expect(typeof response.body.success).toBe('boolean');

  // データの詳細検証（オプション）
  if (expectedDataValidator && response.body.data) {
    expectedDataValidator(response.body.data);
  }
}