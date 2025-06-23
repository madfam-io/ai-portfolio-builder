/**
 * @madfam/smart-fiat-payments
 *
 * World-class payment gateway detection and routing system with AI-powered optimization
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Performance optimization strategies
 * Implements various techniques to improve system performance
 */

import { CacheManager } from './cache-manager';
import { RequestBatcher } from './request-batcher';

interface OptimizationConfig {
  enableCaching: boolean;
  enableBatching: boolean;
  enablePreloading: boolean;
  enableLazyLoading: boolean;
  enableCompression: boolean;
  preloadPatterns?: string[];
}

/**
 * Connection pooling for external APIs
 */
export class ConnectionPool {
  private connections: Map<string, any> = new Map();
  private maxConnections: number;
  private connectionTimeout: number;

  constructor(maxConnections = 10, connectionTimeout = 30000) {
    this.maxConnections = maxConnections;
    this.connectionTimeout = connectionTimeout;
  }

  /**
   * Get or create connection
   */
  async getConnection(key: string, factory: () => Promise<unknown>): Promise<unknown> {
    const existing = this.connections.get(key);

    if (existing && existing.isValid()) {
      return existing;
    }

    if (this.connections.size >= this.maxConnections) {
      await this.evictOldest();
    }

    const connection = await factory();
    this.connections.set(key, {
      connection,
      created: Date.now(),
      isValid: () => Date.now() - connection.created < this.connectionTimeout,
    });

    return connection;
  }

  /**
   * Evict oldest connection
   */
  private async evictOldest(): Promise<void> {
    let oldest: string | null = null;
    let oldestTime = Infinity;

    for (const [key, conn] of this.connections.entries()) {
      if (conn.created < oldestTime) {
        oldest = key;
        oldestTime = conn.created;
      }
    }

    if (oldest) {
      const conn = this.connections.get(oldest);
      if (conn?.connection?.close) {
        await conn.connection.close();
      }
      this.connections.delete(oldest);
    }
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    for (const [_, conn] of this.connections.entries()) {
      if (conn?.connection?.close) {
        await conn.connection.close();
      }
    }
    this.connections.clear();
  }
}

/**
 * Lazy loading wrapper for expensive operations
 */
export class LazyLoader<T> {
  private value: T | null = null;
  private loading: Promise<T> | null = null;
  private lastAccess: number = 0;
  private ttl: number;

  constructor(
    private loader: () => Promise<T>,
    ttl = 3600000 // 1 hour default
  ) {
    this.ttl = ttl;
  }

  /**
   * Get value, loading if necessary
   */
  async get(): Promise<T> {
    const now = Date.now();

    // Check if value is still valid
    if (this.value && now - this.lastAccess < this.ttl) {
      this.lastAccess = now;
      return this.value;
    }

    // If already loading, wait for it
    if (this.loading) {
      return this.loading;
    }

    // Load value
    this.loading = this.loader();

    try {
      this.value = await this.loading;
      this.lastAccess = now;
      return this.value;
    } finally {
      this.loading = null;
    }
  }

  /**
   * Invalidate cached value
   */
  invalidate(): void {
    this.value = null;
    this.loading = null;
  }

  /**
   * Preload value
   */
  async preload(): Promise<void> {
    await this.get();
  }
}

/**
 * Data preloader for common patterns
 */
export class DataPreloader {
  private cache: CacheManager;
  private patterns: Map<string, () => Promise<unknown>> = new Map();

  constructor(cache: CacheManager) {
    this.cache = cache;
  }

  /**
   * Register preload pattern
   */
  register(pattern: string, loader: () => Promise<unknown>): void {
    this.patterns.set(pattern, loader);
  }

