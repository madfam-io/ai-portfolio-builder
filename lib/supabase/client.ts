import { createBrowserClient } from '@supabase/ssr';

import { env, services } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

/**
 * Supabase Client
 * Client-side Supabase client configuration using centralized environment config
 */
export function createClient() {
  // Check if Supabase service is available
  if (!services.supabase) {
    logger.warn('Supabase service not configured');
    return null;
  }

  // TypeScript knows these are defined if services.supabase is true
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    logger.warn('Supabase URL or ANON_KEY not configured');
    return null;
  }

  return createBrowserClient(url, anonKey);
}
