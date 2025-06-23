/**
 * @madfam/smart-payments
 *
 * World-class payment gateway detection and routing system with AI-powered optimization
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Geographical Context Engine
 *
 * Builds comprehensive geographical context from multiple signals
 */

import { LRUCache } from 'lru-cache';
// @ts-ignore - node-ipinfo has module resolution issues
import * as nodeIpinfo from 'node-ipinfo';
const IPinfoWrapper = (nodeIpinfo as any).IPinfoWrapper || (nodeIpinfo as any).default;
import {
  GeographicalContext,
  VPNCheckResult,
  Customer,
  RiskAssessment,
  RiskFactor,
  GeoLookupResponse,
  GeoLookupError,
} from '../types';
import { VPNDetector } from './vpn-detector';

export interface ContextEngineConfig {
  ipinfoToken?: string;
  cacheSize?: number;
  cacheTTL?: number;
  enableVPNDetection?: boolean;
  suspiciousCountries?: string[];
}

/**
 * Main geographical context engine
 */
export class GeographicalContextEngine {
  private ipinfo: any | null = null;
  private vpnDetector: VPNDetector;
  private cache: LRUCache<string, GeographicalContext>;
  private suspiciousCountries: Set<string>;

  constructor(private config: ContextEngineConfig = {}) {
    // Initialize IPinfo if token provided
    if (config.ipinfoToken) {
      this.ipinfo = new IPinfoWrapper(config.ipinfoToken);
    }

    this.vpnDetector = new VPNDetector();
    this.cache = new LRUCache<string, GeographicalContext>({
      max: config.cacheSize || 10000,
      ttl: (config.cacheTTL || 3600) * 1000, // Convert to milliseconds
    });

    // Default suspicious countries (known for fraud)
    this.suspiciousCountries = new Set(
      config.suspiciousCountries || [
        'NG', // Nigeria
        'GH', // Ghana
        'PK', // Pakistan
        'BD', // Bangladesh
        'ID', // Indonesia
        'VN', // Vietnam
        'PH', // Philippines
        'RO', // Romania
        'UA', // Ukraine
        'RU', // Russia
      ]
    );
  }

