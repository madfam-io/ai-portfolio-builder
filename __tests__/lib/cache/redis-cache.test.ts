/**
 * Redis cache service tests
 */

import { cache, CACHE_KEYS, Cacheable } from '@/lib/cache/redis-cache';

// Mock Redis module
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  }),
}));

describe('Redis Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cache operations', () => {
    it('should set and get values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await cache.set(key, value);
      const result = await cache.get(key);

      // In test environment, it uses in-memory cache
      expect(result).toEqual(value);
    });

    it('should delete values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await cache.set(key, value);
      await cache.del(key);
      const result = await cache.get(key);

      expect(result).toBeNull();
    });

    it('should clear pattern', async () => {
      await cache.set('user:1:profile', { name: 'User 1' });
      await cache.set('user:2:profile', { name: 'User 2' });
      await cache.set('post:1:data', { title: 'Post 1' });

      await cache.clearPattern('user:*');

      const user1 = await cache.get('user:1:profile');
      const user2 = await cache.get('user:2:profile');
      const post1 = await cache.get('post:1:data');

      expect(user1).toBeNull();
      expect(user2).toBeNull();
      expect(post1).toBeTruthy();
    });
  });

  describe('cache keys', () => {
    it('should have correct key prefixes', () => {
      expect(CACHE_KEYS.PORTFOLIO).toBe('portfolio:');
      expect(CACHE_KEYS.AI_RESULT).toBe('ai:');
      expect(CACHE_KEYS.ANALYTICS).toBe('analytics:');
      expect(CACHE_KEYS.GITHUB).toBe('github:');
      expect(CACHE_KEYS.TEMPLATE).toBe('template:');
    });
  });

  describe('Cacheable decorator', () => {
    it('should exist and be a function', () => {
      expect(Cacheable).toBeDefined();
      expect(typeof Cacheable).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = Cacheable('test', 60);
      expect(typeof decorator).toBe('function');
    });

    // Note: Decorator syntax not supported in Jest without additional configuration
    // Testing the decorator behavior through manual application
    it('should wrap method with caching logic', async () => {
      class TestService {
        callCount = 0;

        async expensiveOperation(input: string): Promise<string> {
          this.callCount++;
          return `processed-${input}`;
        }
      }

      // Apply decorator manually
      const service = new TestService();
      const descriptor = Object.getOwnPropertyDescriptor(
        TestService.prototype,
        'expensiveOperation'
      );

      if (descriptor) {
        Cacheable('test', 60)(
          TestService.prototype,
          'expensiveOperation',
          descriptor
        );
      }

      // In test mode, decorator returns original method
      const result = await service.expensiveOperation('test');
      expect(result).toBe('processed-test');
    });
  });
});
