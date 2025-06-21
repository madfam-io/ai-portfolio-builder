/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Client-side cache stub
 * This provides a no-op implementation for client-side code
 */

// Key prefixes for different cache types
const CACHE_KEYS = {
  PORTFOLIO: 'portfolio:',
  AI_RESULT: 'ai:',
  ANALYTICS: 'analytics:',
  GITHUB: 'github:',
  TEMPLATE: 'template:',
} as const;

/**
 * No-op cache service for client-side
 */
class ClientCacheService {
  connect(): void {
    // No-op
  }

  get<T = unknown>(_key: string): T | null {
    return null;
  }

  set<T = unknown>(_key: string, _value: T, _ttl?: number): void {
    // No-op
  }

  del(_key: string): void {
    // No-op
  }

  clearPattern(_pattern: string): void {
    // No-op
  }

  disconnect(): void {
    // No-op
  }
}

// Export singleton instance
export const cache = new ClientCacheService();

/**
 * No-op cache decorator for client-side
 */
export function Cacheable(_keyPrefix: string, _ttl?: number) {
  return function (
    _target: unknown,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    return descriptor;
  };
}

// Export cache keys for consistency with server implementation
export { CACHE_KEYS };
