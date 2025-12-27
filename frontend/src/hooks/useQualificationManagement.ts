import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api.service';
import {
  EmployeeSelectOption,
  QualificationTableRow,
  QualificationSuggestion,
  QualificationRegistrationForm,
  QualificationEditForm,
  ExpirationCalculation
} from '@/types';
import { logger } from '@/lib/logger';

interface UseQualificationManagementReturn {
  // 社員選択関連
  employeeOptions: EmployeeSelectOption[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (employeeId: string) => void;

  // 資格一覧関連
  qualifications: QualificationTableRow[];
  qualificationsLoading: boolean;
  qualificationsError: Error | null;

  // 資格サジェスト関連
  suggestions: QualificationSuggestion[];
  suggestionsLoading: boolean;

  // 登録フォーム関連
  registrationForm: QualificationRegistrationForm;
  setRegistrationForm: (form: QualificationRegistrationForm) => void;
  resetRegistrationForm: () => void;

  // 有効期限計算
  expirationCalculation: ExpirationCalculation | null;

  // 編集フォーム関連
  editingQualification: QualificationTableRow | null;
  editForm: QualificationEditForm | null;
  setEditingQualification: (qualification: QualificationTableRow | null) => void;

  // アクション
  createQualification: (form: QualificationRegistrationForm) => Promise<void>;
  updateQualification: (form: QualificationEditForm) => Promise<void>;
  deleteQualification: (qualificationId: string) => Promise<void>;
  calculateExpiration: (qualificationName: string, acquiredDate: string) => void;

  // 全体の状態
  loading: boolean;
  error: Error | null;
}

export const useQualificationManagement = (): UseQualificationManagementReturn => {
  // 社員選択関連の状態
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeSelectOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // 資格一覧関連の状態
  const [qualifications, setQualifications] = useState<QualificationTableRow[]>([]);
  const [qualificationsLoading, setQualificationsLoading] = useState(false);
  const [qualificationsError, setQualificationsError] = useState<Error | null>(null);

  // 資格サジェスト関連の状態
  const [suggestions, setSuggestions] = useState<QualificationSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // 登録フォーム関連の状態
  const [registrationForm, setRegistrationForm] = useState<QualificationRegistrationForm>({
    employeeId: '',
    qualificationName: '',
    acquiredDate: ''
  });

  // 有効期限計算
  const [expirationCalculation, setExpirationCalculation] = useState<ExpirationCalculation | null>(null);

  // 編集フォーム関連の状態
  const [editingQualification, setEditingQualification] = useState<QualificationTableRow | null>(null);
  const [editForm, setEditForm] = useState<QualificationEditForm | null>(null);

  // 全体の状態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 社員オプション取得
  const fetchEmployeeOptions = useCallback(async () => {
    try {
      logger.debug('Fetching employee options', { hookName: 'useQualificationManagement' });

      const options = await apiService.getEmployeeOptions();
      setEmployeeOptions(options);

      logger.info('Employee options fetched successfully', {
        count: options.length,
        hookName: 'useQualificationManagement'
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch employee options', {
        error: error.message,
        hookName: 'useQualificationManagement'
      });
      setError(error);
    }
  }, []);

  // 資格一覧取得
  const fetchQualifications = useCallback(async (employeeId: string) => {
    if (!employeeId) {
      setQualifications([]);
      setQualificationsError(null);
      return;
    }

    try {
      setQualificationsLoading(true);
      setQualificationsError(null);

      logger.debug('Fetching qualifications', { employeeId, hookName: 'useQualificationManagement' });

      const qualificationList = await apiService.getQualificationsByEmployeeForTable(employeeId);
      setQualifications(qualificationList);

      logger.info('Qualifications fetched successfully', {
        employeeId,
        count: qualificationList.length,
        hookName: 'useQualificationManagement'
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch qualifications', {
        error: error.message,
        employeeId,
        hookName: 'useQualificationManagement'
      });
      setQualificationsError(error);
    } finally {
      setQualificationsLoading(false);
    }
  }, []);

  // 資格サジェスト取得
  const fetchSuggestions = useCallback(async () => {
    try {
      setSuggestionsLoading(true);

      logger.debug('Fetching qualification suggestions', { hookName: 'useQualificationManagement' });

      const suggestionList = await apiService.getQualificationSuggestions();
      setSuggestions(suggestionList);

      logger.info('Qualification suggestions fetched successfully', {
        count: suggestionList.length,
        hookName: 'useQualificationManagement'
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch qualification suggestions', {
        error: error.message,
        hookName: 'useQualificationManagement'
      });
      // サジェストのエラーは致命的ではないため、全体エラーには設定しない
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  // 初期データ読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        logger.debug('Loading initial data', { hookName: 'useQualificationManagement' });

        await Promise.all([
          fetchEmployeeOptions(),
          fetchSuggestions()
        ]);

        logger.info('Initial data loaded successfully', { hookName: 'useQualificationManagement' });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Failed to load initial data', {
          error: error.message,
          hookName: 'useQualificationManagement'
        });
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchEmployeeOptions, fetchSuggestions]);

