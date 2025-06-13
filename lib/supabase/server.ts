import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { logger } from '@/lib/utils/logger';
/**
 * Supabase Server Client
 * Server-side Supabase client configuration for API routes
 */

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, return null (graceful degradation)
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase environment variables not configured');
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
