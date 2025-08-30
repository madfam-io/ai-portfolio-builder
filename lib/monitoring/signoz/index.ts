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

// Legacy SigNoz stub - now using Vercel Analytics
export function initSigNoz(): void {
  console.log('SigNoz monitoring stub initialized');
}

export function trackTrace(name: string, fn: () => any): any {
  const start = Date.now();
  const result = fn();
  const duration = Date.now() - start;
  console.log(`Trace ${name}: ${duration}ms`);
  return result;
}

export async function trackAsyncTrace<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  console.log(`Async trace ${name}: ${duration}ms`);
  return result;
}

// Additional SigNoz compatibility functions
export function getCurrentTraceId(): string {
  return 'stub-trace-id';
}

export function addSpanAttributes(attributes: Record<string, any>): void {
  console.log('Span attributes:', attributes);
}
