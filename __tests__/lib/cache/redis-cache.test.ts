import { RedisCache } from '@/lib/cache/redis-cache';

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  flushall: jest.fn(),
  quit: jest.fn(),
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  isOpen: true,
};

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient),
}));

describe('RedisCache', () => {
  let cache: RedisCache;

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new RedisCache();
  });

  describe('Cache operations', () => {
    it('should get a value from cache', async () => {
      mockRedisClient.get.mockResolvedValue('{"test": "value"}');

      const result = await cache.get('test-key');
      expect(result).toEqual({ test: 'value' });
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    });

    it('should set a value in cache', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await cache.set('test-key', { test: 'value' }, 3600);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test-key',
        '{"test":"value"}',
        { EX: 3600 }
      );
    });

    it('should delete a value from cache', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await cache.del('test-key');
      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
    });

    it('should clear all cache', async () => {
      mockRedisClient.flushall.mockResolvedValue('OK');

      await cache.clear();
      expect(mockRedisClient.flushall).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Connection failed'));

      const result = await cache.get('test-key');
      expect(result).toBeNull();
    });
  });
});
