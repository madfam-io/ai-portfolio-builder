/**
 * Custom Domain Service
 *
 * Handles custom domain configuration, verification, and management
 */

import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/monitoring/unified/events';
import { logger } from '@/lib/utils/logger';
import type {
  CustomDomain,
  DomainCheckResult,
  DomainVerificationResult,
  DNSRecord,
  DomainSetupInstructions,
  SSLCertificateInfo,
  DomainRedirect,
} from '@/types/domains';

// DNS providers we support with specific instructions
const DNS_PROVIDERS = {
  cloudflare: 'Cloudflare',
  namecheap: 'Namecheap',
  godaddy: 'GoDaddy',
  route53: 'AWS Route 53',
  googledomains: 'Google Domains',
  generic: 'Generic DNS Provider',
};

export class DomainService {
  /**
   * Check if a domain is available for use
   */
  static async checkDomainAvailability(
    domain: string
  ): Promise<DomainCheckResult> {
    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return {
        isAvailable: false,
        reason: 'invalid',
      };
    }

    // Check if domain is in our blacklist
    const blacklistedDomains = [
      'prisma.madfam.io',
      'app.prisma.madfam.io',
      'api.prisma.madfam.io',
      'localhost',
      '127.0.0.1',
    ];

    if (blacklistedDomains.some(blocked => domain.includes(blocked))) {
      return {
        isAvailable: false,
        reason: 'blacklisted',
      };
    }

