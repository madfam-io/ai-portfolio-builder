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

// Unified event tracking using PostHog
export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  console.log('Event:', event, properties);
  // In production, would send to PostHog
}

export function track(event: string, properties?: Record<string, any>): void {
  trackEvent(event, properties);
}

export function identifyUser(
  userId: string,
  properties?: Record<string, any>
): void {
  console.log('User identified:', userId, properties);
  // In production, would send to PostHog
}
