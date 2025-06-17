/**
 * CDN Manager for Performance Optimization
 * Handles asset optimization, CDN distribution, and performance monitoring
 */

import { logger } from '@/lib/utils/logger';
import { redis, isRedisAvailable } from '@/lib/cache/redis-client';
import { env } from '@/lib/config/env';

export interface CDNConfig {
  provider: 'cloudflare' | 'aws' | 'vercel' | 'custom';
  domain: string;
  apiKey?: string;
  zoneId?: string;
  distributionId?: string;
  enabled: boolean;
}

export interface AssetOptimization {
  images: {
    formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
    qualities: number[];
    sizes: number[];
    lazyLoading: boolean;
  };
  css: {
    minify: boolean;
    purge: boolean;
    critical: boolean;
  };
  javascript: {
    minify: boolean;
    bundle: boolean;
    compression: 'gzip' | 'brotli';
  };
}

export interface CachePolicy {
  static: number; // seconds
  dynamic: number; // seconds
  api: number; // seconds
  images: number; // seconds
  fonts: number; // seconds
}

export interface PerformanceMetrics {
  timestamp: Date;
  url: string;
  metrics: {
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    ttfb: number; // Time to First Byte
    tti: number; // Time to Interactive
  };
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  device: {
    memory: number;
    cores: number;
    platform: string;
  };
}

/**
 * CDN Manager Implementation
 */
class CDNManager {
  private config: CDNConfig;
  private optimization: AssetOptimization;
  private cachePolicy: CachePolicy;

  constructor() {
    this.config = this.getDefaultConfig();
    this.optimization = this.getDefaultOptimization();
    this.cachePolicy = this.getDefaultCachePolicy();
  }

  /**
   * Initialize CDN configuration
   */
  async initialize(config?: Partial<CDNConfig>): Promise<void> {
    this.config = { ...this.config, ...config };

    if (this.config.enabled) {
      await this.setupCDN();
      await this.configureCaching();
      logger.info('CDN manager initialized', {
        provider: this.config.provider,
      });
    } else {
      logger.info('CDN disabled, using local assets');
    }
  }

