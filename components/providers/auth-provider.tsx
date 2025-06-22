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

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { authService } from '@/lib/services/auth/auth-service';
import { useAuthStore } from '@/lib/store/auth-store';
import { logger } from '@/lib/utils/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 *
 * Handles authentication state management and session restoration
 * Listens for auth state changes from Supabase
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { initializeAuth, setUser, setSession } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      logger.info('Auth state changed', { event, userId: session?.user?.id });

      switch (event) {
        case 'SIGNED_IN':
          setUser(session?.user || null);
          setSession(session);
          router.push('/dashboard');
          break;
        case 'SIGNED_OUT':
          setUser(null);
          setSession(null);
          router.push('/');
          break;
        case 'TOKEN_REFRESHED':
          setSession(session);
          break;
        case 'USER_UPDATED':
          setUser(session?.user || null);
          break;
        default:
          break;
      }
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [initializeAuth, setUser, setSession, router]);

  return <>{children}</>;
}
