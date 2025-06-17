/**
 * Custom Domain Type Definitions
 */

export type DomainStatus = 'pending' | 'active' | 'suspended' | 'expired';
export type VerificationStatus =
  | 'pending'
  | 'verifying'
  | 'verified'
  | 'failed';
export type VerificationMethod = 'dns' | 'http';
export type SSLStatus = 'pending' | 'provisioning' | 'active' | 'failed';
export type DNSRecordType = 'A' | 'CNAME' | 'TXT' | 'MX';

export interface CustomDomain {
  id: string;
  userId: string;
  portfolioId: string;

  // Domain details
  domain: string;
  subdomain?: string;

  // DNS configuration
  dnsConfigured: boolean;
  dnsTxtRecord?: string;
  dnsCnameRecord?: string;
  dnsLastCheckedAt?: Date;

  // SSL certificate
  sslStatus: SSLStatus;
  sslCertificateId?: string;
  sslExpiresAt?: Date;

  // Verification
  verificationStatus: VerificationStatus;
  verificationMethod: VerificationMethod;
  verificationToken: string;
  verificationAttempts: number;
  lastVerificationAt?: Date;

  // Configuration
  isPrimary: boolean;
  forceSsl: boolean;

  // Status
  status: DomainStatus;
  errorMessage?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
  activatedAt?: Date;
}

export interface DomainVerificationLog {
  id: string;
  domainId: string;
  verificationType: 'dns_txt' | 'dns_cname' | 'http_file';
  status: 'success' | 'failed' | 'timeout';
  dnsRecords?: DNSRecord[];
  expectedValue?: string;
  actualValue?: string;
  errorCode?: string;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface DNSRecord {
  type: DNSRecordType;
  name: string;
  value: string;
  ttl?: number;
  priority?: number; // For MX records
}

export interface DomainSetupInstructions {
  provider: string;
  steps: DomainSetupStep[];
}

export interface DomainSetupStep {
  order: number;
  title: string;
  description: string;
  recordType: DNSRecordType;
  recordName: string;
  recordValue: string;
  screenshot?: string;
}

export interface DomainAnalytics {
  domainId: string;
  date: string;
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
  avgLoadTimeMs?: number;
  sslHandshakeTimeMs?: number;
  error4xxCount: number;
  error5xxCount: number;
}

export interface DomainRedirect {
  id: string;
  domainId: string;
  fromPath: string;
  toPath: string;
  redirectType: 301 | 302;
  isActive: boolean;
  hitCount: number;
  lastHitAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainCheckResult {
  isAvailable: boolean;
  reason?: 'taken' | 'invalid' | 'reserved' | 'blacklisted';
  suggestions?: string[];
}

export interface DomainVerificationResult {
  verified: boolean;
  method: VerificationMethod;
  records: {
    expected: DNSRecord[];
    actual: DNSRecord[];
  };
  errors?: string[];
}

export interface SSLCertificateInfo {
  status: SSLStatus;
  issuer?: string;
  validFrom?: Date;
  validTo?: Date;
  commonName?: string;
  altNames?: string[];
  fingerprint?: string;
}
