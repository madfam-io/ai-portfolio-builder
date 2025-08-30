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

// Simplified APM using Vercel Analytics
export function startTransaction(name: string): {
  end: (context?: any) => void;
} {
  const startTime = Date.now();

  return {
    end: (context?: any) => {
      const duration = Date.now() - startTime;
      console.log(`Transaction ${name}: ${duration}ms`, context);
      // In production, would send to Vercel Analytics
    },
  };
}

export function setTransactionName(name: string): void {
  // No-op for compatibility
}

export function addTransactionContext(context: Record<string, any>): void {
  // No-op for compatibility
}

// Higher-order function for APM tracking
export function withAPMTracking<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const transaction = startTransaction(name);
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.finally(() => transaction.end());
      }
      transaction.end();
      return result;
    } catch (error) {
      transaction.end({ error: true });
      throw error;
    }
  }) as T;
}
