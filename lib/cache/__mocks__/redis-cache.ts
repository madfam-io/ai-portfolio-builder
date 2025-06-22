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
 * Mock cache service for testing
 */

export const CACHE_KEYS = {
  PORTFOLIO: 'portfolio:',
  AI_RESULT: 'ai:',
  ANALYTICS: 'analytics:',
  GITHUB: 'github:',
  TEMPLATE: 'template:',
} as const;

class MockCacheService {
  private mockCache = new Map<string, unknown>();

  connect(): void {
    // Mock connection
  }

  get<T = unknown>(key: string): T | null {
    return this.mockCache.get(key) || null;
  }

  set<T = unknown>(key: string, value: T, _ttl?: number): void {
    this.mockCache.set(key, value);
  }

  del(key: string): void {
    this.mockCache.delete(key);
  }

  clearPattern(pattern: string): void {
    const keys = Array.from(this.mockCache.keys());
    keys.forEach(key => {
      if (key.includes(pattern.replace('*', ''))) {
        this.mockCache.delete(key);
      }
    });
  }

  disconnect(): void {
    this.mockCache.clear();
  }
}

export const cache = new MockCacheService();

export function Cacheable(_keyPrefix: string, _ttl?: number) {
  return function (
    _target: unknown,
    _propertyName: string,
    _descriptor: PropertyDescriptor
  ) {
    // Return original method in tests
    return _descriptor;
  };
}
