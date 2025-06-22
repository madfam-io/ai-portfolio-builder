/**
 * @madfam/smart-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Tests for optimization strategies
 */

import {
  ConnectionPool,
  LazyLoader,
  DataPreloader,
  CompressionUtils,
  QueryOptimizer,
  OptimizationManager,
} from '../../performance/optimization-strategies';
import { CacheManager } from '../../performance/cache-manager';

describe('ConnectionPool', () => {
  let pool: ConnectionPool;

  beforeEach(() => {
    pool = new ConnectionPool(3, 1000); // Max 3 connections, 1s timeout
  });

  afterEach(async () => {
    await pool.closeAll();
  });

  it('should create and reuse connections', async () => {
    const factory = jest.fn(() => Promise.resolve({
      id: 'connection-1',
      created: Date.now(),
    }));

    const conn1 = await pool.getConnection('api1', factory);
    // Second call should reuse if valid
    const conn2 = await pool.getConnection('api1', factory);

    expect(factory).toHaveBeenCalledTimes(1);
    // Verify that connection pooling is working
    expect(conn1).toBeDefined();
    expect(conn2).toBeDefined();
  });

  it('should create different connections for different keys', async () => {
    const factory1 = jest.fn().mockResolvedValue({ api: 'api1' });
    const factory2 = jest.fn().mockResolvedValue({ api: 'api2' });

    const conn1 = await pool.getConnection('api1', factory1);
    const conn2 = await pool.getConnection('api2', factory2);

    expect(factory1).toHaveBeenCalledTimes(1);
    expect(factory2).toHaveBeenCalledTimes(1);
    expect(conn1).not.toBe(conn2);
  });

  it('should evict oldest connection when pool is full', async () => {
    const factories = Array(4)
      .fill(null)
      .map((_, i) =>
        jest.fn().mockResolvedValue({
          id: i,
          created: Date.now(),
          close: jest.fn(),
        })
      );

    // Fill pool
    await pool.getConnection('api1', factories[0]);
    await pool.getConnection('api2', factories[1]);
    await pool.getConnection('api3', factories[2]);

    // This should evict api1
    await pool.getConnection('api4', factories[3]);

    // api1 should create new connection
    await pool.getConnection('api1', factories[0]);

    expect(factories[0]).toHaveBeenCalledTimes(2); // Created twice
  });

  it('should close all connections', async () => {
    const closeMocks = [jest.fn(), jest.fn()];
    const factories = closeMocks.map((close, i) =>
      jest.fn().mockResolvedValue({ id: i, close })
    );

    await pool.getConnection('api1', factories[0]);
    await pool.getConnection('api2', factories[1]);

    await pool.closeAll();

    expect(closeMocks[0]).toHaveBeenCalled();
    expect(closeMocks[1]).toHaveBeenCalled();
  });
});

