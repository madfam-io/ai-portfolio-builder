/**
 * @madfam/logger
 * 
 * Time formatting utilities
 */

import fecha from 'fecha';

/**
 * Get formatted timestamp
 */
export function getTimestamp(format?: boolean | string): string {
  if (format === false) {
    return '';
  }

  const now = new Date();
  
  if (typeof format === 'string') {
    return fecha.format(now, format);
  }

  // Default format
  return fecha.format(now, 'YYYY-MM-DD HH:mm:ss.SSS');
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  
  if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}