/**
 * Performance monitoring tests
 */

import {
  reportWebVitals,
  measureAsyncOperation,
  trackApiCall,
  getPerformanceStats,
  resetStats,
} from '@/lib/monitoring/performance';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    resetStats();
  });

  describe('reportWebVitals', () => {
    it('should report web vitals metrics', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      reportWebVitals({
        name: 'FCP',
        value: 1200,
        id: 'test-id',
        label: 'web-vital',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Web Vital'),
        expect.objectContaining({
          name: 'FCP',
          value: 1200,
          rating: 'good',
        })
      );

      consoleSpy.mockRestore();
    });

    it('should calculate correct ratings', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Test LCP ratings
      reportWebVitals({ name: 'LCP', value: 2000 }); // good
      reportWebVitals({ name: 'LCP', value: 3000 }); // needs improvement
      reportWebVitals({ name: 'LCP', value: 5000 }); // poor

      // Test FID ratings
      reportWebVitals({ name: 'FID', value: 50 }); // good
      reportWebVitals({ name: 'FID', value: 200 }); // needs improvement
      reportWebVitals({ name: 'FID', value: 400 }); // poor

      const calls = consoleSpy.mock.calls;
      expect(calls[0][1].rating).toBe('good');
      expect(calls[1][1].rating).toBe('needs improvement');
      expect(calls[2][1].rating).toBe('poor');

      consoleSpy.mockRestore();
    });
  });

  describe('measureAsyncOperation', () => {
    it('should measure async operation duration', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await measureAsyncOperation('test-operation', operation);

      expect(result!).toBe('result');
      expect(operation!).toHaveBeenCalled();

      const stats = getPerformanceStats();
      expect(stats['test-operation']).toBeDefined();
      expect(stats['test-operation'].count).toBe(1);
      expect(stats['test-operation'].totalDuration).toBeGreaterThan(0);
    });

    it('should track multiple operations', async () => {
      const operation = jest
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve('done'), 10))
        );

      await Promise.all([
        measureAsyncOperation('multi-op', operation),
        measureAsyncOperation('multi-op', operation),
        measureAsyncOperation('multi-op', operation),
      ]);

      const stats = getPerformanceStats();
      expect(stats['multi-op'].count).toBe(3);
      expect(stats['multi-op'].averageDuration).toBeGreaterThan(0);
    });

    it('should handle operation errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(
        measureAsyncOperation('error-op', operation)
      ).rejects.toThrow('Test error');

      const stats = getPerformanceStats();
      expect(stats['error-op']).toBeDefined();
      expect(stats['error-op'].count).toBe(1);
    });
  });

  describe('trackApiCall', () => {
    it('should track API call performance', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const response = await trackApiCall('/api/test', {
        method: 'GET',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
      });
      expect(response.ok).toBe(true);

      const stats = getPerformanceStats();
      expect(stats['api_/api/test']).toBeDefined();
      expect(stats['api_/api/test'].count).toBe(1);
    });

    it('should track failed API calls', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      global.fetch = mockFetch;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const response = await trackApiCall('/api/error', {
        method: 'POST',
      });

      expect(response.ok).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API call failed'),
        expect.objectContaining({
          endpoint: '/api/error',
          status: 500,
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getPerformanceStats', () => {
    it('should return accumulated stats', async () => {
      await measureAsyncOperation('op1', async () => 'result1');
      await measureAsyncOperation('op2', async () => 'result2');

      const stats = getPerformanceStats();

      expect(Object.keys(stats)).toHaveLength(2);
      expect(stats.op1).toBeDefined();
      expect(stats.op2).toBeDefined();
    });

    it('should calculate correct averages', async () => {
      const delays = [10, 20, 30];

      for (const delay of delays) {
        await measureAsyncOperation(
          'avg-test',
          () => new Promise(resolve => setTimeout(resolve, delay))
        );
      }

      const stats = getPerformanceStats();
      expect(stats['avg-test'].count).toBe(3);
      expect(stats['avg-test'].averageDuration).toBeGreaterThan(0);
      expect(stats['avg-test'].maxDuration).toBeGreaterThanOrEqual(
        stats['avg-test'].minDuration
      );
    });
  });

  describe('resetStats', () => {
    it('should clear all performance stats', async () => {
      await measureAsyncOperation('to-clear', async () => 'data');

      let stats = getPerformanceStats();
      expect(Object.keys(stats)).toHaveLength(1);

      resetStats();

      stats = getPerformanceStats();
      expect(Object.keys(stats)).toHaveLength(0);
    });
  });
});
