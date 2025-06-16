'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '@/lib/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 *
 * Protects routes from unauthenticated access
 * Redirects to signin page if not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo = '/auth/signin',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-testid="loading-container"
      >
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          data-testid="loading-spinner"
        />
      </div>
    );
  }

  // Don't render children until authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