  /**
   * Build complete geographical context from IP address
   */
  async buildContext(
    ipAddress: string,
    headers?: Record<string, string>
  ): Promise<GeographicalContext> {
    // Check cache first
    const cached = this.cache.get(ipAddress);
    if (cached) {
      return cached;
    }

    try {
      // Parallel lookups for performance
      const [ipData, vpnCheck] = await Promise.all([
        this.lookupIP(ipAddress),
        this.config.enableVPNDetection !== false
          ? this.vpnDetector.detect(ipAddress)
          : Promise.resolve(null),
      ]);

      // Extract timezone and language from headers
      const timezone = this.extractTimezone(headers);
      const language = this.extractLanguage(headers);

      // Build context
      const context: GeographicalContext = {
        ipCountry: (ipData as any)?.countryCode || null,
        ipRegion: (ipData as any)?.region || undefined,
        ipCity: (ipData as any)?.city || undefined,
        ipCurrency: this.getCurrencyForCountry((ipData as any)?.countryCode || 'US'),
        vpnDetected: vpnCheck?.isVPN || false,
        vpnConfidence: vpnCheck?.confidence || 0,
        proxyDetected: vpnCheck?.isProxy || false,
        timezone: timezone || (ipData as any)?.timezone || 'UTC',
        language: language || 'en',
        suspiciousActivity: false,
        riskScore: 0,
      };

      // Calculate risk score
      context.riskScore = this.calculateRiskScore(context, vpnCheck);
      context.suspiciousActivity = context.riskScore > 50;

      // Cache the result
      this.cache.set(ipAddress, context);

      return context;
    } catch (error) {
      throw new GeoLookupError('Failed to build geographical context', {
        ipAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Assess risk based on geographical context
   */
  assessRisk(
    context: GeographicalContext,
    cardCountry?: string,
    customer?: Customer
  ): RiskAssessment {
    const factors: RiskFactor[] = [];
    let totalScore = context.riskScore;

    // VPN/Proxy risk
    if (context.vpnDetected) {
      factors.push({
        type: 'vpn_detected',
        severity: context.vpnConfidence > 0.8 ? 'high' : 'medium',
        description: 'VPN or proxy detected',
        evidence: { confidence: context.vpnConfidence },
      });
      totalScore += 20;
    }

    // Country mismatch
    if (cardCountry && context.ipCountry && cardCountry !== context.ipCountry) {
      factors.push({
        type: 'country_mismatch',
        severity: 'medium',
        description: `Card from ${cardCountry} used from ${context.ipCountry}`,
        evidence: { cardCountry, ipCountry: context.ipCountry },
      });
      totalScore += 15;
    }

    // Suspicious country
    if (context.ipCountry && this.suspiciousCountries.has(context.ipCountry)) {
      factors.push({
        type: 'suspicious_country',
        severity: 'high',
        description: `Transaction from high-risk country: ${context.ipCountry}`,
        evidence: { country: context.ipCountry },
      });
      totalScore += 25;
    }

    // Customer history
    if (customer?.riskProfile) {
      const customerRisk = customer.riskProfile.score;
      if (customerRisk > 50) {
        factors.push({
          type: 'customer_risk',
          severity: customerRisk > 75 ? 'high' : 'medium',
          description: 'Customer has elevated risk profile',
          evidence: { riskScore: customerRisk },
        });
        totalScore += customerRisk / 4;
      }
    }

    // Time-based risk (unusual timezone)
    const expectedTimezone = this.getExpectedTimezone(
      context.ipCountry || 'US'
    );
    if (
      context.timezone &&
      !this.isTimezoneMatch(context.timezone, expectedTimezone)
    ) {
      factors.push({
        type: 'timezone_mismatch',
        severity: 'low',
        description: "Timezone doesn't match IP location",
        evidence: { actual: context.timezone, expected: expectedTimezone },
      });
      totalScore += 10;
    }

    // Determine risk level
    let risk: RiskAssessment['risk'] = 'low';
    if (totalScore > 75) risk = 'critical';
    else if (totalScore > 50) risk = 'high';
    else if (totalScore > 25) risk = 'medium';

    // Generate recommendation
    const recommendation = this.generateRecommendation(risk, factors);

    return {
      risk,
      score: Math.min(100, totalScore),
      reason: factors.length > 0 ? factors[0]!.description : null,
      factors,
      recommendation,
      requiresManualReview: risk === 'high' || risk === 'critical',
    };
  }

  /**
   * Check if a specific transaction appears to be geographical arbitrage
   */
  detectGeographicalArbitrage(
    cardCountry: string,
    ipCountry: string | null,
    vpnDetected: boolean,
    priceCountry: string
  ): boolean {
    // If VPN is detected and card country gets better pricing
    if (vpnDetected && cardCountry !== priceCountry) {
      const cardCountryDiscount = this.getCountryDiscount(cardCountry);
      const priceCountryDiscount = this.getCountryDiscount(priceCountry);

      // If user would get significant discount by claiming to be from card country
      if (cardCountryDiscount > priceCountryDiscount + 0.1) {
        return true;
      }
    }

    // If IP country differs significantly from card country
    if (ipCountry && cardCountry !== ipCountry) {
      const ipDiscount = this.getCountryDiscount(ipCountry);
      const cardDiscount = this.getCountryDiscount(cardCountry);

      // Potential arbitrage if card country has much higher discount
      if (cardDiscount > ipDiscount + 0.2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Lookup geographical information with response wrapper
   */
  async lookup(
    ipAddress: string,
    headers?: Record<string, string>
  ): Promise<GeoLookupResponse> {
    try {
      const context = await this.buildContext(ipAddress, headers);
      return {
        success: true,
        context,
        cached: this.cache.has(ipAddress),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cached: false,
      };
    }
  }

  // Private methods

  private async lookupIP(ipAddress: string): Promise<unknown> {
    // Skip for localhost/private IPs
    if (this.isPrivateIP(ipAddress)) {
      return {
        countryCode: 'US',
        region: 'California',
        city: 'Local',
        timezone: 'America/Los_Angeles',
      };
    }

    if (!this.ipinfo) {
      // Fallback to basic detection
      return this.fallbackIPLookup(ipAddress);
    }

    try {
      const result = await this.ipinfo.lookupIp(ipAddress);
      return {
        countryCode: result.countryCode,
        region: result.region,
        city: result.city,
        timezone: result.timezone,
        loc: result.loc,
        org: result.org,
      };
    } catch (error) {
      return this.fallbackIPLookup(ipAddress);
    }
  }

  private isPrivateIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    const first = parseInt(parts[0]!);
    const second = parseInt(parts[1]!);

    // Check for private IP ranges
    return (
      ip === '127.0.0.1' ||
      first === 10 ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  }

  private fallbackIPLookup(ipAddress: string): any {
    // Very basic fallback based on IP ranges
    // In production, would use a proper GeoIP database
    const first = parseInt(ipAddress.split('.')[0]!);

    if (first >= 1 && first <= 50)
      return { countryCode: 'US', timezone: 'America/New_York' };
    if (first >= 51 && first <= 100)
      return { countryCode: 'EU', timezone: 'Europe/London' };
    if (first >= 101 && first <= 150)
      return { countryCode: 'AS', timezone: 'Asia/Tokyo' };
    if (first >= 151 && first <= 200)
      return { countryCode: 'BR', timezone: 'America/Sao_Paulo' };

    return { countryCode: 'US', timezone: 'UTC' };
  }

  private extractTimezone(headers?: Record<string, string>): string | null {
    if (!headers) return null;

    // Check for timezone header
    const tz = headers['x-timezone'] || headers['timezone'];
    if (tz) return tz;

    // Try to extract from date header
    const date = headers['date'];
    if (date) {
      try {
        const offset = new Date(date).getTimezoneOffset();
        // Convert offset to timezone (simplified)
        if (offset === 0) return 'UTC';
        if (offset === -480) return 'Asia/Shanghai';
        if (offset === 300) return 'America/New_York';
        if (offset === 420) return 'America/Los_Angeles';
      } catch {}
    }

    return null;
  }

  private extractLanguage(headers?: Record<string, string>): string {
    if (!headers) return 'en';

    const acceptLang = headers['accept-language'];
    if (!acceptLang) return 'en';

    // Extract primary language
    const primary = acceptLang.split(',')[0];
    return primary!.split('-')[0]!.toLowerCase();
  }

  private getCurrencyForCountry(countryCode: string): string {
    const currencyMap: Record<string, string> = {
      US: 'USD',
      CA: 'CAD',
      MX: 'MXN',
      BR: 'BRL',
      AR: 'ARS',
      CL: 'CLP',
      CO: 'COP',
      PE: 'PEN',
      GB: 'GBP',
      EU: 'EUR',
      IN: 'INR',
      CN: 'CNY',
      JP: 'JPY',
      AU: 'AUD',
      NZ: 'NZD',
      SG: 'SGD',
      HK: 'HKD',
      MY: 'MYR',
      TH: 'THB',
      ID: 'IDR',
      PH: 'PHP',
      VN: 'VND',
      KR: 'KRW',
      TW: 'TWD',
      ZA: 'ZAR',
      NG: 'NGN',
      EG: 'EGP',
      KE: 'KES',
      MA: 'MAD',
      AE: 'AED',
      SA: 'SAR',
      TR: 'TRY',
      RU: 'RUB',
      UA: 'UAH',
      PL: 'PLN',
      CZ: 'CZK',
      HU: 'HUF',
      RO: 'RON',
      SE: 'SEK',
      NO: 'NOK',
      DK: 'DKK',
      CH: 'CHF',
    };

    return currencyMap[countryCode] || 'USD';
  }

  private calculateRiskScore(
    context: GeographicalContext,
    vpnCheck: VPNCheckResult | null
  ): number {
    let score = 0;

    // VPN/Proxy risk
    if (vpnCheck) {
      if (vpnCheck.isVPN) score += 20 * vpnCheck.confidence;
      if (vpnCheck.isProxy) score += 15 * vpnCheck.confidence;
      if (vpnCheck.isTor) score += 30;
      if (vpnCheck.isHosting) score += 25;
    }

    // Country risk
    if (context.ipCountry && this.suspiciousCountries.has(context.ipCountry)) {
      score += 25;
    }

    // Add some randomness for demo (0-10 points)
    score += Math.random() * 10;

    return Math.min(100, Math.round(score));
  }

  private getExpectedTimezone(country: string): string {
    const timezoneMap: Record<string, string> = {
      US: 'America/New_York',
      MX: 'America/Mexico_City',
      BR: 'America/Sao_Paulo',
      AR: 'America/Argentina/Buenos_Aires',
      GB: 'Europe/London',
      EU: 'Europe/Berlin',
      IN: 'Asia/Kolkata',
      CN: 'Asia/Shanghai',
      JP: 'Asia/Tokyo',
      AU: 'Australia/Sydney',
    };

    return timezoneMap[country] || 'UTC';
  }

  private isTimezoneMatch(actual: string, expected: string): boolean {
    // Simplified check - in production would be more sophisticated
    return actual === expected || actual.includes(expected.split('/')[0]!);
  }

  private getCountryDiscount(country: string): number {
    // PPP-based discounts
    const discounts: Record<string, number> = {
      US: 0,
      CA: 0.1,
      GB: 0.05,
      EU: 0.1,
      MX: 0.4,
      BR: 0.5,
      AR: 0.6,
      IN: 0.7,
      PK: 0.75,
      BD: 0.8,
      NG: 0.8,
      EG: 0.7,
      ID: 0.65,
      PH: 0.6,
      VN: 0.65,
    };

    return discounts[country] || 0.3;
  }

  private generateRecommendation(
    risk: RiskAssessment['risk'],
    factors: RiskFactor[]
  ): string {
    if (risk === 'critical') {
      return 'Block transaction and flag for manual review';
    }

    if (risk === 'high') {
      if (
        factors.some(f => f.type === 'vpn_detected' && f.severity === 'high')
      ) {
        return 'Require additional verification or disable geographical discounts';
      }
      return 'Proceed with enhanced monitoring and possible 3D Secure';
    }

    if (risk === 'medium') {
      return 'Proceed with standard fraud checks';
    }

    return 'Low risk - proceed normally';
  }
}
