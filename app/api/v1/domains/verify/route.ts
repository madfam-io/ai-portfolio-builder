import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get domain details
    const { data: domain, error: domainError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .eq('user_id', session.user.id)
      .single();

    if (domainError || !domain) {
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
      await supabase.from('domain_verification_logs').insert({
        domain_id: domainId,
        verification_type: 'dns_txt',
        status: 'failed',
        error_code: (dnsError as any).code,
        error_message: (dnsError as any).message,
      });

      return NextResponse.json({
        verified: false,
        error: 'DNS lookup failed',
        details: (dnsError as any).message,
      });
    }

    // Check if verification token is present
    const flatTxtRecords = txtRecords.flat();
    const hasVerificationToken = flatTxtRecords.some(record =>
      record.includes(`prisma-verify=${domain.verification_token}`)
    );

    const hasCnameRecord = cnameRecord === 'portfolios.prisma.madfam.io';

    // Both records must be present for full verification
    const verified = hasVerificationToken && hasCnameRecord;

    // Update domain status
    const updateData: Record<string, unknown> = {
      dns_last_checked_at: new Date().toISOString(),
      verification_attempts: domain.verification_attempts + 1,
      last_verification_at: new Date().toISOString(),
    };

    if (verified) {
      updateData.verification_status = 'verified';
      updateData.dns_configured = true;
      updateData.verified_at = new Date().toISOString();
    }

    await supabase.from('custom_domains').update(updateData).eq('id', domainId);

    // Log verification attempt
    await supabase.from('domain_verification_logs').insert({
      domain_id: domainId,
      verification_type: 'dns_txt',
      status: verified ? 'success' : 'failed',
      dns_records: {
        txt: flatTxtRecords,
        cname: cnameRecord,
      },
      expected_value: `prisma-verify=${domain.verification_token}`,
      actual_value:
        flatTxtRecords.find(r => r.includes('prisma-verify')) || null,
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
