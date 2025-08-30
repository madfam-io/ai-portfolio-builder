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

// Legacy SigNoz metrics stub
export function recordMetric(name: string, value: number, tags?: Record<string, string>): void {
  console.log(`Metric ${name}: ${value}`, tags);
}

export function incrementCounter(name: string, value = 1, tags?: Record<string, string>): void {
  console.log(`Counter ${name}: +${value}`, tags);
}

export function recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
  console.log(`Histogram ${name}: ${value}`, tags);
}

export function recordGauge(name: string, value: number, tags?: Record<string, string>): void {
  console.log(`Gauge ${name}: ${value}`, tags);
}

export function recordPerformanceMetric(name: string, value: number, tags?: Record<string, string>): void {
  console.log(`Performance metric ${name}: ${value}ms`, tags);
}