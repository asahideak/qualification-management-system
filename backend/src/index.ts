import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import logger from './lib/logger';
import { testDatabaseConnection, disconnectDatabase } from './lib/database';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.BACKEND_PORT || 8432;

// セキュリティミドルウェア
app.use(helmet());

// CORS設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3247',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 1000, // 最大1000リクエスト/15分
  message: {
    success: false,
    message: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
  },
});
app.use(limiter);

// JSON解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// リクエストログ
app.use((req, res, next) => {
  logger.info('API Request', {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
  next();
});

// API ルート
app.use('/api', apiRoutes);

// ルートパス
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '5社統合資格管理システム API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// グローバルエラーハンドラー
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('グローバルエラーハンドラー', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'サーバーエラーが発生しました',
  });
});

// グレースフルシャットダウン
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    await disconnectDatabase();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error during database disconnect', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// サーバー起動
async function startServer() {
  try {
    logger.info('サーバー起動プロセス開始');

    // データベース接続テスト
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      logger.error('データベース接続に失敗しました。サーバーを起動できません。');
      process.exit(1);
    }

    app.listen(PORT, () => {
      logger.info('サーバー起動成功', {
        port: PORT,
        env: process.env.NODE_ENV,
        corsOrigin: process.env.CORS_ORIGIN,
      });
    });
  } catch (error) {
    logger.error('サーバー起動失敗', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

startServer();