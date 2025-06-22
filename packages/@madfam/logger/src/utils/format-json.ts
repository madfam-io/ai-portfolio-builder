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