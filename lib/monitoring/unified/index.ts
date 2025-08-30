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

// Unified monitoring exports
export { trackEvent, identifyUser } from './events';

// Simplified unified monitoring class
export class UnifiedMonitoring {
  static track(event: string, properties?: Record<string, any>): void {
    console.log('Unified tracking:', event, properties);
  }

  static error(error: Error, context?: Record<string, any>): void {
    console.error('Unified error:', error.message, context);
  }

  static performance(metric: string, value: number): void {
    console.log('Unified performance:', metric, value);
  }
}

export default UnifiedMonitoring;

// Additional exports for backward compatibility
export function withAPMTracking<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return fn; // Simplified - just pass through
}
