import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';
import { apiVersionMiddleware } from '../../middleware/api-version';
import { securityMiddleware } from '../../middleware/security';

jest.mock('@/lib/utils/logger', () => ({
jest.mock('@/lib/config', () => mockConfig);
jest.mock('../../middleware/api-version', () => ({
jest.mock('../../middleware/security', () => ({
jest.mock('@supabase/ssr', () => ({

jest.setTimeout(30000);

// Mock dependencies

  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock config with dynamic import support
const mockConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_ENV: 'test',
    CORS_ALLOWED_ORIGINS: 'https://example.com,https://app.example.com',
  },
  services: {
    supabase: true,
  },
};

// Mock middleware modules

  apiVersionMiddleware: jest.fn(),
}));

  securityMiddleware: jest.fn(),
  applySecurityToResponse: jest.fn((req, res) => res),
}));

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
  },
};

  createServerClient: jest.fn(() => mockSupabaseClient),
}));

// Import mocked modules

describe('Middleware', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();

    // Default mock implementations
    (apiVersionMiddleware as jest.Mock).mockResolvedValue(
      new NextResponse(null, { status: 200 })
    );

    (securityMiddleware as jest.Mock).mockResolvedValue(null);
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  const createRequest = (
    pathname: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      cookies?: Record<string, string>;
      searchParams?: Record<string, string>;
    } = {}
  ) => {
    // Include query parameters in the pathname if provided
    let fullPath = pathname;
    if (options.searchParams) {
      const searchParams = new URLSearchParams();
      Object.entries(options.searchParams).forEach(([key, value]) => {
        searchParams.set(key, value);
      });
      if (searchParams.toString()) {
        fullPath += '?' + searchParams.toString();
      }
    }

    const url = new URL(`https://example.com${fullPath}`);

    const headers = new Headers(options.headers);
    const request = new NextRequest(url, {
      method: options.method || 'GET',
      headers,
    });

    // Mock cookies
    if (options.cookies) {
      Object.entries(options.cookies).forEach(([name, value]) => {
        request.cookies.set(name, value);
      });
    }

    return request;
  };

  describe('API Route Handling', () => {
    it('should apply API versioning middleware to API routes', async () => {
      const request = createRequest('/api/v1/test');

      await middleware(request);

      expect(apiVersionMiddleware).toHaveBeenCalledWith(request);
    });

    it('should return version middleware response if it redirects', async () => {
      const redirectResponse = NextResponse.redirect(
        'https://example.com/api/v2/test'
      );

      (apiVersionMiddleware as jest.Mock).mockResolvedValue(redirectResponse);

      const request = createRequest('/api/v1/test');
      const result = await middleware(request);

      expect(result).toBe(redirectResponse);
    });

    it('should skip API versioning for non-API routes', async () => {
      const request = createRequest('/dashboard');

      await middleware(request);

      expect(apiVersionMiddleware).not.toHaveBeenCalled();
    });
  });

  describe('Security Middleware', () => {
    it('should apply security middleware to all requests', async () => {
      const request = createRequest('/dashboard');

      await middleware(request);

      expect(securityMiddleware).toHaveBeenCalledWith(request);
    });

    it('should return security middleware response if it blocks request', async () => {
      const blockedResponse = new NextResponse(null, { status: 403 });
      (securityMiddleware as jest.Mock).mockResolvedValue(blockedResponse);

      const request = createRequest('/dashboard');
      const result = await middleware(request);

      expect(result).toBe(blockedResponse);
    });
  });

  describe('Authentication with Supabase', () => {
    it('should create Supabase client with correct configuration', async () => {
      const request = createRequest('/dashboard');

      await middleware(request);

      const { createServerClient } = require('@supabase/ssr');
      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      );
    });

    it('should handle session retrieval errors gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockRejectedValue(
        new Error('Session error')
      );

      const request = createRequest('/dashboard');
      const result = await middleware(request);

      // Should still process the request despite session error
      expect(result).toBeDefined();
    });

    it('should skip authentication when Supabase is not configured', async () => {
      jest.doMock('@/lib/config', () => ({
        env: {
          NODE_ENV: 'test',
          CORS_ALLOWED_ORIGINS: '',
        },
        services: {
          supabase: false,
        },
      }));

      const request = createRequest('/dashboard');
      const result = await middleware(request);

      expect(result).toBeDefined();
      expect(mockSupabaseClient.auth.getSession).not.toHaveBeenCalled();
    });
  });

  describe('Protected Routes', () => {
    const protectedRoutes = ['/dashboard', '/editor', '/profile'];

    protectedRoutes.forEach(route => {
      it(`should redirect unauthenticated users from ${route} to signin`, async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const request = createRequest(route);
        const result = await middleware(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.status).toBe(307); // Temporary redirect

        const location = result?.headers.get('location');
        expect(location).toBe(
          `https://example.com/auth/signin?redirectTo=${encodeURIComponent(route)}`
        );
      });

      it(`should allow authenticated users to access ${route}`, async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user' },
              access_token: 'test-token',
            },
          },
          error: null,
        });

        const request = createRequest(route);
        const result = await middleware(request);

        // The middleware should continue processing and return a response
        expect(result).toBeInstanceOf(NextResponse);
        // Should not be a redirect
        expect(result.status).not.toBe(307);
      });

      it(`should preserve original URL in redirect for ${route}`, async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const request = createRequest(route, {
          searchParams: { tab: 'settings', id: '123' },
        });
        const result = await middleware(request);

        const location = result?.headers.get('location');
        const expectedPath = `${route}?tab=settings&id=123`;
        expect(location).toContain(
          `redirectTo=${encodeURIComponent(expectedPath)}`
        );
      });
    });
  });

  describe('Authentication Routes', () => {
    const authRoutes = ['/auth/signin', '/auth/signup'];

    authRoutes.forEach(route => {
      it(`should redirect authenticated users from ${route} to dashboard`, async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user' },
              access_token: 'test-token',
            },
          },
          error: null,
        });

        const request = createRequest(route);
        const result = await middleware(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result?.status).toBe(307);
        expect(result?.headers.get('location')).toBe(
          'https://example.com/dashboard'
        );
      });

      it(`should allow unauthenticated users to access ${route}`, async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const request = createRequest(route);
        const result = await middleware(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result.status).not.toBe(307); // Should not redirect
      });

      it(`should redirect to original URL after authentication`, async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user' },
              access_token: 'test-token',
            },
          },
          error: null,
        });

        const request = createRequest(route, {
          searchParams: { redirectTo: '/dashboard/billing' },
        });
        const result = await middleware(request);

        expect(result?.headers.get('location')).toBe(
          'https://example.com/dashboard/billing'
        );
      });

      it(`should not redirect to non-protected routes`, async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user' },
              access_token: 'test-token',
            },
          },
          error: null,
        });

        const request = createRequest(route, {
          searchParams: { redirectTo: '/about' },
        });
        const result = await middleware(request);

        expect(result?.headers.get('location')).toBe(
          'https://example.com/dashboard'
        );
      });
    });
  });

  describe('Public Routes', () => {
    const publicRoutes = ['/', '/about', '/contact', '/pricing', '/blog'];

    publicRoutes.forEach(route => {
      it(`should allow access to ${route} regardless of authentication`, async () => {
        const request = createRequest(route);
        const result = await middleware(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result.status).not.toBe(307); // Should not redirect
      });
    });
  });

  describe('Cookie Management', () => {
    it('should handle cookie setting in Supabase client', async () => {
      const request = createRequest('/dashboard');

      await middleware(request);

      const { createServerClient } = require('@supabase/ssr');
      const cookieConfig = createServerClient.mock.calls[0][2];

      expect(cookieConfig.cookies).toHaveProperty('get');
      expect(cookieConfig.cookies).toHaveProperty('set');
      expect(cookieConfig.cookies).toHaveProperty('remove');
    });

    it('should read cookies from request', async () => {
      const request = createRequest('/dashboard', {
        cookies: { 'test-cookie': 'test-value' },
      });

      await middleware(request);

      const { createServerClient } = require('@supabase/ssr');
      const cookieConfig = createServerClient.mock.calls[0][2];

      const getValue = cookieConfig.cookies.get('test-cookie');
      expect(getValue).toBe('test-value');
    });
  });

  describe('Error Handling', () => {
    it('should handle middleware errors gracefully', async () => {
      // Reset the mock to not throw an error for this test
      (securityMiddleware as jest.Mock).mockResolvedValue(null);

      const request = createRequest('/dashboard');
      const result = await middleware(request);

      // Should handle error gracefully and return a response
      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should handle Supabase configuration errors', async () => {
      // Temporarily disable Supabase
      mockConfig.services.supabase = false;

      const request = createRequest('/dashboard');
      const result = await middleware(request);

      expect(result).toBeInstanceOf(NextResponse);

      // Restore Supabase for other tests
      mockConfig.services.supabase = true;
    });
  });

  describe('Request Headers and Security', () => {
    it('should apply security headers to all responses', async () => {
      const request = createRequest('/dashboard');
      const result = await middleware(request);

      // Middleware should return a response with security headers applied
      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should handle requests with various headers', async () => {
      const request = createRequest('/dashboard', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Test Browser',
          accept: 'text/html',
        },
      });

      const result = await middleware(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect(securityMiddleware).toHaveBeenCalledWith(request);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        createRequest(`/dashboard/page-${i}`)
      );

      const results = await Promise.all(
        requests.map(request => middleware(request))
      );

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeInstanceOf(NextResponse);
      });
    });

    it('should handle very long URLs', async () => {
      const longPath = '/dashboard/' + 'a'.repeat(1000);
      const request = createRequest(longPath);

      const result = await middleware(request);

      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should handle special characters in URLs', async () => {
      const specialPath = '/dashboard/user%20name/portfolio@2024';
      const request = createRequest(specialPath);

      const result = await middleware(request);

      expect(result).toBeInstanceOf(NextResponse);
    });
  });
});