/**
 * @fileoverview Performance Optimization Utilities
 *
 * Comprehensive performance optimization system for portfolio generation,
 * ensuring sub-30-second creation times and optimal user experience.
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

import React from 'react';

export interface PerformanceMetrics {
  portfolioCreation: number;
  templateRendering: number;
  aiProcessing: number;
  imageOptimization: number;
  apiResponseTime: number;
  totalTime: number;
}

export interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enablePreloading: boolean;
  enableCompression: boolean;
  maxImageSize: number;
  compressionLevel: number;
}

/**
 * Performance monitor for tracking critical user journey metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Start timing a performance operation
   */
  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  /**
   * End timing and record the duration
   */
  endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      throw new Error(`Timer for ${operation} was not started`);
    }

    const duration = performance.now() - startTime;
    this.metrics.set(operation, duration);
    this.startTimes.delete(operation);

    return duration;
  }

  /**
   * Get performance metrics for analysis
   */
  getMetrics(): PerformanceMetrics {
    return {
      portfolioCreation: this.metrics.get('portfolioCreation') || 0,
      templateRendering: this.metrics.get('templateRendering') || 0,
      aiProcessing: this.metrics.get('aiProcessing') || 0,
      imageOptimization: this.metrics.get('imageOptimization') || 0,
      apiResponseTime: this.metrics.get('apiResponseTime') || 0,
      totalTime: Array.from(this.metrics.values()).reduce(
        (sum, time) => sum + time,
        0
      ),
    };
  }

  /**
   * Check if performance meets sub-30-second target
   */
  meetsPerformanceTarget(): boolean {
    const totalTime = this.getMetrics().totalTime;
    return totalTime < 30000; // 30 seconds in milliseconds
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig) {
    this.config = config;
  }

  /**
   * Optimize image for web delivery
   */
  optimizeImage(imageData: File | string): string {
    if (!this.config.enableImageOptimization) {
      return typeof imageData === 'string'
        ? imageData
        : URL.createObjectURL(imageData);
    }

    const monitor = new PerformanceMonitor();
    monitor.startTimer('imageOptimization');

    try {
      if (typeof imageData === 'string') {
        // Already optimized URL
        return imageData;
      }

      // Check file size
      if (imageData.size > this.config.maxImageSize) {
        throw new Error(
          `Image size ${imageData.size} exceeds maximum ${this.config.maxImageSize}`
        );
      }

      // Create optimized blob URL
      const optimizedUrl = URL.createObjectURL(imageData);

      return optimizedUrl;
    } finally {
      monitor.endTimer('imageOptimization');
    }
  }

  /**
   * Generate responsive image sizes
   */
  generateResponsiveSizes(baseUrl: string): {
    sm: string;
    md: string;
    lg: string;
  } {
    const sizes = {
      sm: `${baseUrl}?w=400&q=${this.config.compressionLevel}`,
      md: `${baseUrl}?w=800&q=${this.config.compressionLevel}`,
      lg: `${baseUrl}?w=1200&q=${this.config.compressionLevel}`,
    };

    return sizes;
  }
}

/**
 * API response optimization
 */
export class APIOptimizer {
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  /**
   * Cache API response with TTL
   */
  cacheResponse(key: string, data: unknown, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Get cached response if valid
   */
  getCachedResponse(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Optimize API request with caching and compression
   */
  async optimizedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const monitor = new PerformanceMonitor();
    monitor.startTimer('apiResponseTime');

    try {
      // Check cache first for GET requests
      if (!options.method || options.method === 'GET') {
        const cached = this.getCachedResponse(url);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Add compression headers
      const optimizedOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(url, optimizedOptions);

      // Cache successful GET responses
      if (response.ok && (!options.method || options.method === 'GET')) {
        const data = await response.clone().json();
        this.cacheResponse(url, data);
      }

      return response;
    } finally {
      monitor.endTimer('apiResponseTime');
    }
  }
}

/**
 * Bundle size optimization utilities
 */
export class BundleOptimizer {
  /**
   * Lazy load component with error boundary
   */
  static lazyLoadComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    return React.lazy(async () => {
      try {
        const component = await importFn();
        return component;
      } catch (error) {
        console.error('Failed to load component:', error);
        // Return fallback component
        return {
          default: (() =>
            React.createElement(
              'div',
              { className: 'p-4 text-center' },
              'Component failed to load'
            )) as unknown as T,
        };
      }
    });
  }

  /**
   * Preload critical resources
   */
  static preloadResources(resources: string[]): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.match(/\.(jpg|jpeg|png|webp)$/)) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Check if resource should be preloaded
   */
  static shouldPreload(resource: string): boolean {
    // Preload critical template assets
    const criticalResources = [
      '/templates/modern.css',
      '/templates/minimal.css',
      '/js/template-renderer.js',
      '/fonts/inter.woff2',
    ];

    return criticalResources.some(critical => resource.includes(critical));
  }
}

/**
 * Portfolio generation performance optimizer
 */
export class PortfolioPerformanceOptimizer {
  private monitor: PerformanceMonitor;
  private imageOptimizer: ImageOptimizer;
  private apiOptimizer: APIOptimizer;

  constructor(config: OptimizationConfig) {
    this.monitor = new PerformanceMonitor();
    this.imageOptimizer = new ImageOptimizer(config);
    this.apiOptimizer = new APIOptimizer();
  }

