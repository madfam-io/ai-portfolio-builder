import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { createServerClient } from '@supabase/ssr';

// Mock dependencies
jest.mock('@supabase/ssr');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/config', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
  services: {
    supabase: true,
  },
}));

jest.mock('@/middleware/api-version', () => ({
  apiVersionMiddleware: jest.fn(() =>
    NextResponse.next({
      status: 200,
    })
  ),
}));

jest.mock('@/middleware/security', () => ({
  securityMiddleware: jest.fn(() => null),
  applySecurityToResponse: jest.fn((req, res) => res),
}));

const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

describe('middleware', () => {
  let mockSupabaseClient: any;
  let mockSession: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock session
    mockSession = {
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
      },
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
    };

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
      },
    };

    mockCreateServerClient.mockReturnValue(mockSupabaseClient);
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from /dashboard to signin', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );
      const response = await middleware(request);

      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/auth/signin?redirectTo=%2Fdashboard'
      );
    });

    it('should redirect unauthenticated users from /editor to signin', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/editor/new')
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/auth/signin?redirectTo=%2Feditor%2Fnew'
      );
    });

    it('should allow authenticated users to access protected routes', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );
      const response = await middleware(request);

      // Should not redirect
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it('should preserve query parameters when redirecting', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/editor/123?template=developer')
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/auth/signin?redirectTo=%2Feditor%2F123%3Ftemplate%3Ddeveloper'
      );
    });
  });

  describe('Auth Routes', () => {
    it('should redirect authenticated users from signin to dashboard', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/auth/signin')
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/dashboard'
      );
    });

    it('should redirect authenticated users from signup to dashboard', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/auth/signup')
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/dashboard'
      );
    });

    it('should respect redirectTo parameter for authenticated users', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/auth/signin?redirectTo=/editor/new')
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/editor/new'
      );
    });

    it('should not redirect to non-protected routes from redirectTo', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/auth/signin?redirectTo=/about')
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/dashboard'
      );
    });

    it('should allow unauthenticated users to access auth routes', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/auth/signin')
      );
      const response = await middleware(request);

      // Should not redirect
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Public Routes', () => {
    it('should allow access to landing page without authentication', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(new URL('http://localhost:3000/'));
      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it('should allow access to about page without authentication', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest(new URL('http://localhost:3000/about'));
      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('API Routes', () => {
    it('should handle API versioning for API routes', async () => {
      const { apiVersionMiddleware } = require('@/middleware/api-version');

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/portfolios')
      );
      await middleware(request);

      expect(apiVersionMiddleware).toHaveBeenCalledWith(request);
    });

    it('should return API version response if not 200', async () => {
      const { apiVersionMiddleware } = require('@/middleware/api-version');

      // Mock version middleware returning redirect
      apiVersionMiddleware.mockResolvedValueOnce(
        NextResponse.redirect(
          new URL('http://localhost:3000/api/v2/portfolios')
        )
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/api/portfolios')
      );
      const response = await middleware(request);

      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/api/v2/portfolios'
      );
    });
  });

  describe('Security', () => {
    it('should apply security middleware to all requests', async () => {
      const { securityMiddleware } = require('@/middleware/security');

      const request = new NextRequest(new URL('http://localhost:3000/'));
      await middleware(request);

      expect(securityMiddleware).toHaveBeenCalledWith(request);
    });

    it('should apply security headers to response', async () => {
      const { applySecurityToResponse } = require('@/middleware/security');

      const request = new NextRequest(new URL('http://localhost:3000/'));
      await middleware(request);

      expect(applySecurityToResponse).toHaveBeenCalled();
    });

    it('should return security response if provided', async () => {
      const { securityMiddleware } = require('@/middleware/security');

      // Mock security middleware returning rate limit response
      const rateLimitResponse = new NextResponse('Rate limit exceeded', {
        status: 429,
      });
      securityMiddleware.mockResolvedValueOnce(rateLimitResponse);

      const request = new NextRequest(new URL('http://localhost:3000/'));
      const response = await middleware(request);

      expect(response.status).toBe(429);
    });
  });

  describe('Cookie Management', () => {
    it('should properly handle cookie operations', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );

      // Mock cookie operations
      const mockCookieSet = jest.fn();
      const mockCookieGet = jest.fn().mockReturnValue({ value: 'test-cookie' });

      Object.defineProperty(request, 'cookies', {
        value: {
          get: mockCookieGet,
          set: mockCookieSet,
        },
        writable: true,
      });

      await middleware(request);

      // Verify createServerClient was called with cookie handlers
      expect(mockCreateServerClient).toHaveBeenCalledWith(
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
  });

  describe('Error Handling', () => {
    it('should handle session retrieval errors gracefully', async () => {
      // Mock session error
      mockSupabaseClient.auth.getSession.mockRejectedValue(
        new Error('Session error')
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );
      const response = await middleware(request);

      // Should redirect to signin when session fails
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/auth/signin?redirectTo=%2Fdashboard'
      );
    });

    it('should skip auth when Supabase is not configured', async () => {
      // Mock no Supabase configuration
      jest.doMock('@/lib/config', () => ({
        env: {},
        services: {
          supabase: false,
        },
      }));

      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard')
      );
      const response = await middleware(request);

      // Should not redirect when Supabase is not configured
      expect(response.status).toBe(200);
      expect(mockCreateServerClient).not.toHaveBeenCalled();
    });
  });
});
