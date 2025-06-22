/**
 * @madfam/experiments
 *
 * Cache manager for experiments and assignments
 */

import type {
  CacheStrategy,
  Experiment,
  FeatureFlag,
  Assignment,
} from './types';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export class CacheManager {
  private strategy: CacheStrategy;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;

  constructor(strategy?: CacheStrategy) {
    this.strategy = strategy || {
      type: 'memory',
      ttl: 3600000, // 1 hour default
      maxSize: 1000,
    };
    this.maxSize = this.strategy.maxSize || 1000;

    // Set up localStorage if needed
    if (
      this.strategy.type === 'localStorage' &&
      typeof window !== 'undefined'
    ) {
      this.initLocalStorage();
    }
  }

  /**
   * Get experiment from cache
   */
  async getExperiment(experimentId: string): Promise<Experiment | null> {
    return this.get(`experiment:${experimentId}`);
  }

  /**
   * Set experiment in cache
   */
  async setExperiment(
    experimentId: string,
    experiment: Experiment
  ): Promise<void> {
    await this.set(`experiment:${experimentId}`, experiment);
  }

  /**
   * Get feature flag from cache
   */
  async getFlag(flagKey: string): Promise<FeatureFlag | null> {
    return this.get(`flag:${flagKey}`);
  }

  /**
   * Set feature flag in cache
   */
  async setFlag(flagKey: string, flag: FeatureFlag): Promise<void> {
    await this.set(`flag:${flagKey}`, flag);
  }

  /**
   * Get assignment from cache
   */
  async getAssignment(
    experimentId: string,
    userId: string
  ): Promise<Assignment | null> {
    return this.get(`assignment:${experimentId}:${userId}`);
  }

  /**
   * Set assignment in cache
   */
  async setAssignment(
    experimentId: string,
    userId: string,
    assignment: Assignment
  ): Promise<void> {
    await this.set(`assignment:${experimentId}:${userId}`, assignment);
  }

  /**
   * Get value from cache
   */
  private async get<T>(key: string): Promise<T | null> {
    switch (this.strategy.type) {
      case 'memory':
        return this.getFromMemory(key);

      case 'localStorage':
        return this.getFromLocalStorage(key);

      case 'custom':
        if (this.strategy.customGet) {
          return this.strategy.customGet(key);
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Set value in cache
   */
  private async set<T>(key: string, value: T): Promise<void> {
    switch (this.strategy.type) {
      case 'memory':
        this.setInMemory(key, value);
        break;

      case 'localStorage':
        this.setInLocalStorage(key, value);
        break;

      case 'custom':
        if (this.strategy.customSet) {
          await this.strategy.customSet(key, value);
        }
        break;
    }
  }

  /**
   * Get from memory cache
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set in memory cache
   */
  private setInMemory<T>(key: string, value: T): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: this.strategy.ttl,
    });
  }

  /**
   * Get from localStorage
   */
  private getFromLocalStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(`madfam:experiments:${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check TTL
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`madfam:experiments:${key}`);
        return null;
      }

      return entry.value;
    } catch {
      return null;
    }
  }

  /**
   * Set in localStorage
   */
  private setInLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: this.strategy.ttl,
      };

      localStorage.setItem(`madfam:experiments:${key}`, JSON.stringify(entry));

      // Clean up old entries if needed
      this.cleanupLocalStorage();
    } catch (e) {
      // Handle quota exceeded error
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        this.clearLocalStorage();
        // Try again
        try {
          const entry: CacheEntry<T> = {
            value,
            timestamp: Date.now(),
            ttl: this.strategy.ttl,
          };
          localStorage.setItem(
            `madfam:experiments:${key}`,
            JSON.stringify(entry)
          );
        } catch {
          // Give up
        }
      }
    }
  }

  /**
   * Initialize localStorage
   */
  private initLocalStorage(): void {
    if (typeof window === 'undefined') return;

    // Clean up expired entries on init
    this.cleanupLocalStorage();
  }

  /**
   * Clean up localStorage
   */
  private cleanupLocalStorage(): void {
    if (typeof window === 'undefined') return;

    const prefix = 'madfam:experiments:';
    const keys: string[] = [];

    // Collect all experiment keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    // Check each key
    for (const key of keys) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const entry = JSON.parse(item);
          if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Remove invalid entries
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Clear localStorage cache
   */
  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return;

    const prefix = 'madfam:experiments:';
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    keys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Find oldest entry in memory cache
   */
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    if (this.strategy.type === 'localStorage') {
      this.clearLocalStorage();
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}
