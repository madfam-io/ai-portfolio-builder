/**
 * MIT License
 *
 * Copyright (c) 2025 MADFAM LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/rate-limiter
 *
 * In-memory rate limit store
 */

import type { RateLimitStore, RateLimitInfo, MemoryStoreConfig } from '../core/types';

interface MemoryEntry {
  count: number;
  resetTime: number;
  totalHits: number;
  timestamps: number[];
}

export class MemoryStore implements RateLimitStore {
  private store = new Map<string, MemoryEntry>();
  private cleanupInterval?: NodeJS.Timeout;
  private maxKeys: number;

  constructor(config: MemoryStoreConfig = {}) {
    this.maxKeys = config.maxKeys || 10000;

    // Start cleanup interval
    if (config.cleanupInterval !== false) {
      const interval = config.cleanupInterval || 60000; // 1 minute default
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, interval);
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitInfo> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    let entry = this.store.get(key);
    
    if (!entry) {
      // Create new entry
      entry = {
        count: 1,
        resetTime,
        totalHits: 1,
        timestamps: [now],
      };
      this.store.set(key, entry);
    } else {
      // Check if window has expired
      if (now >= entry.resetTime) {
        // Reset the window
        entry.count = 1;
        entry.resetTime = resetTime;
        entry.timestamps = [now];
      } else {
        // Increment within current window
        entry.count++;
        entry.timestamps.push(now);

        // For sliding window, clean old timestamps
        const windowStart = now - windowMs;
        entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
        entry.count = entry.timestamps.length;
      }
      
      entry.totalHits++;
    }

    // Enforce max keys limit
    if (this.store.size > this.maxKeys) {
      this.evictOldestEntries();
    }

    return {
      limit: 0, // Will be set by RateLimiter
      used: entry.count,
      remaining: 0, // Will be calculated by RateLimiter
      resetTime: entry.resetTime,
      totalHits: entry.totalHits,
    };
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now >= entry.resetTime) {
      this.store.delete(key);
      return null;
    }

    return {
      limit: 0, // Will be set by RateLimiter
      used: entry.count,
      remaining: 0, // Will be calculated by RateLimiter
      resetTime: entry.resetTime,
      totalHits: entry.totalHits,
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.store.delete(key);
    }
  }

  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.store.clear();
  }

  /**
   * Evict oldest entries when max keys limit is reached
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.store.entries());
    
    // Sort by reset time (oldest first)
    entries.sort(([, a], [, b]) => a.resetTime - b.resetTime);
    
    // Remove oldest 10% of entries
    const removeCount = Math.floor(entries.length * 0.1);
    for (let i = 0; i < removeCount; i++) {
      this.store.delete(entries[i][0]);
    }
  }

  /**
   * Get store statistics
   */
  getStats() {
    return {
      keys: this.store.size,
      maxKeys: this.maxKeys,
    };
  }

  /**
   * Get all entries (for debugging)
   */
  getEntries() {
    return Array.from(this.store.entries()).map(([key, entry]) => ({
      key,
      ...entry,
    }));
  }
}