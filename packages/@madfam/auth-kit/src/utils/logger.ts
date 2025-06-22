/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
      // eslint-disable-next-line no-console
      console.debug(`[${this.context}] ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(`[${this.context}] ${message}`, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(`[${this.context}] ${message}`, data);
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(`[${this.context}] ${message}`, error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}
