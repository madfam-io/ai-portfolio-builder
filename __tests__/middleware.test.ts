// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) })),
  },
}));

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
jest.setTimeout(30000);

// Mock dependencies before importing middleware
const mockGetSession = jest.fn();
const mockCreateServerClient = jest.fn();
const mockApiVersionMiddleware = jest.fn();
const mockSecurityMiddleware = jest.fn();
const mockApplySecurityToResponse = jest.fn();

// Mock Supabase SSR
jest.mock('@supabase/ssr', () => ({ 
  createServerClient: mockCreateServerClient,
 }));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock config with dynamic import support
jest.mock('@/lib/config', () => {
  const mockConfig = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    services: {
      supabase: true,
    },
  };

  return {
    __esModule: true,
    default: mockConfig,
    env: mockConfig.env,
    services: mockConfig.services,
  };
});

// Mock middleware dependencies
jest.mock('@/middleware/api-version', () => ({ 
  apiVersionMiddleware: mockApiVersionMiddleware,
 }));

jest.mock('@/middleware/security', () => ({ 
  securityMiddleware: mockSecurityMiddleware,
  applySecurityToResponse: mockApplySecurityToResponse,
 }));

// Import middleware after mocks

global.fetch = jest.fn();

describe('middleware', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

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
        getSession: mockGetSession,
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    // Default mock implementations
    mockCreateServerClient.mockReturnValue(mockSupabaseClient);
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    mockApiVersionMiddleware.mockReturnValue(NextResponse.next());
    mockSecurityMiddleware.mockReturnValue(null);
    mockApplySecurityToResponse.mockImplementation((req, res) => res);
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from /dashboard to signin', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);
      expect(response).toBeDefined();
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/auth/signin?redirectTo=%2Fdashboard'
      );
    });
  });
});