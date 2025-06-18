import { describe, test, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateUser,
  hasPermission,
  unauthorizedResponse,
  forbiddenResponse,
  withAuth,
  AuthenticatedRequest,
} from '@/lib/api/middleware/auth';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { apiError } from '@/lib/api/versioning';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';


// Mock dependencies

jest.mock('@/lib/utils/logger');
jest.mock('@/lib/api/versioning');

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockApiError = apiError as jest.MockedFunction<typeof apiError>;

describe('Auth Middleware', () => {
  setupCommonMocks();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock timing functions to speed up tests
    jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      if (typeof callback === 'function') callback();
      return 1 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockRequest = (url = 'http://localhost:3000/api/test') => {
    return new NextRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('authenticateUser', () => {
    it('should authenticate user successfully with profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockProfile = {
        role: 'admin',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createMockRequest();
      const result = await authenticateUser(request);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });

      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should authenticate user with default role when profile fetch fails', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'user@example.com',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Profile not found' },
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createMockRequest();
      const result = await authenticateUser(request);

      expect(result).toEqual({
        id: 'user-456',
        email: 'user@example.com',
        role: 'user',
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Profile fetch failed, using default role',
        {
          userId: 'user-456',
          error: 'Profile not found',
        }

    });

    it('should return null when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createMockRequest();
      const result = await authenticateUser(request);

      expect(result).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith('Authentication failed', {
        error: 'Not authenticated',
      });
    });

    it('should return null when Supabase client is not available', async () => {
      mockCreateClient.mockResolvedValue(null);

      const request = createMockRequest();
      const result = await authenticateUser(request);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Supabase client not available for authentication'

    });

    it('should handle authentication errors gracefully', async () => {
      const authError = new Error('Authentication service error');
      mockCreateClient.mockRejectedValue(authError);

      const request = createMockRequest();
      const result = await authenticateUser(request);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Authentication error',
        authError

    });

    it('should handle user without email', async () => {
      const mockUser = {
        id: 'user-no-email',
        email: null,
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createMockRequest();
      const result = await authenticateUser(request);

      expect(result).toEqual({
        id: 'user-no-email',
        email: '',
        role: 'user',
      });
    });

    it('should implement timing consistency for security', async () => {
      const startTime = Date.now();

      // Mock a fast authentication response
      const mockUser = {
        id: 'user-fast',
        email: 'fast@example.com',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createMockRequest();
      const result = await authenticateUser(request);

      expect(result).not.toBeNull();
      expect(setTimeout).toHaveBeenCalled();
    });
  });

  describe('hasPermission', () => {
    it('should grant admin permissions correctly', () => {
      const adminUser = { role: 'admin' };

      expect(hasPermission(adminUser, 'experiments:manage')).toBe(true);
      expect(hasPermission(adminUser, 'experiments:view')).toBe(true);
      expect(hasPermission(adminUser, 'users:manage')).toBe(true);
      expect(hasPermission(adminUser, 'analytics:view')).toBe(true);
      expect(hasPermission(adminUser, 'portfolio:manage')).toBe(true);
    });

    it('should grant user permissions correctly', () => {
      const regularUser = { role: 'user' };

      expect(hasPermission(regularUser, 'portfolio:manage')).toBe(true);
      expect(hasPermission(regularUser, 'analytics:view')).toBe(true);

      // Should not have admin permissions
      expect(hasPermission(regularUser, 'experiments:manage')).toBe(false);
      expect(hasPermission(regularUser, 'users:manage')).toBe(false);
    });

    it('should handle users without role (default to user)', () => {
      const userWithoutRole = {};

      expect(hasPermission(userWithoutRole, 'portfolio:manage')).toBe(true);
      expect(hasPermission(userWithoutRole, 'analytics:view')).toBe(true);
      expect(hasPermission(userWithoutRole, 'experiments:manage')).toBe(false);
    });

    it('should handle users with unknown role', () => {
      const userWithUnknownRole = { role: 'guest' };

      expect(hasPermission(userWithUnknownRole, 'portfolio:manage')).toBe(
        false

      expect(hasPermission(userWithUnknownRole, 'analytics:view')).toBe(false);
      expect(hasPermission(userWithUnknownRole, 'experiments:manage')).toBe(
        false

    });

    it('should deny access for undefined permissions', () => {
      const adminUser = { role: 'admin' };
      const regularUser = { role: 'user' };

      expect(hasPermission(adminUser, 'unknown:permission')).toBe(false);
      expect(hasPermission(regularUser, 'unknown:permission')).toBe(false);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return unauthorized response with default message', () => {
      const mockResponse = new NextResponse();
      mockApiError.mockReturnValue(mockResponse);

      const result = unauthorizedResponse();

      expect(mockApiError).toHaveBeenCalledWith('Unauthorized', {
        status: 401,
      });
      expect(result).toBe(mockResponse);
    });

    it('should return unauthorized response with custom message', () => {
      const mockResponse = new NextResponse();
      mockApiError.mockReturnValue(mockResponse);

      const customMessage = 'Authentication required';
      const result = unauthorizedResponse(customMessage);

      expect(mockApiError).toHaveBeenCalledWith(customMessage, { status: 401 });
      expect(result).toBe(mockResponse);
    });
  });

  describe('forbiddenResponse', () => {
    it('should return forbidden response with default message', () => {
      const mockResponse = new NextResponse();
      mockApiError.mockReturnValue(mockResponse);

      const result = forbiddenResponse();

      expect(mockApiError).toHaveBeenCalledWith('Insufficient permissions', {
        status: 403,
      });
      expect(result).toBe(mockResponse);
    });

    it('should return forbidden response with custom message', () => {
      const mockResponse = new NextResponse();
      mockApiError.mockReturnValue(mockResponse);

      const customMessage = 'Admin access required';
      const result = forbiddenResponse(customMessage);

      expect(mockApiError).toHaveBeenCalledWith(customMessage, { status: 403 });
      expect(result).toBe(mockResponse);
    });
  });

  describe('withAuth', () => {
    const mockHandler = jest.fn();
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
    };

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it('should call handler with authenticated request when user is authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: mockUser.id, email: mockUser.email } },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const mockResponse = new NextResponse();
      mockHandler.mockResolvedValue(mockResponse);

      const wrappedHandler = withAuth(mockHandler);
      const request = createMockRequest();
      const result = await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
        })

      expect(result).toBe(mockResponse);
    });

    it('should return unauthorized response when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const unauthorizedResp = new NextResponse();
      mockApiError.mockReturnValue(unauthorizedResp);

      const wrappedHandler = withAuth(mockHandler);
      const request = createMockRequest();
      const result = await wrappedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockApiError).toHaveBeenCalledWith('Authentication required', {
        status: 401,
      });
      expect(result).toBe(unauthorizedResp);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Unauthorized access attempt',
        {
          path: '/api/test',
        }

    });

    it('should handle authentication errors gracefully', async () => {
      const authError = new Error('Authentication service error');
      mockCreateClient.mockRejectedValue(authError);

      const errorResp = new NextResponse();
      mockApiError.mockReturnValue(errorResp);

      const wrappedHandler = withAuth(mockHandler);
      const request = createMockRequest();
      const result = await wrappedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockApiError).toHaveBeenCalledWith('Authentication failed', {
        status: 500,
      });
      expect(result).toBe(errorResp);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Auth middleware error:',
        authError

    });

    it('should pass additional arguments to handler', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: mockUser.id, email: mockUser.email } },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const mockResponse = new NextResponse();
      mockHandler.mockResolvedValue(mockResponse);

      const wrappedHandler = withAuth(mockHandler);
      const request = createMockRequest();
      const additionalArg = { extra: 'parameter' };

      const result = await wrappedHandler(request, additionalArg);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
        }),
        additionalArg

      expect(result).toBe(mockResponse);
    });

    it('should preserve request properties in authenticated request', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: mockUser.id, email: mockUser.email } },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const mockResponse = new NextResponse();
      mockHandler.mockResolvedValue(mockResponse);

      const wrappedHandler = withAuth(mockHandler);
      const request = createMockRequest('http://localhost:3000/api/special');

      await wrappedHandler(request);

      const authenticatedRequest = mockHandler.mock
        .calls[0][0] as AuthenticatedRequest;

      expect(authenticatedRequest.user).toEqual(mockUser);
      expect(authenticatedRequest.nextUrl.pathname).toBe('/api/special');
      expect(authenticatedRequest.method).toBe('GET');
    });
  });

  describe('Timing Attack Protection', () => {
    it('should add consistent delays for failed authentication', async () => {
      mockCreateClient.mockResolvedValue(null);

      const request = createMockRequest();
      await authenticateUser(request);

      expect(setTimeout).toHaveBeenCalled();
    });

    it('should add consistent delays for authentication errors', async () => {
      mockCreateClient.mockRejectedValue(new Error('Service error'));

      const request = createMockRequest();
      await authenticateUser(request);

      expect(setTimeout).toHaveBeenCalled();
    });

    it('should implement consistent timing for successful authentication', async () => {
      const mockUser = {
        id: 'user-timing',
        email: 'timing@example.com',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createMockRequest();
      await authenticateUser(request);

      // Should add timing delay for consistency
      expect(setTimeout).toHaveBeenCalled();
    });
  });

  describe('Role-based Access Control Integration', () => {
    const createMockHandler = (requiredPermission?: string) => {
      return jest.fn(async (req: AuthenticatedRequest) => {
        if (
          requiredPermission &&
          !hasPermission(req.user, requiredPermission)
        ) {
          return forbiddenResponse();
        }
        return new NextResponse(JSON.stringify({ success: true }));
      });
    };

    it('should allow admin access to admin endpoints', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'admin-user', email: 'admin@example.com' } },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'admin' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const handler = createMockHandler('users:manage');
      const wrappedHandler = withAuth(handler);
      const request = createMockRequest();

      const result = await wrappedHandler(request);

      expect(handler).toHaveBeenCalled();
      const responseData = await result.json();
      expect(responseData).toEqual({ success: true });
    });

    it('should deny user access to admin endpoints', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'regular-user', email: 'user@example.com' } },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const forbiddenResp = new NextResponse();
      mockApiError.mockReturnValue(forbiddenResp);

      const handler = createMockHandler('users:manage');
      const wrappedHandler = withAuth(handler);
      const request = createMockRequest();

      const result = await wrappedHandler(request);

      expect(result).toBe(forbiddenResp);
      expect(mockApiError).toHaveBeenCalledWith('Insufficient permissions', {
        status: 403,
      });
    });

    it('should allow user access to user endpoints', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'regular-user', email: 'user@example.com' } },
            error: null,
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'user' },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const handler = createMockHandler('portfolio:manage');
      const wrappedHandler = withAuth(handler);
      const request = createMockRequest();

      const result = await wrappedHandler(request);

      expect(handler).toHaveBeenCalled();
      const responseData = await result.json();
      expect(responseData).toEqual({ success: true });
    });
  });
});
