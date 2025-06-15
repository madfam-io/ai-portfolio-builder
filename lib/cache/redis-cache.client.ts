/**
 * Client-side cache stub
 * This provides a no-op implementation for client-side code
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
 * No-op cache service for client-side
 */
class ClientCacheService {
  async connect(): Promise<void> {
    // No-op
  }

  async get<T = unknown>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T = unknown>(
    _key: string,
    _value: T,
    _ttl?: number
  ): Promise<void> {
    // No-op
  }

  async del(_key: string): Promise<void> {
    // No-op
  }

  async clearPattern(_pattern: string): Promise<void> {
    // No-op
  }

  async disconnect(): Promise<void> {
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
