import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { PublicLayout } from './layouts/PublicLayout';

// ページコンポーネント（後で実装）
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const QualificationRegisterPage = React.lazy(() => import('./pages/QualificationRegisterPage'));
const QualificationListPage = React.lazy(() => import('./pages/QualificationListPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));

// ローディングコンポーネント
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    読み込み中...
  </div>
);

// ProtectedRoute コンポーネント（認証チェック）
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // MVP版では認証チェックなし、常にアクセス許可
  return <>{children}</>;

  // 将来実装時のコード:
  // const { isAuthenticated, loading } = useAuth();
  //
  // if (loading) {
  //   return <LoadingFallback />;
  // }
  //
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  //
  // return <>{children}</>;
};

// メインアプリケーションコンポーネント
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <React.Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* 公開ルート（将来のログインページ用） */}
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <LoginPage />
                  </PublicLayout>
                }
              />

              {/* 保護されたルート（メイン機能） */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <QualificationRegisterPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/list"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <QualificationListPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* デフォルトリダイレクト */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404エラー処理 */}
              <Route
                path="*"
                element={
                  <MainLayout>
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: theme.colors.textSecondary
                    }}>
                      <h2>404 - ページが見つかりません</h2>
                      <p>お探しのページは存在しません。</p>
                    </div>
                  </MainLayout>
                }
              />
            </Routes>
          </React.Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
