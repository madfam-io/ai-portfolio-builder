/**
 * Simple logger utility
 */

export class Logger {
  constructor(private context: string) {}

  info(message: string, meta?: any) {
    console.log(`[${this.context}] ${message}`, meta || '');
  }

  warn(message: string, meta?: any) {
    console.warn(`[${this.context}] ${message}`, meta || '');
  }

  error(message: string, meta?: any) {
    console.error(`[${this.context}] ${message}`, meta || '');
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.context}] DEBUG: ${message}`, meta || '');
    }
  }
}
