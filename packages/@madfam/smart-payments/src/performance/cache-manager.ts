/**
 * @madfam/smart-payments
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
 * Performance-optimized caching system
 * Implements LRU cache with TTL support and memory management
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
  size: number;
  hits: number;
  lastAccess: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  entries: number;
}

export interface CacheConfig {
  maxSize: number; // Max memory in bytes
  maxEntries: number;
  ttl: number; // Time to live in milliseconds
  enableStats: boolean;
  onEvict?: (key: string, value: any) => void;
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private currentSize = 0;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    entries: 0,
  };

  constructor(private config: CacheConfig) {}

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.config.enableStats) {
        this.stats.misses++;
      }
      return null;
    }

    // Check expiry
    if (Date.now() > entry.expiry) {
      this.delete(key);
      if (this.config.enableStats) {
        this.stats.misses++;
      }
      return null;
    }

    // Update access order (LRU)
    this.updateAccessOrder(key);
    
    // Update stats
    if (this.config.enableStats) {
      entry.hits++;
      entry.lastAccess = Date.now();
      this.stats.hits++;
    }

    return entry.value;
  }

  /**
   * Set item in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const size = this.estimateSize(value);
    const expiry = Date.now() + (ttl || this.config.ttl);

    // Check if we need to evict
    if (this.cache.size >= this.config.maxEntries || 
        this.currentSize + size > this.config.maxSize) {
      this.evictLRU();
    }

    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Add new entry
    const entry: CacheEntry<T> = {
      value,
      expiry,
      size,
      hits: 0,
      lastAccess: Date.now(),
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.currentSize += size;

    if (this.config.enableStats) {
      this.stats.size = this.currentSize;
      this.stats.entries = this.cache.size;
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.currentSize -= entry.size;

    if (this.config.enableStats) {
      this.stats.size = this.currentSize;
      this.stats.entries = this.cache.size;
    }

    return true;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.currentSize = 0;

    if (this.config.enableStats) {
      this.stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0,
        entries: 0,
      };
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get hit rate percentage
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : (this.stats.hits / total) * 100;
  }

  /**
   * Prewarm cache with entries
   */
  async prewarm(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl);
    }
  }

  /**
   * Update LRU access order
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    while (
      (this.cache.size >= this.config.maxEntries || 
       this.currentSize > this.config.maxSize) &&
      this.accessOrder.length > 0
    ) {
      const key = this.accessOrder.shift()!;
      const entry = this.cache.get(key);
      
      if (entry) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
        
        if (this.config.enableStats) {
          this.stats.evictions++;
        }
        
        if (this.config.onEvict) {
          this.config.onEvict(key, entry.value);
        }
      }
    }

    if (this.config.enableStats) {
      this.stats.size = this.currentSize;
      this.stats.entries = this.cache.size;
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    }
    
    if (typeof value === 'number') {
      return 8;
    }
    
    if (typeof value === 'boolean') {
      return 4;
    }
    
    if (value === null || value === undefined) {
      return 0;
    }
    
    // For objects, estimate based on JSON string
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 1024; // Default 1KB for complex objects
    }
  }
}

/**
 * Create a multi-level cache with different TTLs
 */
export class MultiLevelCache {
  private levels: CacheManager[];

  constructor(configs: CacheConfig[]) {
    this.levels = configs.map(config => new CacheManager(config));
  }

  /**
   * Get from first available level
   */
  async get(key: string): Promise<any> {
    for (let i = 0; i < this.levels.length; i++) {
      const value = this.levels[i].get(key);
      
      if (value !== null) {
        // Promote to higher levels
        for (let j = 0; j < i; j++) {
          this.levels[j].set(key, value);
        }
        return value;
      }
    }
    
    return null;
  }

  /**
   * Set in all levels
   */
  set(key: string, value: any): void {
    for (const level of this.levels) {
      level.set(key, value);
    }
  }

  /**
   * Clear all levels
   */
  clear(): void {
    for (const level of this.levels) {
      level.clear();
    }
  }

  /**
   * Get aggregated stats
   */
  getStats(): CacheStats[] {
    return this.levels.map(level => level.getStats());
  }
}