// ローカルストレージ安全操作ユーティリティ

// セキュアなローカルストレージ操作
export class SecureStorage {
  private static prefix = 'qualification_system_';

  // 値の保存
  static setItem(key: string, value: any): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      const prefixedKey = this.prefix + key;
      localStorage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  }

  // 値の取得
  static getItem<T>(key: string): T | null {
    try {
      const prefixedKey = this.prefix + key;
      const serializedValue = localStorage.getItem(prefixedKey);

      if (serializedValue === null) {
        return null;
      }

      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  // 値の削除
  static removeItem(key: string): boolean {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  }

  // キーの存在チェック
  static hasItem(key: string): boolean {
    try {
      const prefixedKey = this.prefix + key;
      return localStorage.getItem(prefixedKey) !== null;
    } catch (error) {
      return false;
    }
  }

  // 全てのアプリケーション関連データを削除
  static clearAll(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => key.startsWith(this.prefix));

      appKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error('Storage clearAll error:', error);
      return false;
    }
  }

  // ストレージ容量チェック
  static getStorageUsage(): { used: number; available: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);

      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      });

      // 大体の利用可能容量（5MB想定）
      const available = 5 * 1024 * 1024 - used;

      return { used, available };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }
}

// セッションストレージ操作（ページ閉じると削除）
export class SecureSessionStorage {
  private static prefix = 'qualification_session_';

  static setItem(key: string, value: any): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      const prefixedKey = this.prefix + key;
      sessionStorage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      console.error('SessionStorage setItem error:', error);
      return false;
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const prefixedKey = this.prefix + key;
      const serializedValue = sessionStorage.getItem(prefixedKey);

      if (serializedValue === null) {
        return null;
      }

      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error('SessionStorage getItem error:', error);
      return null;
    }
  }

  static removeItem(key: string): boolean {
    try {
      const prefixedKey = this.prefix + key;
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('SessionStorage removeItem error:', error);
      return false;
    }
  }

  static clearAll(): boolean {
    try {
      const keys = Object.keys(sessionStorage);
      const appKeys = keys.filter(key => key.startsWith(this.prefix));

      appKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error('SessionStorage clearAll error:', error);
      return false;
    }
  }
}

// Remember Me 機能のストレージ管理
export class RememberMeStorage {
  private static REMEMBER_KEY = 'remember_me';
  private static EMAIL_KEY = 'remembered_email';

  // Remember Me 設定の保存
  static setRememberMe(email: string, remember: boolean): void {
    if (remember) {
      SecureStorage.setItem(this.REMEMBER_KEY, true);
      SecureStorage.setItem(this.EMAIL_KEY, email);
    } else {
      SecureStorage.removeItem(this.REMEMBER_KEY);
      SecureStorage.removeItem(this.EMAIL_KEY);
    }
  }

  // Remember Me 設定の取得
  static getRememberMe(): { remember: boolean; email: string | null } {
    const remember = SecureStorage.getItem<boolean>(this.REMEMBER_KEY) || false;
    const email = remember ? SecureStorage.getItem<string>(this.EMAIL_KEY) : null;

    return { remember, email };
  }

  // Remember Me データの削除
  static clearRememberMe(): void {
    SecureStorage.removeItem(this.REMEMBER_KEY);
    SecureStorage.removeItem(this.EMAIL_KEY);
  }
}

// ユーザー設定のストレージ管理
interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notificationsEnabled: boolean;
  tablePageSize: number;
  defaultCompanyFilter?: string;
}

export class UserPreferencesStorage {
  private static PREFERENCES_KEY = 'user_preferences';

  // デフォルト設定
  private static defaultPreferences: UserPreferences = {
    theme: 'light',
    language: 'ja',
    timezone: 'Asia/Tokyo',
    notificationsEnabled: true,
    tablePageSize: 50,
  };

  // 設定の保存
  static setPreferences(preferences: Partial<UserPreferences>): void {
    const currentPrefs = this.getPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };
    SecureStorage.setItem(this.PREFERENCES_KEY, updatedPrefs);
  }

  // 設定の取得
  static getPreferences(): UserPreferences {
    const stored = SecureStorage.getItem<UserPreferences>(this.PREFERENCES_KEY);
    return { ...this.defaultPreferences, ...stored };
  }

  // 特定設定の取得
  static getPreference<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] {
    const preferences = this.getPreferences();
    return preferences[key];
  }

  // 設定のリセット
  static resetPreferences(): void {
    SecureStorage.removeItem(this.PREFERENCES_KEY);
  }
}

// ローカルストレージサイズ監視
export class StorageMonitor {
  private static readonly STORAGE_WARNING_THRESHOLD = 0.8; // 80%
  private static readonly STORAGE_ERROR_THRESHOLD = 0.95; // 95%

  // ストレージ使用率チェック
  static checkStorageUsage(): {
    usageRatio: number;
    status: 'normal' | 'warning' | 'critical';
    message?: string;
  } {
    const { used, available } = SecureStorage.getStorageUsage();
    const total = used + available;
    const usageRatio = total > 0 ? used / total : 0;

    if (usageRatio >= this.STORAGE_ERROR_THRESHOLD) {
      return {
        usageRatio,
        status: 'critical',
        message: 'ストレージ容量が不足しています。不要なデータを削除してください。',
      };
    } else if (usageRatio >= this.STORAGE_WARNING_THRESHOLD) {
      return {
        usageRatio,
        status: 'warning',
        message: 'ストレージ容量が少なくなっています。',
      };
    } else {
      return {
        usageRatio,
        status: 'normal',
      };
    }
  }

  // 古いデータの自動クリーンアップ
  static cleanupOldData(maxAgeMinutes: number = 24 * 60): void {
    try {
      const now = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000;

      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(SecureStorage['prefix'])) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              if (parsed._timestamp && (now - parsed._timestamp) > maxAge) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // パースエラーの場合、古い形式のデータとして削除
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

// 使用例とヘルパー関数
export const storageUtils = {
  // 認証関連
  auth: {
    setToken: (token: string) => SecureStorage.setItem('auth_token', token),
    getToken: () => SecureStorage.getItem<string>('auth_token'),
    clearToken: () => SecureStorage.removeItem('auth_token'),

    setUser: (user: any) => SecureStorage.setItem('user', user),
    getUser: () => SecureStorage.getItem<any>('user'),
    clearUser: () => SecureStorage.removeItem('user'),
  },

  // 一時データ
  temp: {
    setFormData: (formId: string, data: any) =>
      SecureSessionStorage.setItem(`form_${formId}`, data),
    getFormData: (formId: string) =>
      SecureSessionStorage.getItem<any>(`form_${formId}`),
    clearFormData: (formId: string) =>
      SecureSessionStorage.removeItem(`form_${formId}`),
  },

  // アプリケーション全体のクリア
  clearAll: () => {
    SecureStorage.clearAll();
    SecureSessionStorage.clearAll();
  },
};