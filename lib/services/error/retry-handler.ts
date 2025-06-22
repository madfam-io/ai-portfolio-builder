/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Retry Handler
 * Implements retry logic with exponential backoff for transient failures
 */

import { AppError, ExternalServiceError } from '@/types/errors';
import { errorLogger } from './error-logger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: error => {
    // Retry on network errors and 5xx status codes
    if (error instanceof ExternalServiceError) {
      return true;
    }
    if (error instanceof AppError) {
      return error.statusCode >= 500 && error.statusCode < 600;
    }
    if (error instanceof Error) {
      return (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED')
      );
    }
    return false;
  },
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.retryCondition(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      // Log retry attempt
      errorLogger.logWarning(`Retry attempt ${attempt}/${opts.maxAttempts}`, {
        action: 'retry',
        metadata: {
          attempt,
          delay,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      // Call retry callback
      opts.onRetry(error, attempt);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly threshold: number = 5,
    public readonly timeout: number = 60000, // 1 minute
    private readonly retryTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.retryTimeout) {
        this.state = 'half-open';
      } else if (fallback) {
        return fallback();
      } else {
        throw new AppError(
          'Service temporarily unavailable',
          'CIRCUIT_BREAKER_OPEN',
          503
        );
      }
    }

    try {
      const result = await fn();

      // Reset on success
      if (this.state === 'half-open') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();

      if (this.failureCount >= this.threshold) {
        this.trip();
      }

      // Use fallback if available when circuit trips to open state
      if (fallback && this.failureCount >= this.threshold) {
        return fallback();
      }

      throw error;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  private trip(): void {
    this.state = 'open';
    errorLogger.logWarning('Circuit breaker tripped', {
      component: 'CircuitBreaker',
      metadata: {
        failureCount: this.failureCount,
        threshold: this.threshold,
      },
    });
  }

  private reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
    errorLogger.logInfo('Circuit breaker reset');
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}

/**
 * Debounced retry for user-triggered actions
 */
export function createDebouncedRetry<
  T extends (...args: any[]) => Promise<any>,
>(fn: T, delay: number = 1000): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;

  return ((...args: Parameters<T>) => {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...(lastArgs as Parameters<T>));
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          timeoutId = null;
          lastArgs = null;
        }
      }, delay);
    });
  }) as T;
}

/**
 * Utility sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        timeoutError ||
          new AppError(
            `Operation timed out after ${timeoutMs}ms`,
            'TIMEOUT',
            408
          )
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]);
}
