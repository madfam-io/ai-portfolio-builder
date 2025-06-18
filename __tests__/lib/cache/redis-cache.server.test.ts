import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import * as redis from 'redis';
import {
  cache,
  CACHE_KEYS,
  CacheService,
} from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';


// Mock dependencies
jest.mock('redis');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/config', () => ({
  env: {
    REDIS_URL: 'redis://localhost:6379',
  },
  services: {
    redis: true,
  },
}));

describe('Redis Cache Service', () => {
  let mockRedisClient: any;
  let cacheService: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Redis client
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      ping: jest.fn().mockResolvedValue('PONG'),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue(undefined),
    };

    (redis.createClient as jest.Mock).mockReturnValue(mockRedisClient);

    // Create new cache service instance
    cacheService = new CacheService();
  });

  describe('initialization', () => {
    it('should initialize Redis client when service is available', async () => {
      await cacheService.initialize();

      expect(redis.createClient).toHaveBeenCalledWith({
        url: 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: expect.any(Function),
        },
      });
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should handle Redis connection errors', async () => {
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));

      await cacheService.initialize();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to connect to Redis',
        expect.any(Error)

    });

    it('should use in-memory cache when Redis is not available', async () => {
      // Mock config without Redis
      jest.doMock('@/lib/config', () => ({
        services: { redis: false },
      }));

      const service = new CacheService();
      await service.initialize();

      // Should not try to create Redis client
      expect(redis.createClient).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should retrieve value from Redis', async () => {
      const mockData = { test: 'data' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockData));

      await cacheService.initialize();
      const result = await cacheService.get('test-key');

      expect(result).toEqual(mockData);
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent key', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      await cacheService.initialize();
      const result = await cacheService.get('non-existent');

      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      await cacheService.initialize();
      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle invalid JSON', async () => {
      mockRedisClient.get.mockResolvedValue('invalid json');

      await cacheService.initialize();
      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value in Redis with TTL', async () => {
      const data = { test: 'data' };

      await cacheService.initialize();
      await cacheService.set('test-key', data, 600);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        600,
        JSON.stringify(data)

    });

    it('should use default TTL when not specified', async () => {
      const data = { test: 'data' };

      await cacheService.initialize();
      await cacheService.set('test-key', data);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        300, // Default TTL
        JSON.stringify(data)

    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.setEx.mockRejectedValue(new Error('Redis error'));

      await cacheService.initialize();
      await cacheService.set('test-key', { data: 'test' });

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle large objects', async () => {
      const largeData = { data: 'x'.repeat(1000000) }; // 1MB string

      await cacheService.initialize();
      await cacheService.set('test-key', largeData);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        300,
        JSON.stringify(largeData)

    });
  });

  describe('del', () => {
    it('should delete key from Redis', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await cacheService.initialize();
      await cacheService.del('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle multiple keys', async () => {
      mockRedisClient.del.mockResolvedValue(3);

      await cacheService.initialize();
      await cacheService.del(['key1', 'key2', 'key3']);

      expect(mockRedisClient.del).toHaveBeenCalledWith([
        'key1',
        'key2',
        'key3',
      ]);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.del.mockRejectedValue(new Error('Redis error'));

      await cacheService.initialize();
      await cacheService.del('test-key');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('keys', () => {
    it('should retrieve keys matching pattern', async () => {
      const mockKeys = ['portfolio:123', 'portfolio:456'];
      mockRedisClient.keys.mockResolvedValue(mockKeys);

      await cacheService.initialize();
      const result = await cacheService.keys('portfolio:*');

      expect(result).toEqual(mockKeys);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('portfolio:*');
    });

    it('should return empty array on error', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'));

      await cacheService.initialize();
      const result = await cacheService.keys('test:*');

      expect(result).toEqual([]);
    });
  });

  describe('cache key helpers', () => {
    it('should have correct key prefixes', () => {
      expect(CACHE_KEYS.PORTFOLIO).toBe('portfolio:');
      expect(CACHE_KEYS.AI_RESULT).toBe('ai:');
      expect(CACHE_KEYS.ANALYTICS).toBe('analytics:');
      expect(CACHE_KEYS.GITHUB).toBe('github:');
      expect(CACHE_KEYS.TEMPLATE).toBe('template:');
    });
  });

  describe('in-memory fallback', () => {
    let inMemoryService: CacheService;

    beforeEach(() => {
      // Force in-memory cache
      jest.doMock('@/lib/config', () => ({
        services: { redis: false },
      }));
      inMemoryService = new CacheService();
    });

    it('should store and retrieve from in-memory cache', async () => {
      const data = { test: 'memory' };

      await inMemoryService.set('test-key', data);
      const result = await inMemoryService.get('test-key');

      expect(result).toEqual(data);
    });

    it('should respect TTL in memory cache', async () => {
      jest.useFakeTimers();

      await inMemoryService.set('test-key', { data: 'test' }, 1); // 1 second TTL

      // Advance time by 2 seconds
      jest.advanceTimersByTime(2000);

      const result = await inMemoryService.get('test-key');
      expect(result).toBeNull();

      jest.useRealTimers();
    });

    it('should handle memory limits', async () => {
      // Try to store data that exceeds memory limit
      const largeData = { data: 'x'.repeat(60 * 1024 * 1024) }; // 60MB

      await inMemoryService.set('large-key', largeData);
      const result = await inMemoryService.get('large-key');

      // Should not store due to memory limit
      expect(result).toBeNull();
    });

    it('should implement LRU eviction', async () => {
      // Fill cache to capacity
      for (let i = 0; i < 100; i++) {
        await inMemoryService.set(`key-${i}`, { data: i });
      }

      // Add one more, should evict oldest
      await inMemoryService.set('key-100', { data: 100 });

      // First key should be evicted
      const firstKey = await inMemoryService.get('key-0');
      expect(firstKey).toBeNull();

      // Last key should exist
      const lastKey = await inMemoryService.get('key-100');
      expect(lastKey).toEqual({ data: 100 });
    });
  });

  describe('error handling', () => {
    it('should reconnect on connection loss', async () => {
      const reconnectStrategy = (redis.createClient as jest.Mock).mock
        .calls[0][0].socket.reconnectStrategy;

      // Test reconnect strategy
      expect(reconnectStrategy(1)).toBe(Math.min(1 * 100, 3000));
      expect(reconnectStrategy(10)).toBe(3000); // Max delay
    });

    it('should handle circular references', async () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;

      await cacheService.initialize();
      await cacheService.set('circular', circularObj);

      // Should not throw
      expect(mockRedisClient.setEx).toHaveBeenCalled();
    });
  });
});
