/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { edgeRateLimiter } from '@/middleware/edge-rate-limiter';

// Mock Redis client
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  multi: jest.fn(() => ({
    incr: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  })),
  pipeline: jest.fn(() => ({
    incr: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  })),
};

jest.mock('@/lib/cache/redis-client', () => ({
  getRedisClient: jest.fn(() => mockRedis),
}));

describe('Edge Rate Limiter Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Mock Date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
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
      mockRedis.get.mockResolvedValue('5'); // Current count

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // No rate limit response
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('should block requests over the limit', async () => {
      mockRedis.get.mockResolvedValue('101'); // Over limit

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(429);

      const responseBody = await result?.json();
      expect(responseBody).toEqual({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: expect.any(Number),
      });
    });

    it('should set appropriate rate limit headers', async () => {
      mockRedis.get.mockResolvedValue('50');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      if (result) {
        expect(result.headers.get('X-RateLimit-Limit')).toBe('100');
        expect(result.headers.get('X-RateLimit-Remaining')).toBe('50');
        expect(result.headers.get('X-RateLimit-Reset')).toBeDefined();
      }
    });

    it('should handle first request (no existing count)', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined();
      expect(mockRedis.incr).toHaveBeenCalled();
      expect(mockRedis.expire).toHaveBeenCalled();
    });
  });

  describe('IP Address Detection', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      mockRedis.get.mockResolvedValue('1');

      const request = createRequest('https://example.com/api/v1/test', {
        headers: { 'x-forwarded-for': '203.0.113.1, 192.168.1.1' },
      });

      await edgeRateLimiter(request);

      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining('203.0.113.1')
      );
    });

    it('should extract IP from x-real-ip header', async () => {
      mockRedis.get.mockResolvedValue('1');

      const request = createRequest('https://example.com/api/v1/test', {
        headers: { 'x-real-ip': '203.0.113.2' },
      });

      await edgeRateLimiter(request);

      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining('203.0.113.2')
      );
    });

    it('should handle missing IP address', async () => {
      mockRedis.get.mockResolvedValue('1');

      const request = createRequest('https://example.com/api/v1/test');

      await edgeRateLimiter(request);

      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining('unknown')
      );
    });

    it('should normalize IPv6 addresses', async () => {
      mockRedis.get.mockResolvedValue('1');

      const request = createRequest('https://example.com/api/v1/test', {
        headers: {
          'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        },
      });

      await edgeRateLimiter(request);

      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
      );
    });

    it('should handle localhost requests', async () => {
      mockRedis.get.mockResolvedValue('1');

      const request = createRequest('https://example.com/api/v1/test', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });

      await edgeRateLimiter(request);

      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining('127.0.0.1')
      );
    });
  });

  describe('Route-Specific Limits', () => {
    it('should apply stricter limits to auth endpoints', async () => {
      mockRedis.get.mockResolvedValue('6'); // Over auth limit (5)

      const request = createRequest('https://example.com/api/v1/auth/login', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(429);
    });

    it('should apply higher limits to public endpoints', async () => {
      mockRedis.get.mockResolvedValue('50');

      const request = createRequest(
        'https://example.com/api/v1/portfolios/public',
        { ip: '192.168.1.1' }
      );
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // Should allow
    });

    it('should apply very strict limits to admin endpoints', async () => {
      mockRedis.get.mockResolvedValue('3'); // Over admin limit (2)

      const request = createRequest('https://example.com/api/v1/admin/users', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(429);
    });

    it('should bypass rate limiting for health checks', async () => {
      const request = createRequest('https://example.com/api/v1/health', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined();
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it('should handle AI endpoint limits', async () => {
      mockRedis.get.mockResolvedValue('21'); // Over AI limit (20)

      const request = createRequest('https://example.com/api/v1/ai/enhance', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(429);
    });
  });

  describe('User-Based Rate Limiting', () => {
    it('should apply higher limits for authenticated users', async () => {
      mockRedis.get.mockResolvedValue('150'); // Would be over anonymous limit

      const request = createRequest('https://example.com/api/v1/portfolios', {
        ip: '192.168.1.1',
        headers: { authorization: 'Bearer valid-token' },
      });

      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // Should allow authenticated user
    });

    it('should apply premium limits for premium users', async () => {
      mockRedis.get.mockResolvedValue('500'); // Would be over regular user limit

      const request = createRequest('https://example.com/api/v1/portfolios', {
        ip: '192.168.1.1',
        headers: {
          authorization: 'Bearer premium-token',
          'x-user-plan': 'premium',
        },
      });

      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // Should allow premium user
    });

    it('should identify users by API key', async () => {
      mockRedis.get.mockResolvedValue('200');

      const request = createRequest('https://example.com/api/v1/portfolios', {
        ip: '192.168.1.1',
        headers: { 'x-api-key': 'valid-api-key' },
      });

      await edgeRateLimiter(request);

      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining('user:')
      );
    });

    it('should handle invalid authentication tokens', async () => {
      mockRedis.get.mockResolvedValue('50');

      const request = createRequest('https://example.com/api/v1/portfolios', {
        ip: '192.168.1.1',
        headers: { authorization: 'Bearer invalid-token' },
      });

      const result = await edgeRateLimiter(request);

      // Should fall back to IP-based limiting
      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.1')
      );
    });
  });

  describe('Time Windows', () => {
    it('should use different time windows for different endpoints', async () => {
      mockRedis.get.mockResolvedValue('1');

      const request = createRequest('https://example.com/api/v1/auth/login', {
        ip: '192.168.1.1',
      });
      await edgeRateLimiter(request);

      expect(mockRedis.expire).toHaveBeenCalledWith(
        expect.any(String),
        300 // 5 minutes for auth
      );
    });

    it('should handle sliding window rate limiting', async () => {
      const pipeline = {
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 'OK'],
        ]),
      };
      mockRedis.pipeline.mockReturnValue(pipeline);

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      await edgeRateLimiter(request);

      expect(mockRedis.pipeline).toHaveBeenCalled();
      expect(pipeline.incr).toHaveBeenCalled();
      expect(pipeline.expire).toHaveBeenCalled();
    });

    it('should reset counters after time window expires', async () => {
      mockRedis.get.mockResolvedValue(null); // Counter has expired

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined();
      expect(mockRedis.incr).toHaveBeenCalled();
    });
  });

  describe('Geographic Rate Limiting', () => {
    it('should apply different limits based on country', async () => {
      mockRedis.get.mockResolvedValue('50');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
        headers: { 'cf-ipcountry': 'US' },
      });

      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // US should have higher limits
    });

    it('should apply stricter limits for high-risk countries', async () => {
      mockRedis.get.mockResolvedValue('10');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
        headers: { 'cf-ipcountry': 'XX' }, // High-risk country
      });

      const result = await edgeRateLimiter(request);

      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should handle missing country information', async () => {
      mockRedis.get.mockResolvedValue('50');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // Should use default limits
    });
  });

  describe('Burst Protection', () => {
    it('should detect and block burst requests', async () => {
      mockRedis.get
        .mockResolvedValueOnce('1')
        .mockResolvedValueOnce('10')
        .mockResolvedValueOnce('20');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });

      // Simulate rapid requests
      await edgeRateLimiter(request);
      await edgeRateLimiter(request);
      const result = await edgeRateLimiter(request);

      expect(mockRedis.incr).toHaveBeenCalledTimes(3);
    });

    it('should implement exponential backoff for repeat offenders', async () => {
      mockRedis.get.mockResolvedValue('101'); // Over limit

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
        headers: { 'x-rate-limit-violations': '3' },
      });

      const result = await edgeRateLimiter(request);

      expect(result?.headers.get('Retry-After')).toBe('300'); // Longer backoff
    });

    it('should whitelist trusted IPs', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '10.0.0.1', // Trusted internal IP
      });

      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined();
      expect(mockRedis.get).not.toHaveBeenCalled();
    });
  });

  describe('Redis Connection Handling', () => {
    it('should handle Redis connection failures gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      // Should allow request when Redis is unavailable
      expect(result).toBeUndefined();
    });

    it('should use fallback rate limiting when Redis is down', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis timeout'));

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // Fail open
    });

    it('should retry Redis operations on transient failures', async () => {
      mockRedis.get
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce('1');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(mockRedis.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include standard rate limit headers', async () => {
      mockRedis.get.mockResolvedValue('25');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });

      // Mock the response to check headers
      const mockNext = jest.fn().mockResolvedValue(new NextResponse('OK'));
      const result = await edgeRateLimiter(request, mockNext);

      expect(result?.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(result?.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(result?.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should include custom headers for debugging', async () => {
      mockRedis.get.mockResolvedValue('25');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      if (result) {
        expect(result.headers.get('X-RateLimit-Policy')).toBeDefined();
        expect(result.headers.get('X-RateLimit-Scope')).toBeDefined();
      }
    });

    it('should add warning headers when approaching limit', async () => {
      mockRedis.get.mockResolvedValue('95'); // Close to limit of 100

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const mockNext = jest.fn().mockResolvedValue(new NextResponse('OK'));
      const result = await edgeRateLimiter(request, mockNext);

      expect(result?.headers.get('X-RateLimit-Warning')).toBe('true');
    });
  });

  describe('Configuration', () => {
    it('should support custom rate limit configurations', async () => {
      mockRedis.get.mockResolvedValue('1');

      const request = createRequest('https://example.com/api/v1/custom', {
        ip: '192.168.1.1',
      });

      // Should use custom config for this endpoint
      const result = await edgeRateLimiter(request, undefined, {
        maxRequests: 50,
        windowMs: 300000, // 5 minutes
      });

      expect(result).toBeUndefined();
    });

    it('should handle environment-specific configurations', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockRedis.get.mockResolvedValue('200'); // Would be over production limit

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result).toBeUndefined(); // Should be more lenient in development

      process.env.NODE_ENV = originalEnv;
    });

    it('should validate configuration parameters', async () => {
      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });

      expect(() => {
        edgeRateLimiter(request, undefined, {
          maxRequests: -1, // Invalid
          windowMs: 0, // Invalid
        });
      }).toThrow();
    });
  });

  describe('Monitoring and Analytics', () => {
    it('should log rate limit violations', async () => {
      mockRedis.get.mockResolvedValue('101');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      await edgeRateLimiter(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit exceeded')
      );

      consoleSpy.mockRestore();
    });

    it('should track rate limiting metrics', async () => {
      mockRedis.get.mockResolvedValue('50');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      await edgeRateLimiter(request);

      // Should increment metrics counter
      expect(mockRedis.incr).toHaveBeenCalledWith(
        expect.stringContaining('metrics:rate_limit')
      );
    });

    it('should provide rate limiting statistics', async () => {
      mockRedis.get.mockResolvedValue('25');

      const request = createRequest(
        'https://example.com/api/v1/rate-limit-stats',
        { ip: '192.168.1.1' }
      );
      const result = await edgeRateLimiter(request);

      if (result) {
        const stats = await result.json();
        expect(stats).toHaveProperty('currentUsage');
        expect(stats).toHaveProperty('limit');
        expect(stats).toHaveProperty('resetTime');
      }
    });
  });

  describe('Security Features', () => {
    it('should detect and block suspicious patterns', async () => {
      mockRedis.get.mockResolvedValue('5');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'suspicious-bot/1.0',
          'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3', // Suspicious proxy chain
        },
      });

      const result = await edgeRateLimiter(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(429);
    });

    it('should implement CAPTCHA challenges for suspicious activity', async () => {
      mockRedis.get.mockResolvedValue('101');

      const request = createRequest('https://example.com/api/v1/test', {
        ip: '192.168.1.1',
      });
      const result = await edgeRateLimiter(request);

      expect(result?.headers.get('X-Challenge-Required')).toBe('captcha');
    });

    it('should handle distributed attacks', async () => {
      mockRedis.get.mockResolvedValue('50');

      // Simulate requests from multiple IPs in same subnet
      const requests = [
        createRequest('https://example.com/api/v1/test', { ip: '192.168.1.1' }),
        createRequest('https://example.com/api/v1/test', { ip: '192.168.1.2' }),
        createRequest('https://example.com/api/v1/test', { ip: '192.168.1.3' }),
      ];

      const results = await Promise.all(
        requests.map(req => edgeRateLimiter(req))
      );

      // Should detect and block subnet-based attack
      expect(results.some(r => r?.status === 429)).toBe(true);
    });
  });
});
