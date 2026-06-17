/**
 * ExUI 统一日志工具
 * 在开发环境输出日志，生产环境静默
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  level?: LogLevel;
}

class Logger {
  private prefix: string;
  private level: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || 'ExUI';
    this.level = options.level || (import.meta.env.DEV ? 'debug' : 'error');
  }

  private shouldLog(level: LogLevel): boolean {
    if (import.meta.env.PROD && level !== 'error') {
      return false;
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string): string {
    return `[${this.prefix}:${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }
}

// 导出默认日志实例
export const logger = new Logger();

// 导出创建自定义日志实例的函数
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}

// 导出类型
export type { LogLevel, LoggerOptions };
