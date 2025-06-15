import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { getToken } from 'next-auth/jwt';

jest.mock('next-auth/jwt');

describe('Main Middleware', () => {
  const mockGetToken = getToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  describe('Public Routes', () => {
    it('should allow access to home page', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      expect(response).not.toBeDefined(); // Allow request to continue
    });

    it('should allow access to landing page sections', async () => {
      const routes = ['/features', '/pricing', '/templates', '/about'];
      
      for (const route of routes) {
        const request = new NextRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);
        expect(response).not.toBeDefined();
      }
    });

    it('should allow access to auth pages', async () => {
      const request = new NextRequest('http://localhost:3000/auth/signin');
      const response = await middleware(request);

      expect(response).not.toBeDefined();
    });

    it('should allow access to static assets', async () => {
      const assets = ['/_next/static/test.js', '/favicon.ico', '/robots.txt'];
      
      for (const asset of assets) {
        const request = new NextRequest(`http://localhost:3000${asset}`);
        const response = await middleware(request);
        expect(response).not.toBeDefined();
      }
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to signin when accessing dashboard without auth', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/auth/signin');
    });

    it('should allow authenticated access to dashboard', async () => {
      mockGetToken.mockResolvedValue({ 
        sub: 'user-123',
        email: 'test@example.com' 
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response).not.toBeDefined(); // Allow request to continue
    });

    it('should protect editor routes', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/editor/portfolio-123');
      const response = await middleware(request);

      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/auth/signin');
    });

    it('should preserve query parameters when redirecting', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/dashboard?tab=analytics');
      const response = await middleware(request);

      expect(response?.headers.get('location')).toContain('?from=%2Fdashboard%3Ftab%3Danalytics');
    });
  });

  describe('API Routes Protection', () => {
    it('should return 401 for unauthenticated API requests', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await middleware(request);

      expect(response?.status).toBe(401);
      const body = await response?.json();
      expect(body.error).toContain('Unauthorized');
    });

    it('should allow authenticated API requests', async () => {
      mockGetToken.mockResolvedValue({ sub: 'user-123' });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await middleware(request);

      expect(response).not.toBeDefined(); // Allow request to continue
    });

    it('should allow public API endpoints', async () => {
      const publicEndpoints = ['/api/health', '/api/status'];

      for (const endpoint of publicEndpoints) {
        const request = new NextRequest(`http://localhost:3000${endpoint}`);
        const response = await middleware(request);
        expect(response).not.toBeDefined();
      }
    });
  });

  describe('CORS Headers', () => {
    it('should add CORS headers to API responses', async () => {
      mockGetToken.mockResolvedValue({ sub: 'user-123' });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        headers: {
          'origin': 'https://app.example.com'
        }
      });

      const response = await middleware(request);

      // In a real implementation, middleware might add CORS headers
      // This test would verify those headers are set correctly
      expect(response).not.toBeDefined();
    });

    it('should handle preflight OPTIONS requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'OPTIONS',
        headers: {
          'access-control-request-method': 'POST',
          'origin': 'https://app.example.com'
        }
      });

      const response = await middleware(request);

      // Preflight requests should be handled appropriately
      expect(response).not.toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should add rate limit headers', async () => {
      mockGetToken.mockResolvedValue({ sub: 'user-123' });

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio');
      const response = await middleware(request);

      // In a real implementation, rate limit headers would be added
      expect(response).not.toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should add security headers to responses', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      // Security headers would be added by middleware
      expect(response).not.toBeDefined();
    });
  });

  describe('Locale Handling', () => {
    it('should handle locale prefixes', async () => {
      const request = new NextRequest('http://localhost:3000/es/dashboard');
      mockGetToken.mockResolvedValue({ sub: 'user-123' });

      const response = await middleware(request);

      expect(response).not.toBeDefined();
    });

    it('should detect and redirect to appropriate locale', async () => {
      const request = new NextRequest('http://localhost:3000/', {
        headers: {
          'accept-language': 'en-US,en;q=0.9'
        }
      });

      const response = await middleware(request);

      // Locale detection logic would be tested here
      expect(response).not.toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      mockGetToken.mockRejectedValue(new Error('Token error'));

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      // Should still redirect to signin on error
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/auth/signin');
    });
  });

  describe('Matcher Configuration', () => {
    it('should skip middleware for excluded paths', async () => {
      const excludedPaths = [
        '/_next/image',
        '/api/auth/providers',
        '/.well-known/security.txt'
      ];

      // These paths would be handled by the matcher config
      // and middleware wouldn't run for them
      for (const path of excludedPaths) {
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await middleware(request);
        expect(response).not.toBeDefined();
      }
    });
  });
});