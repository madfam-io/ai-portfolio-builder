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
 * Core type definitions
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  data?: any;
  error?: Error;
  context?: Record<string, unknown>;
  metadata?: LogMetadata;
}

export interface LogMetadata {
  hostname?: string;
  pid?: number;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  duration?: number;
  [key: string]: any;
}

export interface LoggerConfig {
  // Basic configuration
  service: string;
  level?: LogLevel;

  // Output configuration
  pretty?: boolean;
  json?: boolean;
  timestamp?: boolean | string; // true, false, or format string

  // Redaction
  redact?: string[];
  redactPaths?: string[];

  // Context
  defaultFields?: Record<string, unknown>;

  // Transports
  transports?: Transport[] | TransportConfig[];

  // Performance
  bufferSize?: number;
  flushInterval?: number;

  // Environment specific
  processInfo?: boolean;
  systemInfo?: boolean;
  userAgent?: boolean;
  request?: Request;
}

export interface Transport {
  name: string;
  level?: LogLevel;
  log(entry: LogEntry): Promise<void> | void;
  flush?(): Promise<void> | void;
  close?(): Promise<void> | void;
}

export interface TransportConfig {
  type: 'console' | 'file' | 'http' | 'datadog' | 'cloudwatch' | string;
  level?: LogLevel;
  [key: string]: any;
}

export interface ConsoleTransportConfig extends TransportConfig {
  type: 'console';
  pretty?: boolean;
  colors?: boolean;
}

export interface FileTransportConfig extends TransportConfig {
  type: 'file';
  filename: string;
  maxSize?: string;
  maxFiles?: number;
  compress?: boolean;
}

export interface HttpTransportConfig extends TransportConfig {
  type: 'http';
  url: string;
  method?: string;
  headers?: Record<string, string>;
  batchSize?: number;
  flushInterval?: number;
  timeout?: number;
  retry?: {
    attempts?: number;
    delay?: number;
    backoff?: boolean;
  };
}

export interface DatadogTransportConfig extends TransportConfig {
  type: 'datadog';
  apiKey: string;
  site?: string;
  service?: string;
  source?: string;
  tags?: string[];
  batchSize?: number;
  flushInterval?: number;
}

export interface CloudWatchTransportConfig extends TransportConfig {
  type: 'cloudwatch';
  region: string;
  logGroup: string;
  logStream: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  batchSize?: number;
  flushInterval?: number;
}

export interface Timer {
  done(message: string, data?: any): void;
  elapsed(): number;
}

export interface Logger<
  TEvents extends Record<string, unknown> = Record<string, unknown>,
> {
  // Basic logging methods
  trace(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error | any, data?: any): void;
  fatal(message: string, error?: Error | any, data?: any): void;

  // Typed event logging
  info<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
  warn<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
  error<K extends keyof TEvents>(
    event: K,
    error: Error,
    data: TEvents[K]
  ): void;

  // Child logger
  child(context: Record<string, unknown>): Logger<TEvents>;

  // Timer
  startTimer(): Timer;

  // Transport management
  addTransport(transport: Transport | TransportConfig): void;
  removeTransport(name: string): void;

  // Flush all transports
  flush(): Promise<void>;

  // Close logger
  close(): Promise<void>;
}

// Utility types
export type LogLevelValue = {
  [K in LogLevel]: number;
};

export interface PrettyPrintOptions {
  colors: boolean;
  timestamp: boolean | string;
  align: boolean;
  singleLine: boolean;
}
