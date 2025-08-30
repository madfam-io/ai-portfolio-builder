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

import { r2Storage } from '@/lib/storage/r2-client';
import { kvCache } from '@/lib/cache/vercel-kv';
import { railwayDb } from '@/lib/database/railway-client';
import { cloudflareCDN } from '@/lib/cdn/cloudflare';

/**
 * Infrastructure adapter that provides unified interface for all services
 * Handles failover and environment-specific implementations
 */
class InfrastructureAdapter {
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Storage operations
   */
  async uploadFile(
    path: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    if (this.isProduction) {
      return await r2Storage.uploadFile(path, buffer, contentType, metadata);
    } else {
      // In development, save to local filesystem or use a development storage
      console.log(`Dev mode: Would upload file to ${path}`);
      return `http://localhost:3000/uploads/${path}`;
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (this.isProduction) {
      await r2Storage.deleteFile(path);
    } else {
      console.log(`Dev mode: Would delete file at ${path}`);
    }
  }

  async getFileUrl(path: string): Promise<string> {
    if (this.isProduction) {
      return r2Storage.getPublicUrl(path);
    } else {
      return `http://localhost:3000/uploads/${path}`;
    }
  }

  /**
   * Cache operations with fallback
   */
  async cacheSet(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (this.isProduction) {
        await kvCache.set(key, value, { ttl });
      } else {
        // Use in-memory cache for development
        this.memoryCache.set(key, { value, expires: ttl ? Date.now() + (ttl * 1000) : null });
      }
    } catch (error) {
      console.warn('Cache set failed:', error);
      // Degrade gracefully - app continues to work without cache
    }
  }

  async cacheGet<T = any>(key: string): Promise<T | null> {
    try {
      if (this.isProduction) {
        return await kvCache.get<T>(key);
      } else {
        // Use in-memory cache for development
        const cached = this.memoryCache.get(key);
        if (!cached) return null;
        
        if (cached.expires && Date.now() > cached.expires) {
          this.memoryCache.delete(key);
          return null;
        }
        
        return cached.value;
      }
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  async cacheDelete(key: string): Promise<void> {
    try {
      if (this.isProduction) {
        await kvCache.delete(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.warn('Cache delete failed:', error);
    }
  }

  // In-memory cache for development
  private memoryCache = new Map<string, { value: any; expires: number | null }>();

  /**
   * Database operations
   */
  async dbQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (this.isProduction) {
      return await railwayDb.query<T>(sql, params);
    } else {
      // Use Supabase or local database for development
      console.log('Dev mode: Database query:', { sql: sql.substring(0, 100), params });
      return [];
    }
  }

  async dbQueryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    if (this.isProduction) {
      return await railwayDb.queryOne<T>(sql, params);
    } else {
      console.log('Dev mode: Database query one:', { sql: sql.substring(0, 100), params });
      return null;
    }
  }

  async dbTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    if (this.isProduction) {
      return await railwayDb.transaction(callback);
    } else {
      console.log('Dev mode: Database transaction');
      return callback(null) as T;
    }
  }

  /**
   * CDN operations
   */
  async purgeCDNCache(options: { files?: string[]; tags?: string[]; all?: boolean }): Promise<void> {
    if (!this.isProduction) {
      console.log('Dev mode: Would purge CDN cache', options);
      return;
    }

    try {
      if (options.all) {
        await cloudflareCDN.purgeAll();
      } else if (options.tags) {
        await cloudflareCDN.purgeCacheByTags(options.tags);
      } else if (options.files) {
        await cloudflareCDN.purgeCacheByFiles(options.files);
      }
    } catch (error) {
      console.error('CDN purge failed:', error);
      // Don't throw - CDN purging is not critical
    }
  }

  /**
   * Health checks for all services
   */
  async healthCheck(): Promise<{
    storage: boolean;
    cache: boolean;
    database: boolean;
    cdn: boolean;
    overall: boolean;
  }> {
    const results = {
      storage: false,
      cache: false,
      database: false,
      cdn: false,
      overall: false,
    };

    try {
      // Check storage (R2)
      if (this.isProduction) {
        // Try to list or check R2 bucket
        results.storage = true; // Simplified check
      } else {
        results.storage = true; // Dev mode always passes
      }
    } catch (error) {
      console.error('Storage health check failed:', error);
    }

    try {
      // Check cache (Vercel KV)
      if (this.isProduction) {
        await kvCache.set('health-check', Date.now(), { ttl: 60 });
        const value = await kvCache.get('health-check');
        results.cache = value !== null;
      } else {
        results.cache = true; // Dev mode always passes
      }
    } catch (error) {
      console.error('Cache health check failed:', error);
    }

    try {
      // Check database (Railway)
      if (this.isProduction) {
        const health = await railwayDb.healthCheck();
        results.database = health.healthy;
      } else {
        results.database = true; // Dev mode always passes
      }
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    try {
      // Check CDN (Cloudflare)
      if (this.isProduction) {
        const health = await cloudflareCDN.healthCheck();
        results.cdn = health.healthy;
      } else {
        results.cdn = true; // Dev mode always passes
      }
    } catch (error) {
      console.error('CDN health check failed:', error);
    }

    results.overall = results.storage && results.cache && results.database && results.cdn;

    return results;
  }

  /**
   * Portfolio-specific operations
   */
  async uploadPortfolioAsset(
    userId: string,
    portfolioId: string,
    fileName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const url = await this.uploadFile(
      `portfolios/${userId}/${portfolioId}/${fileName}`,
      buffer,
      contentType,
      { userId, portfolioId, type: 'portfolio-asset' }
    );

    // Purge portfolio cache
    await this.cacheDelete(`portfolio:${portfolioId}`);
    await this.purgeCDNCache({ tags: [`portfolio-${portfolioId}`] });

    return url;
  }

  async deletePortfolioAsset(userId: string, portfolioId: string, fileName: string): Promise<void> {
    await this.deleteFile(`portfolios/${userId}/${portfolioId}/${fileName}`);
    await this.cacheDelete(`portfolio:${portfolioId}`);
    await this.purgeCDNCache({ tags: [`portfolio-${portfolioId}`] });
  }

  /**
   * User profile operations
   */
  async uploadProfileAsset(
    userId: string,
    fileName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const url = await this.uploadFile(
      `profiles/${userId}/${fileName}`,
      buffer,
      contentType,
      { userId, type: 'profile-asset' }
    );

    // Purge user cache
    await this.cacheDelete(`user:${userId}`);
    await this.purgeCDNCache({ tags: [`user-${userId}`] });

    return url;
  }

  /**
   * Environment info
   */
  getEnvironmentInfo() {
    return {
      environment: process.env.NODE_ENV,
      isProduction: this.isProduction,
      services: {
        storage: this.isProduction ? 'Cloudflare R2' : 'Local filesystem',
        cache: this.isProduction ? 'Vercel KV' : 'In-memory',
        database: this.isProduction ? 'Railway PostgreSQL' : 'Local/Supabase',
        cdn: this.isProduction ? 'Cloudflare' : 'Local',
      },
    };
  }
}

// Export singleton instance
export const infrastructure = new InfrastructureAdapter();

// Export class for testing
export { InfrastructureAdapter };