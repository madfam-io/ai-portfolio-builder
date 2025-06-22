/**
 * @madfam/feedback
 *
 * World-class feedback collection and analytics system
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Simple Logger Utility
 *
 * Lightweight logging utility for the feedback system
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level?: LogLevel;
  prefix?: string;
  enabled?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private enabled: boolean;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(name: string, config: LoggerConfig = {}) {
    this.prefix = `[${config.prefix || name}]`;
    this.level = config.level || 'info';
    this.enabled = config.enabled !== false;
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (error) {
      this.log(
        'error',
        message,
        { error: error.message, stack: error.stack },
        ...args
      );
    } else {
      this.log('error', message, ...args);
    }
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.enabled || this.levels[level] < this.levels[this.level]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = `${timestamp} ${level.toUpperCase()} ${this.prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...args);
        break;
      case 'info':
        console.log(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
