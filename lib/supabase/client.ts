import { createBrowserClient } from '@supabase/ssr';

import { logger } from '@/lib/utils/logger';
/**
 * Supabase Client
 * Client-side Supabase client configuration
 */

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, return null (graceful degradation)
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase environment variables not configured');
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
