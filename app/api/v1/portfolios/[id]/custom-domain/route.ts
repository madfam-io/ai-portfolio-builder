import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { logger } from '@/lib/utils/logger';

const getServerUser = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

interface DomainVerificationResult {
  isValid: boolean;
  hasCorrectCNAME: boolean;
  pointsToUs: boolean;
  sslStatus?: 'pending' | 'active' | 'failed';
}

async function verifyDomain(
  domain: string,
  subdomain: string
): Promise<DomainVerificationResult> {
  try {
    // DNS lookup to verify CNAME records
    const dns = await import('dns').then(m => m.promises);

    try {
      // Check root domain CNAME
      const rootRecords = await dns.resolveCname(domain);
      const hasCorrectCNAME = rootRecords.some(record =>
        record.includes(`${subdomain}.prisma.madfam.io`)
      );

      // Check www subdomain
      const wwwRecords = await dns.resolveCname(`www.${domain}`);
      const wwwPointsToUs = wwwRecords.some(record =>
        record.includes(`${subdomain}.prisma.madfam.io`)
      );

      return {
        isValid: true,
        hasCorrectCNAME,
        pointsToUs: hasCorrectCNAME || wwwPointsToUs,
        sslStatus: 'pending',
      };
    } catch (_error) {
      // DNS lookup failed - domain might not have CNAME records yet
      return {
        isValid: false,
        hasCorrectCNAME: false,
        pointsToUs: false,
        sslStatus: 'pending',
      };
    }
  } catch (error) {
    logger.error('Domain verification error', error as Error);
    throw error;
  }
}

export const POST = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    // Initialize Supabase inside the handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Supabase configuration missing');
      return NextResponse.json(
        { error: 'Database service not configured' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cloudflare API for domain verification (if using Cloudflare)
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolioId = params.id;
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    try {
      // Check if portfolio exists and belongs to user
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id, subdomain, user_id')
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .single();

      if (portfolioError || !portfolio) {
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }

      // Check if user has pro subscription
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.subscription_tier === 'free') {
        return NextResponse.json(
          { error: 'Custom domains require a Pro subscription' },
          { status: 403 }
        );
      }

      // Check if domain is already in use
      const { data: existingDomain } = await supabase
        .from('portfolios')
        .select('id')
        .eq('custom_domain', domain)
        .neq('id', portfolioId)
        .single();

      if (existingDomain) {
        return NextResponse.json(
          { error: 'Domain is already in use' },
          { status: 409 }
        );
      }

      // Update portfolio with custom domain
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          custom_domain: domain,
          custom_domain_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolioId);

      if (updateError) {
        throw updateError;
      }

      // If using Cloudflare, create DNS records automatically
      if (CLOUDFLARE_API_TOKEN && CLOUDFLARE_ZONE_ID) {
        try {
          // Add CNAME record for root domain
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'CNAME',
                name: domain,
                content: `${portfolio.subdomain}.prisma.madfam.io`,
                ttl: 300,
                proxied: true,
              }),
            }
          );

          // Add CNAME record for www subdomain
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'CNAME',
                name: `www.${domain}`,
                content: `${portfolio.subdomain}.prisma.madfam.io`,
                ttl: 300,
                proxied: true,
              }),
            }
          );
        } catch (error) {
          logger.warn('Failed to create Cloudflare DNS records', {
            error: error instanceof Error ? error.message : String(error),
          });
          // Continue - user can set up DNS manually
        }
      }

      // Start domain verification in background
      setTimeout(async () => {
        const verification = await verifyDomain(domain, portfolio.subdomain);
        if (verification.pointsToUs) {
          await supabase
            .from('portfolios')
            .update({
              custom_domain_status: 'active',
              custom_domain_verified_at: new Date().toISOString(),
            })
            .eq('id', portfolioId);
        }
      }, 5000);

      logger.info('Custom domain added', {
        userId: user.id,
        portfolioId,
        domain,
      });

      return NextResponse.json({
        success: true,
        domain,
        status: 'pending',
        dnsRecords: [
          {
            type: 'CNAME',
            name: '@',
            value: `${portfolio.subdomain}.prisma.madfam.io`,
            ttl: '300',
          },
          {
            type: 'CNAME',
            name: 'www',
            value: `${portfolio.subdomain}.prisma.madfam.io`,
            ttl: '300',
          },
        ],
      });
    } catch (error) {
      logger.error('Failed to add custom domain', error as Error);
      return NextResponse.json(
        { error: 'Failed to add custom domain' },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    // Initialize Supabase inside the handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Supabase configuration missing');
      return NextResponse.json(
        { error: 'Database service not configured' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolioId = params.id;

    try {
      // Check if portfolio exists and belongs to user
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id, custom_domain')
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .single();

      if (portfolioError || !portfolio) {
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }

      // Remove custom domain
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          custom_domain: null,
          custom_domain_status: null,
          custom_domain_verified_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolioId);

      if (updateError) {
        throw updateError;
      }

      logger.info('Custom domain removed', {
        userId: user.id,
        portfolioId,
        domain: portfolio.custom_domain,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error('Failed to remove custom domain', error as Error);
      return NextResponse.json(
        { error: 'Failed to remove custom domain' },
        { status: 500 }
      );
    }
  }
);
