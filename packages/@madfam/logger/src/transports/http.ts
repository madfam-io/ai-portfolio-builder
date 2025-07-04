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
 * HTTP transport implementation
 */

import type { Transport, LogEntry, HttpTransportConfig } from '../types';
import { formatJson } from '../utils/format-json';

export class HttpTransport implements Transport {
  name = 'http';
  private config: HttpTransportConfig;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: HttpTransportConfig) {
    this.config = {
      method: 'POST',
      batchSize: 10,
      flushInterval: 5000,
      timeout: 30000,
      ...config,
    };

    // Start flush timer if configured
    if (this.config.flushInterval) {
      this.startFlushTimer();
    }
  }

  log(entry: LogEntry): void {
    this.buffer.push(entry);

    // Flush if buffer is full
    if (this.config.batchSize && this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const entries = this.buffer.splice(0, this.buffer.length);

    try {
      await this.sendBatch(entries);
    } catch (error) {
      // In production, we might want to retry or use a fallback
      // eslint-disable-next-line no-console
      console.error('Failed to send logs:', error);

      // Put entries back in buffer for retry
      this.buffer.unshift(...entries);
    }
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }

  private async sendBatch(entries: LogEntry[]): Promise<void> {
    const body = entries.map(entry => formatJson(entry)).join('\n');

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout || 30000
    );

    try {
      const response = await fetch(this.config.url, {
        method: this.config.method,
        headers: {
          'Content-Type': 'application/x-ndjson',
          ...this.config.headers,
        },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval || 5000);

    // Don't prevent process from exiting
    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }
}
