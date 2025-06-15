import { NextRequest, NextResponse } from 'next/server';
import { csrfMiddleware, generateToken, validateToken } from '@/middleware/csrf';

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('mock-random-bytes-1234567890')),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-hash-value'),
  })),
}));

describe('CSRF Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Generation', () => {
    it('should generate a valid CSRF token', () => {
      const token = generateToken();
      
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
      expect(typeof token).toBe('string');
    });

    it('should generate unique tokens', () => {
      const crypto = require('crypto');
      crypto.randomBytes
        .mockReturnValueOnce(Buffer.from('random1'))
        .mockReturnValueOnce(Buffer.from('random2'));

      const token1 = generateToken();
      const token2 = generateToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('Token Validation', () => {
    it('should validate a correct token', () => {
      const token = generateToken();
      const isValid = validateToken(token, token);

      expect(isValid).toBe(true);
    });

    it('should reject an incorrect token', () => {
      const token1 = 'valid-token';
      const token2 = 'invalid-token';
      const isValid = validateToken(token1, token2);

      expect(isValid).toBe(false);
    });

    it('should reject empty tokens', () => {
      expect(validateToken('', 'token')).toBe(false);
      expect(validateToken('token', '')).toBe(false);
      expect(validateToken('', '')).toBe(false);
    });

    it('should handle null/undefined tokens', () => {
      expect(validateToken(null as any, 'token')).toBe(false);
      expect(validateToken('token', undefined as any)).toBe(false);
    });
  });

  describe('Middleware Behavior', () => {
    it('should skip CSRF protection for GET requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const response = await csrfMiddleware(request);

      expect(response).toBeUndefined();
    });

    it('should skip CSRF protection for HEAD requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'HEAD',
      });

      const response = await csrfMiddleware(request);

      expect(response).toBeUndefined();
    });

    it('should require CSRF token for POST requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await csrfMiddleware(request);

      expect(response).toBeDefined();
      expect(response?.status).toBe(403);
      const body = await response?.json();
      expect(body.error).toContain('CSRF');
    });

    it('should accept valid CSRF token in header', async () => {
      const token = generateToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          'cookie': `csrf-token=${token}`,
        },
      });

      const response = await csrfMiddleware(request);

      expect(response).toBeUndefined();
    });

    it('should accept valid CSRF token in custom header', async () => {
      const token = generateToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'PUT',
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'x-csrf-token': token,
          'cookie': `csrf-token=${token}`,
        },
      });

      const response = await csrfMiddleware(request);

      expect(response).toBeUndefined();
    });
  });

  describe('Cookie Handling', () => {
    it('should set CSRF cookie on first request', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      const mockResponse = NextResponse.next();
      const response = await csrfMiddleware(request, {}, mockResponse);

      const setCookie = response?.headers.get('set-cookie');
      expect(setCookie).toContain('csrf-token=');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('SameSite=Strict');
    });

    it('should not override existing CSRF cookie', async () => {
      const existingToken = generateToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'cookie': `csrf-token=${existingToken}`,
        },
      });

      const mockResponse = NextResponse.next();
      const response = await csrfMiddleware(request, {}, mockResponse);

      const setCookie = response?.headers.get('set-cookie');
      expect(setCookie).toBeNull();
    });

    it('should use secure cookie in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const request = new NextRequest('https://example.com/api/test', {
        method: 'GET',
      });

      const mockResponse = NextResponse.next();
      const response = await csrfMiddleware(request, {}, mockResponse);

      const setCookie = response?.headers.get('set-cookie');
      expect(setCookie).toContain('Secure');
    });
  });

  describe('Content Type Handling', () => {
    it('should check CSRF for JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await csrfMiddleware(request);

      expect(response?.status).toBe(403);
    });

    it('should check CSRF for form submissions', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      });

      const response = await csrfMiddleware(request);

      expect(response?.status).toBe(403);
    });

    it('should skip CSRF for multipart uploads with valid token', async () => {
      const token = generateToken();
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data; boundary=----',
          'x-csrf-token': token,
          'cookie': `csrf-token=${token}`,
        },
      });

      const response = await csrfMiddleware(request);

      expect(response).toBeUndefined();
    });
  });

  describe('Exclusion Patterns', () => {
    it('should skip CSRF for excluded paths', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhook', {
        method: 'POST',
      });

      const response = await csrfMiddleware(request, {
        excludePaths: ['/api/webhook', '/api/public'],
      });

      expect(response).toBeUndefined();
    });

    it('should skip CSRF for public API endpoints', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/callback', {
        method: 'POST',
      });

      const response = await csrfMiddleware(request, {
        excludePaths: ['/api/auth/callback'],
      });

      expect(response).toBeUndefined();
    });
  });

  describe('Error Cases', () => {
    it('should handle missing CSRF token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'DELETE',
        headers: {
          'cookie': 'csrf-token=server-token',
        },
      });

      const response = await csrfMiddleware(request);

      expect(response?.status).toBe(403);
      const body = await response?.json();
      expect(body.error).toContain('Missing CSRF token');
    });

    it('should handle token mismatch', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'wrong-token',
          'cookie': 'csrf-token=server-token',
        },
      });

      const response = await csrfMiddleware(request);

      expect(response?.status).toBe(403);
      const body = await response?.json();
      expect(body.error).toContain('Invalid CSRF token');
    });
  });

  describe('Double Submit Cookie Pattern', () => {
    it('should implement double submit cookie pattern', async () => {
      const token = generateToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          'cookie': `csrf-token=${token}`,
        },
      });

      const response = await csrfMiddleware(request);

      expect(response).toBeUndefined(); // Valid double submit
    });
  });
});