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

/**
 * @fileoverview Performance Optimization Utilities for 3-Minute Portfolio Revolution
 *
 * Comprehensive performance optimization system for portfolio generation,
 * ensuring sub-3-minute creation times and optimal user experience.
 * Designed for business excellence with competitive market positioning.
 *
 * @author PRISMA Development Team
 * @version 2.0.0
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
   * Check if performance meets sub-3-minute revolutionary target
   */
  meetsPerformanceTarget(): boolean {
    const totalTime = this.getMetrics().totalTime;
    return totalTime < 180000; // 3 minutes in milliseconds - Revolutionary target
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
      } catch (_error) {
        // Component loading error handled
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
    } catch (_error) {
      // Portfolio optimization error handled
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

    // Bundle optimization recommendations for 3-minute target
    if (metrics.totalTime > 120000) {
      // 2 minutes
      recommendations.bundle.push(
        'Critical: Enable code splitting for 3-minute target'
      );
      recommendations.bundle.push('Implement aggressive resource preloading');
    } else if (metrics.totalTime > 60000) {
      // 1 minute
      recommendations.bundle.push('Optimize for sub-3-minute performance');
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
 * 3-Minute Portfolio Challenge Performance Monitor
 *
 * Revolutionary monitoring system for achieving sub-3-minute portfolio generation
 * Designed for market dominance and competitive intelligence
 */
export class ThreeMinutePerformanceMonitor {
  private sessionStart: number = Date.now();
  private milestones: Map<string, number> = new Map();
  private userActions: Array<{
    action: string;
    timestamp: number;
    duration: number;
  }> = [];
  private performanceThresholds = {
    signup: 30000, // 30 seconds
    profile_import: 60000, // 1 minute
    ai_enhancement: 90000, // 1.5 minutes
    template_selection: 120000, // 2 minutes
    customization: 150000, // 2.5 minutes
    publish: 180000, // 3 minutes
  };

  /**
   * Track milestone completion for 3-minute funnel
   */
  trackMilestone(
    milestone: keyof typeof this.performanceThresholds,
    duration?: number
  ): void {
    const elapsed = Date.now() - this.sessionStart;
    const actualDuration = duration || elapsed;

    this.milestones.set(milestone, actualDuration);
    this.userActions.push({
      action: milestone,
      timestamp: Date.now(),
      duration: actualDuration,
    });

    // Real-time performance analysis
    const threshold = this.performanceThresholds[milestone];
    const isOnTrack = actualDuration <= threshold;
    const speedTier = this.calculateSpeedTier(actualDuration, threshold);

    // Analytics event for business intelligence
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('three_minute_milestone', {
        milestone,
        elapsed_time: actualDuration,
        threshold,
        on_track: isOnTrack,
        speed_tier: speedTier,
        predicted_completion: this.predictCompletionTime(),
      });
    }
  }

  /**
   * Calculate speed tier for competitive analysis
   */
  private calculateSpeedTier(actualTime: number, threshold: number): string {
    const ratio = actualTime / threshold;
    if (ratio <= 0.5) return 'lightning'; // 50% faster than target
    if (ratio <= 0.75) return 'champion'; // 25% faster than target
    if (ratio <= 1.0) return 'success'; // On target
    if (ratio <= 1.5) return 'acceptable'; // 50% slower
    return 'needs_optimization'; // More than 50% slower
  }

  /**
   * Predict total completion time based on current progress
   */
  predictCompletionTime(): number {
    const completedMilestones = this.milestones.size;
    const totalMilestones = Object.keys(this.performanceThresholds).length;

    if (completedMilestones === 0) return 180000; // Default 3 minutes

    const averageTimePerMilestone =
      Array.from(this.milestones.values()).reduce(
        (sum, time) => sum + time,
        0
      ) / completedMilestones;

    return averageTimePerMilestone * totalMilestones;
  }

  /**
   * Get real-time performance status
   */
  getPerformanceStatus(): {
    isOnTrack: boolean;
    currentMilestone: string;
    completionPercentage: number;
    predictedCompletion: number;
    speedTier: string;
    recommendations: string[];
  } {
    const completedMilestones = this.milestones.size;
    const totalMilestones = Object.keys(this.performanceThresholds).length;
    const completionPercentage = (completedMilestones / totalMilestones) * 100;
    const predictedCompletion = this.predictCompletionTime();
    const isOnTrack = predictedCompletion <= 180000;

    const lastMilestone = Array.from(this.milestones.keys()).pop() || 'signup';
    const lastTime = this.milestones.get(lastMilestone) || 0;
    const threshold =
      this.performanceThresholds[
        lastMilestone as keyof typeof this.performanceThresholds
      ];
    const speedTier = this.calculateSpeedTier(lastTime, threshold);

    const recommendations = this.generateOptimizationRecommendations();

    return {
      isOnTrack,
      currentMilestone: lastMilestone,
      completionPercentage,
      predictedCompletion,
      speedTier,
      recommendations,
    };
  }

  /**
   * Generate real-time optimization recommendations
   */
  private generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const predictedTime = this.predictCompletionTime();

    if (predictedTime > 180000) {
      recommendations.push('Speed up current step to stay under 3 minutes');
      recommendations.push('Consider using AI auto-suggestions');
    }

    if (predictedTime > 240000) {
      recommendations.push('Critical: Simplify remaining steps');
      recommendations.push('Use quick template selection');
    }

    // Specific milestone recommendations
    const currentElapsed = Date.now() - this.sessionStart;
    if (currentElapsed > 60000 && !this.milestones.has('profile_import')) {
      recommendations.push('Use LinkedIn/GitHub import for faster setup');
    }

    if (currentElapsed > 120000 && !this.milestones.has('ai_enhancement')) {
      recommendations.push('Enable AI auto-enhancement to save time');
    }

    return recommendations;
  }

  /**
   * Export analytics data for thought leadership
   */
  exportAnalyticsData(): {
    sessionDuration: number;
    milestones: Record<string, number>;
    overallPerformance: string;
    competitiveMetrics: {
      vs_30_minute_competitors: string;
      vs_5_minute_competitors: string;
      market_position: string;
    };
  } {
    const sessionDuration = Date.now() - this.sessionStart;
    const milestoneData = Object.fromEntries(this.milestones);

    let overallPerformance = 'excellent';
    if (sessionDuration > 180000) overallPerformance = 'needs_improvement';
    else if (sessionDuration > 120000) overallPerformance = 'good';

    return {
      sessionDuration,
      milestones: milestoneData,
      overallPerformance,
      competitiveMetrics: {
        vs_30_minute_competitors:
          sessionDuration < 900000 ? '20x faster' : '10x faster',
        vs_5_minute_competitors:
          sessionDuration < 300000 ? '40% faster' : 'competitive',
        market_position:
          sessionDuration < 180000 ? 'industry_leader' : 'competitive',
      },
    };
  }
}

/**
 * Global 3-minute performance monitor instance
 */
let globalThreeMinuteMonitor: ThreeMinutePerformanceMonitor | null = null;

/**
 * Get or create global 3-minute performance monitor
 */
export function getThreeMinuteMonitor(): ThreeMinutePerformanceMonitor {
  if (!globalThreeMinuteMonitor) {
    globalThreeMinuteMonitor = new ThreeMinutePerformanceMonitor();
  }
  return globalThreeMinuteMonitor;
}

/**
 * Reset global monitor for new session
 */
export function resetThreeMinuteMonitor(): ThreeMinutePerformanceMonitor {
  globalThreeMinuteMonitor = new ThreeMinutePerformanceMonitor();
  return globalThreeMinuteMonitor;
}

/**
 * Create optimized portfolio generator
 */
export function createOptimizedPortfolioGenerator(
  config: OptimizationConfig = DEFAULT_OPTIMIZATION_CONFIG
) {
  return new PortfolioPerformanceOptimizer(config);
}
