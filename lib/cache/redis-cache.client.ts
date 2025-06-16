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
const cache = new ClientCacheService();

/**
 * No-op cache decorator for client-side
 */
function Cacheable(_keyPrefix: string, _ttl?: number) {
  return function (
    _target: unknown,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    return descriptor;
  };
}
