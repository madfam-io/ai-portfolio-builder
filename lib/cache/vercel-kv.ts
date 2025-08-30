/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { kv } from '@vercel/kv';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  nx?: boolean; // Only set if key doesn't exist
  ex?: number; // Expire time in seconds
}

class VercelKVCache {
  /**
   * Set a value in the cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (options?.ttl) {
        await kv.setex(key, options.ttl, serializedValue);
      } else if (options?.ex) {
        await kv.setex(key, options.ex, serializedValue);
      } else if (options?.nx) {
        await kv.setnx(key, serializedValue);
      } else {
        await kv.set(key, serializedValue);
      }
    } catch (error) {
      console.error('KV Cache set error:', error);
      throw error;
    }
  }

  /**
   * Get a value from the cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await kv.get(key);
      if (value === null || value === undefined) {
        return null;
      }
      
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          // Return as string if not valid JSON
          return value as T;
        }
      }
      
      return value as T;
    } catch (error) {
      console.error('KV Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete a key from the cache
   */
  async delete(key: string): Promise<void> {
    try {
      await kv.del(key);
    } catch (error) {
      console.error('KV Cache delete error:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await kv.exists(key);
      return result === 1;
    } catch (error) {
      console.error('KV Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await kv.expire(key, seconds);
    } catch (error) {
      console.error('KV Cache expire error:', error);
      throw error;
    }
  }

  /**
   * Get multiple keys
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await kv.mget(...keys);
      return values.map(value => {
        if (value === null || value === undefined) return null;
        
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value as T;
          }
        }
        
        return value as T;
      });
    } catch (error) {
      console.error('KV Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys
   */
  async mset(keyValues: Record<string, any>): Promise<void> {
    try {
      const pipeline = Object.entries(keyValues).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      
      await kv.mset(Object.fromEntries(pipeline));
    } catch (error) {
      console.error('KV Cache mset error:', error);
      throw error;
    }
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string): Promise<number> {
    try {
      return await kv.incr(key);
    } catch (error) {
      console.error('KV Cache incr error:', error);
      throw error;
    }
  }

  /**
   * Decrement a numeric value
   */
  async decr(key: string): Promise<number> {
    try {
      return await kv.decr(key);
    } catch (error) {
      console.error('KV Cache decr error:', error);
      throw error;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await kv.keys(pattern);
    } catch (error) {
      console.error('KV Cache keys error:', error);
      return [];
    }
  }

  /**
   * Clear all keys matching a pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await kv.del(...keys);
      }
    } catch (error) {
      console.error('KV Cache clearPattern error:', error);
      throw error;
    }
  }

  /**
   * Portfolio-specific cache methods
   */
  
  // Cache portfolio data
  async cachePortfolio(portfolioId: string, data: any, ttl = 300): Promise<void> {
    await this.set(`portfolio:${portfolioId}`, data, { ttl });
  }

  // Get cached portfolio
  async getPortfolio(portfolioId: string): Promise<any | null> {
    return await this.get(`portfolio:${portfolioId}`);
  }

  // Cache user profile
  async cacheUserProfile(userId: string, data: any, ttl = 600): Promise<void> {
    await this.set(`user:${userId}`, data, { ttl });
  }

  // Get cached user profile
  async getUserProfile(userId: string): Promise<any | null> {
    return await this.get(`user:${userId}`);
  }

  // Cache AI generation results
  async cacheAIResult(key: string, result: any, ttl = 1800): Promise<void> {
    await this.set(`ai:${key}`, result, { ttl });
  }

  // Get cached AI result
  async getAIResult(key: string): Promise<any | null> {
    return await this.get(`ai:${key}`);
  }

  // Cache analytics data
  async cacheAnalytics(key: string, data: any, ttl = 3600): Promise<void> {
    await this.set(`analytics:${key}`, data, { ttl });
  }

  // Get cached analytics
  async getAnalytics(key: string): Promise<any | null> {
    return await this.get(`analytics:${key}`);
  }

  // Rate limiting
  async incrementRateLimit(identifier: string, window = 3600): Promise<number> {
    const key = `ratelimit:${identifier}`;
    const current = await this.incr(key);
    
    if (current === 1) {
      await this.expire(key, window);
    }
    
    return current;
  }

  // Session cache
  async cacheSession(sessionId: string, data: any, ttl = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, data, { ttl });
  }

  // Get cached session
  async getSession(sessionId: string): Promise<any | null> {
    return await this.get(`session:${sessionId}`);
  }
}

// Export singleton instance
export const kvCache = new VercelKVCache();

// Export class for testing
export { VercelKVCache };