/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { env, services } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

/**
 * Supabase Server Client
 * Server-side Supabase client configuration for API routes using centralized environment config
 */

export async function createClient() {
  // Check if Supabase service is available
  if (!services.supabase) {
    logger.warn('Supabase service not configured');
    return null;
  }

  const cookieStore = await cookies();

  // TypeScript knows these are defined if services.supabase is true
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    logger.warn('Supabase URL or ANON_KEY not configured');
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Handle cases where cookies can't be set (e.g., in middleware)
          logger.warn('Failed to set cookie:', { error });
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // Handle cases where cookies can't be removed
          logger.warn('Failed to remove cookie:', { error });
        }
      },
    },
  });
}
