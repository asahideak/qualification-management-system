import axios from 'axios';
import { AuthUser } from '../../types';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8432';

// Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Request interceptor - トークンを自動添付
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー時は自動ログアウト
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

class AuthService {
  // ログイン
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  // ログアウト
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  // トークン検証
  async validateToken(token: string): Promise<AuthUser> {
    const response = await api.get<AuthUser>('/auth/validate', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // トークンリフレッシュ
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  }

  // パスワードリセット要求
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password-reset-request', { email });
  }

  // パスワードリセット実行
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/password-reset', { token, newPassword });
  }

  // プロフィール取得
  async getProfile(): Promise<AuthUser> {
    const response = await api.get<AuthUser>('/auth/profile');
    return response.data;
  }

  // プロフィール更新
  async updateProfile(profileData: Partial<AuthUser>): Promise<AuthUser> {
    const response = await api.put<AuthUser>('/auth/profile', profileData);
    return response.data;
  }
}

// Mock Auth Service (MVP用)
class MockAuthService {
  private mockUsers: AuthUser[] = [
    {
      userId: 'user-001',
      email: 'demo@example.com',
      name: 'デモユーザー',
      role: 'user',
      employeeId: 'emp-001',
    },
    {
      userId: 'admin-001',
      email: 'admin@example.com',
      name: 'システム管理者',
      role: 'admin',
      employeeId: 'emp-admin',
    },
  ];

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // 認証処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.mockUsers.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    // パスワードチェック（簡易）
    const validPasswords = ['demo123', 'admin123'];
    if (!validPasswords.includes(credentials.password)) {
      throw new Error('パスワードが正しくありません');
    }

    return {
      token: 'mock-jwt-token-' + Date.now(),
      user,
      expiresIn: 3600, // 1時間
    };
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async validateToken(token: string): Promise<AuthUser> {
    // トークン検証をシミュレート
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!token || !token.startsWith('mock-jwt-token')) {
      throw new Error('Invalid token');
    }

    return this.mockUsers[0]; // デフォルトユーザーを返す
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      token: 'mock-jwt-token-refreshed-' + Date.now(),
      expiresIn: 3600,
    };
  }

  async requestPasswordReset(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset requested for: ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset completed for token: ${token}`);
  }

  async getProfile(): Promise<AuthUser> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockUsers[0];
  }

  async updateProfile(profileData: Partial<AuthUser>): Promise<AuthUser> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...this.mockUsers[0], ...profileData };
  }
}

// MVP環境では Mock Service を使用
const isDevelopment = import.meta.env.DEV;
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

export const authService = (isDevelopment && useMockAuth)
  ? new MockAuthService()
  : new AuthService();

export default authService;