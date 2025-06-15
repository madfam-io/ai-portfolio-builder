import { NextRequest, NextResponse } from 'next/server';
import { edgeRateLimiter } from '@/middleware/edge-rate-limiter';

// Mock Redis client
jest.mock('@/lib/cache/redis-cache', () => ({
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    setEx: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  })),
}));

describe('Edge Rate Limiter Middleware', () => {
  let mockRedisClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient = require('@/lib/cache/redis-cache').getRedisClient();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      mockRedisClient.get.mockResolvedValue('5');
      mockRedisClient.incr.mockResolvedValue(6);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const response = await edgeRateLimiter(request);

      expect(response).toBeUndefined();
      expect(mockRedisClient.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1:/api/test');
    });

    it('should block requests exceeding rate limit', async () => {
      mockRedisClient.get.mockResolvedValue('100'); // Exceeds default limit
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const response = await edgeRateLimiter(request);

      expect(response).toBeDefined();
      expect(response?.status).toBe(429);
      const body = await response?.json();
      expect(body.error).toContain('Too many requests');
    });

    it('should set initial TTL for new rate limit keys', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.incr.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/test');

      await edgeRateLimiter(request);

      expect(mockRedisClient.expire).toHaveBeenCalledWith(
        expect.stringContaining('rate_limit:'),
        60 // Default window is 60 seconds
      );
    });

    it('should use custom rate limits for specific endpoints', async () => {
      mockRedisClient.get.mockResolvedValue('2');
      mockRedisClient.incr.mockResolvedValue(3);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio');

      const response = await edgeRateLimiter(request, {
        limit: 5,
        window: 300,
      });

      expect(response).toBeUndefined();
    });
  });

  describe('IP Detection', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      mockRedisClient.get.mockResolvedValue('1');
      mockRedisClient.incr.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '10.0.0.1, 192.168.1.1',
        },
      });

      await edgeRateLimiter(request);

      expect(mockRedisClient.incr).toHaveBeenCalledWith('rate_limit:10.0.0.1:/api/test');
    });

    it('should extract IP from x-real-ip header', async () => {
      mockRedisClient.get.mockResolvedValue('1');
      mockRedisClient.incr.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '172.16.0.1',
        },
      });

      await edgeRateLimiter(request);

      expect(mockRedisClient.incr).toHaveBeenCalledWith('rate_limit:172.16.0.1:/api/test');
    });

    it('should use default IP when headers are missing', async () => {
      mockRedisClient.get.mockResolvedValue('1');
      mockRedisClient.incr.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/test');

      await edgeRateLimiter(request);

      expect(mockRedisClient.incr).toHaveBeenCalledWith('rate_limit:127.0.0.1:/api/test');
    });
  });

  describe('Response Headers', () => {
    it('should include rate limit headers in response', async () => {
      mockRedisClient.get.mockResolvedValue('45');
      mockRedisClient.incr.mockResolvedValue(46);

      const request = new NextRequest('http://localhost:3000/api/test');
      const mockResponse = NextResponse.next();

      const response = await edgeRateLimiter(request, {
        limit: 100,
        window: 60,
      }, mockResponse);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('54');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should include retry-after header when rate limited', async () => {
      mockRedisClient.get.mockResolvedValue('100');

      const request = new NextRequest('http://localhost:3000/api/test');
      
      const response = await edgeRateLimiter(request, {
        limit: 50,
        window: 60,
      });

      expect(response?.headers.get('Retry-After')).toBe('60');
    });
  });

  describe('Error Handling', () => {
    it('should allow requests when Redis is unavailable', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));

      const request = new NextRequest('http://localhost:3000/api/test');

      const response = await edgeRateLimiter(request);

      expect(response).toBeUndefined(); // Should not block
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.get.mockResolvedValue('10');
      mockRedisClient.incr.mockRejectedValue(new Error('Redis error'));

      const request = new NextRequest('http://localhost:3000/api/test');

      const response = await edgeRateLimiter(request);

      expect(response).toBeUndefined(); // Should not block
    });
  });

  describe('Bypass Conditions', () => {
    it('should bypass rate limiting for whitelisted IPs', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      });

      const response = await edgeRateLimiter(request, {
        whitelist: ['127.0.0.1'],
      });

      expect(response).toBeUndefined();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('should bypass rate limiting for excluded paths', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');

      const response = await edgeRateLimiter(request, {
        excludePaths: ['/api/health', '/api/status'],
      });

      expect(response).toBeUndefined();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });
  });

  describe('Custom Key Generation', () => {
    it('should use custom key generator when provided', async () => {
      mockRedisClient.get.mockResolvedValue('1');
      mockRedisClient.incr.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'authorization': 'Bearer user-123',
        },
      });

      await edgeRateLimiter(request, {
        keyGenerator: (req) => {
          const auth = req.headers.get('authorization');
          return auth ? `user:${auth.split(' ')[1]}` : 'anonymous';
        },
      });

      expect(mockRedisClient.incr).toHaveBeenCalledWith('rate_limit:user:user-123');
    });
  });
});