'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { logger } from '@/lib/utils/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 * 
 * Initializes authentication state on app load and listens for auth changes
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    const init = async () => {
      try {
        await initializeAuth();
        logger.info('Auth initialized');
      } catch (error) {
        logger.error('Failed to initialize auth:', error);
      }
    };

    init();

    // Listen for auth state changes
    // Note: This is handled by the auth store itself via onAuthStateChange
  }, [initializeAuth]);

  return <>{children}</>;
}