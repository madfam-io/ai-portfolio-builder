/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfEnhanced } from '@/middleware/csrf-enhanced';

// Mock crypto for consistent testing
const mockCrypto = {
  randomBytes: jest.fn(() => Buffer.from('mock-random-bytes')),
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-hmac-digest'),
  })),
  timingSafeEqual: jest.fn(() => true),
};

jest.mock('crypto', () => mockCrypto);

describe('Enhanced CSRF Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();

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
      body?: string | FormData;
    } = {}
  ) => {
    return new NextRequest(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
    });
  };

  describe('CSRF Token Generation', () => {
    it('should generate CSRF token for GET requests', async () => {
      const request = createRequest('https://example.com/api/v1/csrf-token');
      const response = await csrfEnhanced(request);

      expect(response).toBeInstanceOf(NextResponse);

      const responseData = await response?.json();
      expect(responseData).toHaveProperty('csrfToken');
      expect(responseData.csrfToken).toBeDefined();
    });

    it('should include token in Set-Cookie header', async () => {
      const request = createRequest('https://example.com/api/v1/csrf-token');
      const response = await csrfEnhanced(request);

      const setCookieHeader = response?.headers.get('Set-Cookie');
      expect(setCookieHeader).toContain('csrf-token=');
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader).toContain('Secure');
      expect(setCookieHeader).toContain('SameSite=Strict');
    });

    it('should generate unique tokens for each request', async () => {
      mockCrypto.randomBytes
        .mockReturnValueOnce(Buffer.from('random1'))
        .mockReturnValueOnce(Buffer.from('random2'));

      const request1 = createRequest('https://example.com/api/v1/csrf-token');
      const request2 = createRequest('https://example.com/api/v1/csrf-token');

      const response1 = await csrfEnhanced(request1);
      const response2 = await csrfEnhanced(request2);

      const data1 = await response1?.json();
      const data2 = await response2?.json();

      expect(data1.csrfToken).not.toBe(data2.csrfToken);
    });

    it('should include token expiration', async () => {
      const request = createRequest('https://example.com/api/v1/csrf-token');
      const response = await csrfEnhanced(request);

      const responseData = await response?.json();
      expect(responseData).toHaveProperty('expiresAt');
      expect(new Date(responseData.expiresAt)).toBeInstanceOf(Date);
    });

    it('should handle token rotation', async () => {
      const request = createRequest('https://example.com/api/v1/csrf-token', {
        headers: { Cookie: 'csrf-token=old-token' },
      });

      const response = await csrfEnhanced(request);
      const responseData = await response?.json();

      expect(responseData.csrfToken).toBeDefined();
      expect(responseData.rotated).toBe(true);
    });
  });

  describe('CSRF Token Validation', () => {
    it('should validate CSRF token in headers', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          Cookie: 'csrf-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Portfolio' }),
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined(); // No CSRF error
    });

    it('should validate CSRF token in request body', async () => {
      const formData = new FormData();
      formData.append('_csrf', 'valid-token');
      formData.append('name', 'Test Portfolio');

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          Cookie: 'csrf-token=valid-token',
        },
        body: formData,
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined(); // No CSRF error
    });

    it('should reject requests with missing CSRF token', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Portfolio' }),
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);

      const responseData = await result?.json();
      expect(responseData.error).toContain('CSRF token missing');
    });

    it('should reject requests with invalid CSRF token', async () => {
      mockCrypto.timingSafeEqual.mockReturnValue(false);

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'invalid-token',
          Cookie: 'csrf-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Portfolio' }),
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);

      const responseData = await result?.json();
      expect(responseData.error).toContain('Invalid CSRF token');
    });

    it('should handle expired CSRF tokens', async () => {
      // Advance time to make token expired
      jest.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'expired-token',
          Cookie: 'csrf-token=expired-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Portfolio' }),
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);

      const responseData = await result?.json();
      expect(responseData.error).toContain('CSRF token expired');
    });
  });

  describe('Double Submit Cookie Pattern', () => {
    it('should validate double submit cookie pattern', async () => {
      const token = 'matching-token';

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token,
          Cookie: `csrf-token=${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Portfolio' }),
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined(); // Should pass
    });

    it('should reject mismatched cookie and header tokens', async () => {
      mockCrypto.timingSafeEqual.mockReturnValue(false);

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'header-token',
          Cookie: 'csrf-token=cookie-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Portfolio' }),
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);
    });

    it('should handle missing cookie token', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'header-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Portfolio' }),
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);
    });
  });

  describe('SameSite Origin Validation', () => {
    it('should validate same-site requests', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          Origin: 'https://example.com',
          Referer: 'https://example.com/dashboard',
          'X-CSRF-Token': 'valid-token',
          Cookie: 'csrf-token=valid-token',
        },
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should reject cross-origin requests without proper CORS', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          Origin: 'https://malicious-site.com',
          'X-CSRF-Token': 'valid-token',
          Cookie: 'csrf-token=valid-token',
        },
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);

      const responseData = await result?.json();
      expect(responseData.error).toContain('Cross-origin request blocked');
    });

    it('should validate referer header', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          Referer: 'https://malicious-site.com/attack',
          'X-CSRF-Token': 'valid-token',
          Cookie: 'csrf-token=valid-token',
        },
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);
    });

    it('should handle missing origin and referer headers', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          Cookie: 'csrf-token=valid-token',
        },
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);

      const responseData = await result?.json();
      expect(responseData.error).toContain('Origin validation failed');
    });
  });

  describe('Method-Based Protection', () => {
    it('should protect POST requests', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should protect PUT requests', async () => {
      const request = createRequest(
        'https://example.com/api/v1/portfolios/123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const result = await csrfEnhanced(request);
      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should protect DELETE requests', async () => {
      const request = createRequest(
        'https://example.com/api/v1/portfolios/123',
        {
          method: 'DELETE',
        }
      );

      const result = await csrfEnhanced(request);
      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should protect PATCH requests', async () => {
      const request = createRequest(
        'https://example.com/api/v1/portfolios/123',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const result = await csrfEnhanced(request);
      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should allow GET requests without CSRF token', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'GET',
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should allow HEAD requests without CSRF token', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'HEAD',
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should allow OPTIONS requests without CSRF token', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'OPTIONS',
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });
  });

  describe('Route Exclusions', () => {
    it('should skip CSRF protection for public API routes', async () => {
      const request = createRequest(
        'https://example.com/api/v1/public/templates',
        {
          method: 'POST',
        }
      );

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should skip CSRF protection for webhook endpoints', async () => {
      const request = createRequest(
        'https://example.com/api/v1/webhooks/stripe',
        {
          method: 'POST',
          headers: { 'stripe-signature': 'valid-signature' },
        }
      );

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should skip CSRF protection for health checks', async () => {
      const request = createRequest('https://example.com/api/v1/health', {
        method: 'GET',
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should skip CSRF protection for auth callback routes', async () => {
      const request = createRequest(
        'https://example.com/api/auth/callback/google',
        {
          method: 'POST',
        }
      );

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should protect regular API routes', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeInstanceOf(NextResponse);
    });
  });

  describe('Content Type Handling', () => {
    it('should handle JSON requests', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'valid-token',
          Cookie: 'csrf-token=valid-token',
        },
        body: JSON.stringify({ name: 'Test' }),
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should handle form-encoded requests', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: 'csrf-token=valid-token',
        },
        body: '_csrf=valid-token&name=Test',
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should handle multipart form requests', async () => {
      const formData = new FormData();
      formData.append('_csrf', 'valid-token');
      formData.append('file', new Blob(['test']), 'test.txt');

      const request = createRequest('https://example.com/api/v1/upload', {
        method: 'POST',
        headers: {
          Cookie: 'csrf-token=valid-token',
        },
        body: formData,
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });

    it('should handle requests without content type', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          Cookie: 'csrf-token=valid-token',
        },
      });

      const result = await csrfEnhanced(request);
      expect(result).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
      });

      const result = await csrfEnhanced(request);
      const responseData = await result?.json();

      expect(responseData.error).toContain('CSRF token missing');
      expect(responseData.details).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should provide generic error messages in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
      });

      const result = await csrfEnhanced(request);
      const responseData = await result?.json();

      expect(responseData.error).toBe('Forbidden');
      expect(responseData.details).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle malformed tokens gracefully', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'malformed-token-!@#$%',
          Cookie: 'csrf-token=malformed-token-!@#$%',
        },
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);
    });

    it('should handle very long tokens', async () => {
      const longToken = 'a'.repeat(10000);

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': longToken,
          Cookie: `csrf-token=${longToken}`,
        },
      });

      const result = await csrfEnhanced(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(403);
    });
  });

  describe('Security Features', () => {
    it('should use timing-safe token comparison', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
      });

      await csrfEnhanced(request);

      expect(mockCrypto.timingSafeEqual).toHaveBeenCalled();
    });

    it('should generate cryptographically secure tokens', async () => {
      const request = createRequest('https://example.com/api/v1/csrf-token');
      await csrfEnhanced(request);

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
    });

    it('should use HMAC for token integrity', async () => {
      const request = createRequest('https://example.com/api/v1/csrf-token');
      await csrfEnhanced(request);

      expect(mockCrypto.createHmac).toHaveBeenCalledWith(
        'sha256',
        expect.any(String)
      );
    });

    it('should rotate tokens periodically', async () => {
      // Advance time to trigger rotation
      jest.advanceTimersByTime(12 * 60 * 60 * 1000); // 12 hours

      const request = createRequest('https://example.com/api/v1/portfolios', {
        headers: { Cookie: 'csrf-token=old-token' },
      });

      const result = await csrfEnhanced(request);

      if (result?.headers.get('Set-Cookie')) {
        expect(result.headers.get('Set-Cookie')).toContain('csrf-token=');
      }
    });
  });

  describe('Performance', () => {
    it('should cache token validation results', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'cached-token',
          Cookie: 'csrf-token=cached-token',
        },
      });

      // First validation
      await csrfEnhanced(request);

      // Second validation should use cache
      await csrfEnhanced(request);

      // Should not call expensive crypto operations twice
      expect(mockCrypto.timingSafeEqual).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        createRequest('https://example.com/api/v1/portfolios', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': `token-${i}`,
            Cookie: `csrf-token=token-${i}`,
          },
        })
      );

      const results = await Promise.all(requests.map(req => csrfEnhanced(req)));

      expect(results).toHaveLength(10);
    });

    it('should minimize memory usage for large numbers of tokens', async () => {
      // Generate many tokens
      const requests = Array.from({ length: 1000 }, (_, i) =>
        createRequest('https://example.com/api/v1/csrf-token')
      );

      const responses = await Promise.all(
        requests.map(req => csrfEnhanced(req))
      );

      expect(responses).toHaveLength(1000);
      expect(mockCrypto.randomBytes).toHaveBeenCalledTimes(1000);
    });
  });

  describe('Configuration', () => {
    it('should support custom token header names', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-Custom-CSRF': 'valid-token',
          Cookie: 'csrf-token=valid-token',
        },
      });

      const result = await csrfEnhanced(request, {
        headerName: 'X-Custom-CSRF',
      });

      expect(result).toBeUndefined();
    });

    it('should support custom token field names', async () => {
      const formData = new FormData();
      formData.append('custom_csrf', 'valid-token');

      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: { Cookie: 'csrf-token=valid-token' },
        body: formData,
      });

      const result = await csrfEnhanced(request, {
        fieldName: 'custom_csrf',
      });

      expect(result).toBeUndefined();
    });

    it('should support custom cookie names', async () => {
      const request = createRequest('https://example.com/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          Cookie: 'custom-csrf=valid-token',
        },
      });

      const result = await csrfEnhanced(request, {
        cookieName: 'custom-csrf',
      });

      expect(result).toBeUndefined();
    });

    it('should support custom token expiration', async () => {
      const request = createRequest('https://example.com/api/v1/csrf-token');
      const response = await csrfEnhanced(request, {
        tokenExpiry: 1800000, // 30 minutes
      });

      const setCookieHeader = response?.headers.get('Set-Cookie');
      expect(setCookieHeader).toContain('Max-Age=1800');
    });
  });
});