    // Check if domain is already taken
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data } = await supabase.rpc('check_domain_availability', {
      p_domain: domain,
    });

    if (!data) {
      // Generate suggestions if domain is taken
      const suggestions = this.generateDomainSuggestions(domain);
      return {
        isAvailable: false,
        reason: 'taken',
        suggestions,
      };
    }

    return { isAvailable: true };
  }

  /**
   * Add a custom domain to a portfolio
   */
  static async addCustomDomain(
    userId: string,
    portfolioId: string,
    domain: string
  ): Promise<CustomDomain> {
    // Check availability first
    const availability = await this.checkDomainAvailability(domain);
    if (!availability.isAvailable) {
      throw new Error(`Domain is not available: ${availability.reason}`);
    }

    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken();

    // Create domain record
    const { data, error } = await supabase
      .from('custom_domains')
      .insert({
        user_id: userId,
        portfolio_id: portfolioId,
        domain,
        verification_token: verificationToken,
        dns_txt_record: `prisma-verify=${verificationToken}`,
        dns_cname_record: 'portfolios.prisma.madfam.io',
      })
      .select()
      .single();

    if (error) throw error;

    // Track domain addition
    await track.domain.add({
      user_id: userId,
      portfolio_id: portfolioId,
      domain,
    });

    return this.transformDomain(data);
  }

  /**
   * Get all domains for a user
   */
  static async getUserDomains(userId: string): Promise<CustomDomain[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.transformDomain);
  }

  /**
   * Get domains for a specific portfolio
   */
  static async getPortfolioDomains(
    portfolioId: string
  ): Promise<CustomDomain[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.transformDomain);
  }

  /**
   * Verify domain ownership
   */
  static async verifyDomain(
    domainId: string
  ): Promise<DomainVerificationResult> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Get domain details
    const { data: domain, error } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error || !domain) {
      throw new Error('Domain not found');
    }

    // Perform DNS lookup
    const dnsRecords = await this.lookupDNSRecords(domain.domain);

    // Check for verification records
    const expectedRecords: DNSRecord[] = [
      {
        type: 'TXT',
        name: domain.domain,
        value: domain.dns_txt_record,
      },
      {
        type: 'CNAME',
        name: domain.domain,
        value: domain.dns_cname_record,
      },
    ];

    const verified = this.checkDNSRecordsMatch(expectedRecords, dnsRecords);

    // Update verification status
    const newStatus = verified ? 'verified' : 'failed';
    await supabase
      .from('custom_domains')
      .update({
        verification_status: newStatus,
        dns_configured: verified,
        verified_at: verified ? new Date().toISOString() : null,
        dns_last_checked_at: new Date().toISOString(),
      })
      .eq('id', domainId);

    // Log verification attempt
    await supabase.from('domain_verification_logs').insert({
      domain_id: domainId,
      verification_type: 'dns_txt',
      status: verified ? 'success' : 'failed',
      dns_records: dnsRecords,
      expected_value: domain.dns_txt_record,
      actual_value: dnsRecords.find(r => r.type === 'TXT')?.value,
    });

    // Track verification
    await track.domain.verify({
      domain_id: domainId,
      domain: domain.domain,
      verified,
      method: 'dns',
    });

    return {
      verified,
      method: 'dns',
      records: {
        expected: expectedRecords,
        actual: dnsRecords,
      },
    };
  }

  /**
   * Activate a verified domain
   */
  static async activateDomain(domainId: string): Promise<CustomDomain> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Check if domain is verified
    const { data: domain, error: fetchError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (fetchError || !domain) {
      throw new Error('Domain not found');
    }

    if (domain.verification_status !== 'verified') {
      throw new Error('Domain must be verified before activation');
    }

    // Request SSL certificate
    const sslInfo = await this.requestSSLCertificate(domain.domain);

    // Update domain status
    const { data, error } = await supabase
      .from('custom_domains')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        ssl_status: sslInfo.status,
        ssl_certificate_id: sslInfo.certificateId,
      })
      .eq('id', domainId)
      .select()
      .single();

    if (error) throw error;

    // Track activation
    await track.domain.activate({
      domain_id: domainId,
      domain: domain.domain,
    });

    return this.transformDomain(data);
  }

  /**
   * Set a domain as primary for a portfolio
   */
  static async setPrimaryDomain(
    domainId: string,
    portfolioId: string
  ): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // First, unset any existing primary domain for this portfolio
    await supabase
      .from('custom_domains')
      .update({ is_primary: false })
      .eq('portfolio_id', portfolioId)
      .eq('is_primary', true);

    // Set the new primary domain
    const { error } = await supabase
      .from('custom_domains')
      .update({ is_primary: true })
      .eq('id', domainId)
      .eq('portfolio_id', portfolioId);

    if (error) throw error;

    // Track primary domain change
    await track.domain.setPrimary({
      domain_id: domainId,
      portfolio_id: portfolioId,
    });
  }

  /**
   * Remove a custom domain
   */
  static async removeDomain(domainId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Get domain details for tracking
    const { data: domain } = await supabase
      .from('custom_domains')
      .select('domain')
      .eq('id', domainId)
      .single();

    // Delete the domain
    const { error } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', domainId);

    if (error) throw error;

    // Track removal
    await track.domain.remove({
      domain_id: domainId,
      domain: domain?.domain,
    });
  }

  /**
   * Get setup instructions for a specific DNS provider
   */
  static getSetupInstructions(
    domain: string,
    verificationToken: string,
    provider: keyof typeof DNS_PROVIDERS = 'generic'
  ): DomainSetupInstructions {
    const baseInstructions = {
      provider: DNS_PROVIDERS[provider],
      steps: [],
    };

    switch (provider) {
      case 'cloudflare':
        return {
          ...baseInstructions,
          steps: [
            {
              order: 1,
              title: 'Add TXT Record for Verification',
              description:
                'In your Cloudflare DNS settings, add a new TXT record',
              recordType: 'TXT',
              recordName: '@',
              recordValue: `prisma-verify=${verificationToken}`,
              screenshot: '/images/dns/cloudflare-txt.png',
            },
            {
              order: 2,
              title: 'Add CNAME Record',
              description:
                'Add a CNAME record with Proxy status set to DNS only (gray cloud)',
              recordType: 'CNAME',
              recordName: '@',
              recordValue: 'portfolios.prisma.madfam.io',
              screenshot: '/images/dns/cloudflare-cname.png',
            },
          ],
        };

      case 'namecheap':
        return {
          ...baseInstructions,
          steps: [
            {
              order: 1,
              title: 'Access Advanced DNS',
              description:
                'Log in to Namecheap and navigate to Domain List > Manage > Advanced DNS',
              recordType: 'TXT',
              recordName: '@',
              recordValue: `prisma-verify=${verificationToken}`,
            },
            {
              order: 2,
              title: 'Add TXT Record',
              description: 'Click "Add New Record" and select TXT Record',
              recordType: 'TXT',
              recordName: '@',
              recordValue: `prisma-verify=${verificationToken}`,
            },
            {
              order: 3,
              title: 'Add CNAME Record',
              description: 'Add another record, select CNAME Record',
              recordType: 'CNAME',
              recordName: '@',
              recordValue: 'portfolios.prisma.madfam.io',
            },
          ],
        };

      default:
        return {
          ...baseInstructions,
          steps: [
            {
              order: 1,
              title: 'Add TXT Record',
              description: 'Add a TXT record to verify domain ownership',
              recordType: 'TXT',
              recordName: domain,
              recordValue: `prisma-verify=${verificationToken}`,
            },
            {
              order: 2,
              title: 'Add CNAME Record',
              description: 'Add a CNAME record to point your domain to PRISMA',
              recordType: 'CNAME',
              recordName: domain,
              recordValue: 'portfolios.prisma.madfam.io',
            },
          ],
        };
    }
  }

  /**
   * Create a domain redirect
   */
  static async createRedirect(
    domainId: string,
    fromPath: string,
    toPath: string,
    redirectType: 301 | 302 = 301
  ): Promise<DomainRedirect> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('domain_redirects')
      .insert({
        domain_id: domainId,
        from_path: fromPath,
        to_path: toPath,
        redirect_type: redirectType,
      })
      .select()
      .single();

    if (error) throw error;

    return this.transformRedirect(data);
  }

  /**
   * Get SSL certificate information
   */
  static async getSSLInfo(domainId: string): Promise<SSLCertificateInfo> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data: domain, error } = await supabase
      .from('custom_domains')
      .select('ssl_status, ssl_certificate_id, ssl_expires_at, domain')
      .eq('id', domainId)
      .single();

    if (error || !domain) {
      throw new Error('Domain not found');
    }

    // In production, this would fetch actual certificate details
    // from the SSL provider (e.g., Let's Encrypt via Caddy)
    return {
      status: domain.ssl_status,
      validTo: domain.ssl_expires_at
        ? new Date(domain.ssl_expires_at)
        : undefined,
      commonName: domain.domain,
    };
  }

  // Helper methods

  private static generateVerificationToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }

  private static generateDomainSuggestions(domain: string): string[] {
    const baseName = domain.split('.')[0];
    const tld = domain.substring(domain.lastIndexOf('.'));

    const suggestions = [
      `${baseName}-portfolio${tld}`,
      `${baseName}-pro${tld}`,
      `my-${baseName}${tld}`,
      `${baseName}-online${tld}`,
      `${baseName}-site${tld}`,
    ];

    return suggestions.slice(0, 3);
  }

  private static async lookupDNSRecords(domain: string): Promise<DNSRecord[]> {
    // In production, this would use a DNS lookup service
    // For now, we'll simulate DNS records
    logger.info('Looking up DNS records for domain', { domain });

    // This would integrate with services like:
    // - Cloudflare API
    // - AWS Route53
    // - Google Cloud DNS
    // - Or a dedicated DNS lookup service

    return [];
  }

  private static checkDNSRecordsMatch(
    expected: DNSRecord[],
    actual: DNSRecord[]
  ): boolean {
    return expected.every(expectedRecord =>
      actual.some(
        actualRecord =>
          actualRecord.type === expectedRecord.type &&
          actualRecord.value === expectedRecord.value
      )
    );
  }

  private static async requestSSLCertificate(domain: string): Promise<{
    status: 'provisioning' | 'active';
    certificateId?: string;
  }> {
    // In production, this would integrate with:
    // - Let's Encrypt via Caddy/Certbot
    // - Cloudflare SSL
    // - Or another SSL provider

    logger.info('Requesting SSL certificate for domain', { domain });

    return {
      status: 'provisioning',
      certificateId: `cert-${Date.now()}`,
    };
  }

  private static transformDomain(data: any): CustomDomain {
    return {
      id: data.id,
      userId: data.user_id,
      portfolioId: data.portfolio_id,
      domain: data.domain,
      subdomain: data.subdomain,
      dnsConfigured: data.dns_configured,
      dnsTxtRecord: data.dns_txt_record,
      dnsCnameRecord: data.dns_cname_record,
      dnsLastCheckedAt: data.dns_last_checked_at
        ? new Date(data.dns_last_checked_at)
        : undefined,
      sslStatus: data.ssl_status,
      sslCertificateId: data.ssl_certificate_id,
      sslExpiresAt: data.ssl_expires_at
        ? new Date(data.ssl_expires_at)
        : undefined,
      verificationStatus: data.verification_status,
      verificationMethod: data.verification_method,
      verificationToken: data.verification_token,
      verificationAttempts: data.verification_attempts,
      lastVerificationAt: data.last_verification_at
        ? new Date(data.last_verification_at)
        : undefined,
      isPrimary: data.is_primary,
      forceSsl: data.force_ssl,
      status: data.status,
      errorMessage: data.error_message,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
      activatedAt: data.activated_at ? new Date(data.activated_at) : undefined,
    };
  }

  private static transformRedirect(data: any): DomainRedirect {
    return {
      id: data.id,
      domainId: data.domain_id,
      fromPath: data.from_path,
      toPath: data.to_path,
      redirectType: data.redirect_type,
      isActive: data.is_active,
      hitCount: data.hit_count,
      lastHitAt: data.last_hit_at ? new Date(data.last_hit_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
