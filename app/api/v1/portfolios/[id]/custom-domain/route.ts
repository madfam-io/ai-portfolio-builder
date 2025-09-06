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

import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/prisma';

const getServerUser = async () => {
  const user = await getCurrentUser();
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
        record.includes(`${subdomain}.portfolio-builder.madfam.io`)
      );

      // Check www subdomain
      const wwwRecords = await dns.resolveCname(`www.${domain}`);
      const wwwPointsToUs = wwwRecords.some(record =>
        record.includes(`${subdomain}.portfolio-builder.madfam.io`)
      );

      return {
        isValid: true,
        hasCorrectCNAME,
        pointsToUs: hasCorrectCNAME || wwwPointsToUs,
        sslStatus: 'pending',
      };
    } catch {
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
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          id: portfolioId,
          userId: user.id,
        },
        select: {
          id: true,
          subdomain: true,
          userId: true,
        },
      });

      if (!portfolio) {
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }

      // Check if user has pro subscription
      const profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { subscriptionTier: true },
      });

      if (!profile || profile.subscriptionTier === 'FREE') {
        return NextResponse.json(
          { error: 'Custom domains require a Pro subscription' },
          { status: 403 }
        );
      }

      // Check if domain is already in use
      const existingDomain = await prisma.portfolio.findFirst({
        where: {
          customDomain: domain,
          NOT: {
            id: portfolioId,
          },
        },
        select: { id: true },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: 'Domain is already in use' },
          { status: 409 }
        );
      }

      // Update portfolio with custom domain (note: customDomainStatus field doesn't exist in schema)
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          customDomain: domain,
          updatedAt: new Date(),
        },
      });

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
                content: `${portfolio.subdomain}.portfolio-builder.madfam.io`,
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
                content: `${portfolio.subdomain}.portfolio-builder.madfam.io`,
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
      // Note: Domain status tracking would need to be implemented through a separate table or field
      setTimeout(async () => {
        const verification = await verifyDomain(domain, portfolio.subdomain!);
        if (verification.pointsToUs) {
          // Domain verification success would be tracked differently
          logger.info('Domain verification successful', {
            portfolioId,
            domain,
          });
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
            value: `${portfolio.subdomain}.portfolio-builder.madfam.io`,
            ttl: '300',
          },
          {
            type: 'CNAME',
            name: 'www',
            value: `${portfolio.subdomain}.portfolio-builder.madfam.io`,
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

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolioId = params.id;

    try {
      // Check if portfolio exists and belongs to user
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          id: portfolioId,
          userId: user.id,
        },
        select: {
          id: true,
          customDomain: true,
        },
      });

      if (!portfolio) {
        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );
      }

      // Remove custom domain
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          customDomain: null,
          updatedAt: new Date(),
        },
      });

      logger.info('Custom domain removed', {
        userId: user.id,
        portfolioId,
        domain: portfolio.customDomain,
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
