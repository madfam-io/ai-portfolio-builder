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
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import dns from 'dns/promises';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { domainId } = await request.json();

    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID is required' },
        { status: 400 }
      );
    }

    // Get user session
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get domain details
    const domain = await prisma.customDomain.findFirst({
      where: {
        id: domainId,
        userId: user.id,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Perform DNS lookup
    let txtRecords: string[][] = [];
    let cnameRecord: string | null = null;

    try {
      // Look up TXT records
      txtRecords = await dns.resolveTxt(domain.domain);

      // Look up CNAME record
      try {
        const cnameRecords = await dns.resolveCname(domain.domain);
        cnameRecord = cnameRecords[0] || null;
      } catch (_cnameError) {
        // CNAME might not exist, which is okay
        logger.debug('No CNAME record found', { domain: domain.domain });
      }
    } catch (dnsError) {
      logger.error('DNS lookup error', dnsError as Error);

      // Log verification attempt
      await prisma.domainVerificationLog.create({
        data: {
          domainId,
          verificationType: 'dns_txt',
          status: 'failed',
          errorCode:
            dnsError instanceof Error && 'code' in dnsError
              ? (dnsError as NodeJS.ErrnoException).code || 'UNKNOWN'
              : 'UNKNOWN',
          errorMessage:
            dnsError instanceof Error ? dnsError.message : 'Unknown DNS error',
        },
      });

      return NextResponse.json({
        verified: false,
        error: 'DNS lookup failed',
        details:
          dnsError instanceof Error ? dnsError.message : 'Unknown DNS error',
      });
    }

    // Check if verification token is present
    const flatTxtRecords = txtRecords.flat();
    const hasVerificationToken = flatTxtRecords.some(record =>
      record.includes(`prisma-verify=${domain.verificationToken}`)
    );

    const hasCnameRecord =
      cnameRecord === 'portfolios.portfolio-builder.madfam.io';

    // Both records must be present for full verification
    const verified = hasVerificationToken && hasCnameRecord;

    // Update domain status
    const updateData: any = {
      dnsLastCheckedAt: new Date(),
      verificationAttempts: domain.verificationAttempts + 1,
      lastVerificationAt: new Date(),
    };

    if (verified) {
      updateData.verificationStatus = 'verified';
      updateData.dnsConfigured = true;
      updateData.verifiedAt = new Date();
    }

    await prisma.customDomain.update({
      where: { id: domainId },
      data: updateData,
    });

    // Log verification attempt
    await prisma.domainVerificationLog.create({
      data: {
        domainId,
        verificationType: 'dns_txt',
        status: verified ? 'success' : 'failed',
        dnsRecords: {
          txt: flatTxtRecords,
          cname: cnameRecord,
        },
        expectedValue: `prisma-verify=${domain.verificationToken}`,
        actualValue:
          flatTxtRecords.find(r => r.includes('prisma-verify')) || null,
      },
    });

    return NextResponse.json({
      verified,
      records: {
        txt: flatTxtRecords,
        cname: cnameRecord,
      },
      missing: {
        txt: !hasVerificationToken,
        cname: !hasCnameRecord,
      },
    });
  } catch (error) {
    logger.error('Domain verification error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
