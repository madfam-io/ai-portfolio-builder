import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import {
  securityMiddleware,
  applySecurityToResponse,
  securityUtils,
} from '../../../middleware/security';

// Mock dependencies
jest.mock('@/lib/config', () => ({
  env: {
    NODE_ENV: 'test',
    CORS_ALLOWED_ORIGINS: 'https://example.com,https://app.example.com',
  },
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock middleware dependencies
jest.mock('../../../middleware/csrf', () => ({
  csrfMiddleware: jest.fn(),
}));

jest.mock('../../../middleware/edge-rate-limiter', () => ({
  edgeRateLimitMiddleware: jest.fn(),
}));

jest.mock('../../../middleware/security-headers', () => ({
  applySecurityHeaders: jest.fn((req, res) => res),
}));

import { csrfMiddleware } from '../../../middleware/csrf';
import { edgeRateLimitMiddleware } from '../../../middleware/edge-rate-limiter';
import { applySecurityHeaders } from '../../../middleware/security-headers';
import { logger } from '@/lib/utils/logger';


describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (csrfMiddleware as jest.Mock).mockReturnValue(null);
    (edgeRateLimitMiddleware as jest.Mock).mockReturnValue(null);
  });

  const createRequest = (
    pathname: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
      searchParams?: Record<string, string>;
    } = {}
  ) => {
    const url = new URL(`https://example.com${pathname}`);

    if (options.searchParams) {
      Object.entries(options.searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const headers = new Headers(options.headers);

    if (options.body && !headers.get('content-length')) {
      headers.set('content-length', options.body.length.toString());
    }

    return new NextRequest(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });
  };

  describe('IP Blocking', () => {
    it('should block requests from blocked IPs', async () => {
      // First, add IP to blocklist
      securityUtils.blockIP('192.168.1.100');

      const request = createRequest('/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });

      const result = await securityMiddleware(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: BLOCKED_IP',
        expect.objectContaining({
          ip: '192.168.1.100',
        })

      // Clean up
      securityUtils.unblockIP('192.168.1.100');
    });

    it('should allow requests from non-blocked IPs', async () => {
      const request = createRequest('/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });

    it('should handle requests without IP headers', async () => {
      const request = createRequest('/api/test');

      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });

    it('should prioritize x-forwarded-for header over x-real-ip', async () => {
      securityUtils.blockIP('10.0.0.1');

      const request = createRequest('/api/test', {
        headers: {
          'x-forwarded-for': '10.0.0.1',
          'x-real-ip': '10.0.0.2',
        },
      });

      const result = await securityMiddleware(request);

      expect(result?.status).toBe(403);

      securityUtils.unblockIP('10.0.0.1');
    });
  });

  describe('Suspicious Content Detection', () => {
    const suspiciousPatterns = [
      { name: 'directory traversal', path: '/api/../../../etc/passwd' },
      {
        name: 'script injection',
        path: '/api/test?q=<script>alert(1)</script>',
      },
      {
        name: 'javascript protocol',
        path: '/api/test?redirect=javascript:void(0)',
      },
      { name: 'event handlers', path: '/api/test?data=onclick=alert(1)' },
    ];

    suspiciousPatterns.forEach(({ name, path }) => {
      it(`should block requests with ${name}`, async () => {
        const request = createRequest(path);

        const result = await securityMiddleware(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.status).toBe(400);
        expect(logger.warn).toHaveBeenCalledWith(
          'Security Event: SUSPICIOUS_CONTENT',
          expect.any(Object)

      });
    });

    it('should check query parameters for suspicious content', async () => {
      const request = createRequest('/api/test', {
        searchParams: {
          normal: 'value',
          malicious: '<script>alert("xss")</script>',
        },
      });

      const result = await securityMiddleware(request);

      expect(result?.status).toBe(400);
    });

    it('should allow legitimate requests', async () => {
      const request = createRequest('/api/portfolios/123', {
        searchParams: {
          include: 'projects,experience',
          limit: '10',
        },
      });

      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });
  });

  describe('Request Size Validation', () => {
    it('should block requests that are too large', async () => {
      const largeSize = (11 * 1024 * 1024).toString(); // 11MB
      const request = createRequest('/api/upload', {
        method: 'POST',
        headers: { 'content-length': largeSize },
      });

      const result = await securityMiddleware(request);

      expect(result?.status).toBe(413);
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: REQUEST_TOO_LARGE',
        expect.any(Object)

    });

    it('should allow requests within size limit', async () => {
      const normalSize = (5 * 1024 * 1024).toString(); // 5MB
      const request = createRequest('/api/upload', {
        method: 'POST',
        headers: { 'content-length': normalSize },
      });

      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });

    it('should handle requests without content-length header', async () => {
      const request = createRequest('/api/test', {
        method: 'POST',
      });

      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });

    it('should handle invalid content-length values', async () => {
      const request = createRequest('/api/test', {
        method: 'POST',
        headers: { 'content-length': 'invalid' },
      });

      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should apply rate limiting and block when limit exceeded', async () => {
      const rateLimitResponse = new NextResponse(null, { status: 429 });
      (edgeRateLimitMiddleware as jest.Mock).mockReturnValue(rateLimitResponse);

      const request = createRequest('/api/test');
      const result = await securityMiddleware(request);

      expect(result).toBe(rateLimitResponse);
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: RATE_LIMITED',
        expect.any(Object)

    });

    it('should continue when rate limit is not exceeded', async () => {
      (edgeRateLimitMiddleware as jest.Mock).mockReturnValue(null);

      const request = createRequest('/api/test');
      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });
  });

  describe('CSRF Protection Integration', () => {
    it('should apply CSRF protection to API routes', async () => {
      const request = createRequest('/api/portfolios', { method: 'POST' });

      await securityMiddleware(request);

      expect(csrfMiddleware).toHaveBeenCalledWith(request);
    });

    it('should block requests that fail CSRF validation', async () => {
      const csrfResponse = new NextResponse(null, { status: 403 });
      (csrfMiddleware as jest.Mock).mockReturnValue(csrfResponse);

      const request = createRequest('/api/portfolios', { method: 'POST' });
      const result = await securityMiddleware(request);

      expect(result).toBe(csrfResponse);
      expect(logger.warn).toHaveBeenCalledWith(
        'Security Event: CSRF_FAILED',
        expect.any(Object)

    });

    it('should skip CSRF protection for non-API routes', async () => {
      const request = createRequest('/dashboard', { method: 'POST' });

      await securityMiddleware(request);

      expect(csrfMiddleware).not.toHaveBeenCalled();
    });
  });

  describe('CORS Preflight Handling', () => {
    it('should handle OPTIONS requests for CORS preflight', async () => {
      const request = createRequest('/api/test', {
        method: 'OPTIONS',
        headers: { origin: 'https://example.com' },
      });

      const result = await securityMiddleware(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(204);
      expect(result?.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com'

    });

    it('should set appropriate CORS headers for allowed origins', async () => {
      const request = createRequest('/api/test', {
        method: 'OPTIONS',
        headers: { origin: 'https://app.example.com' },
      });

      const result = await securityMiddleware(request);

      expect(result?.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'

      expect(result?.headers.get('Access-Control-Allow-Headers')).toContain(
        'Content-Type'

      expect(result?.headers.get('Access-Control-Max-Age')).toBe('86400');
    });

    it('should not set CORS headers for disallowed origins', async () => {
      const request = createRequest('/api/test', {
        method: 'OPTIONS',
        headers: { origin: 'https://malicious.com' },
      });

      const result = await securityMiddleware(request);

      expect(result?.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully and fail closed', async () => {
      (edgeRateLimitMiddleware as jest.Mock).mockImplementation(() => {
        throw new Error('Rate limiter error');
      });

      const request = createRequest('/api/test');
      const result = await securityMiddleware(request);

      expect(result?.status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'Security middleware error',
        expect.objectContaining({ error: expect.any(Error) })
    });

    it('should handle async errors in request size validation', async () => {
      const request = createRequest('/api/test', {
        method: 'POST',
        headers: { 'content-length': 'invalid' },
      });

      // Should not throw, should handle gracefully
      const result = await securityMiddleware(request);

      expect(result).toBeNull();
    });
  });

  describe('applySecurityToResponse', () => {
    let request: NextRequest;
    let response: NextResponse;

    beforeEach(() => {
      request = createRequest('/test');
      response = new NextResponse('test content');
    });

    it('should apply security headers to response', () => {
      const result = applySecurityToResponse(request, response);

      expect(applySecurityHeaders).toHaveBeenCalledWith(request, response);
    });

    it('should add standard security headers', () => {
      const result = applySecurityToResponse(request, response);

      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
      expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(result.headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin'

    });

    it('should add HSTS header in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      jest.doMock('@/lib/config', () => ({
        env: {
          NODE_ENV: 'production',
          CORS_ALLOWED_ORIGINS: 'https://example.com',
        },
      }));

      const result = applySecurityToResponse(request, response);

      expect(result.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains'

      process.env.NODE_ENV = originalEnv;
    });

    it('should apply CORS headers for valid origins', () => {
      const corsRequest = createRequest('/test', {
        headers: { origin: 'https://example.com' },
      });

      const result = applySecurityToResponse(corsRequest, response);

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com'

      expect(result.headers.get('Access-Control-Allow-Credentials')).toBe(
        'true'

    });
  });

  describe('Security Utils', () => {
    describe('validateAPIKey', () => {
      it('should validate correct API key', () => {
        const request = createRequest('/api/test', {
          headers: { 'x-api-key': 'correct-key' },
        });

        const isValid = securityUtils.validateAPIKey(request, 'correct-key');

        expect(isValid).toBe(true);
      });

      it('should reject incorrect API key', () => {
        const request = createRequest('/api/test', {
          headers: { 'x-api-key': 'wrong-key' },
        });

        const isValid = securityUtils.validateAPIKey(request, 'correct-key');

        expect(isValid).toBe(false);
      });

      it('should reject missing API key', () => {
        const request = createRequest('/api/test');

        const isValid = securityUtils.validateAPIKey(request, 'correct-key');

        expect(isValid).toBe(false);
      });
    });

    describe('getClientIP', () => {
      it('should get IP from x-forwarded-for header', () => {
        const request = createRequest('/test', {
          headers: { 'x-forwarded-for': '192.168.1.1' },
        });

        const ip = securityUtils.getClientIP(request);

        expect(ip).toBe('192.168.1.1');
      });

      it('should fallback to x-real-ip header', () => {
        const request = createRequest('/test', {
          headers: { 'x-real-ip': '10.0.0.1' },
        });

        const ip = securityUtils.getClientIP(request);

        expect(ip).toBe('10.0.0.1');
      });

      it('should return unknown when no IP headers present', () => {
        const request = createRequest('/test');

        const ip = securityUtils.getClientIP(request);

        expect(ip).toBe('unknown');
      });
    });

    describe('isAllowedOrigin', () => {
      it('should allow configured origins', () => {
        const request = createRequest('/test', {
          headers: { origin: 'https://example.com' },
        });

        const isAllowed = securityUtils.isAllowedOrigin(request);

        expect(isAllowed).toBe(true);
      });

      it('should allow same-origin requests', () => {
        const request = createRequest('/test', {
          headers: { origin: 'https://example.com' },
        });

        const isAllowed = securityUtils.isAllowedOrigin(request);

        expect(isAllowed).toBe(true);
      });

      it('should allow requests without origin header', () => {
        const request = createRequest('/test');

        const isAllowed = securityUtils.isAllowedOrigin(request);

        expect(isAllowed).toBe(true);
      });

      it('should reject non-configured origins', () => {
        const request = createRequest('/test', {
          headers: { origin: 'https://malicious.com' },
        });

        const isAllowed = securityUtils.isAllowedOrigin(request);

        expect(isAllowed).toBe(false);
      });
    });

    describe('IP Management', () => {
      it('should block and unblock IPs', () => {
        const testIP = '192.168.1.200';

        // Block IP
        securityUtils.blockIP(testIP);
        expect(logger.warn).toHaveBeenCalledWith('IP added to blocklist', {
          ip: testIP,
        });

        // Verify IP is blocked
        const request = createRequest('/test', {
          headers: { 'x-forwarded-for': testIP },
        });

        // Unblock IP
        securityUtils.unblockIP(testIP);
        expect(logger.info).toHaveBeenCalledWith('IP removed from blocklist', {
          ip: testIP,
        });
      });
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle high volume of requests efficiently', async () => {
      const requests = Array.from({ length: 100 }, (_, i) =>
        createRequest(`/api/test-${i}`)

      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(req => securityMiddleware(req))

      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle edge cases in URL parsing', async () => {
      const edgeCases = [
        '/api/test?param=',
        '/api/test?=value',
        '/api/test?param1=value1&param2=value2&param3=',
        '/api/test%20with%20spaces',
        '/api/test?unicode=🎉',
      ];

      for (const path of edgeCases) {
        const request = createRequest(path);
        const result = await securityMiddleware(request);

        // Should handle gracefully without throwing
        expect(result).toBeDefined();
      }
    });
  });
});
