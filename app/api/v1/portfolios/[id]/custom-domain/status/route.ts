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

export const GET = withErrorHandling(
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
      // Get portfolio with custom domain info
      const { data: portfolio, error } = await supabase
        .from('portfolios')
        .select('id, custom_domain, custom_domain_status, subdomain')
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .single();

      if (error || !portfolio) {
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }

      if (!portfolio.custom_domain) {
        return NextResponse.json(
          { error: 'No custom domain configured' },
          { status: 404 }
        );
      }

      // If already active, return current status
      if (portfolio.custom_domain_status === 'active') {
        return NextResponse.json({
          status: 'active',
          domain: portfolio.custom_domain,
          ssl: true,
          message: 'Domain is active and SSL is enabled',
        });
      }

      // Verify domain DNS configuration
      try {
        const dns = await import('dns').then(m => m.promises);

        // Check CNAME records
        const hasCorrectCNAME = await checkCnameRecords(dns, portfolio);

        async function checkCnameRecords(
          dnsModule: { resolveCname: (domain: string) => Promise<string[]> },
          portfolioData: { subdomain: string; custom_domain: string }
        ): Promise<boolean> {
          const expectedTarget = `${portfolioData.subdomain}.prisma.madfam.io`;

          // Try main domain first
          try {
            const records = await dnsModule.resolveCname(
              portfolioData.custom_domain
            );
            return records.some((record: string) =>
              record.includes(expectedTarget)
            );
          } catch (_e) {
            // Try www subdomain
            try {
              const wwwRecords = await dnsModule.resolveCname(
                `www.${portfolioData.custom_domain}`
              );
              return wwwRecords.some((record: string) =>
                record.includes(expectedTarget)
              );
            } catch (_e) {
              return false;
            }
          }
        }

        if (hasCorrectCNAME) {
          // Update status to active
          await supabase
            .from('portfolios')
            .update({
              custom_domain_status: 'active',
              custom_domain_verified_at: new Date().toISOString(),
            })
            .eq('id', portfolioId);

          return NextResponse.json({
            status: 'active',
            domain: portfolio.custom_domain,
            ssl: true,
            message: 'Domain verified successfully!',
          });
        } else {
          return NextResponse.json({
            status: 'pending',
            domain: portfolio.custom_domain,
            ssl: false,
            message:
              'Waiting for DNS propagation. This can take up to 48 hours.',
          });
        }
      } catch (error) {
        logger.error(
          'Domain verification error',
          error instanceof Error ? error : new Error(String(error))
        );
        return NextResponse.json({
          status: 'error',
          domain: portfolio.custom_domain,
          ssl: false,
          message: 'Failed to verify domain. Please check your DNS settings.',
        });
      }
    } catch (error) {
      logger.error(
        'Failed to check domain status',
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.json(
        { error: 'Failed to check domain status' },
        { status: 500 }
      );
    }
  }
);
