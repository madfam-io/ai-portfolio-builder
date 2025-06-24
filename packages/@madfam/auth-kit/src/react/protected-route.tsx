/**
 * @madfam/auth-kit
 *
 * Enterprise-grade authentication system for the MADFAM platform
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

import React from 'react';
import { useAuth } from './hooks';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireEmailVerification?: boolean;
  onUnauthorized?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = null,
  requiredRoles = [],
  requiredPermissions = [],
  requireEmailVerification = false,
  onUnauthorized,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // Check email verification
  if (requireEmailVerification && !user.emailVerified) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role =>
      user.roles?.includes(role)
    );
    if (!hasRequiredRole) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      return <>{fallback}</>;
    }
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission =>
      user.permissions?.includes(permission)
    );
    if (!hasRequiredPermission) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
