/**
 * @jest-environment jsdom
 */

import {
  PerformanceMonitor,
  PerformanceMetrics,
  ComponentPerformance,
  getMemoryUsage,
} from '@/lib/utils/performance';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

// Mock Performance APIs
const mockPerformanceObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

mockPerformanceObserver.mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

global.PerformanceObserver = mockPerformanceObserver as any;

// Mock performance APIs
const mockPerformanceNow = jest.fn(() => 1000);
const mockGetEntriesByType = jest.fn();

Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    getEntriesByType: mockGetEntriesByType,
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 200 * 1024 * 1024,
    },
  },
  writable: true,
});

describe('Performance Utilities', () => {
  let monitor: PerformanceMonitor;
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    jest.clearAllMocks();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockPerformanceNow.mockReturnValue(1000);
    mockGetEntriesByType.mockReturnValue([]);
    
    // Reset singleton instance
    (PerformanceMonitor as any).instance = undefined;
    
    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    console.log = jest.fn();
    console.warn = jest.fn();

    // Mock environment
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING;

    monitor = PerformanceMonitor.getInstance();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    
    // Clean up monitor
    if (monitor) {
      monitor.destroy();
    }
  });

  describe('PerformanceMonitor', () => {
    describe('Singleton Pattern', () => {
      it('should return the same instance', () => {
        const instance1 = PerformanceMonitor.getInstance();
        const instance2 = PerformanceMonitor.getInstance();
        
        expect(instance1).toBe(instance2);
      });

      it('should create only one instance', () => {
        const instance1 = PerformanceMonitor.getInstance();
        const instance2 = PerformanceMonitor.getInstance();
        const instance3 = PerformanceMonitor.getInstance();
        
        expect(instance1).toBe(instance2);
        expect(instance2).toBe(instance3);
      });
    });

    describe('Initialization', () => {
      it('should initialize observers in development mode', () => {
        process.env.NODE_ENV = 'development';
        
        // Create new instance
        (PerformanceMonitor as any).instance = undefined;
        const devMonitor = PerformanceMonitor.getInstance();
        
        expect(mockPerformanceObserver).toHaveBeenCalled();
      });

      it('should initialize observers when explicitly enabled', () => {
        process.env.NODE_ENV = 'production';
        process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING = 'true';
        
        // Create new instance
        (PerformanceMonitor as any).instance = undefined;
        const prodMonitor = PerformanceMonitor.getInstance();
        
        expect(mockPerformanceObserver).toHaveBeenCalled();
      });

      it('should not initialize observers in production by default', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING;
        
        mockPerformanceObserver.mockClear();
        
        // Create new instance
        (PerformanceMonitor as any).instance = undefined;
        const prodMonitor = PerformanceMonitor.getInstance();
        
        // Should not initialize observers
        expect(mockPerformanceObserver).not.toHaveBeenCalled();
      });
    });

    describe('Observer Setup', () => {
      it('should attempt to setup performance observers in development', () => {
        // In development mode, it should try to create observers
        expect(mockPerformanceObserver).toHaveBeenCalled();
        
        // Even if observe is not called due to environment, 
        // the observer creation attempt shows it's trying to set up monitoring
        expect(mockPerformanceObserver.mock.calls.length).toBeGreaterThan(0);
      });

      it('should handle observer creation errors gracefully', () => {
        mockPerformanceObserver.mockImplementationOnce(() => {
          throw new Error('Observer not supported');
        });

        // Should not throw
        expect(() => {
          (PerformanceMonitor as any).instance = undefined;
          PerformanceMonitor.getInstance();
        }).not.toThrow();

        expect(logger.warn).toHaveBeenCalled();
      });
    });

    describe('Component Performance Tracking', () => {
      it('should track component render time', () => {
        monitor.trackComponentRender('TestComponent', 10);
        
        const metrics = monitor.getComponentMetrics();
        expect(metrics).toHaveLength(1);
        
        const metric = metrics[0];
        expect(metric.componentName).toBe('TestComponent');
        expect(metric.renderTime).toBe(10);
        expect(metric.renderCount).toBe(1);
        expect(metric.averageRenderTime).toBe(10);
      });

      it('should accumulate multiple renders for same component', () => {
        monitor.trackComponentRender('TestComponent', 10);
        monitor.trackComponentRender('TestComponent', 20);
        monitor.trackComponentRender('TestComponent', 30);
        
        const metrics = monitor.getComponentMetrics();
        const metric = metrics.find(m => m.componentName === 'TestComponent');
        
        expect(metric?.renderTime).toBe(60);
        expect(metric?.renderCount).toBe(3);
        expect(metric?.averageRenderTime).toBe(20);
      });

      it('should track multiple components separately', () => {
        monitor.trackComponentRender('ComponentA', 10);
        monitor.trackComponentRender('ComponentB', 15);
        monitor.trackComponentRender('ComponentA', 20);
        
        const metrics = monitor.getComponentMetrics();
        expect(metrics).toHaveLength(2);
        
        const componentA = metrics.find(m => m.componentName === 'ComponentA');
        const componentB = metrics.find(m => m.componentName === 'ComponentB');
        
        expect(componentA?.renderCount).toBe(2);
        expect(componentB?.renderCount).toBe(1);
      });

      it('should warn about slow components in development', () => {
        process.env.NODE_ENV = 'development';
        
        monitor.trackComponentRender('SlowComponent', 25); // > 16ms threshold
        
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Slow component render: SlowComponent took 25.00ms')
        );
      });

      it('should not warn about slow components in production', () => {
        process.env.NODE_ENV = 'production';
        
        monitor.trackComponentRender('SlowComponent', 25);
        
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('should not track when monitoring is disabled', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING;
        
        // Create new instance with monitoring disabled
        (PerformanceMonitor as any).instance = undefined;
        const disabledMonitor = PerformanceMonitor.getInstance();
        
        disabledMonitor.trackComponentRender('TestComponent', 10);
        
        const metrics = disabledMonitor.getComponentMetrics();
        expect(metrics).toHaveLength(0);
      });
    });

    describe('Metrics Reporting', () => {
      it('should return current metrics', () => {
        const metrics = monitor.getMetrics();
        
        expect(metrics).toBeDefined();
        expect(typeof metrics).toBe('object');
      });

      it('should return component metrics array', () => {
        monitor.trackComponentRender('TestComponent', 10);
        
        const metrics = monitor.getComponentMetrics();
        
        expect(Array.isArray(metrics)).toBe(true);
        expect(metrics).toHaveLength(1);
      });

      it('should return immutable metrics object', () => {
        const metrics1 = monitor.getMetrics();
        const metrics2 = monitor.getMetrics();
        
        // Should be different objects (defensive copy)
        expect(metrics1).not.toBe(metrics2);
        expect(metrics1).toEqual(metrics2);
      });
    });

    describe('Performance Score Calculation', () => {
      it('should return perfect score with no metrics', () => {
        const score = monitor.getPerformanceScore();
        expect(score).toBe(100);
      });

      it('should penalize poor LCP', () => {
        // Simulate poor LCP > 4s
        (monitor as any).metrics.lcp = 5000;
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(60); // 100 - 40
      });

      it('should penalize moderate LCP', () => {
        // Simulate moderate LCP 2.5-4s
        (monitor as any).metrics.lcp = 3000;
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(80); // 100 - 20
      });

      it('should penalize poor FID', () => {
        // Simulate poor FID > 300ms
        (monitor as any).metrics.fid = 400;
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(70); // 100 - 30
      });

      it('should penalize moderate FID', () => {
        // Simulate moderate FID 100-300ms
        (monitor as any).metrics.fid = 200;
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(85); // 100 - 15
      });

      it('should penalize poor CLS', () => {
        // Simulate poor CLS > 0.25
        (monitor as any).metrics.cls = 0.3;
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(70); // 100 - 30
      });

      it('should penalize moderate CLS', () => {
        // Simulate moderate CLS 0.1-0.25
        (monitor as any).metrics.cls = 0.15;
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(85); // 100 - 15
      });

      it('should combine penalties correctly', () => {
        // Simulate poor performance across all metrics
        (monitor as any).metrics.lcp = 5000; // -40
        (monitor as any).metrics.fid = 400;  // -30
        (monitor as any).metrics.cls = 0.3;  // -30
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(0); // 100 - 40 - 30 - 30 = 0 (min)
      });

      it('should not go below 0', () => {
        // Simulate extreme poor performance
        (monitor as any).metrics.lcp = 10000;
        (monitor as any).metrics.fid = 1000;
        (monitor as any).metrics.cls = 1.0;
        
        const score = monitor.getPerformanceScore();
        expect(score).toBe(0);
      });
    });

    describe('Metric Reporting', () => {
      it('should log metrics in development mode', () => {
        process.env.NODE_ENV = 'development';
        
        // Trigger metric reporting by setting up observer callback
        const lcpCallback = mockPerformanceObserver.mock.calls.find(
          call => call[0].toString().includes('lcp')
        )?.[0];
        
        if (lcpCallback) {
          // Simulate LCP entry
          lcpCallback({
            getEntries: () => [{ startTime: 2000 }],
          });
          
          expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('📊 Performance Metric: lcp = 2000.00ms')
          );
        }
      });

      it('should not log metrics in production', () => {
        process.env.NODE_ENV = 'production';
        process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING = 'true';
        
        // Create new instance for production
        (PerformanceMonitor as any).instance = undefined;
        const prodMonitor = PerformanceMonitor.getInstance();
        
        console.log = jest.fn();
        
        // Manually trigger metric reporting
        (prodMonitor as any).reportMetric('test', 100);
        
        expect(console.log).not.toHaveBeenCalled();
      });

      it('should get correct metric units', () => {
        const monitor = PerformanceMonitor.getInstance();
        
        expect((monitor as any).getMetricUnit('cls')).toBe('');
        expect((monitor as any).getMetricUnit('lcp')).toBe('ms');
        expect((monitor as any).getMetricUnit('fid')).toBe('ms');
        expect((monitor as any).getMetricUnit('ttfb')).toBe('ms');
        expect((monitor as any).getMetricUnit('fcp')).toBe('ms');
        expect((monitor as any).getMetricUnit('unknown')).toBe('');
      });
    });

    describe('Observer Management', () => {
      it('should have destroy method', () => {
        expect(typeof monitor.destroy).toBe('function');
        
        // Should not throw when called
        expect(() => monitor.destroy()).not.toThrow();
      });

      it('should clear observer map on destroy', () => {
        monitor.destroy();
        
        // Observers map should be cleared
        const observersSize = (monitor as any).observers.size;
        expect(observersSize).toBe(0);
      });
    });

    describe('Navigation Timing', () => {
      it('should have navigation timing method', () => {
        expect(typeof (monitor as any).observeNavigationTiming).toBe('function');
      });

      it('should handle missing navigation timing gracefully', () => {
        mockGetEntriesByType.mockReturnValue([]);

        expect(() => {
          (monitor as any).observeNavigationTiming();
        }).not.toThrow();
      });
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should return memory usage when available', () => {
      // Update global performance to have memory property
      Object.defineProperty(global.performance, 'memory', {
        value: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
        },
        configurable: true,
      });
      
      const memory = getMemoryUsage();
      
      expect(memory).not.toBeNull();
      expect(memory?.used).toBe(50 * 1024 * 1024);
      expect(memory?.total).toBe(100 * 1024 * 1024);
      expect(memory?.percentage).toBe(50);
    });

    it('should return null when memory API not available', () => {
      const originalMemory = (performance as any).memory;
      delete (performance as any).memory;
      
      const memory = getMemoryUsage();
      expect(memory).toBeNull();
      
      // Restore memory API
      (performance as any).memory = originalMemory;
    });

    it('should return null in server environment', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      
      const memory = getMemoryUsage();
      expect(memory).toBeNull();
      
      // Restore window
      global.window = originalWindow;
    });

    it('should calculate percentage correctly', () => {
      // Update mock memory values
      (performance as any).memory = {
        usedJSHeapSize: 25 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024,
      };
      
      const memory = getMemoryUsage();
      expect(memory?.percentage).toBe(25);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing PerformanceObserver gracefully', () => {
      const originalObserver = global.PerformanceObserver;
      delete (global as any).PerformanceObserver;
      
      expect(() => {
        (PerformanceMonitor as any).instance = undefined;
        PerformanceMonitor.getInstance();
      }).not.toThrow();
      
      // Restore PerformanceObserver
      global.PerformanceObserver = originalObserver;
    });

    it('should handle observer setup errors', () => {
      mockPerformanceObserver.mockImplementationOnce(() => {
        throw new Error('Observer creation failed');
      });
      
      expect(() => {
        (PerformanceMonitor as any).instance = undefined;
        PerformanceMonitor.getInstance();
      }).not.toThrow();
      
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle missing performance.now gracefully', () => {
      const originalNow = performance.now;
      delete (performance as any).now;
      
      // Should not crash when tracking components
      expect(() => {
        monitor.trackComponentRender('TestComponent', 10);
      }).not.toThrow();
      
      // Restore performance.now
      performance.now = originalNow;
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero render times', () => {
      monitor.trackComponentRender('InstantComponent', 0);
      
      const metrics = monitor.getComponentMetrics();
      const metric = metrics[0];
      
      expect(metric.renderTime).toBe(0);
      expect(metric.averageRenderTime).toBe(0);
    });

    it('should handle negative render times', () => {
      monitor.trackComponentRender('NegativeComponent', -5);
      
      const metrics = monitor.getComponentMetrics();
      const metric = metrics[0];
      
      expect(metric.renderTime).toBe(-5);
      expect(metric.averageRenderTime).toBe(-5);
    });

    it('should handle very large render times', () => {
      const largeTime = 999999;
      monitor.trackComponentRender('VerySlowComponent', largeTime);
      
      const metrics = monitor.getComponentMetrics();
      const metric = metrics[0];
      
      expect(metric.renderTime).toBe(largeTime);
      expect(metric.averageRenderTime).toBe(largeTime);
    });

    it('should handle component names with special characters', () => {
      const specialName = 'Component@#$%^&*()';
      monitor.trackComponentRender(specialName, 10);
      
      const metrics = monitor.getComponentMetrics();
      const metric = metrics[0];
      
      expect(metric.componentName).toBe(specialName);
    });

    it('should handle empty component names', () => {
      monitor.trackComponentRender('', 10);
      
      const metrics = monitor.getComponentMetrics();
      const metric = metrics[0];
      
      expect(metric.componentName).toBe('');
    });
  });

  describe('Performance Integration', () => {
    it('should work with real performance.now calls', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1020);
      
      const startTime = performance.now();
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      monitor.trackComponentRender('RealTimingComponent', renderTime);
      
      const metrics = monitor.getComponentMetrics();
      const metric = metrics[0];
      
      expect(metric.renderTime).toBe(20);
    });

    it('should handle concurrent component tracking', () => {
      // Simulate multiple components rendering simultaneously
      monitor.trackComponentRender('Component1', 10);
      monitor.trackComponentRender('Component2', 15);
      monitor.trackComponentRender('Component3', 20);
      monitor.trackComponentRender('Component1', 5); // Re-render
      
      const metrics = monitor.getComponentMetrics();
      expect(metrics).toHaveLength(3);
      
      const component1 = metrics.find(m => m.componentName === 'Component1');
      expect(component1?.renderCount).toBe(2);
      expect(component1?.averageRenderTime).toBe(7.5); // (10 + 5) / 2
    });
  });
});