  /**
   * Optimize image URL with CDN transformations
   */
  optimizeImageUrl(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      background?: string;
    } = {}
  ): string {
    if (!this.config.enabled) {
      return originalUrl;
    }

    const {
      width,
      height,
      quality = 85,
      format = 'auto',
      fit = 'cover',
      background = 'transparent',
    } = options;

    switch (this.config.provider) {
      case 'cloudflare':
        return this.cloudflareImageUrl(originalUrl, {
          width,
          height,
          quality,
          format,
          fit,
        });

      case 'vercel':
        return this.vercelImageUrl(originalUrl, {
          width,
          height,
          quality,
        });

      case 'aws':
        return this.awsImageUrl(originalUrl, options);

      default:
        return originalUrl;
    }
  }

  /**
   * Get optimized asset URL
   */
  getAssetUrl(path: string, type: 'css' | 'js' | 'image' | 'font'): string {
    if (!this.config.enabled) {
      return path;
    }

    const baseUrl = this.config.domain;
    const cacheBuster = this.getCacheBuster(path);

    return `${baseUrl}${path}?v=${cacheBuster}`;
  }

  /**
   * Preload critical assets
   */
  async preloadCriticalAssets(
    assets: Array<{
      url: string;
      type: 'image' | 'font' | 'script' | 'style';
      priority: 'high' | 'low';
    }>
  ): Promise<void> {
    if (!this.config.enabled) return;

    const preloadPromises = assets.map(async asset => {
      try {
        if (typeof window !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = asset.url;
          link.as =
            asset.type === 'image'
              ? 'image'
              : asset.type === 'font'
                ? 'font'
                : 'fetch';

          if (asset.type === 'font') {
            link.crossOrigin = 'anonymous';
          }

          document.head.appendChild(link);
        }
      } catch (error) {
        logger.error('Failed to preload asset', { error, asset });
      }
    });

    await Promise.allSettled(preloadPromises);
    logger.info('Critical assets preloaded', { count: assets.length });
  }

  /**
   * Purge cache for specific URLs
   */
  async purgeCache(urls: string[]): Promise<void> {
    if (!this.config.enabled) return;

    try {
      switch (this.config.provider) {
        case 'cloudflare':
          await this.purgeCloudflareCache(urls);
          break;
        case 'aws':
          await this.purgeAWSCache(urls);
          break;
        case 'vercel':
          await this.purgeVercelCache(urls);
          break;
        default:
          logger.warn('Cache purging not supported for provider', {
            provider: this.config.provider,
          });
      }

      logger.info('Cache purged successfully', { urls: urls.length });
    } catch (error) {
      logger.error('Failed to purge cache', { error, urls });
      throw error;
    }
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined') return null;

    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const fcp =
        paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      const connection = (navigator as any).connection;

      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        url: window.location.href,
        metrics: {
          fcp,
          lcp: 0, // Will be updated by Web Vitals
          fid: 0, // Will be updated by Web Vitals
          cls: 0, // Will be updated by Web Vitals
          ttfb: navigation.responseStart - navigation.requestStart,
          tti: navigation.domInteractive - navigation.navigationStart,
        },
        connection: {
          effectiveType: connection?.effectiveType || 'unknown',
          downlink: connection?.downlink || 0,
          rtt: connection?.rtt || 0,
        },
        device: {
          memory: (navigator as any).deviceMemory || 0,
          cores: navigator.hardwareConcurrency || 0,
          platform: navigator.platform,
        },
      };

      return metrics;
    } catch (error) {
      logger.error('Failed to collect performance metrics', { error });
      return null;
    }
  }

  /**
   * Store performance metrics
   */
  async storePerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      if (isRedisAvailable()) {
        const key = `perf:${Date.now()}:${Math.random().toString(36).substring(2)}`;
        await redis.setex(key, 86400, JSON.stringify(metrics)); // Store for 24 hours

        // Add to performance timeline
        await redis.lpush('perf:timeline', key);
        await redis.ltrim('perf:timeline', 0, 999); // Keep last 1000 entries
      }

      logger.debug('Performance metrics stored', {
        url: metrics.url,
        fcp: metrics.metrics.fcp,
        ttfb: metrics.metrics.ttfb,
      });
    } catch (error) {
      logger.error('Failed to store performance metrics', { error });
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    averages: {
      fcp: number;
      lcp: number;
      fid: number;
      cls: number;
      ttfb: number;
      tti: number;
    };
    trends: Array<{
      date: string;
      metrics: PerformanceMetrics['metrics'];
    }>;
    topSlowPages: Array<{
      url: string;
      avgLoadTime: number;
      samples: number;
    }>;
  }> {
    try {
      if (!isRedisAvailable()) {
        return this.getEmptyAnalytics();
      }

      // Get all performance metric keys from timeline
      const keys = await redis.lrange('perf:timeline', 0, -1);
      const metrics: PerformanceMetrics[] = [];

      // Fetch metrics within date range
      for (const key of keys) {
        try {
          const data = await redis.get(key);
          if (data) {
            const metric: PerformanceMetrics = JSON.parse(data);
            if (metric.timestamp >= startDate && metric.timestamp <= endDate) {
              metrics.push(metric);
            }
          }
        } catch (error) {
          // Skip invalid entries
        }
      }

      if (metrics.length === 0) {
        return this.getEmptyAnalytics();
      }

      // Calculate averages
      const averages = {
        fcp: this.average(metrics.map(m => m.metrics.fcp)),
        lcp: this.average(metrics.map(m => m.metrics.lcp)),
        fid: this.average(metrics.map(m => m.metrics.fid)),
        cls: this.average(metrics.map(m => m.metrics.cls)),
        ttfb: this.average(metrics.map(m => m.metrics.ttfb)),
        tti: this.average(metrics.map(m => m.metrics.tti)),
      };

      // Generate trends by day
      const trends = this.generateTrends(metrics);

      // Find slowest pages
      const topSlowPages = this.getTopSlowPages(metrics);

      return { averages, trends, topSlowPages };
    } catch (error) {
      logger.error('Failed to get performance analytics', { error });
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Setup CDN configuration
   */
  private async setupCDN(): Promise<void> {
    switch (this.config.provider) {
      case 'cloudflare':
        await this.setupCloudflare();
        break;
      case 'aws':
        await this.setupAWS();
        break;
      case 'vercel':
        await this.setupVercel();
        break;
      default:
        logger.warn('Unknown CDN provider', { provider: this.config.provider });
    }
  }

  /**
   * Configure caching policies
   */
  private async configureCaching(): Promise<void> {
    if (isRedisAvailable()) {
      await redis.setex(
        'cdn:cache_policy',
        86400,
        JSON.stringify(this.cachePolicy)
      );
    }
  }

  /**
   * Cloudflare image optimization
   */
  private cloudflareImageUrl(
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
      fit?: string;
    }
  ): string {
    const params = new URLSearchParams();

    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format && options.format !== 'auto')
      params.set('format', options.format);
    if (options.fit) params.set('fit', options.fit);

    return `${this.config.domain}/cdn-cgi/image/${params.toString()}/${url}`;
  }

  /**
   * Vercel image optimization
   */
  private vercelImageUrl(
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    }
  ): string {
    const params = new URLSearchParams({
      url: encodeURIComponent(url),
    });

    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());

    return `${this.config.domain}/_next/image?${params.toString()}`;
  }

  /**
   * AWS CloudFront image optimization
   */
  private awsImageUrl(url: string, options: any): string {
    // Implement AWS CloudFront image optimization
    return `${this.config.domain}${url}`;
  }

  /**
   * Get cache buster for asset
   */
  private getCacheBuster(path: string): string {
    // In production, this would be based on file hash or build timestamp
    return env.NODE_ENV === 'production' ? 'prod-v1' : Date.now().toString();
  }

  // CDN-specific setup methods
  private async setupCloudflare(): Promise<void> {
    // Cloudflare-specific configuration
    logger.info('Cloudflare CDN configured');
  }

  private async setupAWS(): Promise<void> {
    // AWS CloudFront configuration
    logger.info('AWS CloudFront configured');
  }

  private async setupVercel(): Promise<void> {
    // Vercel Edge Network configuration
    logger.info('Vercel Edge Network configured');
  }

  // Cache purging methods
  private async purgeCloudflareCache(urls: string[]): Promise<void> {
    if (!this.config.apiKey || !this.config.zoneId) {
      throw new Error('Cloudflare API key and zone ID required');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urls }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare cache purge failed: ${response.statusText}`);
    }
  }

  private async purgeAWSCache(urls: string[]): Promise<void> {
    // AWS CloudFront invalidation
    logger.info('AWS cache purge not implemented');
  }

  private async purgeVercelCache(urls: string[]): Promise<void> {
    // Vercel cache purging
    logger.info('Vercel cache purge not implemented');
  }

  // Analytics helper methods
  private average(numbers: number[]): number {
    return numbers.length > 0
      ? numbers.reduce((a, b) => a + b, 0) / numbers.length
      : 0;
  }

  private generateTrends(metrics: PerformanceMetrics[]): Array<{
    date: string;
    metrics: PerformanceMetrics['metrics'];
  }> {
    const dailyMetrics = new Map<string, PerformanceMetrics[]>();

    metrics.forEach(metric => {
      const date = metric.timestamp.toISOString().split('T')[0];
      if (!dailyMetrics.has(date)) {
        dailyMetrics.set(date, []);
      }
      dailyMetrics.get(date)!.push(metric);
    });

    return Array.from(dailyMetrics.entries()).map(([date, dayMetrics]) => ({
      date,
      metrics: {
        fcp: this.average(dayMetrics.map(m => m.metrics.fcp)),
        lcp: this.average(dayMetrics.map(m => m.metrics.lcp)),
        fid: this.average(dayMetrics.map(m => m.metrics.fid)),
        cls: this.average(dayMetrics.map(m => m.metrics.cls)),
        ttfb: this.average(dayMetrics.map(m => m.metrics.ttfb)),
        tti: this.average(dayMetrics.map(m => m.metrics.tti)),
      },
    }));
  }

  private getTopSlowPages(metrics: PerformanceMetrics[]): Array<{
    url: string;
    avgLoadTime: number;
    samples: number;
  }> {
    const pageMetrics = new Map<string, number[]>();

    metrics.forEach(metric => {
      const url = new URL(metric.url).pathname;
      if (!pageMetrics.has(url)) {
        pageMetrics.set(url, []);
      }
      pageMetrics.get(url)!.push(metric.metrics.tti);
    });

    return Array.from(pageMetrics.entries())
      .map(([url, loadTimes]) => ({
        url,
        avgLoadTime: this.average(loadTimes),
        samples: loadTimes.length,
      }))
      .sort((a, b) => b.avgLoadTime - a.avgLoadTime)
      .slice(0, 10);
  }

  private getEmptyAnalytics() {
    return {
      averages: {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0,
        tti: 0,
      },
      trends: [],
      topSlowPages: [],
    };
  }

  // Default configurations
  private getDefaultConfig(): CDNConfig {
    return {
      provider: env.NODE_ENV === 'production' ? 'vercel' : 'custom',
      domain: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      enabled: env.NODE_ENV === 'production',
    };
  }

  private getDefaultOptimization(): AssetOptimization {
    return {
      images: {
        formats: ['webp', 'avif', 'jpeg'],
        qualities: [85, 70, 60],
        sizes: [320, 640, 1024, 1920],
        lazyLoading: true,
      },
      css: {
        minify: true,
        purge: true,
        critical: true,
      },
      javascript: {
        minify: true,
        bundle: true,
        compression: 'gzip',
      },
    };
  }

  private getDefaultCachePolicy(): CachePolicy {
    return {
      static: 31536000, // 1 year
      dynamic: 3600, // 1 hour
      api: 300, // 5 minutes
      images: 604800, // 1 week
      fonts: 31536000, // 1 year
    };
  }
}

/**
 * Singleton instance
 */
export const cdnManager = new CDNManager();
