import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { apiError } from '@/lib/api/versioning';

/**
 * @fileoverview Authentication middleware for API routes
 * Provides reusable authentication and authorization utilities
 */

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Authentication middleware that verifies user session
 * @param request - The incoming request
 * @returns User object if authenticated, null otherwise
 */
export async function authenticateUser(_request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      logger.error('Supabase client not available for authentication');
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      logger.debug('Authentication failed', { error });
      return null;
    }

    // Fetch additional user data if needed
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'user',
    };
  } catch (error) {
    logger.error('Authentication error', error as Error);
    return null;
  }
}

/**
 * Authorization check for specific permissions
 * @param user - The authenticated user
 * @param permission - The required permission
 * @returns True if user has permission
 */
export function hasPermission(
  user: { role?: string },
  permission: string
): boolean {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      'experiments:manage',
      'experiments:view',
      'users:manage',
      'analytics:view',
      'portfolio:manage',
    ],
    user: ['portfolio:manage', 'analytics:view'],
  };

  const userPermissions = rolePermissions[user.role || 'user'] || [];
  return userPermissions.includes(permission);
}

/**
 * Standard unauthorized response using centralized error handler
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return apiError(message, { status: 401 });
}

/**
 * Standard forbidden response using centralized error handler
 */
export function forbiddenResponse(message = 'Insufficient permissions') {
  return apiError(message, { status: 403 });
}

/**
 * Wrapper function to require authentication for an API route
 * @param handler - The route handler function
 * @param requiredPermission - Optional permission requirement
 */
export function requireAuth(
  handler: (request: NextRequest, user: unknown) => Promise<NextResponse>,
  requiredPermission?: string
) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      return forbiddenResponse();
    }

    return handler(request, user);
  };
}

/**
 * Higher-order function that wraps API route handlers with authentication
 * Works seamlessly with versionedApiHandler
 */
export function withAuth<T extends (...args: any[]) => any>(
  handler: (req: AuthenticatedRequest, ...args: Parameters<T>) => ReturnType<T>
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    try {
      const user = await authenticateUser(req);
      
      if (!user) {
        logger.warn('Unauthorized access attempt', { 
          path: req.nextUrl.pathname 
        });
        return unauthorizedResponse('Authentication required');
      }

      // Create authenticated request with user
      const authenticatedReq = Object.assign(req, { user }) as AuthenticatedRequest;

      // Call the original handler with authenticated request
      return handler(authenticatedReq, ...(args as Parameters<T>));
    } catch (error) {
      logger.error('Auth middleware error:', error as Error);
      return apiError('Authentication failed', { status: 500 });
    }
  }) as T;
}
