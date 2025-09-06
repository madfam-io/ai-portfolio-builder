/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '@/lib/store/auth-store';
import { logger } from '@/lib/utils/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 *
 * Handles authentication state management and session restoration
 * Uses NextAuth for session management
 */
function AuthProviderInner({ children }: AuthProviderProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { initializeAuth, setUser, setSession } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    initializeAuth();

    // Handle NextAuth session changes
    if (status === 'loading') {
      return; // Still loading
    }

    if (status === 'authenticated' && session && session.user) {
      // Transform NextAuth session to our format
      const transformedUser = {
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      };

      // Create a mock session format for compatibility with auth store
      // In production, you would integrate with your actual token system
      const transformedSession = {
        access_token: 'nextauth_session_token', // Mock token
        refresh_token: 'nextauth_refresh_token', // Mock token
        expires_in: 3600, // 1 hour
        token_type: 'Bearer',
        user: transformedUser,
      };

      setUser(transformedUser);
      setSession(transformedSession);
      
      logger.info('User authenticated via NextAuth', { userId: transformedUser.id });
    } else if (status === 'unauthenticated') {
      setUser(null);
      setSession(null);
      logger.info('User unauthenticated');
    }
  }, [session, status, initializeAuth, setUser, setSession, router]);

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}