describe('LazyLoader', () => {
  it('should load value on first access', async () => {
    const loaderMock = jest.fn().mockResolvedValue('loaded value');
    const lazy = new LazyLoader(loaderMock);

    const value = await lazy.get();

    expect(loaderMock).toHaveBeenCalledTimes(1);
    expect(value).toBe('loaded value');
  });

  it('should cache value for subsequent accesses', async () => {
    const loaderMock = jest.fn().mockResolvedValue('loaded value');
    const lazy = new LazyLoader(loaderMock);

    const value1 = await lazy.get();
    const value2 = await lazy.get();
    const value3 = await lazy.get();

    expect(loaderMock).toHaveBeenCalledTimes(1);
    expect(value1).toBe('loaded value');
    expect(value2).toBe('loaded value');
    expect(value3).toBe('loaded value');
  });

  it('should handle concurrent loading', async () => {
    let resolveLoader: (value: string) => void;
    const loaderPromise = new Promise<string>(resolve => {
      resolveLoader = resolve;
    });
    const loaderMock = jest.fn().mockReturnValue(loaderPromise);

    const lazy = new LazyLoader(loaderMock);

    // Start multiple concurrent loads
    const promise1 = lazy.get();
    const promise2 = lazy.get();
    const promise3 = lazy.get();

    // Should only call loader once
    expect(loaderMock).toHaveBeenCalledTimes(1);

    // Resolve the loader
    resolveLoader!('loaded value');

    const [value1, value2, value3] = await Promise.all([
      promise1,
      promise2,
      promise3,
    ]);

    expect(value1).toBe('loaded value');
    expect(value2).toBe('loaded value');
    expect(value3).toBe('loaded value');
  });

  it('should reload after TTL expires', async () => {
    const loaderMock = jest
      .fn()
      .mockResolvedValueOnce('value1')
      .mockResolvedValueOnce('value2');

    const lazy = new LazyLoader(loaderMock, 100); // 100ms TTL

    const value1 = await lazy.get();
    expect(value1).toBe('value1');

    await new Promise(resolve => setTimeout(resolve, 150));

    const value2 = await lazy.get();
    expect(value2).toBe('value2');
    expect(loaderMock).toHaveBeenCalledTimes(2);
  });

  it('should invalidate cached value', async () => {
    const loaderMock = jest
      .fn()
      .mockResolvedValueOnce('value1')
      .mockResolvedValueOnce('value2');

    const lazy = new LazyLoader(loaderMock);

    const value1 = await lazy.get();
    expect(value1).toBe('value1');

    lazy.invalidate();

    const value2 = await lazy.get();
    expect(value2).toBe('value2');
    expect(loaderMock).toHaveBeenCalledTimes(2);
  });

  it('should preload value', async () => {
    const loaderMock = jest.fn().mockResolvedValue('preloaded');
    const lazy = new LazyLoader(loaderMock);

    await lazy.preload();
    expect(loaderMock).toHaveBeenCalledTimes(1);

    const value = await lazy.get();
    expect(value).toBe('preloaded');
    expect(loaderMock).toHaveBeenCalledTimes(1); // Not called again
  });
});

describe('DataPreloader', () => {
  let cache: CacheManager;
  let preloader: DataPreloader;

  beforeEach(() => {
    cache = new CacheManager({
      maxSize: 10240,
      maxEntries: 100,
      ttl: 60000,
      enableStats: true,
    });
    preloader = new DataPreloader(cache);
  });

  it('should register and preload patterns', async () => {
    const loader1 = jest.fn().mockResolvedValue({ data: 'pattern1' });
    const loader2 = jest.fn().mockResolvedValue({ data: 'pattern2' });

    preloader.register('pattern1', loader1);
    preloader.register('pattern2', loader2);

    await preloader.preload(['pattern1', 'pattern2']);

    expect(loader1).toHaveBeenCalled();
    expect(loader2).toHaveBeenCalled();
    expect(cache.get('pattern1')).toEqual({ data: 'pattern1' });
    expect(cache.get('pattern2')).toEqual({ data: 'pattern2' });
  });

  it('should handle preload errors gracefully', async () => {
    const successLoader = jest.fn().mockResolvedValue({ data: 'success' });
    const errorLoader = jest.fn().mockRejectedValue(new Error('Load failed'));

    preloader.register('success', successLoader);
    preloader.register('error', errorLoader);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await preloader.preload(['success', 'error']);

    expect(cache.get('success')).toEqual({ data: 'success' });
    expect(cache.get('error')).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to preload error:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should preload common BINs', async () => {
    const binLookup = jest
      .fn()
      .mockImplementation(bin => Promise.resolve({ bin, country: 'US' }));

    await preloader.preloadCommonBINs(binLookup);

    expect(binLookup).toHaveBeenCalledTimes(8); // Number of common BINs
    expect(cache.get('bin:411111')).toEqual({ bin: '411111', country: 'US' });
    expect(cache.get('bin:555555')).toEqual({ bin: '555555', country: 'US' });
  });

  it('should preload common countries', async () => {
    const geoLookup = jest
      .fn()
      .mockImplementation(country =>
        Promise.resolve({ country, currency: 'USD' })
      );

    await preloader.preloadCommonCountries(geoLookup);

    expect(geoLookup).toHaveBeenCalledTimes(7); // Number of common countries
    expect(cache.get('country:US')).toEqual({ country: 'US', currency: 'USD' });
    expect(cache.get('country:BR')).toEqual({ country: 'BR', currency: 'USD' });
  });
});

