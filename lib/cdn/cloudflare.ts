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

interface CloudflareConfig {
  apiKey: string;
  email: string;
  zoneId: string;
  accountId: string;
}

interface PurgeOptions {
  files?: string[];
  tags?: string[];
  hosts?: string[];
}

interface CacheRule {
  expression: string;
  action: 'cache' | 'bypass';
  cacheLevel: 'aggressive' | 'basic' | 'simplified';
  ttl?: number;
}

class CloudflareCDN {
  private config: CloudflareConfig;
  private baseUrl = 'https://api.cloudflare.com/v4';

  constructor() {
    this.config = {
      apiKey: process.env.CLOUDFLARE_API_KEY!,
      email: process.env.CLOUDFLARE_EMAIL!,
      zoneId: process.env.CLOUDFLARE_ZONE_ID!,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    };
  }

  private async makeRequest(endpoint: string, method = 'GET', body?: any) {
    const headers = {
      'X-Auth-Email': this.config.email,
      'X-Auth-Key': this.config.apiKey,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
    }

    return data.result;
  }

  /**
   * Purge cache for specific files, tags, or hosts
   */
  async purgeCache(options: PurgeOptions): Promise<void> {
    try {
      const body: any = {};
      
      if (options.files) {
        body.files = options.files;
      }
      
      if (options.tags) {
        body.tags = options.tags;
      }
      
      if (options.hosts) {
        body.hosts = options.hosts;
      }

      // If no specific options, purge everything
      if (!options.files && !options.tags && !options.hosts) {
        body.purge_everything = true;
      }

      await this.makeRequest(`/zones/${this.config.zoneId}/purge_cache`, 'POST', body);
      console.log('Cache purged successfully');
    } catch (error) {
      console.error('Cache purge error:', error);
      throw error;
    }
  }

  /**
   * Purge all cache
   */
  async purgeAll(): Promise<void> {
    return this.purgeCache({});
  }

  /**
   * Purge cache by tags (useful for portfolio-specific purging)
   */
  async purgeCacheByTags(tags: string[]): Promise<void> {
    return this.purgeCache({ tags });
  }

  /**
   * Purge cache for specific files
   */
  async purgeCacheByFiles(files: string[]): Promise<void> {
    return this.purgeCache({ files });
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(period = '1d'): Promise<any> {
    try {
      const response = await this.makeRequest(
        `/zones/${this.config.zoneId}/analytics/dashboard?since=-${period}&until=now`
      );
      return response;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      throw error;
    }
  }

  /**
   * Create cache rule for portfolio assets
   */
  async createCacheRule(rule: CacheRule): Promise<void> {
    try {
      const body = {
        description: 'Portfolio Builder Cache Rule',
        expression: rule.expression,
        action: rule.action,
        action_parameters: {
          cache: rule.action === 'cache',
          cache_level: rule.cacheLevel,
          ...(rule.ttl && { edge_ttl: rule.ttl }),
        },
      };

      await this.makeRequest(`/zones/${this.config.zoneId}/rulesets/phases/http_request_cache_settings/entrypoint`, 'POST', {
        rules: [body],
      });
      
      console.log('Cache rule created successfully');
    } catch (error) {
      console.error('Error creating cache rule:', error);
      throw error;
    }
  }

  /**
   * Portfolio-specific cache management
   */

  // Purge cache for a specific portfolio
  async purgePortfolioCache(portfolioId: string): Promise<void> {
    const tags = [`portfolio-${portfolioId}`];
    return this.purgeCacheByTags(tags);
  }

  // Purge cache for user's portfolios
  async purgeUserCache(userId: string): Promise<void> {
    const tags = [`user-${userId}`];
    return this.purgeCacheByTags(tags);
  }

  // Purge static assets cache
  async purgeStaticAssets(): Promise<void> {
    const files = [
      `${process.env.NEXT_PUBLIC_CDN_URL}/static/*`,
      `${process.env.NEXT_PUBLIC_CDN_URL}/_next/static/*`,
    ];
    return this.purgeCacheByFiles(files);
  }

  // Purge API cache
  async purgeAPICache(): Promise<void> {
    const files = [
      `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/*`,
    ];
    return this.purgeCacheByFiles(files);
  }

  /**
   * Set up optimal cache rules for the portfolio builder
   */
  async setupOptimalCacheRules(): Promise<void> {
    const rules: CacheRule[] = [
      // Cache static assets aggressively
      {
        expression: '(http.request.uri.path matches "^/static/.*" or http.request.uri.path matches "^/_next/static/.*")',
        action: 'cache',
        cacheLevel: 'aggressive',
        ttl: 31536000, // 1 year
      },
      
      // Cache images and media
      {
        expression: '(http.request.uri.path matches ".*\\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2)$")',
        action: 'cache',
        cacheLevel: 'aggressive',
        ttl: 2592000, // 30 days
      },
      
      // Cache CSS and JS with medium TTL
      {
        expression: '(http.request.uri.path matches ".*\\.(css|js)$")',
        action: 'cache',
        cacheLevel: 'aggressive',
        ttl: 604800, // 7 days
      },
      
      // Cache API responses with short TTL
      {
        expression: '(http.request.uri.path matches "^/api/v1/.*" and http.request.method eq "GET")',
        action: 'cache',
        cacheLevel: 'basic',
        ttl: 300, // 5 minutes
      },
      
      // Cache published portfolios
      {
        expression: '(http.request.uri.path matches "^/[a-zA-Z0-9-]+$" and not http.request.uri.path in {"/", "/login", "/signup", "/dashboard"})',
        action: 'cache',
        cacheLevel: 'basic',
        ttl: 1800, // 30 minutes
      },
    ];

    for (const rule of rules) {
      try {
        await this.createCacheRule(rule);
      } catch (error) {
        console.error(`Failed to create cache rule: ${rule.expression}`, error);
        // Continue with other rules even if one fails
      }
    }
  }

  /**
   * Preload critical resources
   */
  async preloadCriticalResources(urls: string[]): Promise<void> {
    try {
      // This would typically involve setting up preload headers
      // Cloudflare Workers or Page Rules would handle this
      console.log('Preloading critical resources:', urls);
      
      // For now, we'll just warm the cache by making requests
      const promises = urls.map(url => 
        fetch(url, { method: 'HEAD' }).catch(error => 
          console.warn(`Failed to preload ${url}:`, error)
        )
      );
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error preloading resources:', error);
    }
  }

  /**
   * Get zone information
   */
  async getZoneInfo(): Promise<any> {
    try {
      return await this.makeRequest(`/zones/${this.config.zoneId}`);
    } catch (error) {
      console.error('Error getting zone info:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    try {
      const start = Date.now();
      await this.getZoneInfo();
      const latency = Date.now() - start;
      
      return { healthy: true, latency };
    } catch (error) {
      console.error('CDN health check failed:', error);
      return { healthy: false, latency: -1 };
    }
  }
}

// Export singleton instance
export const cloudflareCDN = new CloudflareCDN();

// Export types and class
export type { CloudflareConfig, PurgeOptions, CacheRule };
export { CloudflareCDN };