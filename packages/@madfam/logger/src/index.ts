/**
 * @madfam/logger
 * 
 * Production-ready logging with beautiful formatting, structured logs, and automatic PII redaction
 * 
 * @version 1.0.0
 * @license MIT
 * @copyright 2025 MADFAM LLC
 */

export * from './types';
export * from './core/logger';
export * from './transports/console';
export * from './transports/file';
export * from './transports/http';
export * from './utils/redact';

// Main factory function
import { Logger } from './core/logger';
import type { LoggerConfig } from './types';

export function createLogger<TEvents extends Record<string, any> = Record<string, any>>(
  config: LoggerConfig
): Logger<TEvents> {
  return new Logger<TEvents>(config);
}

// Version
export const VERSION = '1.0.0';