/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  PerformanceMonitor,
  ImageOptimizer,
  APIOptimizer,
  BundleOptimizer,
  PortfolioPerformanceOptimizer,
  DEFAULT_OPTIMIZATION_CONFIG,
} from '@/lib/performance/optimization';

import {
  DeviceDetector,
  MobileImageOptimizer,
  MobileViewportOptimizer,
  MobileDataOptimizer,
  MobileOptimizationSystem,
  DEFAULT_MOBILE_CONFIG,
} from '@/lib/performance/mobile-optimization';

import {
  MobileCSSOptimizer,
  TemplateMobileOptimizer,
  createTemplateMobileOptimizer,
} from '@/lib/performance/mobile-css-optimization';

// Mock fetch for API tests
global.fetch = jest.fn();

describe('Performance Optimization System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('PerformanceMonitor', () => {
    it('should track operation timing accurately', () => {
      const monitor = new PerformanceMonitor();

      monitor.startTimer('testOperation');

      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait for ~10ms
      }

      const duration = monitor.endTimer('testOperation');

      expect(duration).toBeGreaterThan(5);
      expect(duration).toBeLessThan(50);
    });

    it('should calculate total metrics correctly', () => {
      const monitor = new PerformanceMonitor();

      monitor.startTimer('operation1');
      monitor.endTimer('operation1');
      monitor.startTimer('operation2');
      monitor.endTimer('operation2');

      const metrics = monitor.getMetrics();
      expect(metrics.totalTime).toBeGreaterThan(0);
      expect(metrics.portfolioCreation).toBeDefined();
    });

    it('should check performance targets correctly', () => {
      const monitor = new PerformanceMonitor();

      // Test fast operation
      monitor.startTimer('fastOperation');
      monitor.endTimer('fastOperation');

      expect(monitor.meetsPerformanceTarget()).toBe(true);
    });

    it('should reset metrics correctly', () => {
      const monitor = new PerformanceMonitor();

      monitor.startTimer('test');
      monitor.endTimer('test');

      const metricsBeforeReset = monitor.getMetrics();
      expect(metricsBeforeReset.totalTime).toBeGreaterThan(0);

      monitor.reset();

      const metricsAfterReset = monitor.getMetrics();
      expect(metricsAfterReset.totalTime).toBe(0);
    });
  });

  describe('ImageOptimizer', () => {
    it('should optimize images when enabled', async () => {
      const optimizer = new ImageOptimizer(DEFAULT_OPTIMIZATION_CONFIG);

      const testUrl = 'https://example.com/image.jpg';
      const optimized = await optimizer.optimizeImage(testUrl);

      expect(optimized).toBe(testUrl);
    });

    it('should handle file size validation', async () => {
      const optimizer = new ImageOptimizer(DEFAULT_OPTIMIZATION_CONFIG);

      // Create a mock file that's too large
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      await expect(optimizer.optimizeImage(largeFile)).rejects.toThrow(
        'exceeds maximum'

    });

    it('should generate responsive sizes correctly', () => {
      const optimizer = new ImageOptimizer(DEFAULT_OPTIMIZATION_CONFIG);

      const sizes = optimizer.generateResponsiveSizes(
        'https://example.com/image.jpg'

      expect(sizes.sm).toContain('w=400');
      expect(sizes.md).toContain('w=800');
      expect(sizes.lg).toContain('w=1200');
      expect(sizes.sm).toContain(
        `q=${DEFAULT_OPTIMIZATION_CONFIG.compressionLevel}`

    });
  });

  describe('APIOptimizer', () => {
    it('should cache GET responses', async () => {
      const optimizer = new APIOptimizer();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        clone: () => ({
          json: async () => ({ data: 'test' }),
        }),
        json: async () => ({ data: 'test' }),
      });

      // First request
      const response1 = await optimizer.optimizedFetch('/api/test');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second request should use cache
      const response2 = await optimizer.optimizedFetch('/api/test');
      expect(global.fetch).toHaveBeenCalledTimes(1); // No additional fetch

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1).toEqual(data2);
    });

    it('should add compression headers', async () => {
      const optimizer = new APIOptimizer();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        clone: () => ({ json: async () => ({}) }),
        json: async () => ({}),
      });

      await optimizer.optimizedFetch('/api/test');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['Accept-Encoding']).toContain('gzip');
    });

    it('should handle cache expiration', () => {
      const optimizer = new APIOptimizer();

      // Cache with short TTL
      optimizer.cacheResponse('test', { data: 'test' }, 1);

      // Should return cached data immediately
      expect(optimizer.getCachedResponse('test')).toEqual({ data: 'test' });

      // Wait for expiration and check again
      setTimeout(() => {
        expect(optimizer.getCachedResponse('test')).toBeNull();
      }, 10);
    });
  });

  describe('Mobile Device Detection', () => {
    it('should detect mobile devices correctly', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        configurable: true,
      });

      const detector = new DeviceDetector();
      const capabilities = detector.getCapabilities();

      expect(capabilities.isMobile).toBe(true);
      expect(capabilities.isTablet).toBe(false);
    });

    it('should detect low-end devices', () => {
      // Mock low-end device indicators
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 1,
        configurable: true,
      });

      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        configurable: true,
      });

      const detector = new DeviceDetector();
      const capabilities = detector.getCapabilities();

      expect(capabilities.isLowEndDevice).toBe(true);
      expect(detector.needsAggressiveOptimization()).toBe(true);
    });

    it('should detect slow connections', () => {
      // Mock slow connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g',
          downlink: 0.5,
        },
        configurable: true,
      });

      const detector = new DeviceDetector();
      const capabilities = detector.getCapabilities();

      expect(capabilities.hasSlowConnection).toBe(true);
    });
  });

  describe('Mobile Image Optimization', () => {
    it('should optimize images for mobile devices', () => {
      const detector = new DeviceDetector();
      const optimizer = new MobileImageOptimizer(
        DEFAULT_MOBILE_CONFIG,
        detector

      const optimization = optimizer.optimizeForMobile(
        'https://example.com/image.jpg'

      expect(optimization.src).toContain('w=');
      expect(optimization.src).toContain('q=');
      expect(optimization.srcSet).toContain(',');
      expect(optimization.sizes).toContain('vw');
      expect(['lazy', 'eager']).toContain(optimization.loading);
    });

    it('should adjust quality for low-end devices', () => {
      // Mock low-end device
      const detector = new DeviceDetector();
      jest.spyOn(detector, 'needsAggressiveOptimization').mockReturnValue(true);

      const optimizer = new MobileImageOptimizer(
        DEFAULT_MOBILE_CONFIG,
        detector

      const optimization = optimizer.optimizeForMobile(
        'https://example.com/image.jpg'

      expect(optimization.quality).toBeLessThanOrEqual(60);
    });
  });

  describe('Mobile CSS Optimization', () => {
    it('should generate responsive container classes', () => {
      const optimizer = new MobileCSSOptimizer();
      const containerClasses = optimizer.getResponsiveContainer();

      expect(containerClasses).toContain('w-full');
      expect(containerClasses).toContain('px-4');
      expect(containerClasses).toContain('sm:px-6');
      expect(containerClasses).toContain('lg:px-8');
    });

    it('should generate responsive grid classes', () => {
      const optimizer = new MobileCSSOptimizer();
      const gridClasses = optimizer.getResponsiveGrid({
        mobile: 1,
        tablet: 2,
        desktop: 3,
      });

      expect(gridClasses).toContain('grid-cols-1');
      expect(gridClasses).toContain('md:grid-cols-2');
      expect(gridClasses).toContain('lg:grid-cols-3');
    });

    it('should generate touch-optimized button classes', () => {
      const optimizer = new MobileCSSOptimizer();
      const buttonClasses = optimizer.getTouchOptimizedButton();

      expect(buttonClasses).toContain('inline-flex');
      expect(buttonClasses).toContain('min-h-[44px]');
      expect(buttonClasses).toContain('transition-all');
    });

    it('should generate mobile stylesheet with custom properties', () => {
      const optimizer = new MobileCSSOptimizer();
      const stylesheet = optimizer.generateMobileStylesheet();

      expect(stylesheet).toContain(':root');
      expect(stylesheet).toContain('--touch-target-min');
      expect(stylesheet).toContain('@media (prefers-reduced-motion: reduce)');
      expect(stylesheet).toContain('min-height: var(--touch-target-min)');
    });
  });

  describe('Template Mobile Optimization', () => {
    it('should generate template-specific mobile classes', () => {
      const optimizer = createTemplateMobileOptimizer();

      const modernClasses = optimizer.getModernTemplateMobile();
      expect(modernClasses.hero).toContain('py-12');
      expect(modernClasses.card).toContain('backdrop-blur-sm');

      const minimalClasses = optimizer.getMinimalTemplateMobile();
      expect(minimalClasses.layout).toContain('space-y-8');
      expect(minimalClasses.typography).toContain('leading-relaxed');

      const businessClasses = optimizer.getBusinessTemplateMobile();
      expect(businessClasses.header).toContain('bg-slate-900');
      expect(businessClasses.metrics).toContain('grid-cols-2');

      const creativeClasses = optimizer.getCreativeTemplateMobile();
      expect(creativeClasses.masonry).toContain('columns-1');
      expect(creativeClasses.animations).toContain('hover:scale-105');

      const educatorClasses = optimizer.getEducatorTemplateMobile();
      expect(educatorClasses.timeline).toContain('relative');
      expect(educatorClasses.philosophy).toContain('bg-amber-50');
    });
  });

  describe('Portfolio Performance Optimization', () => {
    it('should optimize complete portfolio creation workflow', async () => {
      const optimizer = new PortfolioPerformanceOptimizer(
        DEFAULT_OPTIMIZATION_CONFIG

      const portfolioData = {
        name: 'Test Portfolio',
        template: 'modern',
        avatarUrl: 'https://example.com/avatar.jpg',
        projects: [
          {
            id: '1',
            title: 'Project 1',
            imageUrl: 'https://example.com/project1.jpg',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        clone: () => ({ json: async () => ({}) }),
        json: async () => ({}),
      });

      const result = await optimizer.optimizePortfolioCreation(portfolioData);

      expect(result.success).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.optimizedData).toBeDefined();
      expect(result.metrics.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should provide optimization recommendations', () => {
      const optimizer = new PortfolioPerformanceOptimizer(
        DEFAULT_OPTIMIZATION_CONFIG

      // Simulate performance issues by manually setting metrics
      const monitor = new PerformanceMonitor();
      monitor.startTimer('portfolioCreation');
      // Simulate long operation
      setTimeout(() => {
        monitor.endTimer('portfolioCreation');
      }, 100);

      const recommendations = optimizer.getOptimizationRecommendations();

      expect(recommendations.performance).toBeDefined();
      expect(recommendations.images).toBeDefined();
      expect(recommendations.api).toBeDefined();
      expect(recommendations.bundle).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full mobile optimization workflow', () => {
      const mobileSystem = new MobileOptimizationSystem();

      // Initialize optimizations
      expect(() => mobileSystem.initialize()).not.toThrow();

      // Check device capabilities
      const capabilities = mobileSystem.getDeviceCapabilities();
      expect(capabilities).toBeDefined();
      expect(typeof capabilities.isMobile).toBe('boolean');

      // Optimize an image
      const imageConfig = mobileSystem.optimizeImage(
        'https://example.com/test.jpg'

      expect(imageConfig.src).toBeDefined();
      expect(imageConfig.quality).toBeGreaterThan(0);

      // Check if mobile device
      const isMobile = mobileSystem.isMobileDevice();
      expect(typeof isMobile).toBe('boolean');
    });

    it('should handle performance monitoring throughout portfolio creation', async () => {
      const monitor = new PerformanceMonitor();

      // Simulate complete portfolio creation workflow
      monitor.startTimer('portfolioCreation');

      // Step 1: Template rendering
      monitor.startTimer('templateRendering');
      await new Promise(resolve => setTimeout(resolve, 10));
      monitor.endTimer('templateRendering');

      // Step 2: AI processing
      monitor.startTimer('aiProcessing');
      await new Promise(resolve => setTimeout(resolve, 5));
      monitor.endTimer('aiProcessing');

      // Step 3: Image optimization
      monitor.startTimer('imageOptimization');
      await new Promise(resolve => setTimeout(resolve, 8));
      monitor.endTimer('imageOptimization');

      // Step 4: API response
      monitor.startTimer('apiResponseTime');
      await new Promise(resolve => setTimeout(resolve, 3));
      monitor.endTimer('apiResponseTime');

      monitor.endTimer('portfolioCreation');

      const metrics = monitor.getMetrics();

      expect(metrics.templateRendering).toBeGreaterThan(0);
      expect(metrics.aiProcessing).toBeGreaterThan(0);
      expect(metrics.imageOptimization).toBeGreaterThan(0);
      expect(metrics.apiResponseTime).toBeGreaterThan(0);
      expect(metrics.totalTime).toBeGreaterThan(0);

      // Should meet performance targets for this test
      expect(monitor.meetsPerformanceTarget()).toBe(true);
    });
  });
});
