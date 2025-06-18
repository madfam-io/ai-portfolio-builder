/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import {
  setupCommonMocks,
  defaultSupabaseMock,
} from '@/__tests__/utils/api-route-test-helpers';

describe('Auth Callback Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful OAuth callback', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 'user_123', email: 'test@example.com' },
              },
            },
            error: null,
          }),
        },
      },
    });

    const { GET } = await import('@/app/auth/callback/route');

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/dashboard');
  });

  it('should handle missing code parameter', async () => {
    setupCommonMocks();

    const { GET } = await import('@/app/auth/callback/route');

    const request = new NextRequest('https://example.com/auth/callback');
    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('error=invalid_request');
  });

  it('should handle OAuth errors from provider', async () => {
    setupCommonMocks();

    const { GET } = await import('@/app/auth/callback/route');

    const request = new NextRequest(
      'https://example.com/auth/callback?error=access_denied&error_description=User+denied+access'
    );

    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('error=access_denied');
  });

  it('should handle exchange code failure', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid authorization code' },
          }),
        },
      },
    });

    const { GET } = await import('@/app/auth/callback/route');

    const request = new NextRequest(
      'https://example.com/auth/callback?code=invalid_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('error=auth_failed');
  });

  it('should handle onboarding redirect for new users', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 'user_123', email: 'test@example.com' },
              },
            },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'user_123', onboarding_completed: false },
                error: null,
              }),
            }),
          }),
        }),
      },
    });

    const { GET } = await import('@/app/auth/callback/route');

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/onboarding');
  });

  it('should handle database connection failure', async () => {
    setupCommonMocks({
      supabase: null,
    });

    const { GET } = await import('@/app/auth/callback/route');

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code'
    );
    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('error=server_error');
  });

  it('should preserve next parameter through callback', async () => {
    setupCommonMocks({
      supabase: {
        ...defaultSupabaseMock,
        auth: {
          ...defaultSupabaseMock.auth,
          exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 'user_123', email: 'test@example.com' },
              },
            },
            error: null,
          }),
        },
      },
    });

    const { GET } = await import('@/app/auth/callback/route');

    const request = new NextRequest(
      'https://example.com/auth/callback?code=test_code&next=/editor/new'
    );
    const response = await GET(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/editor/new');
  });
});
