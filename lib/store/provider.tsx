'use client';

import { useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
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

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Initialize auth state
    const initAuth = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          // No Supabase client available, skip auth initialization
          setLoading(false);
          return;
        }

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
        }

        setLoading(false);

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          setSession(session);
          setUser(session?.user || null);

          // Handle specific auth events
          switch (event) {
            case 'SIGNED_IN':
              logger.info('User signed in', { userId: session?.user?.id });
              break;
            case 'SIGNED_OUT':
              logger.info('User signed out');
              // Reset stores handled in auth store
              break;
            case 'TOKEN_REFRESHED':
              logger.debug('Token refreshed', { userId: session?.user?.id });
              break;
            case 'USER_UPDATED':
              logger.info('User updated', { userId: session?.user?.id });
              break;
          }
        });

        unsubscribe = () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        logger.error('Auth initialization error', error as Error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setUser, setSession, setLoading]);

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
        logger.error('Failed to parse saved theme:', error as Error);
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
    console.warn(
      'StoreProvider should wrap your app to ensure proper store initialization'
    );
  }

  return isAuthenticated;
}
