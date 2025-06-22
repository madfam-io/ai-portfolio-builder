/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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

export function createLogger<
  TEvents extends Record<string, any> = Record<string, any>,
>(config: LoggerConfig): Logger<TEvents> {
  return new Logger<TEvents>(config);
}

// Version
export const VERSION = '1.0.0';
