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

// Simplified error tracking
export function trackError(error: Error, context?: Record<string, any>): void {
  console.error('Error:', error.message, context);
  // In production, would send to Vercel Analytics or external service
}

export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  trackError(error, context);
}

// Higher-order function for error tracking
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          trackError(error, { function: fn.name, context, args });
          throw error;
        });
      }
      return result;
    } catch (error) {
      trackError(error as Error, { function: fn.name, context, args });
      throw error;
    }
  }) as T;
}
