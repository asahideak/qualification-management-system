import winston from 'winston';

// 環境変数からログレベルを取得（dev: debug / prod: info）
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// 機密情報の自動マスキング処理
const maskSensitiveData = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;

  const masked = Array.isArray(obj) ? [...obj] : { ...obj };
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];

  for (const key in masked) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
};

// トランザクションID自動付与用のストレージ
export const transactionContext = {
  current: null as string | null,
  generateId: () => `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
};

// Winston logger設定
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const txnId = transactionContext.current ? `[${transactionContext.current}]` : '';
          const metaStr = Object.keys(meta).length ? JSON.stringify(maskSensitiveData(meta)) : '';
          return `${timestamp} ${level} ${txnId}: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

// パフォーマンス計測機能
export class PerformanceTracker {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
    logger.debug(`Performance tracking started: ${operation}`);
  }

  end(additionalInfo?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;
    logger.info(`Performance: ${this.operation}`, {
      duration_ms: duration,
      ...maskSensitiveData(additionalInfo || {}),
    });
  }
}

export default logger;