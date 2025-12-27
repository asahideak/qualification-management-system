// 5社統合資格管理システム - 全社員資格一覧ページ
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { useAllEmployeeQualificationData } from '@/hooks/useAllEmployeeQualificationData';
import { MainLayout } from '@/layouts/MainLayout';
import { AllEmployeeQualificationFilter } from '@/types';
import { logger } from '@/lib/logger';

export const AllEmployeeQualificationListPage: React.FC = () => {
  const {
    qualifications,
    companies,
    departments,
    loading,
    error,
    filter,
    applyFilter,
    clearFilter,
    fetchDepartmentsByCompany,
    exportToCSV,
    refetch,
  } = useAllEmployeeQualificationData();

  // ローカル状態（フィルター入力用）
  const [localFilter, setLocalFilter] = useState<AllEmployeeQualificationFilter>({});

  /**
   * 会社フィルター変更時のハンドラー
   */
  const handleCompanyChange = (event: SelectChangeEvent<string>) => {
    const companyId = event.target.value;
    logger.debug('Company filter changed', { companyId });

    const newFilter = { ...localFilter, companyId: companyId || undefined, departmentId: undefined };
    setLocalFilter(newFilter);

    // 会社が選択された場合、対応する部署一覧を取得
    if (companyId) {
      fetchDepartmentsByCompany(companyId);
    }
  };

  /**
   * 部署フィルター変更時のハンドラー
   */
  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    const departmentId = event.target.value;
    logger.debug('Department filter changed', { departmentId });

    const newFilter = { ...localFilter, departmentId: departmentId || undefined };
    setLocalFilter(newFilter);
  };

  /**
   * 期限状況フィルター変更時のハンドラー
   */
  const handleExpirationStatusChange = (event: SelectChangeEvent<string>) => {
    const expirationStatus = event.target.value;
    logger.debug('Expiration status filter changed', { expirationStatus });

    const newFilter = {
      ...localFilter,
      expirationStatus: expirationStatus as 'expired' | 'warning' | 'normal' | '' | undefined,
    };
    setLocalFilter(newFilter);
  };

  /**
   * 検索キーワード変更時のハンドラー
   */
  const handleSearchKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchKeyword = event.target.value;
    logger.debug('Search keyword changed', { searchKeyword });

    const newFilter = { ...localFilter, searchKeyword: searchKeyword || undefined };
    setLocalFilter(newFilter);
  };

  /**
   * フィルター適用
   */
  const handleApplyFilter = () => {
    logger.debug('Applying filter', { localFilter });
    applyFilter(localFilter);
  };

  /**
   * フィルタークリア
   */
  const handleClearFilter = () => {
    logger.debug('Clearing filter');
    setLocalFilter({});
    clearFilter();
  };

  /**
   * CSVエクスポート実行
   */
  const handleExportCSV = async () => {
    try {
      logger.debug('Starting CSV export');
      await exportToCSV();
    } catch (error) {
      logger.error('CSV export failed', { error });
      // エラー処理はカスタムフック内で実行済み
    }
  };

  /**
   * ステータスチップの色を取得
   */
  const getStatusChipColor = (status: 'normal' | 'warning' | 'expired') => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* ページタイトル */}
        <Typography variant="h4" sx={{ mb: 3 }}>
          全社員資格一覧
        </Typography>

        {/* フィルター・検索セクション */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'flex-end',
              mb: 2
            }}
          >
            {/* 会社フィルター */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>会社</InputLabel>
              <Select
                value={localFilter.companyId || ''}
                onChange={handleCompanyChange}
                label="会社"
              >
                <MenuItem value="">
                  <em>全ての会社</em>
                </MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.companyId} value={company.companyId}>
                    {company.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 部署フィルター */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>部署</InputLabel>
              <Select
                value={localFilter.departmentId || ''}
                onChange={handleDepartmentChange}
                label="部署"
                disabled={!localFilter.companyId}
              >
                <MenuItem value="">
                  <em>全ての部署</em>
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 期限状況フィルター */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>期限状況</InputLabel>
              <Select
                value={localFilter.expirationStatus || ''}
                onChange={handleExpirationStatusChange}
                label="期限状況"
              >
                <MenuItem value="">
                  <em>全ての状況</em>
                </MenuItem>
                <MenuItem value="expired">期限切れ</MenuItem>
                <MenuItem value="warning">期限間近（30日以内）</MenuItem>
                <MenuItem value="normal">正常</MenuItem>
              </Select>
            </FormControl>

            {/* 検索フィールド */}
            <TextField
              size="small"
              label="検索"
              placeholder="社員名または資格名で検索"
              value={localFilter.searchKeyword || ''}
              onChange={handleSearchKeywordChange}
              sx={{ minWidth: 200 }}
            />

            {/* フィルター操作ボタン */}
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                size="small"
                onClick={handleApplyFilter}
              >
                検索
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilter}
              >
                クリア
              </Button>
            </Box>
          </Box>

          {/* アクションボタン */}
          <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={refetch}
              size="small"
            >
              🔄 更新
            </Button>
            <Button
              variant="contained"
              onClick={handleExportCSV}
              size="small"
            >
              📥 CSVエクスポート
            </Button>
          </Box>
        </Paper>

        {/* 資格一覧テーブル */}
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>社員名</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>会社</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>部署</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>資格名</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>取得日</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>有効期限</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>状況</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qualifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      データがありません
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                qualifications.map((qualification, index) => (
                  <TableRow
                    key={`${qualification.qualificationId}-${index}`}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {/* 社員名 */}
                    <TableCell sx={{ fontWeight: 500 }}>
                      {qualification.employeeName}
                    </TableCell>

                    {/* 会社 */}
                    <TableCell>
                      <Chip
                        label={qualification.companyName}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>

                    {/* 部署 */}
                    <TableCell>{qualification.departmentName || '-'}</TableCell>

                    {/* 資格名 */}
                    <TableCell sx={{ color: 'primary.main' }}>
                      {qualification.qualificationName}
                    </TableCell>

                    {/* 取得日 */}
                    <TableCell>{qualification.acquiredDate}</TableCell>

                    {/* 有効期限 */}
                    <TableCell>{qualification.expirationDate}</TableCell>

                    {/* 状況 */}
                    <TableCell>
                      <Chip
                        label={qualification.statusDisplayText}
                        size="small"
                        color={getStatusChipColor(qualification.status)}
                        variant="filled"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 件数表示 */}
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            {qualifications.length}件の資格が表示されています
          </Typography>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AllEmployeeQualificationListPage;