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
 * Console transport implementation
 */

import type { Transport, LogEntry, ConsoleTransportConfig } from '../types';
import { formatPretty } from '../utils/format-pretty';
import { formatJson } from '../utils/format-json';

export class ConsoleTransport implements Transport {
  name = 'console';
  private config: ConsoleTransportConfig;

  constructor(config: ConsoleTransportConfig) {
    this.config = config;
  }

  log(entry: LogEntry): void {
    const output = this.config.pretty
      ? formatPretty(entry, { colors: this.config.colors !== false })
      : formatJson(entry);

    // Use appropriate console method based on level
    switch (entry.level) {
      case 'trace':
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(output);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(output);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(output);
        break;
      case 'error':
      case 'fatal':
        // eslint-disable-next-line no-console
        console.error(output);
        break;
    }
  }

  // No flush needed for console
  flush(): void {
    // No-op
  }

  // No close needed for console
  close(): void {
    // No-op
  }
}
