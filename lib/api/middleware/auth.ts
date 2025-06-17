import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

import { apiError } from '@/lib/api/versioning';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * @fileoverview Authentication middleware for API routes
 * Provides reusable authentication and authorization utilities
 */

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal
 */
function _safeStringCompare(a: string, b: string): boolean {
  try {
    // Ensure both strings are the same length to prevent length-based timing attacks
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');
    
    // Pad shorter buffer with zeros to make lengths equal
    const maxLength = Math.max(bufferA.length, bufferB.length);
    const paddedA = Buffer.alloc(maxLength);
    const paddedB = Buffer.alloc(maxLength);
    
    bufferA.copy(paddedA);
    bufferB.copy(paddedB);
    
    return timingSafeEqual(paddedA, paddedB) && a.length === b.length;
  } catch (error) {
    logger.error('Safe string comparison error:', error as Error);
    return false;
  }
}

/**
 * Add artificial delay to prevent timing attacks on authentication failures
 */
async function addConstantTimeDelay(): Promise<void> {
  // Add a small random delay (10-50ms) to mask actual processing time
  const delay = Math.floor(Math.random() * 40) + 10;
  await new Promise(resolve => setTimeout(resolve, delay));
}

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
  const startTime = Date.now();
  
  try {
    const supabase = await createClient();

    if (!supabase) {
      logger.error('Supabase client not available for authentication');
      await addConstantTimeDelay();
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      logger.debug('Authentication failed', { error: error?.message });
      // Add delay to prevent timing attacks on failed authentication
      await addConstantTimeDelay();
      return null;
    }

    // Fetch additional user data if needed
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.warn('Profile fetch failed, using default role', { 
        userId: user.id,
        error: profileError.message 
      });
    }

    // Ensure consistent timing for successful authentication
    const processingTime = Date.now() - startTime;
    if (processingTime < 50) {
      await new Promise(resolve => setTimeout(resolve, 50 - processingTime));
    }

    return {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'user',
    };
  } catch (error) {
    logger.error('Authentication error', error as Error);
    await addConstantTimeDelay();
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
function _requireAuth(
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
          path: req.nextUrl.pathname,
        });
        return unauthorizedResponse('Authentication required');
      }

      // Create authenticated request with user
      const authenticatedReq = Object.assign(req, {
        user,
      }) as AuthenticatedRequest;

      // Call the original handler with authenticated request
      return handler(authenticatedReq, ...(args as Parameters<T>));
    } catch (error) {
      logger.error('Auth middleware error:', error as Error);
      return apiError('Authentication failed', { status: 500 });
    }
  }) as T;
}
