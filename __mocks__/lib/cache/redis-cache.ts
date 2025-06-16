/**
 * Mock for Redis cache service
 */

// Key prefixes for different cache types
export const CACHE_KEYS = {
  PORTFOLIO: 'portfolio:',
  AI_RESULT: 'ai:',
  ANALYTICS: 'analytics:',
  GITHUB: 'github:',
  TEMPLATE: 'template:',
} as const;

/**
 * Mock cache service
 */
export class RedisCache {
  private store = new Map<string, unknown>();

  connect(): void {
    // Mock implementation
  }

  get<T = unknown>(key: string): T | null {
    const value = this.store.get(key);
    return (value as T) ?? null;
  }

  set<T = unknown>(key: string, value: T, _ttl?: number): void {
    this.store.set(key, value);
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  disconnect(): void {
    this.store.clear();
  }
}

// Export singleton instance
export const cache = new RedisCache();

/**
 * Mock cache decorator
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
