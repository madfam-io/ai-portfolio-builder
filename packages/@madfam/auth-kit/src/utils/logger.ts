/**
 * @madfam/auth-kit
 * 
 * Simple logger utility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private context: string;
  private level: LogLevel;

  constructor(context: string, level: LogLevel = 'info') {
    this.context = context;
    this.level = level;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[${this.context}] ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[${this.context}] ${message}`, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.context}] ${message}`, data);
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      console.error(`[${this.context}] ${message}`, error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}