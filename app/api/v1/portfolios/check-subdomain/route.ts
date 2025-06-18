import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

const checkSubdomainSchema = z.object({
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be at most 30 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens'
    )
    .regex(/^[a-z0-9]/, 'Subdomain must start with a letter or number')
    .regex(/[a-z0-9]$/, 'Subdomain must end with a letter or number'),
});

/**
 * Check if a subdomain is available
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = checkSubdomainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          available: false,
          error: 'Invalid subdomain format',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { subdomain } = validation.data;

    // Reserved subdomains
    const reservedSubdomains = [
      'www',
      'api',
      'admin',
      'app',
      'blog',
      'docs',
      'help',
      'support',
      'dashboard',
      'status',
      'mail',
      'email',
      'cdn',
      'assets',
      'static',
      'staging',
      'dev',
      'test',
      'demo',
      'sandbox',
      'preview',
      'beta',
      'secure',
      'ssl',
      'ftp',
      'sftp',
      'ssh',
      'git',
      'gitlab',
      'github',
      'bitbucket',
      'jenkins',
      'ci',
      'cd',
      'docker',
      'registry',
      'hub',
      'store',
      'shop',
      'checkout',
      'payment',
      'billing',
      'invoice',
      'account',
      'accounts',
      'auth',
      'login',
      'logout',
      'signup',
      'register',
      'profile',
      'settings',
      'config',
      'console',
      'control',
      'panel',
      'analytics',
      'stats',
      'metrics',
      'monitoring',
      'logs',
      'log',
      'prisma',
      'madfam',
      'portfolio',
      'portfolios',
    ];

    if (reservedSubdomains.includes(subdomain.toLowerCase())) {
      return NextResponse.json({
        available: false,
        error: 'This subdomain is reserved and cannot be used',
      });
    }

    // Check if subdomain exists in database
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const { data: existing, error } = await supabase
      .from('portfolios')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error checking subdomain availability:', error);
      return NextResponse.json(
        { error: 'Failed to check subdomain availability' },
        { status: 500 }
      );
    }

    const available = !existing;

    // Generate suggestions if not available
    let suggestions: string[] = [];
    if (!available) {
      suggestions = await generateSuggestions(subdomain, supabase);
    }

    return NextResponse.json({
      available,
      subdomain,
      suggestions: available ? [] : suggestions,
    });
  } catch (error) {
    logger.error('Error in subdomain check:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate alternative subdomain suggestions
 */
async function generateSuggestions(
  subdomain: string,
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never
): Promise<string[]> {
  const suggestions: string[] = [];
  const maxSuggestions = 5;

  // Try different variations
  const variations = [
    `${subdomain}1`,
    `${subdomain}2`,
    `${subdomain}3`,
    `${subdomain}-portfolio`,
    `${subdomain}-dev`,
    `${subdomain}-io`,
    `${subdomain}-me`,
    `${subdomain}-pro`,
    `the-${subdomain}`,
    `${subdomain}-official`,
  ];

  for (const variation of variations) {
    if (suggestions.length >= maxSuggestions) break;

    try {
      if (!supabase) {
        continue;
      }

      const { data: existing } = await supabase
        .from('portfolios')
        .select('id')
        .eq('subdomain', variation)
        .single();

      if (!existing) {
        suggestions.push(variation);
      }
    } catch (error) {
      // If error code is PGRST116, it means no record found, so it's available
      if ((error as { code?: string })?.code === 'PGRST116') {
        suggestions.push(variation);
      }
    }
  }

  return suggestions;
}
