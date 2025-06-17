/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { securityHeaders } from '@/middleware/security-headers';

describe('Security Headers Middleware', () => {
  const createRequest = (
    url: string = 'https://example.com',
    options: { headers?: Record<string, string>; method?: string } = {}
  ) => {
    return new NextRequest(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
    });
  };

  const createResponse = (body?: string, init?: ResponseInit) => {
    return new NextResponse(body, init);
  };

  describe('Core Security Headers', () => {
    it('should add Content Security Policy header', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const cspHeader = result.headers.get('Content-Security-Policy');
      expect(cspHeader).toBeDefined();
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self' 'unsafe-inline'");
      expect(cspHeader).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('should add X-Frame-Options header', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should add X-Content-Type-Options header', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should add X-XSS-Protection header', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should add Referrer-Policy header', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should add Permissions-Policy header', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const permissionsPolicy = result.headers.get('Permissions-Policy');
      expect(permissionsPolicy).toBeDefined();
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=()');
    });
  });

  describe('HTTPS Security', () => {
    it('should add Strict-Transport-Security header for HTTPS', () => {
      const request = createRequest('https://example.com');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const hsts = result.headers.get('Strict-Transport-Security');
      expect(hsts).toBe('max-age=31536000; includeSubDomains; preload');
    });

    it('should not add HSTS header for HTTP', () => {
      const request = createRequest('http://example.com');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Strict-Transport-Security')).toBeNull();
    });

    it('should add Upgrade-Insecure-Requests header', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Upgrade-Insecure-Requests')).toBe('1');
    });
  });

  describe('Content Security Policy', () => {
    it('should allow Next.js domains in script-src', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://*.vercel.app');
      expect(csp).toContain('https://prisma-brown.vercel.app');
    });

    it('should include analytics domains', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://www.google-analytics.com');
      expect(csp).toContain('https://www.googletagmanager.com');
    });

    it('should allow Stripe domains for payments', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://*.stripe.com');
      expect(csp).toContain('https://js.stripe.com');
    });

    it('should include font sources', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://fonts.googleapis.com');
      expect(csp).toContain('https://fonts.gstatic.com');
    });

    it('should handle img-src for CDNs', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain("img-src 'self' data: https:");
    });
  });

  describe('API Routes Security', () => {
    it('should apply stricter CSP for API routes', () => {
      const request = createRequest('https://example.com/api/v1/test');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain("default-src 'none'");
      expect(csp).toContain("script-src 'none'");
    });

    it('should add X-Robots-Tag for API routes', () => {
      const request = createRequest('https://example.com/api/v1/test');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    });

    it('should set Cache-Control for API routes', () => {
      const request = createRequest('https://example.com/api/v1/test');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    });
  });

  describe('Development vs Production', () => {
    it('should apply stricter headers in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).not.toContain("'unsafe-eval'");

      process.env.NODE_ENV = originalEnv;
    });

    it('should allow development tools in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain('localhost:*');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Special Routes', () => {
    it('should handle iframe embedding for specific routes', () => {
      const request = createRequest('https://example.com/embed/portfolio');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    });

    it('should allow more permissive CSP for preview pages', () => {
      const request = createRequest('https://example.com/preview/123');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain("frame-src 'self'");
    });

    it('should handle auth callback routes', () => {
      const request = createRequest('https://example.com/auth/callback');
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Content Type Handling', () => {
    it('should handle JSON responses', () => {
      const request = createRequest();
      const response = createResponse('{"test": true}', {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Content-Type')).toBe('application/json');
      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should handle HTML responses', () => {
      const request = createRequest();
      const response = createResponse('<html></html>', {
        headers: { 'Content-Type': 'text/html' },
      });
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Content-Type')).toBe('text/html');
    });

    it('should handle static assets', () => {
      const request = createRequest('https://example.com/static/image.png');
      const response = createResponse(null, {
        headers: { 'Content-Type': 'image/png' },
      });
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Cache-Control')).toContain('public');
    });
  });

  describe('Cross-Origin Resource Sharing', () => {
    it('should handle CORS for allowed origins', () => {
      const request = createRequest('https://example.com/api/v1/public', {
        headers: { 'Origin': 'https://trusted-domain.com' },
      });
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://trusted-domain.com');
    });

    it('should reject CORS for disallowed origins', () => {
      const request = createRequest('https://example.com/api/v1/private', {
        headers: { 'Origin': 'https://malicious-domain.com' },
      });
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('should handle preflight requests', () => {
      const request = createRequest('https://example.com/api/v1/test', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://trusted-domain.com',
          'Access-Control-Request-Method': 'POST',
        },
      });
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(result.headers.get('Access-Control-Max-Age')).toBe('86400');
    });
  });

  describe('Security Monitoring', () => {
    it('should add security-related response headers for monitoring', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Powered-By')).toBeNull(); // Should remove this
      expect(result.headers.get('Server')).toBeNull(); // Should remove this
    });

    it('should add Content Security Policy Report-URI', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain('report-uri /api/v1/csp-report');
    });

    it('should handle error responses securely', () => {
      const request = createRequest();
      const response = createResponse('Internal Server Error', { status: 500 });
      
      const result = securityHeaders(request, response);

      expect(result.status).toBe(500);
      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('Performance Considerations', () => {
    it('should not duplicate existing headers', () => {
      const request = createRequest();
      const response = createResponse(null, {
        headers: { 'X-Frame-Options': 'SAMEORIGIN' },
      });
      
      const result = securityHeaders(request, response);

      // Should override with more secure value
      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should preserve non-security headers', () => {
      const request = createRequest();
      const response = createResponse(null, {
        headers: { 
          'Custom-Header': 'value',
          'Content-Length': '100',
        },
      });
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Custom-Header')).toBe('value');
      expect(result.headers.get('Content-Length')).toBe('100');
    });

    it('should handle large header values efficiently', () => {
      const request = createRequest();
      const response = createResponse();
      
      const start = performance.now();
      const result = securityHeaders(request, response);
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // Should be fast
      expect(result.headers.get('Content-Security-Policy')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed URLs gracefully', () => {
      const request = createRequest('invalid-url');
      const response = createResponse();
      
      expect(() => securityHeaders(request, response)).not.toThrow();
    });

    it('should handle missing request headers', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should handle null response body', () => {
      const request = createRequest();
      const response = createResponse(null);
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('Content-Security-Policy')).toBeDefined();
    });

    it('should handle very long URLs', () => {
      const longPath = '/'.repeat(1000);
      const request = createRequest(`https://example.com${longPath}`);
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Integration', () => {
    it('should work with other middleware', () => {
      const request = createRequest();
      const response = createResponse(null, {
        headers: { 'X-Custom-Middleware': 'applied' },
      });
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Custom-Middleware')).toBe('applied');
      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should maintain response status codes', () => {
      const request = createRequest();
      const response = createResponse('Not Found', { status: 404 });
      
      const result = securityHeaders(request, response);

      expect(result.status).toBe(404);
      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should work with streaming responses', () => {
      const request = createRequest();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue('chunk1');
          controller.enqueue('chunk2');
          controller.close();
        },
      });
      const response = new NextResponse(stream);
      
      const result = securityHeaders(request, response);

      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Security Compliance', () => {
    it('should meet OWASP security header requirements', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      // OWASP recommended headers
      expect(result.headers.get('X-Frame-Options')).toBeTruthy();
      expect(result.headers.get('X-Content-Type-Options')).toBeTruthy();
      expect(result.headers.get('Content-Security-Policy')).toBeTruthy();
      expect(result.headers.get('Referrer-Policy')).toBeTruthy();
    });

    it('should pass security scanner requirements', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      // Common security scanner checks
      expect(result.headers.get('X-Powered-By')).toBeNull();
      expect(result.headers.get('Server')).toBeNull();
      expect(result.headers.get('X-XSS-Protection')).toBeTruthy();
    });

    it('should support Content Security Policy v3', () => {
      const request = createRequest();
      const response = createResponse();
      
      const result = securityHeaders(request, response);

      const csp = result.headers.get('Content-Security-Policy');
      expect(csp).toContain('report-uri');
      expect(csp).toContain("'strict-dynamic'");
    });
  });
});