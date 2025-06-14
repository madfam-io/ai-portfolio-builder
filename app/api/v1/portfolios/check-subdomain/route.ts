import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { apiSuccess, apiError, versionedApiHandler } from '@/lib/api/response-helpers';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/v1/portfolios/check-subdomain
 * Check if a subdomain is available
 */
export const POST = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { subdomain, currentPortfolioId } = body;

      // Validate subdomain format
      if (!subdomain || typeof subdomain !== 'string') {
        return apiError('Invalid subdomain', { status: 400 });
      }

      // Check subdomain requirements
      const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
      if (!subdomainRegex.test(subdomain)) {
        return apiError('Invalid subdomain format', { 
          status: 400,
          data: { 
            requirements: 'Subdomain must be 3-63 characters, start and end with a letter or number, and contain only lowercase letters, numbers, and hyphens'
          }
        });
      }

      // Reserved subdomains
      const reservedSubdomains = [
        'www', 'app', 'api', 'admin', 'dashboard', 'auth', 
        'login', 'signup', 'about', 'contact', 'help', 'support',
        'blog', 'news', 'press', 'media', 'static', 'assets',
        'public', 'private', 'secure', 'portal', 'account',
        'profile', 'settings', 'config', 'test', 'demo'
      ];

      if (reservedSubdomains.includes(subdomain)) {
        return apiSuccess({ 
          available: false, 
          reason: 'reserved',
          message: 'This subdomain is reserved' 
        });
      }

      // Create Supabase client
      const supabase = await createClient();
      if (!supabase) {
        return apiError('Database service not available', { status: 503 });
      }

      // Check if subdomain is already taken
      const { data: existingPortfolios, error: fetchError } = await supabase
        .from('portfolios')
        .select('id, subdomain')
        .eq('subdomain', subdomain);

      if (fetchError) {
        logger.error('Database error checking subdomain:', fetchError);
        return apiError('Failed to check subdomain availability', { status: 500 });
      }

      // Check if subdomain is available
      const isAvailable = !existingPortfolios || existingPortfolios.length === 0 || 
        (existingPortfolios.length === 1 && existingPortfolios[0]?.id === currentPortfolioId);

      return apiSuccess({ 
        available: isAvailable,
        subdomain,
        reason: isAvailable ? null : 'taken',
        message: isAvailable 
          ? 'Subdomain is available' 
          : 'This subdomain is already taken'
      });

    } catch (error) {
      logger.error('Unexpected error in check-subdomain:', error as Error);
      if (error instanceof SyntaxError) {
        return apiError('Invalid JSON in request body', { status: 400 });
      }
      return apiError('Internal server error', { status: 500 });
    }
  })
);