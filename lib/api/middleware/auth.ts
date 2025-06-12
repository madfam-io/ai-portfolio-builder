/**
 * @fileoverview Authentication middleware for API routes
 * Provides reusable authentication and authorization utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
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
export async function authenticateUser(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      logger.error('Supabase client not available for authentication');
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser();

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
      role: profile?.role || 'user'
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
export function hasPermission(user: { role?: string }, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      'experiments:manage',
      'experiments:view',
      'users:manage',
      'analytics:view',
      'portfolio:manage'
    ],
    user: [
      'portfolio:manage',
      'analytics:view'
    ]
  };

  const userPermissions = rolePermissions[user.role || 'user'] || [];
  return userPermissions.includes(permission);
}

/**
 * Standard unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Standard forbidden response
 */
export function forbiddenResponse(message = 'Insufficient permissions') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Wrapper function to require authentication for an API route
 * @param handler - The route handler function
 * @param requiredPermission - Optional permission requirement
 */
export function requireAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
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