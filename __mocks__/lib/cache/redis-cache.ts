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

  async connect(): Promise<void> {
    // Mock implementation
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    return this.store.get(key) || null;
  }

  async set<T = unknown>(key: string, value: T, _ttl?: number): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async disconnect(): Promise<void> {
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