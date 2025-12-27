// 5社統合資格管理システム - 全社員資格一覧データ用カスタムフック
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api.service';
import {
  AllEmployeeQualificationTableRow,
  AllEmployeeQualificationFilter,
  Company,
  Department,
} from '@/types';
import { logger } from '@/lib/logger';

export const useAllEmployeeQualificationData = () => {
  // 状態管理
  const [qualifications, setQualifications] = useState<AllEmployeeQualificationTableRow[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // フィルター状態
  const [filter, setFilter] = useState<AllEmployeeQualificationFilter>({});

  /**
   * 資格一覧データを取得
   */
  const fetchQualifications = useCallback(async (currentFilter?: AllEmployeeQualificationFilter) => {
    try {
      setLoading(true);
      logger.debug('Fetching qualifications', { hookName: 'useAllEmployeeQualificationData', filter: currentFilter });

      const data = await apiService.getAllEmployeeQualifications(currentFilter);
      setQualifications(data);
      logger.info('Qualifications fetched successfully', {
        count: data.length,
        hookName: 'useAllEmployeeQualificationData',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch qualifications', {
        error: error.message,
        hookName: 'useAllEmployeeQualificationData',
      });
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 会社一覧を取得
   */
  const fetchCompanies = useCallback(async () => {
    try {
      logger.debug('Fetching companies', { hookName: 'useAllEmployeeQualificationData' });

      const data = await apiService.getCompanies();
      setCompanies(data);
      logger.info('Companies fetched successfully', {
        count: data.length,
        hookName: 'useAllEmployeeQualificationData',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch companies', {
        error: error.message,
        hookName: 'useAllEmployeeQualificationData',
      });
      // 会社データのエラーは致命的でないため、エラー状態は設定しない
    }
  }, []);

  /**
   * 部署一覧を取得
   */
  const fetchDepartments = useCallback(async () => {
    try {
      logger.debug('Fetching all departments', { hookName: 'useAllEmployeeQualificationData' });

      const data = await apiService.getDepartments();
      setDepartments(data);
      logger.info('Departments fetched successfully', {
        count: data.length,
        hookName: 'useAllEmployeeQualificationData',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch departments', {
        error: error.message,
        hookName: 'useAllEmployeeQualificationData',
      });
      // 部署データのエラーは致命的でないため、エラー状態は設定しない
    }
  }, []);

  /**
   * 会社に基づく部署一覧を取得
   */
  const fetchDepartmentsByCompany = useCallback(async (companyId: string) => {
    try {
      logger.debug('Fetching departments by company', { companyId, hookName: 'useAllEmployeeQualificationData' });

      const data = await apiService.getDepartmentsByCompany(companyId);
      setDepartments(data);
      logger.info('Departments by company fetched successfully', {
        companyId,
        count: data.length,
        hookName: 'useAllEmployeeQualificationData',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch departments by company', {
        error: error.message,
        companyId,
        hookName: 'useAllEmployeeQualificationData',
      });
      // 部署データのエラーは致命的でないため、エラー状態は設定しない
    }
  }, []);

  /**
   * フィルター適用
   */
  const applyFilter = useCallback((newFilter: AllEmployeeQualificationFilter) => {
    logger.debug('Applying filter', { newFilter, hookName: 'useAllEmployeeQualificationData' });

    setFilter(newFilter);
    fetchQualifications(newFilter);
  }, [fetchQualifications]);

  /**
   * フィルタークリア
   */
  const clearFilter = useCallback(() => {
    logger.debug('Clearing filter', { hookName: 'useAllEmployeeQualificationData' });

    const emptyFilter: AllEmployeeQualificationFilter = {};
    setFilter(emptyFilter);
    fetchQualifications(emptyFilter);
  }, [fetchQualifications]);

  /**
   * CSVエクスポート
   */
  const exportToCSV = useCallback(async () => {
    try {
      logger.debug('Exporting to CSV', { filter, hookName: 'useAllEmployeeQualificationData' });

      const { url, filename } = await apiService.exportQualificationsToCSV(filter);

      // ダウンロード実行
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Blob URLを解放
      URL.revokeObjectURL(url);

      logger.info('CSV export completed successfully', {
        filename,
        hookName: 'useAllEmployeeQualificationData',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to export CSV', {
        error: error.message,
        hookName: 'useAllEmployeeQualificationData',
      });
      throw error; // 呼び出し元でエラーハンドリング可能に
    }
  }, [filter]);

  /**
   * データの再取得（リフレッシュ）
   */
  const refetch = useCallback(() => {
    logger.debug('Refetching data', { hookName: 'useAllEmployeeQualificationData' });
    fetchQualifications(filter);
  }, [filter, fetchQualifications]);

  // 初期データ取得
  useEffect(() => {
    logger.debug('Hook mounted', { hookName: 'useAllEmployeeQualificationData' });

    // 並行して初期データを取得
    Promise.all([
      fetchQualifications(),
      fetchCompanies(),
      fetchDepartments(),
    ]);
  }, [fetchQualifications, fetchCompanies, fetchDepartments]);

  return {
    // データ
    qualifications,
    companies,
    departments,
    loading,
    error,

    // フィルター状態
    filter,

    // フィルター操作
    applyFilter,
    clearFilter,
    fetchDepartmentsByCompany,

    // アクション
    exportToCSV,
    refetch,
  };
};