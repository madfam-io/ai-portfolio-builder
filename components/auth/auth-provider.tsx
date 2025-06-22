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
        logger.error(
          'Failed to initialize auth:',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    };

    init();

    // Listen for auth state changes
    // Note: This is handled by the auth store itself via onAuthStateChange
  }, [initializeAuth]);

  return <>{children}</>;
}