  // 社員選択時の処理
  useEffect(() => {
    setRegistrationForm(prev => ({ ...prev, employeeId: selectedEmployeeId }));
    fetchQualifications(selectedEmployeeId);
  }, [selectedEmployeeId, fetchQualifications]);

  // 有効期限計算
  const calculateExpiration = useCallback((qualificationName: string, acquiredDate: string) => {
    if (!qualificationName || !acquiredDate) {
      setExpirationCalculation(null);
      return;
    }

    try {
      logger.debug('Calculating expiration', { qualificationName, acquiredDate });

      const calculation = apiService.calculateExpiration(qualificationName, acquiredDate);
      setExpirationCalculation(calculation);

      logger.debug('Expiration calculated', {
        qualificationName,
        acquiredDate,
        result: calculation.displayText
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to calculate expiration', {
        error: error.message,
        qualificationName,
        acquiredDate
      });

      setExpirationCalculation({
        expirationDate: 'error',
        displayText: '計算エラー'
      });
    }
  }, []);

  // 登録フォームリセット
  const resetRegistrationForm = useCallback(() => {
    setRegistrationForm({
      employeeId: selectedEmployeeId,
      qualificationName: '',
      acquiredDate: ''
    });
    setExpirationCalculation(null);

    logger.debug('Registration form reset', { selectedEmployeeId });
  }, [selectedEmployeeId]);

  // 編集対象設定
  const handleSetEditingQualification = useCallback((qualification: QualificationTableRow | null) => {
    setEditingQualification(qualification);

    if (qualification) {
      setEditForm({
        qualificationId: qualification.qualificationId,
        qualificationName: qualification.qualificationName,
        acquiredDate: formatDateForInput(qualification.acquiredDate)
      });

      logger.debug('Edit form prepared', { qualificationId: qualification.qualificationId });
    } else {
      setEditForm(null);
      logger.debug('Edit form cleared');
    }
  }, []);

  // 資格登録
  const createQualification = useCallback(async (form: QualificationRegistrationForm) => {
    try {
      logger.debug('Creating qualification', { qualificationName: form.qualificationName });

      await apiService.createQualification(form);
      await fetchQualifications(form.employeeId);
      resetRegistrationForm();

      logger.info('Qualification created successfully', {
        qualificationName: form.qualificationName,
        employeeId: form.employeeId
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to create qualification', {
        error: error.message,
        form
      });
      throw error;
    }
  }, [fetchQualifications, resetRegistrationForm]);

  // 資格更新
  const updateQualification = useCallback(async (form: QualificationEditForm) => {
    try {
      logger.debug('Updating qualification', { qualificationId: form.qualificationId });

      await apiService.updateQualification(form);
      await fetchQualifications(selectedEmployeeId);
      setEditingQualification(null);
      setEditForm(null);

      logger.info('Qualification updated successfully', { qualificationId: form.qualificationId });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to update qualification', {
        error: error.message,
        form
      });
      throw error;
    }
  }, [fetchQualifications, selectedEmployeeId]);

  // 資格削除
  const deleteQualification = useCallback(async (qualificationId: string) => {
    try {
      logger.debug('Deleting qualification', { qualificationId });

      await apiService.deleteQualification(qualificationId);
      await fetchQualifications(selectedEmployeeId);

      logger.info('Qualification deleted successfully', { qualificationId });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to delete qualification', {
        error: error.message,
        qualificationId
      });
      throw error;
    }
  }, [fetchQualifications, selectedEmployeeId]);

  return {
    // 社員選択関連
    employeeOptions,
    selectedEmployeeId,
    setSelectedEmployeeId,

    // 資格一覧関連
    qualifications,
    qualificationsLoading,
    qualificationsError,

    // 資格サジェスト関連
    suggestions,
    suggestionsLoading,

    // 登録フォーム関連
    registrationForm,
    setRegistrationForm,
    resetRegistrationForm,

    // 有効期限計算
    expirationCalculation,

    // 編集フォーム関連
    editingQualification,
    editForm,
    setEditingQualification: handleSetEditingQualification,

    // アクション
    createQualification,
    updateQualification,
    deleteQualification,
    calculateExpiration,

    // 全体の状態
    loading,
    error
  };
};

// ユーティリティ関数：表示用日付を入力用フォーマットに変換
function formatDateForInput(displayDate: string): string {
  if (!displayDate || displayDate === '永続') {
    return '';
  }

  // 'YYYY/MM/DD' を 'YYYY-MM-DD' に変換
  const parts = displayDate.split('/');
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }

  return displayDate;
}