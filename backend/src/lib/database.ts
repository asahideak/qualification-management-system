import { PrismaClient } from '@prisma/client';
import logger from './logger';

// Prisma クライアントのシングルトンインスタンス
const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  // Prismaのログイベントを Winston logger に転送
  prisma.$on('query', (e) => {
    logger.debug('Database Query', {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  });

  prisma.$on('error', (e) => {
    logger.error('Database Error', {
      message: e.message,
      target: e.target,
    });
  });

  prisma.$on('info', (e) => {
    logger.info('Database Info', {
      message: e.message,
      target: e.target,
    });
  });

  prisma.$on('warn', (e) => {
    logger.warn('Database Warning', {
      message: e.message,
      target: e.target,
    });
  });

  return prisma;
};

// グローバル型定義
declare global {
  var __prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// シングルトンパターンで Prisma クライアントを管理
const prisma = globalThis.__prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// データベース接続テスト関数
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// データベース切断関数
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}