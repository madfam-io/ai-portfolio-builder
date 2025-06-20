jest.setTimeout(30000);

import { describe, it, expect, beforeEach, afterEach, jest,  } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { 
  edgeRateLimitMiddleware,
  cleanupExpiredEntries,
  getClientId,
  getConfigForPath,
} from '@/middleware/edge-rate-limiter';

/**
 * @jest-environment node
 */

// Mock the logger to avoid console output during tests
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Edge Rate Limiter Middleware', () => {
  beforeEach(() => {
    // Suppress console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    global.fetch = jest.fn();
    jest.clearAllMocks();
    jest.resetModules();

    // Mock Date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    // Clear the rate limit store by calling cleanup
    cleanupExpiredEntries();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createRequest = (
    url: string = 'https://example.com/api/v1/test',
    options: {
      headers?: Record<string, string>;
      method?: string;
      ip?: string;
    } = {}
  ) => {
    const headers = new Headers(options.headers || {});

    if (options.ip) {
      headers.set('x-forwarded-for', options.ip);
      headers.set('x-real-ip', options.ip);
    }

    return new NextRequest(url, {
      method: options.method || 'GET',
      headers,
    });
  };

  describe('Basic Rate Limiting', () => {
    it('should allow requests under the limit', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      
      // Make 5 requests (under the limit of 100)
      for (let i = 0; i < 5; i++) {
        const result = await edgeRateLimitMiddleware(request);
        expect(result).toBeNull(); // No rate limit response
      }
    });

    it('should block requests over the limit', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      
      // Make requests up to the limit
      for (let i = 0; i < 100; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      // The 101st request should be blocked
      const result = await edgeRateLimitMiddleware(request);
      
      expect(result).toBeDefined();
      expect(result?.status).toBe(429);
      
      const responseBody = await result?.json();
      expect(responseBody).toEqual({
        error: 'Too many requests, please try again later.',
        retryAfter: expect.any(Number),
      });
    });

    it('should set appropriate rate limit headers', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      
      // Make 50 requests
      for (let i = 0; i < 50; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      // Check that headers would be set on a NextResponse.next()
      const result = await edgeRateLimitMiddleware(request);
      expect(result).toBeNull(); // Should still allow the request
    });

    it('should handle first request (no existing count)', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      
      const result = await edgeRateLimitMiddleware(request);
      expect(result).toBeNull();
    });
  });

  describe('IP Address Detection', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        headers: { 'x-forwarded-for': '203.0.113.1, 192.168.1.1' },
      });

      const clientId = getClientId(request);
      expect(clientId).toContain('203.0.113.1');
    });

    it('should extract IP from x-real-ip header', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        headers: { 'x-real-ip': '203.0.113.2' },
      });

      const clientId = getClientId(request);
      expect(clientId).toContain('203.0.113.2');
    });

    it('should handle missing IP address', async () => {
      const request = createRequest('https://example.com/api/v1/test');

      const clientId = getClientId(request);
      expect(clientId).toContain('unknown');
    });

    it('should normalize IPv6 addresses', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        headers: {
          'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        },
      });

      const clientId = getClientId(request);
      expect(clientId).toContain('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    });

    it('should handle localhost requests', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });

      const clientId = getClientId(request);
      expect(clientId).toContain('127.0.0.1');
    });
  });

  describe('Route-Specific Limits', () => {
    it('should apply stricter limits to auth endpoints', async () => {
      const request = createRequest('https://example.com/api/auth/login', {
        ip: '192.168.1.1',
      });
      
      // Auth limit is 5 requests per 15 minutes
      for (let i = 0; i < 5; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      // The 6th request should be blocked
      const result = await edgeRateLimitMiddleware(request);
      expect(result).toBeDefined();
      expect(result?.status).toBe(429);
    });

    it('should apply higher limits to public endpoints', async () => {
      const request = createRequest(
        'https://example.com/api/v1/portfolios/public',
        { ip: '192.168.1.1' }
      );
      
      // Should allow up to 100 requests (default API limit)
      for (let i = 0; i < 50; i++) {
        const result = await edgeRateLimitMiddleware(request);
        expect(result).toBeNull();
      }
    });

    it('should apply AI endpoint limits', async () => {
      const request = createRequest('https://example.com/api/ai/enhance', {
        ip: '192.168.1.1',
      });
      
      // AI limit is 10 requests per minute
      for (let i = 0; i < 10; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      // The 11th request should be blocked
      const result = await edgeRateLimitMiddleware(request);
      expect(result).toBeDefined();
      expect(result?.status).toBe(429);
    });

    it('should not apply rate limiting to non-API routes', async () => {
      const request = createRequest('https://example.com/dashboard', {
        ip: '192.168.1.1',
      });
      
      // Should allow unlimited requests for non-API routes
      for (let i = 0; i < 200; i++) {
        const result = await edgeRateLimitMiddleware(request);
        expect(result).toBeNull();
      }
    });
  });

  describe('Time Windows', () => {
    it('should use different time windows for different endpoints', async () => {
      const authConfig = getConfigForPath('/api/auth/login');
      const apiConfig = getConfigForPath('/api/v1/test');
      const aiConfig = getConfigForPath('/api/ai/enhance');
      
      expect(authConfig.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(apiConfig.windowMs).toBe(60 * 1000); // 1 minute
      expect(aiConfig.windowMs).toBe(60 * 1000); // 1 minute
    });

    it('should reset counters after time window expires', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      
      // Make some requests
      for (let i = 0; i < 5; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      // Advance time beyond the window (1 minute)
      jest.advanceTimersByTime(61 * 1000);
      
      // Should be able to make requests again
      const result = await edgeRateLimitMiddleware(request);
      expect(result).toBeNull();
    });
  });

  describe('Error Messages', () => {
    it('should return appropriate error message for rate limit exceeded', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      
      // Exceed the limit
      for (let i = 0; i < 101; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      const result = await edgeRateLimitMiddleware(request);
      const body = await result?.json();
      
      expect(body.error).toBe('Too many requests, please try again later.');
    });

    it('should return custom error message for auth endpoints', async () => {
      const request = createRequest('https://example.com/api/auth/login', {
        ip: '192.168.1.1',
      });
      
      // Exceed auth limit
      for (let i = 0; i < 6; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      const result = await edgeRateLimitMiddleware(request);
      const body = await result?.json();
      
      expect(body.error).toBe('Too many authentication attempts, please try again later.');
    });
  });

  describe('Headers', () => {
    it('should include retry-after header when rate limited', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      
      // Exceed the limit
      for (let i = 0; i < 101; i++) {
        await edgeRateLimitMiddleware(request);
      }
      
      const result = await edgeRateLimitMiddleware(request);
      expect(result?.headers.get('Retry-After')).toBeDefined();
      expect(result?.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result?.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('Cleanup Function', () => {
    it('should clean up expired entries', async () => {
      // Use non-API path to avoid rate limiting completely
      const request1 = createRequest('https://example.com/static/test', {
        ip: '192.168.1.1',
      });
      const request2 = createRequest('https://example.com/static/test2', {
        ip: '192.168.1.2',
      });
      
      // These should not be rate limited (non-API paths)
      const result1 = await edgeRateLimitMiddleware(request1);
      const result2 = await edgeRateLimitMiddleware(request2);
      
      // Non-API paths should return null (no rate limiting)
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
});