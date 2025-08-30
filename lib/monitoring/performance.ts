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

// Simplified performance tracking using Vercel Web Vitals
export function trackPerformance(
  name: string,
  value: number,
  context?: Record<string, any>
): void {
  console.log(`Performance: ${name} = ${value}ms`, context);
  // In production, would send to Vercel Analytics
}

export function trackWebVitals(metric: any): void {
  console.log('Web Vital:', metric.name, '=', metric.value, metric.rating);
  // In production, would send to Vercel Analytics
}

export function reportWebVitals(metric: any): void {
  trackWebVitals(metric);
}
