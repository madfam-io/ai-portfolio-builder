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

/**
 * Custom Domain Service
 *
 * Handles custom domain configuration, verification, and management
 */

import { prisma } from '@/lib/db/prisma';
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
    const existingDomain = await prisma.customDomain.findFirst({
      where: {
        domain: domain,
      },
    });

    if (existingDomain) {
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

    // Generate verification token
    const verificationToken = this.generateVerificationToken();

    // Create domain record
    const data = await prisma.customDomain.create({
      data: {
        userId: userId,
        portfolioId: portfolioId,
        domain,
        verificationToken: verificationToken,
        dnsTxtRecord: `prisma-verify=${verificationToken}`,
        dnsCnameRecord: 'portfolios.prisma.madfam.io',
      },
    });

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
    const data = await prisma.customDomain.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return data.map(this.transformDomain);
  }

  /**
   * Get domains for a specific portfolio
   */
  static async getPortfolioDomains(
    portfolioId: string
  ): Promise<CustomDomain[]> {
    const data = await prisma.customDomain.findMany({
      where: {
        portfolioId: portfolioId,
      },
      orderBy: {
        isPrimary: 'desc',
      },
    });

    return data.map(this.transformDomain);
  }

  /**
   * Verify domain ownership
   */
  static async verifyDomain(
    domainId: string
  ): Promise<DomainVerificationResult> {
    // Get domain details
    const domain = await prisma.customDomain.findUnique({
      where: {
        id: domainId,
      },
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    // Perform DNS lookup
    const dnsRecords = await this.lookupDNSRecords(domain.domain);

    // Check for verification records
    const expectedRecords: DNSRecord[] = [
      {
        type: 'TXT',
        name: domain.domain,
        value: domain.dnsTxtRecord,
      },
      {
        type: 'CNAME',
        name: domain.domain,
        value: domain.dnsCnameRecord,
      },
    ];

    const verified = this.checkDNSRecordsMatch(expectedRecords, dnsRecords);

    // Update verification status
    const newStatus = verified ? 'verified' : 'failed';
    await prisma.customDomain.update({
      where: {
        id: domainId,
      },
      data: {
        verificationStatus: newStatus,
        dnsConfigured: verified,
        verifiedAt: verified ? new Date() : null,
        dnsLastCheckedAt: new Date(),
      },
    });

    // Log verification attempt (assuming you have this model)
    // await prisma.domainVerificationLog.create({
    //   data: {
    //     domainId: domainId,
    //     verificationType: 'dns_txt',
    //     status: verified ? 'success' : 'failed',
    //     dnsRecords: dnsRecords,
    //     expectedValue: domain.dnsTxtRecord,
    //     actualValue: dnsRecords.find(r => r.type === 'TXT')?.value,
    //   },
    // });

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
    // Check if domain is verified
    const domain = await prisma.customDomain.findUnique({
      where: {
        id: domainId,
      },
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    if (domain.verificationStatus !== 'verified') {
      throw new Error('Domain must be verified before activation');
    }

    // Request SSL certificate
    const sslInfo = await this.requestSSLCertificate(domain.domain);

    // Update domain status
    const data = await prisma.customDomain.update({
      where: {
        id: domainId,
      },
      data: {
        status: 'active',
        activatedAt: new Date(),
        sslStatus: sslInfo.status,
        sslCertificateId: sslInfo.certificateId,
      },
    });

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
    // First, unset any existing primary domain for this portfolio
    await prisma.customDomain.updateMany({
      where: {
        portfolioId: portfolioId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // Set the new primary domain
    await prisma.customDomain.update({
      where: {
        id: domainId,
        portfolioId: portfolioId,
      },
      data: {
        isPrimary: true,
      },
    });

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
    // Get domain details for tracking
    const domain = await prisma.customDomain.findUnique({
      where: {
        id: domainId,
      },
      select: {
        domain: true,
      },
    });

    // Delete the domain
    await prisma.customDomain.delete({
      where: {
        id: domainId,
      },
    });

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
              description:
                'Add a CNAME record to point your domain to Portfolio Builder',
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
    const data = await prisma.domainRedirect.create({
      data: {
        domainId: domainId,
        fromPath: fromPath,
        toPath: toPath,
        redirectType: redirectType,
      },
    });

    return this.transformRedirect(data);
  }

  /**
   * Get SSL certificate information
   */
  static async getSSLInfo(domainId: string): Promise<SSLCertificateInfo> {
    const domain = await prisma.customDomain.findUnique({
      where: {
        id: domainId,
      },
      select: {
        sslStatus: true,
        sslCertificateId: true,
        sslExpiresAt: true,
        domain: true,
      },
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    // In production, this would fetch actual certificate details
    // from the SSL provider (e.g., Let's Encrypt via Caddy)
    return {
      status: domain.sslStatus,
      validTo: domain.sslExpiresAt || undefined,
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

  private static lookupDNSRecords(domain: string): Promise<DNSRecord[]> {
    // In production, this would use a DNS lookup service
    // For now, we'll simulate DNS records
    logger.info('Looking up DNS records for domain', { domain });

    // This would integrate with services like:
    // - Cloudflare API
    // - AWS Route53
    // - Google Cloud DNS
    // - Or a dedicated DNS lookup service

    return Promise.resolve([]);
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

  private static requestSSLCertificate(domain: string): Promise<{
    status: 'provisioning' | 'active';
    certificateId?: string;
  }> {
    // In production, this would integrate with:
    // - Let's Encrypt via Caddy/Certbot
    // - Cloudflare SSL
    // - Or another SSL provider

    logger.info('Requesting SSL certificate for domain', { domain });

    return Promise.resolve({
      status: 'provisioning',
      certificateId: `cert-${Date.now()}`,
    });
  }

  private static transformDomain(data: any): CustomDomain {
    return {
      id: data.id,
      userId: data.userId,
      portfolioId: data.portfolioId,
      domain: data.domain,
      subdomain: data.subdomain,
      dnsConfigured: data.dnsConfigured,
      dnsTxtRecord: data.dnsTxtRecord,
      dnsCnameRecord: data.dnsCnameRecord,
      dnsLastCheckedAt: data.dnsLastCheckedAt,
      sslStatus: data.sslStatus,
      sslCertificateId: data.sslCertificateId,
      sslExpiresAt: data.sslExpiresAt,
      verificationStatus: data.verificationStatus,
      verificationMethod: data.verificationMethod,
      verificationToken: data.verificationToken,
      verificationAttempts: data.verificationAttempts,
      lastVerificationAt: data.lastVerificationAt,
      isPrimary: data.isPrimary,
      forceSsl: data.forceSsl,
      status: data.status,
      errorMessage: data.errorMessage,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      verifiedAt: data.verifiedAt,
      activatedAt: data.activatedAt,
    };
  }

  private static transformRedirect(data: any): DomainRedirect {
    return {
      id: data.id,
      domainId: data.domainId,
      fromPath: data.fromPath,
      toPath: data.toPath,
      redirectType: data.redirectType,
      isActive: data.isActive,
      hitCount: data.hitCount,
      lastHitAt: data.lastHitAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
