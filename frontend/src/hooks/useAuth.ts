// 統一認証操作フック
import { useAuth as useAuthContext } from '../contexts/AuthContext';

// AuthContext のuseAuthを再エクスポート
export const useAuth = useAuthContext;