/**
 * @madfam/smart-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Tests for cache manager performance optimization
 */

import { CacheManager, MultiLevelCache } from '../../performance/cache-manager';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager({
      maxSize: 1024 * 10, // 10KB
      maxEntries: 100,
      ttl: 1000, // 1 second
      enableStats: true,
    });
  });

  describe('Basic operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for missing keys', () => {
      expect(cache.get('missing')).toBeNull();
    });

    it('should handle different data types', () => {
      cache.set('string', 'test');
      cache.set('number', 123);
      cache.set('boolean', true);
      cache.set('object', { foo: 'bar' });
      cache.set('array', [1, 2, 3]);

      expect(cache.get('string')).toBe('test');
      expect(cache.get('number')).toBe(123);
      expect(cache.get('boolean')).toBe(true);
      expect(cache.get('object')).toEqual({ foo: 'bar' });
      expect(cache.get('array')).toEqual([1, 2, 3]);
    });

    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.delete('key1')).toBe(false);
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('TTL expiration', () => {
    it('should expire values after TTL', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      expect(cache.get('key1')).toBe('value1');

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeNull();
    });

    it('should use custom TTL over default', async () => {
      cache.set('key1', 'value1', 2000); // 2s TTL

      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(cache.get('key1')).toBe('value1'); // Still valid
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used items when maxEntries reached', () => {
      const smallCache = new CacheManager({
        maxSize: 1024 * 100,
        maxEntries: 3,
        ttl: 60000,
        enableStats: true,
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Access key1 to make it more recent
      smallCache.get('key1');

      // Add new item, should evict key2
      smallCache.set('key4', 'value4');

      expect(smallCache.get('key1')).toBe('value1');
      expect(smallCache.get('key2')).toBeNull(); // Evicted
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('should respect size limit configuration', () => {
      const sizeCache = new CacheManager({
        maxSize: 50,
        maxEntries: 1000,
        ttl: 60000,
        enableStats: true,
      });

      sizeCache.set('key1', 'short'); // 10 bytes
      sizeCache.set('key2', 'medium'); // 12 bytes
      
      // Both should fit within the 50 byte limit
      expect(sizeCache.get('key1')).toBe('short');
      expect(sizeCache.get('key2')).toBe('medium');
      
      const stats = sizeCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(50);
    });

    it('should call onEvict callback', () => {
      const onEvict = jest.fn();
      const evictCache = new CacheManager({
        maxSize: 1024,
        maxEntries: 2,
        ttl: 60000,
        enableStats: true,
        onEvict,
      });

      evictCache.set('key1', 'value1');
      evictCache.set('key2', 'value2');
      evictCache.set('key3', 'value3');

      expect(onEvict).toHaveBeenCalledWith('key1', 'value1');
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('key1'); // Hit
      cache.get('missing'); // Miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it('should calculate hit rate', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('key1'); // Hit
      cache.get('key1'); // Hit
      cache.get('missing'); // Miss

      expect(cache.getHitRate()).toBe(75); // 3/4 = 75%
    });

    it('should track evictions', () => {
      const evictCache = new CacheManager({
        maxSize: 100,
        maxEntries: 2,
        ttl: 60000,
        enableStats: true,
      });

      evictCache.set('key1', 'value1');
      evictCache.set('key2', 'value2');
      evictCache.set('key3', 'value3'); // Causes eviction

      const stats = evictCache.getStats();
      expect(stats.evictions).toBe(1);
    });

    it('should track size and entries', () => {
      cache.set('key1', 'test');
      cache.set('key2', { foo: 'bar' });

      const stats = cache.getStats();
      expect(stats.entries).toBe(2);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Prewarm', () => {
    it('should prewarm cache with entries', async () => {
      await cache.prewarm([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2', ttl: 5000 },
        { key: 'key3', value: { data: 'test' } },
      ]);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toEqual({ data: 'test' });
    });
  });

  describe('Size estimation', () => {
    it('should estimate sizes correctly', () => {
      cache.set('string', 'hello'); // ~10 bytes
      cache.set('number', 42); // 8 bytes
      cache.set('boolean', true); // 4 bytes
      cache.set('null', null); // 0 bytes
      cache.set('object', { a: 1, b: 2 }); // ~24 bytes

      const stats = cache.getStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.size).toBeLessThan(1024); // Should be reasonable
    });
  });
});

describe('MultiLevelCache', () => {
  let multiCache: MultiLevelCache;

  beforeEach(() => {
    multiCache = new MultiLevelCache([
      {
        maxSize: 1024,
        maxEntries: 10,
        ttl: 100, // 100ms - L1 cache
        enableStats: true,
      },
      {
        maxSize: 10240,
        maxEntries: 100,
        ttl: 1000, // 1s - L2 cache
        enableStats: true,
      },
      {
        maxSize: 102400,
        maxEntries: 1000,
        ttl: 10000, // 10s - L3 cache
        enableStats: true,
      },
    ]);
  });

  it('should set values in all levels', () => {
    multiCache.set('key1', 'value1');

    // Should be available in all levels
    multiCache.get('key1').then(value => {
      expect(value).toBe('value1');
    });
  });

  it('should promote values to higher levels on access', async () => {
    // Set only in L3
    const caches = (multiCache as any).levels;
    caches[2].set('key1', 'value1');

    // Get should promote to L1 and L2
    const value = await multiCache.get('key1');
    expect(value).toBe('value1');

    // Check all levels have the value
    expect(caches[0].get('key1')).toBe('value1');
    expect(caches[1].get('key1')).toBe('value1');
    expect(caches[2].get('key1')).toBe('value1');
  });

  it('should handle TTL differences between levels', async () => {
    multiCache.set('key1', 'value1');

    // Wait for L1 to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should still get from L2
    const value = await multiCache.get('key1');
    expect(value).toBe('value1');
  });

  it('should clear all levels', () => {
    multiCache.set('key1', 'value1');
    multiCache.set('key2', 'value2');

    multiCache.clear();

    multiCache.get('key1').then(value => {
      expect(value).toBeNull();
    });
    multiCache.get('key2').then(value => {
      expect(value).toBeNull();
    });
  });

  it('should return aggregated stats', () => {
    multiCache.set('key1', 'value1');

    const stats = multiCache.getStats();
    expect(stats).toHaveLength(3); // 3 levels
    expect(stats[0]).toHaveProperty('hits');
    expect(stats[0]).toHaveProperty('misses');
  });
});
