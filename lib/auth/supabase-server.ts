import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Create a Supabase client for server-side operations
 * This client automatically handles cookies and authentication
 */
async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client for server-side operations with service role
 * This client has admin privileges and should only be used for server-side operations
 */
function createSupabaseServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Service role client doesn't need cookies
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
