import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';

// Mock all dependencies
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } },
        error: null
      })
    }
  }))
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
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
  apiVersionMiddleware: jest.fn(() => NextResponse.next())
}));

jest.mock('@/middleware/security', () => ({
  securityMiddleware: jest.fn(() => null),
  applySecurityToResponse: jest.fn((req, res) => res)
}));

describe('Middleware Simple Test', () => {
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