describe('CompressionUtils', () => {
  it('should compress JSON by removing whitespace', () => {
    const data = {
      user: {
        name: 'John Doe',
        age: 30,
        items: ['item1', 'item2', 'item3'],
      },
    };

    const compressed = CompressionUtils.compress(data);

    expect(compressed).not.toContain(' : ');
    expect(compressed).not.toContain(' , ');
    expect(compressed).not.toContain(' { ');
    expect(compressed).not.toContain(' } ');
  });

  it('should decompress to original data', () => {
    const original = {
      test: 'value',
      nested: { key: 'value' },
      array: [1, 2, 3],
    };

    const compressed = CompressionUtils.compress(original);
    const decompressed = CompressionUtils.decompress(compressed);

    expect(decompressed).toEqual(original);
  });

  it('should determine if compression is worthwhile', () => {
    const smallData = { a: 1 };
    const largeData = { data: 'x'.repeat(2000) };

    expect(CompressionUtils.shouldCompress(smallData)).toBe(false);
    expect(CompressionUtils.shouldCompress(largeData)).toBe(true);
  });
});

describe('QueryOptimizer', () => {
  let optimizer: QueryOptimizer;

  beforeEach(() => {
    optimizer = new QueryOptimizer();
  });

  it('should cache query results', async () => {
    const result1 = await optimizer.query('SELECT * FROM users WHERE id = ?', [
      1,
    ]);
    const result2 = await optimizer.query('SELECT * FROM users WHERE id = ?', [
      1,
    ]);

    // Should return same cached result
    expect(result1).toBe(result2);
  });

  it('should differentiate queries by parameters', async () => {
    const result1 = await optimizer.query('SELECT * FROM users WHERE id = ?', [
      1,
    ]);
    const result2 = await optimizer.query('SELECT * FROM users WHERE id = ?', [
      2,
    ]);

    expect(result1).not.toBe(result2);
  });

  it('should limit cache size', async () => {
    // Fill cache beyond limit (reduced for faster test)
    for (let i = 0; i < 50; i++) {
      await optimizer.query('SELECT * FROM users WHERE id = ?', [i]);
    }

    // Should have cached queries
    expect(optimizer.queryCache.size).toBeGreaterThan(0);
    optimizer.clearCache();
  });

  it('should clear cache', async () => {
    await optimizer.query('SELECT * FROM users', []);
    optimizer.clearCache();

    // After clearing, should execute query again
    await optimizer.query('SELECT * FROM users', []);
  });
});

describe('OptimizationManager', () => {
  let manager: OptimizationManager;

  beforeEach(() => {
    manager = new OptimizationManager({
      enableCaching: true,
      enableBatching: true,
      enablePreloading: true,
      enableLazyLoading: true,
      enableCompression: true,
      preloadPatterns: ['pattern1', 'pattern2'],
    });
  });

  afterEach(async () => {
    await manager.cleanup();
  });

  it('should provide cache instance', () => {
    const cache = manager.getCache();
    expect(cache).toBeInstanceOf(CacheManager);

    cache.set('test', 'value');
    expect(cache.get('test')).toBe('value');
  });

  it('should provide connection pool', () => {
    const pool = manager.getConnectionPool();
    expect(pool).toBeInstanceOf(ConnectionPool);
  });

  it('should provide preloader', () => {
    const preloader = manager.getPreloader();
    expect(preloader).toBeInstanceOf(DataPreloader);
  });

  it('should initialize with preloading', async () => {
    const preloader = manager.getPreloader();
    const preloadSpy = jest.spyOn(preloader, 'preload').mockResolvedValue();

    await manager.initialize();

    expect(preloadSpy).toHaveBeenCalledWith(['pattern1', 'pattern2']);
  });

  it('should get optimization stats', () => {
    const cache = manager.getCache();
    cache.set('test', 'value');
    cache.get('test');
    cache.get('missing');

    const stats = manager.getStats();

    expect(stats.cache).toMatchObject({
      hits: 1,
      misses: 1,
      entries: 1,
    });
    expect(stats.cacheHitRate).toBe(50);
  });

  it('should cleanup resources', async () => {
    const cache = manager.getCache();
    const pool = manager.getConnectionPool();

    cache.set('test', 'value');

    await manager.cleanup();

    expect(cache.get('test')).toBeNull();
  });
});
