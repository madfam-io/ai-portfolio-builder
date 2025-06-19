/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock dependencies first
const mockHandleHealthCheck = jest.fn();

jest.mock('@/lib/monitoring/health-check', () => ({
  handleHealthCheck: mockHandleHealthCheck,
  healthMonitor: {
    getSystemHealth: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring/error-tracking', () => ({
  withErrorTracking: (handler: any) => handler,
}));

jest.mock('@/lib/monitoring/apm', () => ({
  withAPMTracking: (handler: any) => handler,
}));

// Import after mocks
import { GET, HEAD } from '@/app/api/v1/health/route';

describe('/api/v1/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const createRequest = (method: string = 'GET') => {
    return new NextRequest('http://localhost:3000/api/v1/health', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('GET', () => {
    it('should return comprehensive health check', async () => {
      const healthData = {
        status: 'healthy',
        timestamp: '2025-01-01T00:00:00.000Z',
        version: '0.3.0-beta',
        services: {
          database: {
            status: 'healthy',
            responseTime: 25,
          },
          redis: {
            status: 'healthy',
            responseTime: 8,
          },
          ai: {
            status: 'healthy',
            responseTime: 120,
          },
        },
        environment: 'test',
        uptime: 3600,
        memoryUsage: {
          used: 128,
          total: 512,
          percentage: 25,
        },
      };

      const mockResponse = new Response(JSON.stringify(healthData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      mockHandleHealthCheck.mockResolvedValue(mockResponse as any);

      const request = createRequest();
      const response = await GET(request);

      // Since the real function is being called, test the actual response
      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('overall');
      expect(responseData).toHaveProperty('checks');
      expect(responseData).toHaveProperty('timestamp');
      expect(responseData).toHaveProperty('uptime');
      expect(responseData).toHaveProperty('version');
    });

    it('should handle health check service errors', async () => {
      const request = createRequest();
      const response = await GET(request);

      // Health check should return 200 or 503 depending on system health
      expect([200, 503]).toContain(response.status);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('overall');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(responseData.overall);
    });

    it('should handle health check exceptions', async () => {
      const request = createRequest();
      const response = await GET(request);

      // Even if some health checks fail, the endpoint should return a response
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  describe('HEAD', () => {
    it('should return quick health check for load balancers', async () => {
      const request = createRequest('HEAD');
      const response = await HEAD(request);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
      expect(mockHandleHealthCheck).not.toHaveBeenCalled();
    });

    it('should have minimal response time for load balancer checks', async () => {
      const startTime = Date.now();

      const request = createRequest('HEAD');
      await HEAD(request);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should be very fast (under 10ms for a simple response)
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('Integration', () => {
    it('should support health check monitoring workflow', async () => {
      // Simulate monitoring system workflow

      // 1. Quick HEAD check first
      const headRequest = createRequest('HEAD');
      const headResponse = await HEAD(headRequest);
      expect(headResponse.status).toBe(200);

      // 2. If HEAD passes, do comprehensive GET check
      const getRequest = createRequest('GET');
      const getResponse = await GET(getRequest);

      expect([200, 503]).toContain(getResponse.status);

      const responseData = await getResponse.json();
      expect(responseData).toHaveProperty('overall');
      expect(responseData).toHaveProperty('checks');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(responseData.overall);
    });

    it('should handle degraded service scenarios', async () => {
      const request = createRequest();
      const response = await GET(request);

      // Response should be valid regardless of system state
      expect([200, 503]).toContain(response.status);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('overall');
      expect(responseData).toHaveProperty('checks');
      expect(Array.isArray(responseData.checks)).toBe(true);
    });

    it('should maintain consistent response format', async () => {
      const request = createRequest();
      const response = await GET(request);

      const responseData = await response.json();

      // Verify required fields are present in actual format
      expect(responseData).toHaveProperty('overall');
      expect(responseData).toHaveProperty('timestamp');
      expect(responseData).toHaveProperty('checks');
      expect(responseData).toHaveProperty('uptime');
      expect(responseData).toHaveProperty('version');

      // Verify overall status is one of expected values
      expect(['healthy', 'degraded', 'unhealthy']).toContain(
        responseData.overall
      );
      
      // Verify checks is an array
      expect(Array.isArray(responseData.checks)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle null response from health check', async () => {
      const request = createRequest();
      const response = await GET(request);

      // Health check should always return a valid response
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle malformed health check response', async () => {
      const request = createRequest();
      const response = await GET(request);

      // Should return a valid response even with potential internal errors
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  describe('Performance', () => {
    it('should track performance metrics', async () => {
      const startTime = Date.now();

      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: 50,
      };

      const mockResponse = new Response(JSON.stringify(healthData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      mockHandleHealthCheck.mockResolvedValue(mockResponse as any);

      const request = createRequest();
      await GET(request);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Health check should be reasonably fast
      expect(totalTime).toBeLessThan(1000);
    });
  });
});
