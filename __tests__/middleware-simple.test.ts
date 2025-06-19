import { describe, test, it, expect, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before importing middleware
const mockCreateServerClient = jest.fn();
const mockApiVersionMiddleware = jest.fn();
const mockSecurityMiddleware = jest.fn();
const mockApplySecurityToResponse = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
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

jest.mock('@/middleware/api-version', () => ({
  apiVersionMiddleware: mockApiVersionMiddleware,
}));

jest.mock('@/middleware/security', () => ({
  securityMiddleware: mockSecurityMiddleware,
  applySecurityToResponse: mockApplySecurityToResponse,
}));

// Import middleware after mocks are set up
import { middleware } from '@/middleware';

describe('Middleware Simple Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    const mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user' } } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockCreateServerClient.mockImplementation(() => mockSupabaseClient);
    mockApiVersionMiddleware.mockResolvedValue(NextResponse.next());
    mockSecurityMiddleware.mockResolvedValue(null);
    mockApplySecurityToResponse.mockImplementation((req, res) => res);
  });

  it('should work with basic request', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));

    console.log('Testing middleware with request:', request.url);

    try {
      const response = await middleware(request);
      console.log('Response:', response);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});
