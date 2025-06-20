import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { middleware } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

import {   generateCSRFToken,

jest.mock('@/lib/utils/logger', () => ({

jest.setTimeout(30000);

  verifyCSRFToken,
  csrfMiddleware} from '../../middleware/csrf';

// Mock logger

  logger: {
    warn: jest.fn(),
    error: jest.fn()}}));

describe('CSRF Middleware', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  const createRequest = (
    pathname: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      cookies?: Record<string, string>;
    } = {}
  ) => {
    const url = new URL(`https://example.com${pathname}`);
    const headers = new Headers(options.headers);
    const request = new NextRequest(url, {
      method: options.method || 'GET',
      headers});

    // Mock cookies
    if (options.cookies) {
      Object.entries(options.cookies).forEach(([name, value]) => {
        request.cookies.set(name, value);
      });
    }

    return request;
  };

  describe('generateCSRFToken', () => {
    it('should generate a token of correct length', async () => {
      const token = generateCSRFToken();

      expect(token).toHaveLength(64); // 32 bytes * 2 (hex encoding)
      expect(typeof token).toBe('string');
    });

    it('should generate unique tokens', async () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with only hex characters', async () => {
      const token = generateCSRFToken();

      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('should be cryptographically random', async () => {
      // Generate multiple tokens and ensure they have good entropy
      const tokens = Array.from({ length: 100 }, () => generateCSRFToken());
      const uniqueTokens = new Set(tokens);

      expect(uniqueTokens.size).toBe(100); // All tokens should be unique
    });
  });

  describe('verifyCSRFToken', () => {
    const validToken =
      '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    describe('Method-based protection', () => {
      it('should skip verification for GET requests', async () => {
        const request = createRequest('/api/test', { method: 'GET' });

        const result = verifyCSRFToken(request);

        expect(result).toBe(true);
      });

      it('should skip verification for HEAD requests', async () => {
        const request = createRequest('/api/test', { method: 'HEAD' });

        const result = verifyCSRFToken(request);

        expect(result).toBe(true);
      });

      it('should skip verification for OPTIONS requests', async () => {
        const request = createRequest('/api/test', { method: 'OPTIONS' });

        const result = verifyCSRFToken(request);

        expect(result).toBe(true);
      });

      const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
      protectedMethods.forEach(method => {
        it(`should require verification for ${method} requests`, async () => {
          const request = createRequest('/api/test', { method });

          const result = verifyCSRFToken(request);

          expect(result).toBe(false);
        });
      });
    });

    describe('Route exemptions', () => {
      const exemptRoutes = [
        '/api/auth/callback',
        '/api/integrations/github/callback',
        '/api/webhooks/stripe',
      ];

      exemptRoutes.forEach(route => {
        it(`should skip verification for exempt route: ${route}`, async () => {
          const request = createRequest(route, { method: 'POST' });

          const result = verifyCSRFToken(request);

          expect(result).toBe(true);
        });
      });

      it('should require verification for non-exempt routes', async () => {
        const request = createRequest('/api/portfolios', { method: 'POST' });

        const result = verifyCSRFToken(request);

        expect(result).toBe(false);
      });
    });

    describe('Token validation', () => {
      it('should accept valid matching tokens', async () => {
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': validToken },
          cookies: { 'prisma-csrf-token': validToken }});

        const result = verifyCSRFToken(request);

        expect(result).toBe(true);
      });

      it('should reject mismatched tokens', async () => {
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': validToken },
          cookies: { 'prisma-csrf-token': 'different-token' }});

        const result = verifyCSRFToken(request);

        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith(
          'CSRF token mismatch',
          expect.objectContaining({
            method: 'POST',
            url: 'https://example.com/api/test'})
        );
      });

      it('should reject missing cookie token', async () => {
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': validToken }});

        const result = verifyCSRFToken(request);

        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith(
          'CSRF token missing',
          expect.objectContaining({
            hasCookie: false,
            hasHeader: true})
        );
      });

      it('should reject missing header token', async () => {
        const request = createRequest('/api/test', {
          method: 'POST',
          cookies: { 'prisma-csrf-token': validToken }});

        const result = verifyCSRFToken(request);

        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith(
          'CSRF token missing',
          expect.objectContaining({
            hasCookie: true,
            hasHeader: false})
        );
      });

      it('should reject both tokens missing', async () => {
        const request = createRequest('/api/test', { method: 'POST' });

        const result = verifyCSRFToken(request);

        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith(
          'CSRF token missing',
          expect.objectContaining({
            hasCookie: false,
            hasHeader: false})
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty token values', async () => {
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': '' },
          cookies: { 'prisma-csrf-token': '' }});

        const result = verifyCSRFToken(request);

        expect(result).toBe(false);
      });

      it('should handle whitespace in tokens', async () => {
        const tokenWithSpaces = ` ${validToken} `;
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': tokenWithSpaces },
          cookies: { 'prisma-csrf-token': tokenWithSpaces }});

        const result = verifyCSRFToken(request);

        // CSRF tokens with whitespace should be considered invalid for security
        expect(result).toBe(false);
      });

      it('should be case sensitive', async () => {
        const upperToken = validToken.toUpperCase();
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': validToken },
          cookies: { 'prisma-csrf-token': upperToken }});

        const result = verifyCSRFToken(request);

        expect(result).toBe(false);
      });
    });
  });

  describe('csrfMiddleware', () => {
    describe('GET request handling', () => {
      it('should generate and set CSRF token for GET requests', async () => {
        const request = createRequest('/api/test', { method: 'GET' });

        const response = csrfMiddleware(request);

        expect(response).toBeInstanceOf(NextResponse);

        // Check cookie was set
        const cookies = response?.cookies.getAll() || [];
        const csrfCookie = cookies.find(c => c.name === 'prisma-csrf-token');
        expect(csrfCookie).toBeDefined();
        expect(csrfCookie?.value).toHaveLength(64);
        expect(csrfCookie?.httpOnly).toBe(true);
        expect(csrfCookie?.sameSite).toBe('strict');
        expect(csrfCookie?.path).toBe('/');

        // Check header was set
        const headerToken = response?.headers.get('x-csrf-token');
        expect(headerToken).toBe(csrfCookie?.value);
      });

      it('should set secure cookie in production', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const request = createRequest('/api/test', { method: 'GET' });
        const response = csrfMiddleware(request);

        const cookies = response?.cookies.getAll() || [];
        const csrfCookie = cookies.find(c => c.name === 'prisma-csrf-token');
        expect(csrfCookie?.secure).toBe(true);

        process.env.NODE_ENV = originalEnv;
      });

      it('should set non-secure cookie in development', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const request = createRequest('/api/test', { method: 'GET' });
        const response = csrfMiddleware(request);

        const cookies = response?.cookies.getAll() || [];
        const csrfCookie = cookies.find(c => c.name === 'prisma-csrf-token');
        expect(csrfCookie?.secure).toBe(false);

        process.env.NODE_ENV = originalEnv;
      });

      it('should set cookie expiration to 24 hours', async () => {
        const request = createRequest('/api/test', { method: 'GET' });
        const response = csrfMiddleware(request);

        const cookies = response?.cookies.getAll() || [];
        const csrfCookie = cookies.find(c => c.name === 'prisma-csrf-token');
        expect(csrfCookie?.maxAge).toBe(60 * 60 * 24); // 24 hours in seconds
      });
    });

    describe('Protected method handling', () => {
      const validToken =
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      it('should allow requests with valid CSRF tokens', async () => {
        const request = createRequest('/api/portfolios', {
          method: 'POST',
          headers: { 'x-csrf-token': validToken },
          cookies: { 'prisma-csrf-token': validToken }});

        const response = csrfMiddleware(request);

        expect(response).toBeNull();
      });

      it('should block requests with invalid CSRF tokens', async () => {
        const request = createRequest('/api/portfolios', {
          method: 'POST',
          headers: { 'x-csrf-token': 'invalid-token' },
          cookies: { 'prisma-csrf-token': validToken }});

        const response = csrfMiddleware(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);

        const responseData = response?.json();
        await expect(responseData).resolves.toEqual({ error: 'Invalid CSRF token' });
      });

      it('should log security events for failed validations', async () => {
        const request = createRequest('/api/portfolios', {
          method: 'POST',
          headers: { 'x-csrf-token': 'invalid-token' },
          cookies: { 'prisma-csrf-token': validToken }});

        csrfMiddleware(request);

        expect(logger.error).toHaveBeenCalledWith(
          'CSRF validation failed',
          expect.objectContaining({
            method: 'POST',
            url: 'https://example.com/api/portfolios'})
        );
      });

      it('should include IP address in security logs', async () => {
        const request = createRequest('/api/portfolios', {
          method: 'POST',
          headers: {
            'x-csrf-token': 'invalid-token',
            'x-forwarded-for': '192.168.1.1'},
          cookies: { 'prisma-csrf-token': validToken }});

        csrfMiddleware(request);

        expect(logger.error).toHaveBeenCalledWith(
          'CSRF validation failed',
          expect.objectContaining({
            ip: '192.168.1.1'})
        );
      });
    });

    describe('Exempt routes', () => {
      it('should allow POST to OAuth callback without CSRF token', async () => {
        const request = createRequest('/api/auth/callback', { method: 'POST' });

        const response = csrfMiddleware(request);

        expect(response).toBeNull();
      });

      it('should allow POST to GitHub callback without CSRF token', async () => {
        const request = createRequest('/api/integrations/github/callback', {
          method: 'POST'});

        const response = csrfMiddleware(request);

        expect(response).toBeNull();
      });

      it('should allow POST to webhooks without CSRF token', async () => {
        const request = createRequest('/api/webhooks/stripe', {
          method: 'POST'});

        const response = csrfMiddleware(request);

        expect(response).toBeNull();
      });
    });

    describe('Integration scenarios', () => {
      it('should handle complete CSRF flow', async () => {
        // Step 1: GET request generates token
        const getRequest = createRequest('/api/portfolios', { method: 'GET' });
        const getResponse = csrfMiddleware(getRequest);

        expect(getResponse).toBeInstanceOf(NextResponse);

        // Extract token from response
        const cookies = getResponse?.cookies.getAll() || [];
        const csrfCookie = cookies.find(c => c.name === 'prisma-csrf-token');
        const token = csrfCookie?.value;
        expect(token).toBeDefined();

        // Step 2: POST request uses the token
        const postRequest = createRequest('/api/portfolios', {
          method: 'POST',
          headers: { 'x-csrf-token': token || '' },
          cookies: { 'prisma-csrf-token': token || '' }});

        const postResponse = csrfMiddleware(postRequest);
        expect(postResponse).toBeNull();
      });

      it('should handle multiple concurrent requests', async () => {
        const validToken = generateCSRFToken();

        const requests = Array.from({ length: 10 }, (_, i) =>
          createRequest(`/api/test-${i}`, {
            method: 'POST',
            headers: { 'x-csrf-token': validToken },
            cookies: { 'prisma-csrf-token': validToken }})
        );
        const responses = requests.map(req => csrfMiddleware(req));

        // All should pass CSRF validation
        responses.forEach(response => {
          expect(response).toBeNull();
        });
      });
    });

    describe('Error handling and edge cases', () => {
      it('should handle requests with malformed cookies', async () => {
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': 'valid-token' }});

        // Manually set malformed cookie
        request.cookies.set('prisma-csrf-token', '');

        const response = csrfMiddleware(request);

        expect(response?.status).toBe(403);
      });

      it('should handle very long tokens', async () => {
        const longToken = 'a'.repeat(1000);
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': longToken },
          cookies: { 'prisma-csrf-token': longToken }});

        const response = csrfMiddleware(request);

        expect(response).toBeNull(); // Should accept matching tokens regardless of length
      });

      it('should handle special characters in tokens', async () => {
        const specialToken = 'token-with-special-chars!@#$%^&*()';
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': specialToken },
          cookies: { 'prisma-csrf-token': specialToken }});

        const response = csrfMiddleware(request);

        expect(response).toBeNull();
      });

      it('should handle requests without any headers', async () => {
        const request = createRequest('/api/test', { method: 'POST' });

        const response = csrfMiddleware(request);

        expect(response?.status).toBe(403);
      });
    });

    describe('Performance considerations', () => {
      it('should process requests quickly', async () => {
        const validToken = generateCSRFToken();
        const request = createRequest('/api/test', {
          method: 'POST',
          headers: { 'x-csrf-token': validToken },
          cookies: { 'prisma-csrf-token': validToken }});

        const startTime = Date.now();
        csrfMiddleware(request);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      });

      it('should handle high volume of token generations', async () => {
        const startTime = Date.now();

        for (let i = 0; i < 1000; i++) {
          generateCSRFToken();
        }

        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(100); // Should generate 1000 tokens quickly
      });
    });
  });
});