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
 * JSON formatting for structured logs
 */

import type { LogEntry } from '../types';

export function formatJson(entry: LogEntry): string {
  const output: any = {
    timestamp: entry.timestamp.toISOString(),
    level: entry.level,
    service: entry.service,
    message: entry.message,
  };

  // Add context
  if (entry.context && Object.keys(entry.context).length > 0) {
    Object.assign(output, entry.context);
  }

  // Add data
  if (entry.data) {
    // If data is an object, merge it
    if (typeof entry.data === 'object' && !Array.isArray(entry.data)) {
      Object.assign(output, entry.data);
    } else {
      // Otherwise, add as data field
      output.data = entry.data;
    }
  }

  // Add error
  if (entry.error) {
    output.error = {
      message: entry.error.message,
      name: entry.error.name,
      stack: entry.error.stack,
    };
  }

  // Add metadata
  if (entry.metadata) {
    output.metadata = entry.metadata;
  }

  return JSON.stringify(output);
}