  /**
   * Preload data based on patterns
   */
  async preload(patterns: string[]): Promise<void> {
    const promises = patterns.map(async pattern => {
      const loader = this.patterns.get(pattern);

      if (loader) {
        try {
          const data = await loader();
          this.cache.set(pattern, data);
        } catch (error) {
          console.error(`Failed to preload ${pattern}:`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  /**
   * Preload common BINs
   */
  async preloadCommonBINs(
    binLookup: (bin: string) => Promise<unknown>
  ): Promise<void> {
    const commonBINs = [
      '411111', // Visa test
      '555555', // Mastercard test
      '378282', // Amex test
      '424242', // Visa
      '520000', // Mastercard
      '537459', // Mastercard Brazil
      '516259', // Mastercard Brazil
      '406742', // Visa Latin America
    ];

    await Promise.all(
      commonBINs.map(async bin => {
        const data = await binLookup(bin);
        this.cache.set(`bin:${bin}`, data);
      })
    );
  }

  /**
   * Preload common countries
   */
  async preloadCommonCountries(
    geoLookup: (country: string) => Promise<unknown>
  ): Promise<void> {
    const commonCountries = ['US', 'BR', 'MX', 'IN', 'GB', 'CA', 'AU'];

    await Promise.all(
      commonCountries.map(async country => {
        const data = await geoLookup(country);
        this.cache.set(`country:${country}`, data);
      })
    );
  }
}

/**
 * Response compression utilities
 */
export class CompressionUtils {
  /**
   * Compress JSON data
   */
  static compress(data: any): string {
    const json = JSON.stringify(data);

    // Simple compression by removing whitespace
    const compressed = json
      .replace(/\s+/g, ' ')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*\[\s*/g, '[')
      .replace(/\s*\]\s*/g, ']');

    return compressed;
  }

  /**
   * Decompress JSON data
   */
  static decompress(compressed: string): any {
    return JSON.parse(compressed);
  }

  /**
   * Check if compression is worth it
   */
  static shouldCompress(data: any): boolean {
    const json = JSON.stringify(data);
    return json.length > 1024; // Only compress if > 1KB
  }
}

/**
 * Query optimization for database lookups
 */
export class QueryOptimizer {
  private queryCache = new Map<string, any>();
  private queryBatcher: RequestBatcher;

  constructor() {
    this.queryBatcher = new RequestBatcher({
      maxBatchSize: 50,
      maxWaitTime: 10,
      batchProcessor: async (queries: string[]) => {
        // Implement batch query processing
        return queries.map(q => this.executeQuery(q));
      },
    });
  }

  /**
   * Optimize and execute query
   */
  async query(sql: string, params?: any[]): Promise<unknown> {
    const cacheKey = `${sql}:${JSON.stringify(params || [])}`;

    // Check cache
    const cached = this.queryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute query
    const result = await this.queryBatcher.add({ sql, params });

    // Cache result
    this.queryCache.set(cacheKey, result);

    // Limit cache size
    if (this.queryCache.size > 1000) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }

    return result;
  }

  /**
   * Execute single query
   */
  private async executeQuery(query: any): Promise<unknown> {
    // Placeholder - implement actual query execution
    return { query, result: 'mock' };
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear();
  }
}

/**
 * Main optimization manager
 */
export class OptimizationManager {
  private config: OptimizationConfig;
  private cache: CacheManager;
  private connectionPool: ConnectionPool;
  private preloader: DataPreloader;

  constructor(config: OptimizationConfig) {
    this.config = config;

    this.cache = new CacheManager({
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 10000,
      ttl: 300000, // 5 minutes
      enableStats: true,
    });

    this.connectionPool = new ConnectionPool();
    this.preloader = new DataPreloader(this.cache);
  }

  /**
   * Get cache instance
   */
  getCache(): CacheManager {
    return this.cache;
  }

  /**
   * Get connection pool
   */
  getConnectionPool(): ConnectionPool {
    return this.connectionPool;
  }

  /**
   * Get preloader
   */
  getPreloader(): DataPreloader {
    return this.preloader;
  }

  /**
   * Initialize optimizations
   */
  async initialize(): Promise<void> {
    if (this.config.enablePreloading && this.config.preloadPatterns) {
      await this.preloader.preload(this.config.preloadPatterns);
    }
  }

  /**
   * Get optimization stats
   */
  getStats(): any {
    return {
      cache: this.cache.getStats(),
      cacheHitRate: this.cache.getHitRate(),
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.cache.clear();
    await this.connectionPool.closeAll();
  }
}
