/**
 * @fileoverview Conditional logging utility for PRISMA
 * 
 * Provides conditional logging that respects environment settings
 * and avoids console pollution in production builds.
 * 
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private debugEnabled = this.isDevelopment || process.env.ENABLE_DEBUG === 'true';

  /**
   * Debug logging - only in development or when explicitly enabled
   */
  debug(message: string, ...args: any[]): void {
    if (this.debugEnabled) {
      console.debug(`[PRISMA Debug] ${message}`, ...args);
    }
  }

  /**
   * Info logging - development and production
   */
  info(message: string, ...args: any[]): void {
    console.info(`[PRISMA] ${message}`, ...args);
  }

  /**
   * Warning logging - always enabled
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[PRISMA Warning] ${message}`, ...args);
  }

  /**
   * Error logging - always enabled
   */
  error(message: string, ...args: any[]): void {
    console.error(`[PRISMA Error] ${message}`, ...args);
  }

  /**
   * Conditional logging based on level
   */
  log(level: LogLevel, message: string, ...args: any[]): void {
    switch (level) {
      case 'debug':
        this.debug(message, ...args);
        break;
      case 'info':
        this.info(message, ...args);
        break;
      case 'warn':
        this.warn(message, ...args);
        break;
      case 'error':
        this.error(message, ...args);
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);