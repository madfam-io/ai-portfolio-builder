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

import { useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { logger } from '@/lib/utils/logger';

import { useAuthStore } from './auth-store';
import { useUIStore } from './ui-store';

/**
 * Store Provider
 * Initializes stores and handles authentication state
 */

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { setUser, setSession, setLoading } = useAuthStore();
  const { setTheme } = useUIStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Update auth state based on NextAuth session
    if (status === 'loading') {
      setLoading(true);
    } else {
      setLoading(false);
      if (session) {
        setSession(session as any);
        setUser(session.user as any);
        logger.info('User signed in', { userId: session.user?.id });
      } else {
        setSession(null);
        setUser(null);
        logger.info('User signed out');
      }
    }
  }, [session, status, setSession, setUser, setLoading]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Initialize auth state
    const initAuth = async () => {
      try {
        setLoading(false);
      } catch (error) {
        logger.error(
          'Auth initialization error',
          error instanceof Error ? error : new Error(String(error))
        );
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('ui-store');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme);
        }
      } catch (error) {
        logger.error(
          'Failed to parse saved theme:',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    // Apply initial theme
    const root = document.documentElement;
    const theme = useUIStore.getState().theme;

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [setTheme]);

  return <>{children}</>;
}

// Export a hook to ensure provider is used
export function useStoreProvider() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (typeof window !== 'undefined' && !isAuthenticated) {
  }

  return isAuthenticated;
}
