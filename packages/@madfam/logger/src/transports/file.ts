/**
 * @madfam/logger
 *
 * File transport implementation (placeholder)
 */

import type { Transport, LogEntry, FileTransportConfig } from '../types';
import { formatJson } from '../utils/format-json';

export class FileTransport implements Transport {
  name = 'file';
  private config: FileTransportConfig;

  constructor(config: FileTransportConfig) {
    this.config = config;
  }

  log(entry: LogEntry): void {
    // In a real implementation, this would write to a file
    // For now, just log to console that we would write
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(
        `[FileTransport] Would write to ${this.config.filename}:`,
        formatJson(entry)
      );
    }
  }

  flush(): void {
    // Would flush any buffered writes
  }

  close(): void {
    // Would close file handles
  }
}
