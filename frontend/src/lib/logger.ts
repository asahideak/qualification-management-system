// 簡単なロガー実装
interface Logger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
}

class SimpleLogger implements Logger {
  debug(message: string, meta?: Record<string, any>): void {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, meta || '');
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    console.log(`[INFO] ${message}`, meta || '');
  }

  error(message: string, meta?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, meta || '');
  }
}

export const logger = new SimpleLogger();