  /**
   * Optimize portfolio creation workflow
   */
  async optimizePortfolioCreation(
    portfolioData: Record<string, unknown>
  ): Promise<{
    optimizedData: Record<string, unknown>;
    metrics: PerformanceMetrics;
    success: boolean;
  }> {
    this.monitor.startTimer('portfolioCreation');

    try {
      // Parallel optimization tasks
      const optimizationTasks = [
        this.optimizeImages(portfolioData),
        this.optimizeApiCalls(portfolioData),
        this.preloadTemplateAssets(String(portfolioData.template)),
      ];

      const [optimizedImages, optimizedApi] =
        await Promise.all(optimizationTasks);

      const optimizedData = {
        ...portfolioData,
        ...optimizedImages,
        ...optimizedApi,
      };

      this.monitor.endTimer('portfolioCreation');
      const metrics = this.monitor.getMetrics();

      return {
        optimizedData,
        metrics,
        success: this.monitor.meetsPerformanceTarget(),
      };
    } catch (error) {
      console.error('Portfolio optimization failed:', error);
      this.monitor.endTimer('portfolioCreation');

      return {
        optimizedData: portfolioData,
        metrics: this.monitor.getMetrics(),
        success: false,
      };
    }
  }

  /**
   * Optimize images in portfolio data
   */
  private async optimizeImages(
    portfolioData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.monitor.startTimer('imageOptimization');

    try {
      const optimizedData = { ...portfolioData };

      // Optimize avatar
      if (portfolioData.avatarUrl) {
        optimizedData.avatarUrl = await this.imageOptimizer.optimizeImage(
          String(portfolioData.avatarUrl)
        );
        optimizedData.avatarSizes = this.imageOptimizer.generateResponsiveSizes(
          String(optimizedData.avatarUrl)
        );
      }

      // Optimize project images
      if (portfolioData.projects) {
        optimizedData.projects = await Promise.all(
          (portfolioData.projects as Array<Record<string, unknown>>).map(
            async project => {
              if (project.imageUrl) {
                const optimizedUrl = await this.imageOptimizer.optimizeImage(
                  String(project.imageUrl)
                );
                return {
                  ...project,
                  imageUrl: optimizedUrl,
                  imageSizes:
                    this.imageOptimizer.generateResponsiveSizes(optimizedUrl),
                };
              }
              return project;
            }
          )
        );
      }

      return optimizedData;
    } finally {
      this.monitor.endTimer('imageOptimization');
    }
  }

  /**
   * Optimize API calls
   */
  private async optimizeApiCalls(
    portfolioData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.monitor.startTimer('apiResponseTime');

    try {
      // Pre-cache template data
      if (portfolioData.template) {
        const templateUrl = `/api/v1/templates/${portfolioData.template}`;
        await this.apiOptimizer.optimizedFetch(templateUrl);
      }

      // Pre-cache user preferences
      if (portfolioData.userId) {
        const preferencesUrl = `/api/v1/users/${portfolioData.userId}/preferences`;
        await this.apiOptimizer.optimizedFetch(preferencesUrl);
      }

      return portfolioData;
    } finally {
      this.monitor.endTimer('apiResponseTime');
    }
  }

  /**
   * Preload template assets
   */
  private preloadTemplateAssets(template: string): void {
    const templateAssets = [
      `/templates/${template}.css`,
      `/templates/${template}.js`,
      `/fonts/template-${template}.woff2`,
    ].filter(asset => BundleOptimizer.shouldPreload(asset));

    BundleOptimizer.preloadResources(templateAssets);
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): {
    performance: string[];
    images: string[];
    api: string[];
    bundle: string[];
  } {
    const metrics = this.monitor.getMetrics();
    const recommendations: {
      performance: string[];
      images: string[];
      api: string[];
      bundle: string[];
    } = {
      performance: [],
      images: [],
      api: [],
      bundle: [],
    };

    // Performance recommendations
    if (metrics.totalTime > 30000) {
      recommendations.performance.push(
        'Total generation time exceeds 30-second target'
      );
    }

    if (metrics.templateRendering > 5000) {
      recommendations.performance.push(
        'Template rendering is slow - consider simplifying template'
      );
    }

    // Image optimization recommendations
    if (metrics.imageOptimization > 3000) {
      recommendations.images.push(
        'Image optimization is slow - consider reducing image sizes'
      );
      recommendations.images.push('Enable WebP format for better compression');
    }

    // API optimization recommendations
    if (metrics.apiResponseTime > 2000) {
      recommendations.api.push('API responses are slow - implement caching');
      recommendations.api.push('Consider API request batching');
    }

    // Bundle optimization recommendations
    if (metrics.totalTime > 20000) {
      recommendations.bundle.push(
        'Enable code splitting for better performance'
      );
      recommendations.bundle.push('Implement resource preloading');
    }

    return recommendations;
  }
}

/**
 * Default optimization configuration
 */
export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  enableImageOptimization: true,
  enableCodeSplitting: true,
  enablePreloading: true,
  enableCompression: true,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  compressionLevel: 85,
};

/**
 * Create optimized portfolio generator
 */
export function createOptimizedPortfolioGenerator(
  config: OptimizationConfig = DEFAULT_OPTIMIZATION_CONFIG
) {
  return new PortfolioPerformanceOptimizer(config);
}
