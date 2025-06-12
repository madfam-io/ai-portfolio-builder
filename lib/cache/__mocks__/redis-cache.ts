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
  private mockCache = new Map<string, any>();

  async connect(): Promise<void> {
    // Mock connection
  }

  async get<T = any>(key: string): Promise<T | null> {
    return this.mockCache.get(key) || null;
  }

  async set<T = any>(key: string, value: T, _ttl?: number): Promise<void> {
    this.mockCache.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.mockCache.delete(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const keys = Array.from(this.mockCache.keys());
    keys.forEach(key => {
      if (key.includes(pattern.replace('*', ''))) {
        this.mockCache.delete(key);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.mockCache.clear();
  }
}

export const cache = new MockCacheService();

export function Cacheable(_keyPrefix: string, _ttl?: number) {
  return function (
    _target: any,
    _propertyName: string,
    _descriptor: PropertyDescriptor
  ) {
    // Return original method in tests
    return _descriptor;
  };
}
