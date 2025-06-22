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
