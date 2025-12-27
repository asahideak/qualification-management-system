import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { MainLayout } from '@/layouts/MainLayout';
import { useQualificationManagement } from '@/hooks/useQualificationManagement';
import { logger } from '@/lib/logger';

export const QualificationManagementPage: React.FC = () => {
  const {
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

    // 登録フォーム関連
    registrationForm,
    setRegistrationForm,

    // 有効期限計算
    expirationCalculation,

    // アクション
    createQualification,
    deleteQualification,
    calculateExpiration,

    // 全体の状態
    loading,
    error
  } = useQualificationManagement();

  // ローカル状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // フォーム入力監視で有効期限を自動計算
  useEffect(() => {
    if (registrationForm.qualificationName && registrationForm.acquiredDate) {
      calculateExpiration(registrationForm.qualificationName, registrationForm.acquiredDate);
    }
  }, [registrationForm.qualificationName, registrationForm.acquiredDate, calculateExpiration]);

  // 資格登録処理
  const handleSubmitRegistration = async () => {
    if (!registrationForm.employeeId || !registrationForm.qualificationName || !registrationForm.acquiredDate) {
      return;
    }

    try {
      setSubmitLoading(true);
      await createQualification(registrationForm);
      logger.info('Qualification registration completed');
    } catch (err) {
      logger.error('Qualification registration failed', { error: String(err) });
    } finally {
      setSubmitLoading(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitLoading(true);
      await deleteQualification(deleteTarget);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      logger.info('Qualification delete completed');
    } catch (err) {
      logger.error('Qualification delete failed', { error: String(err) });
    } finally {
      setSubmitLoading(false);
    }
  };

  // 削除確認ダイアログを開く
  const openDeleteDialog = (qualificationId: string) => {
    setDeleteTarget(qualificationId);
    setDeleteDialogOpen(true);
  };

  // 資格状況に応じた色を取得
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'valid': return 'success';
      case 'expiring': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
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
        <Typography variant="h4" sx={{ color: '#2471a3', mb: 3, fontWeight: 500 }}>
          資格登録・管理
        </Typography>

        {/* 社員選択セクション */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="employee-select-label">社員選択</InputLabel>
            <Select
              labelId="employee-select-label"
              value={selectedEmployeeId}
              label="社員選択"
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <MenuItem value="">
                <em>社員を選択してください</em>
              </MenuItem>
              {employeeOptions.map((option) => (
                <MenuItem key={option.employeeId} value={option.employeeId}>
                  {option.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* 資格登録フォームセクション */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#2471a3', mb: 2, fontWeight: 500 }}>
            新規資格登録
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 2 }}>
            <TextField
              label="資格名"
              placeholder="基本情報技術者試験"
              value={registrationForm.qualificationName}
              onChange={(e) => {
                setRegistrationForm({
                  ...registrationForm,
                  qualificationName: e.target.value
                });
              }}
              fullWidth
              disabled={!selectedEmployeeId}
            />

            <TextField
              type="date"
              label="取得日"
              value={registrationForm.acquiredDate}
              onChange={(e) => {
                setRegistrationForm({
                  ...registrationForm,
                  acquiredDate: e.target.value
                });
              }}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              disabled={!selectedEmployeeId}
            />

            <TextField
              label="有効期限"
              value={expirationCalculation?.displayText || '取得日を入力すると自動計算されます'}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: '#f8f9fa'
                }
              }}
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmitRegistration}
            disabled={!selectedEmployeeId || !registrationForm.qualificationName || !registrationForm.acquiredDate || submitLoading}
            sx={{
              backgroundColor: '#2471a3',
              '&:hover': {
                backgroundColor: '#1a5a89'
              }
            }}
          >
            {submitLoading ? <CircularProgress size={20} /> : '登録'}
          </Button>
        </Paper>

        {/* 既存資格一覧セクション */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ color: '#2471a3', mb: 2, fontWeight: 500 }}>
            保有資格一覧
          </Typography>

          {qualificationsLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : qualificationsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {qualificationsError.message}
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 500 }}>資格名</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>取得日</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>有効期限</TableCell>
                    <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>状態</TableCell>
                    <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qualifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#666', fontStyle: 'italic' }}>
                        {selectedEmployeeId ? 'この社員の資格情報はありません' : '社員を選択すると保有資格が表示されます'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    qualifications.map((qualification) => (
                      <TableRow key={qualification.qualificationId}>
                        <TableCell>{qualification.qualificationName}</TableCell>
                        <TableCell>{qualification.acquiredDate}</TableCell>
                        <TableCell>{qualification.expirationDate}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={qualification.statusText}
                            color={getStatusColor(qualification.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openDeleteDialog(qualification.qualificationId)}
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            削除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* 削除確認ダイアログ */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>削除確認</DialogTitle>
          <DialogContent>
            <Typography>
              この資格を削除しますか？この操作は取り消すことができません。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={submitLoading}>
              {submitLoading ? <CircularProgress size={20} /> : '削除'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default QualificationManagementPage;