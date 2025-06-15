import { CacheService, cache } from '@/lib/cache/redis-cache.server';
import * as redis from 'redis';
import { logger } from '@/lib/utils/logger';

jest.mock('redis');
jest.mock('@/lib/utils/logger');

describe('Redis Cache Service', () => {
  let cacheService: CacheService;
  let mockRedisClient: jest.Mocked<redis.RedisClientType>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Redis client
    mockRedisClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      flushAll: jest.fn(),
      ping: jest.fn(),
      on: jest.fn(),
      quit: jest.fn(),
    } as any;

    (redis.createClient as jest.Mock).mockReturnValue(mockRedisClient);
    
    cacheService = new CacheService();
  });

  describe('Connection Management', () => {
    it('should connect to Redis on first operation', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      
      await cacheService.get('test-key');
      
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      const result = await cacheService.get('test-key');
      
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Redis connection failed',
        expect.any(Error)
      );
    });

    it('should use in-memory fallback when Redis unavailable', async () => {
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      await cacheService.set('fallback-key', 'fallback-value');
      const result = await cacheService.get('fallback-key');
      
      expect(result).toBe('fallback-value');
    });
  });

  describe('Basic Operations', () => {
    beforeEach(() => {
      mockRedisClient.connect.mockResolvedValue(undefined);
    });

    describe('get', () => {
      it('should retrieve cached values', async () => {
        const testData = { id: 1, name: 'Test' };
        mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));
        
        const result = await cacheService.get('test-key');
        
        expect(result).toEqual(testData);
        expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      });

      it('should return null for missing keys', async () => {
        mockRedisClient.get.mockResolvedValue(null);
        
        const result = await cacheService.get('missing-key');
        
        expect(result).toBeNull();
      });

      it('should handle malformed JSON gracefully', async () => {
        mockRedisClient.get.mockResolvedValue('invalid-json');
        
        const result = await cacheService.get('bad-key');
        
        expect(result).toBeNull();
        expect(logger.error).toHaveBeenCalled();
      });
    });

    describe('set', () => {
      it('should store values with default TTL', async () => {
        const testData = { id: 1, name: 'Test' };
        mockRedisClient.set.mockResolvedValue('OK');
        
        await cacheService.set('test-key', testData);
        
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify(testData),
          { EX: 3600 }
        );
      });

      it('should store values with custom TTL', async () => {
        mockRedisClient.set.mockResolvedValue('OK');
        
        await cacheService.set('test-key', 'value', 7200);
        
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify('value'),
          { EX: 7200 }
        );
      });

      it('should handle circular references', async () => {
        const circular: any = { a: 1 };
        circular.self = circular;
        
        await cacheService.set('circular-key', circular);
        
        expect(logger.error).toHaveBeenCalledWith(
          'Failed to serialize cache value',
          expect.any(Error)
        );
      });
    });

    describe('del', () => {
      it('should delete single key', async () => {
        mockRedisClient.del.mockResolvedValue(1);
        
        await cacheService.del('test-key');
        
        expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
      });

      it('should delete multiple keys', async () => {
        mockRedisClient.del.mockResolvedValue(3);
        
        await cacheService.del(['key1', 'key2', 'key3']);
        
        expect(mockRedisClient.del).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
      });
    });

    describe('clearPattern', () => {
      it('should clear keys matching pattern', async () => {
        mockRedisClient.keys.mockResolvedValue(['user:1', 'user:2', 'user:3']);
        mockRedisClient.del.mockResolvedValue(3);
        
        await cacheService.clearPattern('user:*');
        
        expect(mockRedisClient.keys).toHaveBeenCalledWith('user:*');
        expect(mockRedisClient.del).toHaveBeenCalledWith(['user:1', 'user:2', 'user:3']);
      });

      it('should handle no matching keys', async () => {
        mockRedisClient.keys.mockResolvedValue([]);
        
        await cacheService.clearPattern('nonexistent:*');
        
        expect(mockRedisClient.del).not.toHaveBeenCalled();
      });
    });
  });

  describe('Advanced Features', () => {
    beforeEach(() => {
      mockRedisClient.connect.mockResolvedValue(undefined);
    });

    describe('remember', () => {
      it('should return cached value if exists', async () => {
        const cachedData = { cached: true };
        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));
        
        const factory = jest.fn();
        const result = await cacheService.remember('test-key', factory);
        
        expect(result).toEqual(cachedData);
        expect(factory).not.toHaveBeenCalled();
      });

      it('should call factory and cache result if not exists', async () => {
        const freshData = { fresh: true };
        mockRedisClient.get.mockResolvedValue(null);
        mockRedisClient.set.mockResolvedValue('OK');
        
        const factory = jest.fn().mockResolvedValue(freshData);
        const result = await cacheService.remember('test-key', factory, 300);
        
        expect(result).toEqual(freshData);
        expect(factory).toHaveBeenCalled();
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify(freshData),
          { EX: 300 }
        );
      });

      it('should not cache null factory results', async () => {
        mockRedisClient.get.mockResolvedValue(null);
        
        const factory = jest.fn().mockResolvedValue(null);
        const result = await cacheService.remember('test-key', factory);
        
        expect(result).toBeNull();
        expect(mockRedisClient.set).not.toHaveBeenCalled();
      });
    });

    describe('getTTL', () => {
      it('should return remaining TTL', async () => {
        mockRedisClient.ttl.mockResolvedValue(120);
        
        const ttl = await cacheService.getTTL('test-key');
        
        expect(ttl).toBe(120);
      });

      it('should return -1 for non-existent keys', async () => {
        mockRedisClient.ttl.mockResolvedValue(-2);
        
        const ttl = await cacheService.getTTL('missing-key');
        
        expect(ttl).toBe(-1);
      });
    });

    describe('extend', () => {
      it('should extend TTL for existing keys', async () => {
        mockRedisClient.expire.mockResolvedValue(true);
        
        const result = await cacheService.extend('test-key', 7200);
        
        expect(result).toBe(true);
        expect(mockRedisClient.expire).toHaveBeenCalledWith('test-key', 7200);
      });
    });
  });

  describe('Decorator', () => {
    class TestService {
      callCount = 0;

      @cache.method('test-method', 300)
      async fetchData(id: string): Promise<any> {
        this.callCount++;
        return { id, data: 'test-data' };
      }

      @cache.method('complex-method')
      async complexMethod(obj: { id: string }, num: number): Promise<any> {
        return { ...obj, num };
      }
    }

    it('should cache method results', async () => {
      const service = new TestService();
      mockRedisClient.connect.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockRedisClient.set.mockResolvedValue('OK');

      const result1 = await service.fetchData('123');
      expect(service.callCount).toBe(1);

      // Second call should use cache
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(result1));
      const result2 = await service.fetchData('123');
      
      expect(service.callCount).toBe(1); // Not incremented
      expect(result2).toEqual(result1);
    });

    it('should generate unique cache keys for different arguments', async () => {
      const service = new TestService();
      mockRedisClient.connect.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockResolvedValue('OK');

      await service.complexMethod({ id: '1' }, 10);
      await service.complexMethod({ id: '2' }, 10);

      expect(mockRedisClient.set).toHaveBeenCalledTimes(2);
      const calls = (mockRedisClient.set as jest.Mock).mock.calls;
      expect(calls[0][0]).not.toBe(calls[1][0]); // Different cache keys
    });
  });

  describe('In-Memory Fallback', () => {
    it('should limit in-memory cache size', async () => {
      // Force fallback mode
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      // Fill cache beyond limit
      for (let i = 0; i < 1500; i++) {
        await cacheService.set(`key-${i}`, `value-${i}`);
      }

      // Early keys should be evicted
      const result = await cacheService.get('key-0');
      expect(result).toBeNull();
    });

    it('should handle TTL in fallback mode', async () => {
      jest.useFakeTimers();
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));
      
      await cacheService.set('ttl-key', 'value', 1); // 1 second TTL
      
      // Before expiry
      expect(await cacheService.get('ttl-key')).toBe('value');
      
      // After expiry
      jest.advanceTimersByTime(2000);
      expect(await cacheService.get('ttl-key')).toBeNull();
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.connect.mockResolvedValue(undefined);
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));
      
      const result = await cacheService.get('error-key');
      
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should reconnect on connection loss', async () => {
      mockRedisClient.connect.mockResolvedValue(undefined);
      
      // Simulate connection loss
      const errorHandler = (mockRedisClient.on as jest.Mock).mock.calls
        .find(call => call[0] === 'error')?.[1];
      
      if (errorHandler) {
        errorHandler(new Error('Connection lost'));
      }

      // Next operation should attempt reconnect
      mockRedisClient.get.mockResolvedValue(null);
      await cacheService.get('test-key');
      
      expect(mockRedisClient.connect).toHaveBeenCalledTimes(2);
    });
  });
});