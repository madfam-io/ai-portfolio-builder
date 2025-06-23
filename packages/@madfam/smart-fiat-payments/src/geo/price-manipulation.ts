/**
 * @madfam/smart-fiat-payments
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
 * Price Manipulation Detection
 *
 * Detects attempts to manipulate geographical pricing
 */

import { GeographicalContext, CardInfo, Customer, RiskFlag } from '../types';

export interface ManipulationCheck {
  detected: boolean;
  confidence: number;
  type: ManipulationType;
  evidence: ManipulationEvidence;
  recommendation: string;
}

export type ManipulationType =
  | 'vpn_discount_abuse'
  | 'card_country_mismatch'
  | 'suspicious_behavior'
  | 'location_spoofing'
  | 'account_sharing'
  | 'bulk_purchasing'
  | 'none';

export interface ManipulationEvidence {
  factors: string[];
  riskScore: number;
  details: Record<string, unknown>;
}

/**
 * Price manipulation detection service
 */
export class PriceManipulationDetector {
  private readonly priceThresholds = {
    significantDiscount: 0.3, // 30% or more discount
    suspiciousDiscount: 0.5, // 50% or more discount
    extremeDiscount: 0.7, // 70% or more discount
  };

  /**
   * Check for price manipulation attempts
   */
  detectManipulation(
    geoContext: GeographicalContext,
    cardInfo: CardInfo | null,
    customer: Customer | null,
    requestedCountry?: string
  ): ManipulationCheck {
    const evidence: ManipulationEvidence = {
      factors: [],
      riskScore: 0,
      details: {},
    };

    let manipulationType: ManipulationType = 'none';

    // Check 1: VPN with discount request
    if (geoContext.vpnDetected && requestedCountry) {
      const vpnCheck = this.checkVPNDiscountAbuse(
        geoContext,
        requestedCountry,
        cardInfo?.issuerCountry
      );

      if (vpnCheck.detected) {
        evidence.factors.push('VPN detected while requesting regional pricing');
        evidence.riskScore += vpnCheck.score;
        evidence.details.vpn = vpnCheck;
        manipulationType = 'vpn_discount_abuse';
      }
    }

    // Check 2: Card country mismatch
    if (cardInfo && geoContext.ipCountry) {
      const mismatchCheck = this.checkCardCountryMismatch(
        cardInfo.issuerCountry,
        geoContext.ipCountry,
        requestedCountry || geoContext.ipCountry
      );

      if (mismatchCheck.detected) {
        evidence.factors.push('Card country differs from location');
        evidence.riskScore += mismatchCheck.score;
        evidence.details.mismatch = mismatchCheck;
        if (manipulationType === 'none') {
          manipulationType = 'card_country_mismatch';
        }
      }
    }

    // Check 3: Customer behavior patterns
    if (customer) {
      const behaviorCheck = this.checkSuspiciousBehavior(customer, geoContext);

      if (behaviorCheck.detected) {
        evidence.factors.push('Suspicious customer behavior detected');
        evidence.riskScore += behaviorCheck.score;
        evidence.details.behavior = behaviorCheck;
        if (manipulationType === 'none') {
          manipulationType = 'suspicious_behavior';
        }
      }
    }

    // Check 4: Location spoofing indicators
    const spoofingCheck = this.checkLocationSpoofing(geoContext);

    if (spoofingCheck.detected) {
      evidence.factors.push('Location spoofing indicators found');
      evidence.riskScore += spoofingCheck.score;
      evidence.details.spoofing = spoofingCheck;
      if (manipulationType === 'none') {
        manipulationType = 'location_spoofing';
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(
      evidence.riskScore,
      evidence.factors.length
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      manipulationType,
      confidence,
      evidence.riskScore
    );

    return {
      detected: manipulationType !== 'none',
      confidence,
      type: manipulationType,
      evidence,
      recommendation,
    };
  }

  /**
   * Check for VPN discount abuse
   */
  private checkVPNDiscountAbuse(
    geoContext: GeographicalContext,
    requestedCountry: string,
    cardCountry?: string
  ): { detected: boolean; score: number; details: any } {
    const factors = [];
    let score = 0;

    // High confidence VPN detection
    if (geoContext.vpnConfidence > 0.8) {
      factors.push('High confidence VPN detection');
      score += 30;
    }

    // Requesting different country than IP
    if (geoContext.ipCountry && geoContext.ipCountry !== requestedCountry) {
      factors.push('Requested country differs from IP location');
      score += 20;

      // Check if requesting higher discount country
      const ipDiscount = this.getCountryDiscount(geoContext.ipCountry);
      const requestedDiscount = this.getCountryDiscount(requestedCountry);

      if (requestedDiscount > ipDiscount + 0.2) {
        factors.push('Requesting significantly higher discount region');
        score += 25;
      }
    }

    // Card from different country than requested
    if (cardCountry && cardCountry !== requestedCountry) {
      const cardDiscount = this.getCountryDiscount(cardCountry);
      const requestedDiscount = this.getCountryDiscount(requestedCountry);

      if (requestedDiscount > cardDiscount + 0.3) {
        factors.push('Card country has lower discount than requested');
        score += 20;
      }
    }

    return {
      detected: score > 40,
      score,
      details: {
        factors,
        vpnConfidence: geoContext.vpnConfidence,
        ipCountry: geoContext.ipCountry,
        requestedCountry,
        cardCountry,
      },
    };
  }

  /**
   * Check for card country mismatch patterns
   */
  private checkCardCountryMismatch(
    cardCountry: string,
    ipCountry: string,
    pricingCountry: string
  ): { detected: boolean; score: number; details: any } {
    const factors = [];
    let score = 0;

    // Basic mismatch
    if (cardCountry !== ipCountry) {
      factors.push('Card and IP countries differ');
      score += 15;

      // Check if common travel pair
      if (!this.isCommonTravelPair(cardCountry, ipCountry)) {
        factors.push('Unusual country combination');
        score += 10;
      }
    }

    // Triple mismatch (card, IP, and pricing all different)
    if (
      cardCountry !== ipCountry &&
      cardCountry !== pricingCountry &&
      ipCountry !== pricingCountry
    ) {
      factors.push('All three countries differ (card, IP, pricing)');
      score += 25;
    }

    // Extreme discount seeking
    const cardDiscount = this.getCountryDiscount(cardCountry);
    const pricingDiscount = this.getCountryDiscount(pricingCountry);

    if (pricingDiscount > cardDiscount + 0.5) {
      factors.push(
        'Extreme discount difference between card and pricing country'
      );
      score += 30;
    }

    return {
      detected: score > 30,
      score,
      details: {
        factors,
        cardCountry,
        ipCountry,
        pricingCountry,
        discountDifference: pricingDiscount - cardDiscount,
      },
    };
  }

  /**
   * Check for suspicious customer behavior
   */
  private checkSuspiciousBehavior(
    customer: Customer,
    geoContext: GeographicalContext
  ): { detected: boolean; score: number; details: any } {
    const factors = [];
    let score = 0;

    // Check risk flags
    if (customer.riskProfile) {
      const vpnAbuseFlags = customer.riskProfile.flags.filter(
        f => f.type === 'vpn_abuse'
      );

      if (vpnAbuseFlags.length > 0) {
        factors.push('Previous VPN abuse detected');
        score += 25 * vpnAbuseFlags.length;
      }

      const fraudFlags = customer.riskProfile.flags.filter(
        f => f.type === 'fraud_attempt'
      );

      if (fraudFlags.length > 0) {
        factors.push('Previous fraud attempts');
        score += 30 * fraudFlags.length;
      }
    }

    // Rapid country changes
    if (
      customer.country &&
      geoContext.ipCountry &&
      customer.country !== geoContext.ipCountry
    ) {
      const accountAge = this.getAccountAgeInDays(customer.accountCreatedAt);

      if (accountAge < 7) {
        factors.push('New account with different country');
        score += 20;
      }
    }

    // Multiple purchases from different countries
    if (customer.previousPurchases > 5 && geoContext.vpnDetected) {
      factors.push('Multiple purchases with VPN detected');
      score += 15;
    }

    return {
      detected: score > 25,
      score,
      details: {
        factors,
        riskProfile: customer.riskProfile,
        accountAge: this.getAccountAgeInDays(customer.accountCreatedAt),
        previousPurchases: customer.previousPurchases,
      },
    };
  }

  /**
   * Check for location spoofing indicators
   */
  private checkLocationSpoofing(geoContext: GeographicalContext): {
    detected: boolean;
    score: number;
    details: any;
  } {
    const factors = [];
    let score = 0;

    // Multiple spoofing indicators
    if (geoContext.vpnDetected && geoContext.proxyDetected) {
      factors.push('Both VPN and proxy detected');
      score += 40;
    }

    // Timezone mismatch
    const expectedTimezone = this.getExpectedTimezone(
      geoContext.ipCountry || 'US'
    );
    if (geoContext.timezone !== expectedTimezone) {
      factors.push("Timezone doesn't match IP location");
      score += 15;
    }

    // Language mismatch
    const expectedLanguage = this.getExpectedLanguage(
      geoContext.ipCountry || 'US'
    );
    if (
      geoContext.language !== expectedLanguage &&
      !this.isCommonSecondLanguage(
        geoContext.language,
        geoContext.ipCountry || 'US'
      )
    ) {
      factors.push("Language doesn't match IP location");
      score += 10;
    }

    // High risk score from geo context
    if (geoContext.riskScore > 70) {
      factors.push('High geographical risk score');
      score += 20;
    }

    return {
      detected: score > 30,
      score,
      details: {
        factors,
        timezone: geoContext.timezone,
        expectedTimezone,
        language: geoContext.language,
        expectedLanguage,
        geoRiskScore: geoContext.riskScore,
      },
    };
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(riskScore: number, factorCount: number): number {
    // Base confidence on risk score
    let confidence = Math.min(riskScore / 100, 0.9);

    // Adjust based on number of factors
    if (factorCount >= 4) confidence = Math.min(confidence + 0.2, 0.95);
    else if (factorCount >= 2) confidence = Math.min(confidence + 0.1, 0.9);

    return confidence;
  }

  /**
   * Generate recommendation based on detection
   */
  private generateRecommendation(
    type: ManipulationType,
    confidence: number,
    riskScore: number
  ): string {
    if (type === 'none') {
      return 'No manipulation detected - proceed normally';
    }

    if (confidence > 0.8 && riskScore > 70) {
      return 'High confidence manipulation detected - block discount and require verification';
    }

    if (type === 'vpn_discount_abuse') {
      if (confidence > 0.6) {
        return 'Apply pricing based on card country instead of requested country';
      }
      return 'Monitor transaction and consider additional verification';
    }

    if (type === 'card_country_mismatch') {
      if (riskScore > 50) {
        return 'Use card issuing country for pricing and monitor closely';
      }
      return 'Allow but flag for review if chargeback occurs';
    }

    if (type === 'suspicious_behavior') {
      return 'Require additional verification before applying discounts';
    }

    if (type === 'location_spoofing') {
      return 'Apply base pricing without geographical discounts';
    }

    return 'Monitor transaction for unusual patterns';
  }

  // Helper methods

  private getCountryDiscount(country: string): number {
    const discounts: Record<string, number> = {
      US: 0,
      CA: 0.1,
      GB: 0.05,
      MX: 0.4,
      BR: 0.5,
      AR: 0.6,
      IN: 0.7,
      PK: 0.75,
      BD: 0.8,
      NG: 0.8,
      ID: 0.65,
      PH: 0.6,
      VN: 0.65,
      EG: 0.7,
    };

    return discounts[country] || 0.3;
  }

  private isCommonTravelPair(country1: string, country2: string): boolean {
    const pairs = [
      ['US', 'CA'],
      ['US', 'MX'],
      ['GB', 'FR'],
      ['GB', 'ES'],
      ['DE', 'FR'],
      ['DE', 'NL'],
      ['AU', 'NZ'],
      ['SG', 'MY'],
      ['AR', 'BR'],
      ['AR', 'CL'],
      ['IN', 'AE'],
      ['IN', 'SG'],
    ];

    return pairs.some(
      pair =>
        (pair[0] === country1 && pair[1] === country2) ||
        (pair[1] === country1 && pair[0] === country2)
    );
  }

  private getAccountAgeInDays(createdAt: Date): number {
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getExpectedTimezone(country: string): string {
    const timezones: Record<string, string> = {
      US: 'America/New_York',
      MX: 'America/Mexico_City',
      BR: 'America/Sao_Paulo',
      AR: 'America/Argentina/Buenos_Aires',
      GB: 'Europe/London',
      IN: 'Asia/Kolkata',
      JP: 'Asia/Tokyo',
      AU: 'Australia/Sydney',
    };

    return timezones[country] || 'UTC';
  }

  private getExpectedLanguage(country: string): string {
    const languages: Record<string, string> = {
      US: 'en',
      MX: 'es',
      BR: 'pt',
      AR: 'es',
      GB: 'en',
      FR: 'fr',
      DE: 'de',
      IN: 'hi',
      JP: 'ja',
      CN: 'zh',
    };

    return languages[country] || 'en';
  }

  private isCommonSecondLanguage(language: string, country: string): boolean {
    const secondLanguages: Record<string, string[]> = {
      IN: ['en'],
      MX: ['en'],
      BR: ['en', 'es'],
      CA: ['fr', 'en'],
      US: ['es'],
      SG: ['en', 'zh', 'ms', 'ta'],
    };

    return secondLanguages[country]?.includes(language) || false;
  }
}
