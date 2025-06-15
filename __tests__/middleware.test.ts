import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { createServerClient } from '@supabase/ssr';

// Mock dependencies
jest.mock('@supabase/ssr');
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));
jest.mock('@/middleware/api-version', () => ({
  apiVersionMiddleware: jest.fn().mockResolvedValue(
    new NextResponse(null, { status: 200 })
  ),
}));
jest.mock('@/middleware/security', () => ({
  securityMiddleware: jest.fn().mockResolvedValue(null),
  applySecurityToResponse: jest.fn((req, res) => res),
}));
jest.mock('@/lib/config', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
  services: {
    supabase: true,
  },
}));

describe('Main Middleware', () => {
  const mockCreateServerClient = createServerClient as jest.Mock;
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    
    // Setup default Supabase client mock
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    };
    
    mockCreateServerClient.mockReturnValue(mockSupabaseClient);
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
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { session: null } 
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(307);
      const location = response?.headers.get('location');
      expect(location).toContain('/auth/signin');
      expect(location).toContain('redirectTo=%2Fdashboard');
    });

    it('should allow authenticated access to dashboard', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { 
          session: {
            user: { id: 'user-123', email: 'test@example.com' },
            access_token: 'test-token',
          } 
        } 
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response?.status).toBe(200); // NextResponse.next() returns 200
    });

    it('should protect editor routes', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { session: null } 
      });

      const request = new NextRequest('http://localhost:3000/editor/portfolio-123');
      const response = await middleware(request);

      expect(response?.status).toBe(307);
      const location = response?.headers.get('location');
      expect(location).toContain('/auth/signin');
      expect(location).toContain('redirectTo=%2Feditor%2Fportfolio-123');
    });

    it('should preserve pathname when redirecting', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { session: null } 
      });

      const request = new NextRequest('http://localhost:3000/dashboard?tab=analytics');
      const response = await middleware(request);

      const location = response?.headers.get('location');
      expect(location).toContain('/auth/signin');
      expect(location).toContain('redirectTo=%2Fdashboard');
    });
  });

  describe('Auth Route Handling', () => {
    it('should redirect authenticated users away from signin page', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { 
          session: {
            user: { id: 'user-123', email: 'test@example.com' },
            access_token: 'test-token',
          } 
        } 
      });

      const request = new NextRequest('http://localhost:3000/auth/signin');
      const response = await middleware(request);

      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/dashboard');
    });

    it('should redirect to specified URL after signin', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { 
          session: {
            user: { id: 'user-123', email: 'test@example.com' },
            access_token: 'test-token',
          } 
        } 
      });

      const request = new NextRequest('http://localhost:3000/auth/signin?redirectTo=/editor');
      const response = await middleware(request);

      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('http://localhost:3000/editor');
    });
  });

  describe('Protected Routes', () => {
    it('should protect profile route', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { session: null } 
      });

      const request = new NextRequest('http://localhost:3000/profile');
      const response = await middleware(request);

      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/auth/signin');
    });

    it('should allow access to public routes', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ 
        data: { session: null } 
      });

      const publicRoutes = ['/', '/about', '/pricing', '/templates'];
      
      for (const route of publicRoutes) {
        const request = new NextRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);
        expect(response?.status).toBe(200);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Session error'));

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      // Should still redirect to signin on error
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/auth/signin');
    });

    it('should skip auth when Supabase is not configured', async () => {
      // Mock config without Supabase
      const { middleware: middlewareWithoutSupabase } = await import('@/middleware');
      jest.doMock('@/lib/config', () => ({
        env: {},
        services: { supabase: false },
      }));

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middlewareWithoutSupabase(request);

      // Without Supabase, middleware should allow request to continue
      expect(response?.status).toBe(200);
    });
  });

  describe('Cookie Handling', () => {
    it('should properly handle cookies for session management', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard');
      
      // Mock cookie operations
      const mockCookieSet = jest.fn();
      (request.cookies as any).set = mockCookieSet;

      await middleware(request);

      // Verify Supabase client was created with proper cookie handling
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
});