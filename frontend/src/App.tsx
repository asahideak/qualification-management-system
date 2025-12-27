import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Card, CardContent, List, ListItem, ListItemText, Chip, Button, Stack } from '@mui/material';
import QualificationManagementPage from '@/pages/user/QualificationManagement';
import AllEmployeeQualificationListPage from '@/pages/user/AllEmployeeQualificationListPage';

// 基本的なMUIテーマ作成
const theme = createTheme({
  palette: {
    primary: {
      main: '#2471a3',
    },
    secondary: {
      main: '#2980b9',
    },
  },
});

// 仮のページコンポーネント
const DashboardPage = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom color="primary">
      ダッシュボード
    </Typography>
    <Typography variant="body1">
      5社統合資格管理システムのダッシュボードページです。
    </Typography>
  </Container>
);

// 削除: RegisterPageは QualificationManagementPage に置き換え

const ListPage = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom color="primary">
      資格一覧
    </Typography>
    <Typography variant="body1">
      登録済み資格の一覧を表示するページです。
    </Typography>
  </Container>
);

// ホームページコンポーネント
const HomePage = () => {
  const handleNavigation = (path: string) => {
    window.location.hash = `#${path}`;
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom color="primary">
        5社統合資格管理システム
      </Typography>
      <Typography variant="body1" paragraph>
        React + TypeScript + Vite + MUI + Router 基盤構築完了
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            システム状況
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="React 18 基盤" />
              <Chip label="✅ 完了" color="success" variant="outlined" />
            </ListItem>
            <ListItem>
              <ListItemText primary="TypeScript 設定" />
              <Chip label="✅ 完了" color="success" variant="outlined" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Vite ビルドツール" />
              <Chip label="✅ 完了" color="success" variant="outlined" />
            </ListItem>
            <ListItem>
              <ListItemText primary="MUI v7 コンポーネントライブラリ" />
              <Chip label="✅ 完了" color="success" variant="outlined" />
            </ListItem>
            <ListItem>
              <ListItemText primary="React Router v7 設定" />
              <Chip label="✅ 完了" color="success" variant="outlined" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ナビゲーションテスト
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" href="#/dashboard">
              ダッシュボード
            </Button>
            <Button variant="outlined" href="#/register">
              資格登録
            </Button>
            <Button variant="outlined" href="#/list">
              資格一覧
            </Button>
            <Button variant="outlined" href="#/all-employees">
              全社員資格一覧
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          🎉 ビルドエラー解消完了 - 核となる基盤が正常に動作しています
        </Typography>
      </Box>
    </Container>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/register" element={<QualificationManagementPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/all-employees" element={<AllEmployeeQualificationListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;