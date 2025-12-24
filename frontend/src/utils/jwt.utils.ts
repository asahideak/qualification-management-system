// JWT トークンユーティリティ

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number; // Issued at
  exp: number; // Expires at
  [key: string]: any;
}

// トークンデコード（Base64）
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

// トークン有効性チェック
export function isTokenValid(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (error) {
    return false;
  }
}

// トークン有効期限チェック（残り時間取得）
export function getTokenExpiryTime(token: string): number | null {
  try {
    const payload = decodeToken(token);
    if (!payload) {
      return null;
    }

    return payload.exp * 1000; // ミリ秒に変換
  } catch (error) {
    return null;
  }
}

// トークンの残り有効時間（秒）
export function getTokenRemainingTime(token: string): number {
  try {
    const expiryTime = getTokenExpiryTime(token);
    if (!expiryTime) {
      return 0;
    }

    const now = Date.now();
    const remainingTime = Math.floor((expiryTime - now) / 1000);
    return Math.max(0, remainingTime);
  } catch (error) {
    return 0;
  }
}

// トークンリフレッシュが必要かチェック
export function shouldRefreshToken(token: string, refreshThresholdMinutes: number = 15): boolean {
  try {
    const remainingTime = getTokenRemainingTime(token);
    const thresholdSeconds = refreshThresholdMinutes * 60;

    return remainingTime <= thresholdSeconds && remainingTime > 0;
  } catch (error) {
    return false;
  }
}

// ユーザー情報をトークンから抽出
export function getUserFromToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const payload = decodeToken(token);
    if (!payload) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
}

// ローカルストレージからトークン取得
export function getStoredToken(): string | null {
  return localStorage.getItem('authToken');
}

// ローカルストレージにトークン保存
export function setStoredToken(token: string): void {
  localStorage.setItem('authToken', token);
}

// ローカルストレージからトークン削除
export function removeStoredToken(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

// トークン自動リフレッシュ設定
export class TokenRefreshManager {
  private refreshTimer: number | null = null;
  private refreshCallback: () => Promise<void>;

  constructor(refreshCallback: () => Promise<void>) {
    this.refreshCallback = refreshCallback;
  }

  // 自動リフレッシュ開始
  startAutoRefresh(token: string): void {
    this.stopAutoRefresh();

    const remainingTime = getTokenRemainingTime(token);
    if (remainingTime <= 0) {
      return;
    }

    // 期限の15分前にリフレッシュ実行
    const refreshTime = Math.max(0, remainingTime - 15 * 60) * 1000;

    this.refreshTimer = window.setTimeout(async () => {
      try {
        await this.refreshCallback();
        const newToken = getStoredToken();
        if (newToken) {
          this.startAutoRefresh(newToken);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, refreshTime);
  }

  // 自動リフレッシュ停止
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// セッションタイムアウト管理
export class SessionTimeoutManager {
  private timeoutTimer: number | null = null;
  private warningTimer: number | null = null;
  private timeoutCallback: () => void;
  private warningCallback?: () => void;

  constructor(timeoutCallback: () => void, warningCallback?: () => void) {
    this.timeoutCallback = timeoutCallback;
    this.warningCallback = warningCallback;
  }

  // セッションタイムアウト開始
  startSessionTimeout(timeoutMinutes: number = 30, warningMinutes: number = 5): void {
    this.stopSessionTimeout();

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    // 警告タイマー
    if (this.warningCallback && warningMs > 0) {
      this.warningTimer = window.setTimeout(() => {
        this.warningCallback?.();
      }, warningMs);
    }

    // タイムアウトタイマー
    this.timeoutTimer = window.setTimeout(() => {
      this.timeoutCallback();
    }, timeoutMs);
  }

  // セッションタイムアウト停止
  stopSessionTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  // セッションタイムアウトリセット
  resetSessionTimeout(): void {
    this.stopSessionTimeout();
  }
}