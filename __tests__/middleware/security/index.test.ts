import { NextRequest, NextResponse } from 'next/server';
import { SecurityMiddleware } from '@/middleware/security';
import { validateRequest } from '@/middleware/security/validation';

jest.mock('@/middleware/security/validation');

describe('SecurityMiddleware', () => {
  const mockValidateRequest = validateRequest as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF token for state-changing requests', async () => {
      mockValidateRequest.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token'
        },
        body: JSON.stringify({ name: 'Test' })
      });

      const response = await SecurityMiddleware.handle(request);

      expect(mockValidateRequest).toHaveBeenCalledWith(request);
      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should reject requests without CSRF token', async () => {
      mockValidateRequest.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      });

      const response = await SecurityMiddleware.handle(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('CSRF');
    });

    it('should allow safe methods without CSRF token', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'GET'
      });

      const response = await SecurityMiddleware.handle(request);

      expect(mockValidateRequest).not.toHaveBeenCalled();
      expect(response).toBeUndefined();
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize request body', async () => {
      mockValidateRequest.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>Test',
          bio: 'Normal bio'
        })
      });

      const response = await SecurityMiddleware.handle(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid input');
    });

    it('should allow clean input', async () => {
      mockValidateRequest.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Clean Portfolio Name',
          bio: 'Professional bio without scripts'
        })
      });

      const response = await SecurityMiddleware.handle(request);

      expect(response).toBeUndefined();
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should block SQL injection attempts', async () => {
      mockValidateRequest.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "'; DROP TABLE portfolios; --",
          bio: 'Test'
        })
      });

      const response = await SecurityMiddleware.handle(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid input');
    });
  });

  describe('Rate Limiting Headers', () => {
    it('should add rate limit headers to response', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = NextResponse.next();

      const modifiedResponse = await SecurityMiddleware.addSecurityHeaders(response);

      expect(modifiedResponse.headers.get('X-RateLimit-Limit')).toBeTruthy();
      expect(modifiedResponse.headers.get('X-RateLimit-Remaining')).toBeTruthy();
    });
  });

  describe('Content Security Policy', () => {
    it('should add CSP headers', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = NextResponse.next();

      const modifiedResponse = await SecurityMiddleware.addSecurityHeaders(response);

      expect(modifiedResponse.headers.get('Content-Security-Policy')).toBeTruthy();
      expect(modifiedResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(modifiedResponse.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Input Validation', () => {
    it('should validate request size limits', async () => {
      const largeBody = 'x'.repeat(10 * 1024 * 1024); // 10MB

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: largeBody })
      });

      const response = await SecurityMiddleware.handle(request);

      expect(response.status).toBe(413); // Payload Too Large
    });

    it('should validate content type', async () => {
      mockValidateRequest.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-token',
          'Content-Type': 'text/plain'
        },
        body: 'Not JSON'
      });

      const response = await SecurityMiddleware.handle(request);

      expect(response.status).toBe(415); // Unsupported Media Type
    });
  });

  describe('Authentication Check', () => {
    it('should verify authentication for protected routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      
      // Mock auth check
      jest.spyOn(SecurityMiddleware, 'isAuthenticated').mockResolvedValue(false);

      const response = await SecurityMiddleware.handle(request);

      expect(response.status).toBe(401);
    });
  });

  describe('IP Blocking', () => {
    it('should block blacklisted IPs', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        headers: {
          'X-Forwarded-For': '192.168.1.100' // Assuming this is blacklisted in test
        }
      });

      jest.spyOn(SecurityMiddleware, 'isIPBlocked').mockReturnValue(true);

      const response = await SecurityMiddleware.handle(request);

      expect(response.status).toBe(403);
      expect(response.statusText).toContain('Forbidden');
    });
  });
});