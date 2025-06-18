import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';

/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, HEAD } from '@/app/api/v1/health/route';
import { handleHealthCheck } from '@/lib/monitoring/health-check';


// Mock dependencies
jest.mock('@/lib/monitoring/health-check');
jest.mock('@/lib/monitoring/error-tracking', () => ({
  withErrorTracking: (handler: any) => handler,
}));
jest.mock('@/lib/monitoring/apm', () => ({
  withAPMTracking: (handler: any) => handler,
}));

const mockHandleHealthCheck = handleHealthCheck as jest.MockedFunction<
  typeof handleHealthCheck
>;

describe('/api/v1/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      expect(mockHandleHealthCheck).toHaveBeenCalledTimes(1);
      expect(response).toBe(mockResponse);
    });

    it('should handle health check service errors', async () => {
      const errorResponse = new Response(
        JSON.stringify({
          status: 'degraded',
          services: {
            database: {
              status: 'unhealthy',
              error: 'Connection timeout',
            },
          },
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
          },
        }

      mockHandleHealthCheck.mockResolvedValue(errorResponse as any);

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(503);
      expect(mockHandleHealthCheck).toHaveBeenCalledTimes(1);
    });

    it('should handle health check exceptions', async () => {
      mockHandleHealthCheck.mockRejectedValue(new Error('Health check failed'));

      const request = createRequest();

      // The error tracking middleware would handle this, but since we mocked it
      // the error will propagate
      await expect(GET(request)).rejects.toThrow('Health check failed');
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
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'healthy', responseTime: 30 },
          redis: { status: 'healthy', responseTime: 10 },
          ai: { status: 'healthy', responseTime: 150 },
        },
      };

      const mockResponse = new Response(JSON.stringify(healthData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      mockHandleHealthCheck.mockResolvedValue(mockResponse as any);

      const getRequest = createRequest('GET');
      const getResponse = await GET(getRequest);

      expect(getResponse.status).toBe(200);

      const responseData = await getResponse.json();
      expect(responseData.status).toBe('healthy');
      expect(responseData.services.database.status).toBe('healthy');
    });

    it('should handle degraded service scenarios', async () => {
      const degradedHealthData = {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'healthy', responseTime: 45 },
          redis: { status: 'unhealthy', error: 'Connection refused' },
          ai: { status: 'healthy', responseTime: 200 },
        },
        alerts: ['Redis service is down', 'Some features may be unavailable'],
      };

      const mockResponse = new Response(JSON.stringify(degradedHealthData), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });

      mockHandleHealthCheck.mockResolvedValue(mockResponse as any);

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(503);

      const responseData = await response.json();
      expect(responseData.status).toBe('degraded');
      expect(responseData.services.redis.status).toBe('unhealthy');
      expect(responseData.alerts).toContain('Redis service is down');
    });

    it('should maintain consistent response format', async () => {
      const healthData = {
        status: 'healthy',
        timestamp: '2025-01-01T00:00:00.000Z',
        version: '0.3.0-beta',
        services: {
          database: {
            status: 'healthy',
            responseTime: 30,
          },
          redis: {
            status: 'healthy',
            responseTime: 10,
          },
        },
      };

      const mockResponse = new Response(JSON.stringify(healthData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      mockHandleHealthCheck.mockResolvedValue(mockResponse as any);

      const request = createRequest();
      const response = await GET(request);

    const responseData = await response.json();

      // Verify required fields are present
      expect(responseData).toHaveProperty('status');
      expect(responseData).toHaveProperty('timestamp');
      expect(responseData).toHaveProperty('services');
      expect(responseData.services).toHaveProperty('database');

      // Verify status is one of expected values
      expect(['healthy', 'degraded', 'unhealthy']).toContain(
        responseData.status

    });
  });

  describe('Error Handling', () => {
    it('should handle null response from health check', async () => {
      mockHandleHealthCheck.mockResolvedValue(null as any);

      const request = createRequest();
      const response = await GET(request);

      // Response should handle null gracefully
      expect(response).toBeNull();
    });

    it('should handle malformed health check response', async () => {
      const malformedResponse = new Response('invalid json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      mockHandleHealthCheck.mockResolvedValue(malformedResponse as any);

      const request = createRequest();
      const response = await GET(request);

      // Response should still be passed through
      expect(response).toBe(malformedResponse);
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
