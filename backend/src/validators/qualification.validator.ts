import { isValidQualification, QualificationRegistrationForm, QualificationEditForm } from '../types';
import logger from '../lib/logger';

/**
 * 資格登録フォームバリデーション
 * @param data リクエストボディ
 * @returns バリデーション結果
 */
export function validateQualificationRegistrationForm(data: unknown): data is QualificationRegistrationForm {
  if (typeof data !== 'object' || data === null) {
    logger.error('資格登録フォーム バリデーションエラー: データがオブジェクトではありません', { data });
    return false;
  }

  const form = data as Record<string, unknown>;

  // employeeId検証
  if (typeof form.employeeId !== 'string' || form.employeeId.trim() === '') {
    logger.error('資格登録フォーム バリデーションエラー: employeeIdが無効です', { employeeId: form.employeeId });
    return false;
  }

  // qualificationName検証
  if (typeof form.qualificationName !== 'string' || form.qualificationName.trim() === '') {
    logger.error('資格登録フォーム バリデーションエラー: qualificationNameが無効です', {
      qualificationName: form.qualificationName,
    });
    return false;
  }

  // acquiredDate検証 (YYYY-MM-DD形式)
  if (typeof form.acquiredDate !== 'string') {
    logger.error('資格登録フォーム バリデーションエラー: acquiredDateが文字列ではありません', {
      acquiredDate: form.acquiredDate,
    });
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(form.acquiredDate)) {
    logger.error('資格登録フォーム バリデーションエラー: acquiredDateの形式が無効です(YYYY-MM-DD必須)', {
      acquiredDate: form.acquiredDate,
    });
    return false;
  }

  const date = new Date(form.acquiredDate);
  if (isNaN(date.getTime())) {
    logger.error('資格登録フォーム バリデーションエラー: acquiredDateが無効な日付です', {
      acquiredDate: form.acquiredDate,
    });
    return false;
  }

  // 未来の日付チェック
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    logger.error('資格登録フォーム バリデーションエラー: 取得日は未来の日付にできません', {
      acquiredDate: form.acquiredDate,
      today: today.toISOString().split('T')[0],
    });
    return false;
  }

  // qualificationMasterIdは任意項目
  if (form.qualificationMasterId !== undefined) {
    if (typeof form.qualificationMasterId !== 'string' || form.qualificationMasterId.trim() === '') {
      logger.error('資格登録フォーム バリデーションエラー: qualificationMasterIdが無効です', {
        qualificationMasterId: form.qualificationMasterId,
      });
      return false;
    }
  }

  logger.debug('資格登録フォーム バリデーション成功', {
    employeeId: form.employeeId,
    qualificationName: form.qualificationName,
    acquiredDate: form.acquiredDate,
  });

  return true;
}

/**
 * 資格編集フォームバリデーション
 * @param data リクエストボディ
 * @returns バリデーション結果
 */
export function validateQualificationEditForm(data: unknown): data is QualificationEditForm {
  if (typeof data !== 'object' || data === null) {
    logger.error('資格編集フォーム バリデーションエラー: データがオブジェクトではありません', { data });
    return false;
  }

  const form = data as Record<string, unknown>;

  // qualificationId検証
  if (typeof form.qualificationId !== 'string' || form.qualificationId.trim() === '') {
    logger.error('資格編集フォーム バリデーションエラー: qualificationIdが無効です', {
      qualificationId: form.qualificationId,
    });
    return false;
  }

  // qualificationName検証
  if (typeof form.qualificationName !== 'string' || form.qualificationName.trim() === '') {
    logger.error('資格編集フォーム バリデーションエラー: qualificationNameが無効です', {
      qualificationName: form.qualificationName,
    });
    return false;
  }

  // acquiredDate検証 (YYYY-MM-DD形式)
  if (typeof form.acquiredDate !== 'string') {
    logger.error('資格編集フォーム バリデーションエラー: acquiredDateが文字列ではありません', {
      acquiredDate: form.acquiredDate,
    });
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(form.acquiredDate)) {
    logger.error('資格編集フォーム バリデーションエラー: acquiredDateの形式が無効です(YYYY-MM-DD必須)', {
      acquiredDate: form.acquiredDate,
    });
    return false;
  }

  const date = new Date(form.acquiredDate);
  if (isNaN(date.getTime())) {
    logger.error('資格編集フォーム バリデーションエラー: acquiredDateが無効な日付です', {
      acquiredDate: form.acquiredDate,
    });
    return false;
  }

  // 未来の日付チェック
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    logger.error('資格編集フォーム バリデーションエラー: 取得日は未来の日付にできません', {
      acquiredDate: form.acquiredDate,
      today: today.toISOString().split('T')[0],
    });
    return false;
  }

  // qualificationMasterIdは任意項目
  if (form.qualificationMasterId !== undefined) {
    if (typeof form.qualificationMasterId !== 'string' || form.qualificationMasterId.trim() === '') {
      logger.error('資格編集フォーム バリデーションエラー: qualificationMasterIdが無効です', {
        qualificationMasterId: form.qualificationMasterId,
      });
      return false;
    }
  }

  logger.debug('資格編集フォーム バリデーション成功', {
    qualificationId: form.qualificationId,
    qualificationName: form.qualificationName,
    acquiredDate: form.acquiredDate,
  });

  return true;
}

/**
 * 資格IDバリデーション
 * @param qualificationId 資格ID
 * @returns バリデーション結果
 */
export function validateQualificationId(qualificationId: unknown): qualificationId is string {
  if (typeof qualificationId !== 'string' || qualificationId.trim() === '') {
    logger.error('資格ID バリデーションエラー: 無効な資格IDです', { qualificationId });
    return false;
  }

  logger.debug('資格ID バリデーション成功', { qualificationId });
  return true;
}

/**
 * 有効期限計算
 * @param acquiredDate 取得日(YYYY-MM-DD)
 * @param validityPeriod 有効期間（年数または'permanent'）
 * @returns 有効期限
 */
export function calculateExpirationDate(acquiredDate: string, validityPeriod: number | 'permanent'): string {
  if (validityPeriod === 'permanent') {
    logger.debug('有効期限計算: 永続資格', { acquiredDate, validityPeriod });
    return 'permanent';
  }

  const acquired = new Date(acquiredDate);
  if (isNaN(acquired.getTime())) {
    logger.error('有効期限計算エラー: 無効な取得日', { acquiredDate });
    throw new Error(`無効な取得日: ${acquiredDate}`);
  }

  if (typeof validityPeriod !== 'number' || validityPeriod <= 0) {
    logger.error('有効期限計算エラー: 無効な有効期間', { validityPeriod });
    throw new Error(`無効な有効期間: ${validityPeriod}`);
  }

  // 取得日に年数を追加
  const expiration = new Date(acquired);
  expiration.setFullYear(expiration.getFullYear() + validityPeriod);

  const result = expiration.toISOString().split('T')[0];
  logger.debug('有効期限計算完了', {
    acquiredDate,
    validityPeriod,
    expirationDate: result,
  });

  return result;
}