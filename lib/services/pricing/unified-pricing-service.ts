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
 * Unified Pricing Service
 * 
 * Combines static tier pricing with dynamic geographical adjustments
 * and promotional campaigns. Integrates with @madfam/smart-fiat-payments
 * for intelligent, location-aware pricing.
 */

import { 
  DynamicPricingEngine,
  GeographicalContextEngine,
  PriceManipulationDetector,
  type PricingContext,
  type GeographicalContext,
  type Money,
  type Customer,
  type PricingStrategy,
} from '@madfam/smart-fiat-payments';

import { 
  UNIFIED_PRICING_CONFIG, 
  PricingHelpers,
  type TierID,
  type SubscriptionTier,
} from '@/lib/pricing/unified-pricing-config';

import { enhancedStripeService } from '@/lib/services/stripe/stripe-enhanced';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/types/database';

type DbUser = Database['public']['Tables']['users']['Row'];

export interface UnifiedPricingContext {
  tierId: TierID;
  interval: 'monthly' | 'yearly';
  user?: DbUser | null;
  ipCountry?: string | null;
  cardCountry?: string;
  vpnDetected?: boolean;
  deviceFingerprint?: string;
  discountCode?: string;
  forcePromotion?: boolean;
}

export interface UnifiedPriceResult {
  // Base pricing
  tier: SubscriptionTier;
  basePrice: Money;
  displayPrice: Money;
  
  // Adjustments
  geographicalAdjustment?: {
    percentage: number;
    amount: Money;
    reason: string;
  };
  promotionalDiscount?: {
    percentage: number;
    amount: Money;
    code: string;
    validUntil: Date;
  };
  
  // Final calculations
  finalPrice: Money;
  savingsAmount?: Money;
  savingsPercentage?: number;
  
  // Metadata
  currency: string;
  displayCurrency: string;
  fraudDetected: boolean;
  eligibleForPromotion: boolean;
  pricingCountry: string;
  pricingStrategy: 'base' | 'geographical' | 'promotional' | 'combined';
}

export interface CheckoutSessionOptions {
  tierId: TierID;
  interval: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  pricingContext: UnifiedPricingContext;
  applyPromotion?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Unified Pricing Service - Single source of truth for all pricing operations
 */
export class UnifiedPricingService {
  private dynamicPricingEngine: DynamicPricingEngine;
  private geoEngine: GeographicalContextEngine;
  private manipulationDetector: PriceManipulationDetector;
  
  constructor() {
    // Initialize smart-fiat-payments engines
    const pricingStrategy: PricingStrategy = {
      baseCountry: 'US',
      baseCurrency: 'USD',
      enableGeographicalPricing: true,
      blockVPNDiscounts: false,
      displayLocalCurrency: true,
      roundingStrategy: 'nearest',
    };
    
    this.dynamicPricingEngine = new DynamicPricingEngine({
      strategy: pricingStrategy,
      enableManipulationDetection: true,
      minimumPrice: { amount: 100, currency: 'USD', display: '$1.00' },
    });
    
    this.geoEngine = new GeographicalContextEngine({
      enableVPNDetection: true,
      enableProxyDetection: true,
      enableDataCenterDetection: true,
      cacheResults: true,
      cacheTTL: 3600,
    });
    
    this.manipulationDetector = new PriceManipulationDetector();
  }

  /**
   * Calculate unified pricing with all adjustments
   */
  async calculatePrice(context: UnifiedPricingContext): Promise<UnifiedPriceResult> {
    try {
      // Get tier configuration
      const tier = PricingHelpers.getTierById(context.tierId);
      if (!tier) {
        throw new Error(`Invalid tier ID: ${context.tierId}`);
      }

      // Get base price
      const basePrice = context.interval === 'monthly' 
        ? tier.pricing.monthly 
        : tier.pricing.yearly;

      // Create Money object for base price
      const baseMoney: Money = {
        amount: basePrice,
        currency: UNIFIED_PRICING_CONFIG.currency,
        display: PricingHelpers.formatPrice(basePrice),
      };

      // Get geographical context
      const geoContext = await this.getGeographicalContext(context);
      
      // Detect price manipulation
      const fraudDetected = this.detectManipulation(geoContext, context);

      // Determine pricing country
      const pricingCountry = this.determinePricingCountry(
        context.cardCountry,
        context.ipCountry,
        context.vpnDetected,
        fraudDetected
      );

      // Initialize result
      let result: UnifiedPriceResult = {
        tier,
        basePrice: baseMoney,
        displayPrice: baseMoney,
        finalPrice: baseMoney,
        currency: UNIFIED_PRICING_CONFIG.currency,
        displayCurrency: this.getDisplayCurrency(pricingCountry),
        fraudDetected,
        eligibleForPromotion: false,
        pricingCountry,
        pricingStrategy: 'base',
      };

      // Apply promotional pricing if eligible
      if (this.isEligibleForPromotion(context, fraudDetected)) {
        result = this.applyPromotionalPricing(result, context);
      }

      // Apply geographical pricing if no fraud detected
      if (!fraudDetected && UNIFIED_PRICING_CONFIG.tiers[context.tierId].id !== 'free') {
        result = await this.applyGeographicalPricing(result, context, pricingCountry);
      }

      // Calculate final price and savings
      result = this.calculateFinalPrice(result);

      // Convert to display currency if needed
      if (result.displayCurrency !== result.currency) {
        result.displayPrice = this.convertToDisplayCurrency(
          result.finalPrice,
          result.displayCurrency
        );
      }

      logger.info('Unified price calculated', {
        tierId: context.tierId,
        interval: context.interval,
        basePrice: result.basePrice.amount,
        finalPrice: result.finalPrice.amount,
        pricingCountry,
        strategy: result.pricingStrategy,
      });

      return result;
    } catch (error) {
      logger.error('Error calculating unified price', { error, context });
      throw error;
    }
  }

  /**
   * Create Stripe checkout session with unified pricing
   */
  async createCheckoutSession(options: CheckoutSessionOptions): Promise<{
    sessionId: string;
    sessionUrl: string;
    pricing: UnifiedPriceResult;
  }> {
    try {
      // Calculate pricing
      const pricing = await this.calculatePrice(options.pricingContext);

      // Determine which Stripe price ID to use
      const stripePriceId = this.getStripePriceId(
        pricing.tier,
        options.interval,
        pricing.eligibleForPromotion && options.applyPromotion !== false
      );

      if (!stripePriceId) {
        throw new Error(`No Stripe price ID configured for ${options.tierId} ${options.interval}`);
      }

      // Create checkout session
      const session = await enhancedStripeService.createCheckoutSession({
        planId: options.tierId as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        userId: options.userId,
        userEmail: options.userEmail,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        applyPromotion: pricing.eligibleForPromotion && options.applyPromotion !== false,
        metadata: {
          ...options.metadata,
          pricingCountry: pricing.pricingCountry,
          pricingStrategy: pricing.pricingStrategy,
          finalPriceUSD: pricing.finalPrice.amount.toString(),
          savingsPercentage: pricing.savingsPercentage?.toString() || '0',
        },
      });

      logger.info('Checkout session created with unified pricing', {
        sessionId: session.id,
        tierId: options.tierId,
        interval: options.interval,
        pricing: {
          basePrice: pricing.basePrice.amount,
          finalPrice: pricing.finalPrice.amount,
          strategy: pricing.pricingStrategy,
        },
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        pricing,
      };
    } catch (error) {
      logger.error('Error creating checkout session', { error, options });
      throw error;
    }
  }

  /**
   * Get pricing for display (e.g., pricing page)
   */
  async getPricingForDisplay(
    ipCountry?: string | null,
    _currency?: string
  ): Promise<Record<TierID, UnifiedPriceResult>> {
    const results: Partial<Record<TierID, UnifiedPriceResult>> = {};

    for (const tierId of Object.keys(UNIFIED_PRICING_CONFIG.tiers) as TierID[]) {
      const monthlyPrice = await this.calculatePrice({
        tierId,
        interval: 'monthly',
        ipCountry,
      });
      
      results[tierId] = monthlyPrice;
    }

    return results as Record<TierID, UnifiedPriceResult>;
  }

  // Private helper methods

  private getGeographicalContext(
    context: UnifiedPricingContext
  ): Promise<GeographicalContext | null> {
    if (!context.ipCountry) return null;

    // In production, this would use the real GeographicalContextEngine
    // For now, return a simplified context
    return {
      ipCountry: context.ipCountry,
      ipCurrency: this.getCurrencyForCountry(context.ipCountry),
      vpnDetected: context.vpnDetected || false,
      vpnConfidence: context.vpnDetected ? 0.8 : 0,
      proxyDetected: false,
      timezone: 'UTC',
      language: 'en',
      suspiciousActivity: false,
      riskScore: context.vpnDetected ? 30 : 0,
    };
  }

  private detectManipulation(
    geoContext: GeographicalContext | null,
    context: UnifiedPricingContext
  ): boolean {
    if (!geoContext) return false;

    // Simplified fraud detection
    // In production, would use the full PriceManipulationDetector
    const suspiciousFactors = [
      context.vpnDetected && context.cardCountry !== context.ipCountry,
      geoContext.riskScore > 50,
      geoContext.suspiciousActivity,
    ];

    return suspiciousFactors.filter(Boolean).length >= 2;
  }

  private determinePricingCountry(
    cardCountry?: string,
    ipCountry?: string | null,
    vpnDetected?: boolean,
    fraudDetected?: boolean
  ): string {
    if (fraudDetected) {
      return 'US'; // Default to US pricing if fraud detected
    }

    if (cardCountry) {
      return cardCountry; // Card country is most reliable
    }

    if (ipCountry && !vpnDetected) {
      return ipCountry; // IP country if no VPN
    }

    return 'US'; // Default
  }

  private isEligibleForPromotion(
    context: UnifiedPricingContext,
    fraudDetected: boolean
  ): boolean {
    if (fraudDetected) return false;
    if (context.tierId === 'free') return false;
    
    const { promotion } = UNIFIED_PRICING_CONFIG;
    if (!promotion.enabled) return false;
    if (new Date() > promotion.validUntil) return false;
    
    // Check if user has already used promotion
    // This would check database in production
    
    return context.forcePromotion || true; // For now, everyone is eligible
  }

  private applyPromotionalPricing(
    result: UnifiedPriceResult,
    context: UnifiedPricingContext
  ): UnifiedPriceResult {
    const tier = result.tier;
    const { promotion } = UNIFIED_PRICING_CONFIG;
    
    if (!tier.pricing.promotional) return result;

    const promotionalPrice = context.interval === 'monthly'
      ? tier.pricing.promotional.monthly
      : tier.pricing.promotional.yearly;

    const discountAmount = result.basePrice.amount - promotionalPrice;

    return {
      ...result,
      promotionalDiscount: {
        percentage: promotion.discountPercentage,
        amount: {
          amount: discountAmount,
          currency: result.currency,
          display: PricingHelpers.formatPrice(discountAmount),
        },
        code: promotion.code,
        validUntil: promotion.validUntil,
      },
      eligibleForPromotion: true,
      pricingStrategy: 'promotional',
    };
  }

  private async applyGeographicalPricing(
    result: UnifiedPriceResult,
    context: UnifiedPricingContext,
    _pricingCountry: string
  ): Promise<UnifiedPriceResult> {
    // Use the DynamicPricingEngine for geographical adjustments
    const pricingContext: PricingContext = {
      basePrice: result.basePrice,
      cardCountry: context.cardCountry,
      ipCountry: context.ipCountry,
      vpnDetected: context.vpnDetected,
      customer: context.user ? {
        id: context.user.id,
        email: context.user.email || '',
        accountCreatedAt: new Date(context.user.created_at),
      } as Customer : undefined,
    };

    const geoPrice = await this.dynamicPricingEngine.calculatePrice(pricingContext);

    if (geoPrice.adjustment && geoPrice.adjustment.type === 'discount') {
      return {
        ...result,
        geographicalAdjustment: {
          percentage: geoPrice.adjustment.percentage * 100,
          amount: geoPrice.adjustment.amount,
          reason: geoPrice.adjustment.reason,
        },
        pricingStrategy: result.promotionalDiscount ? 'combined' : 'geographical',
      };
    }

    return result;
  }

  private calculateFinalPrice(result: UnifiedPriceResult): UnifiedPriceResult {
    let finalAmount = result.basePrice.amount;
    let totalSavings = 0;

    // Apply promotional discount first (if any)
    if (result.promotionalDiscount) {
      finalAmount -= result.promotionalDiscount.amount.amount;
      totalSavings += result.promotionalDiscount.amount.amount;
    }

    // Then apply geographical adjustment (if any)
    if (result.geographicalAdjustment) {
      const geoDiscount = result.basePrice.amount * (result.geographicalAdjustment.percentage / 100);
      finalAmount -= geoDiscount;
      totalSavings += geoDiscount;
    }

    // Ensure minimum price
    finalAmount = Math.max(finalAmount, 100); // Minimum $1

    const finalPrice: Money = {
      amount: Math.round(finalAmount),
      currency: result.currency,
      display: PricingHelpers.formatPrice(finalAmount),
    };

    const savingsAmount = totalSavings > 0 ? {
      amount: Math.round(totalSavings),
      currency: result.currency,
      display: PricingHelpers.formatPrice(totalSavings),
    } : undefined;

    const savingsPercentage = totalSavings > 0 
      ? Math.round((totalSavings / result.basePrice.amount) * 100)
      : undefined;

    return {
      ...result,
      finalPrice,
      savingsAmount,
      savingsPercentage,
    };
  }

  private getStripePriceId(
    tier: SubscriptionTier,
    interval: 'monthly' | 'yearly',
    usePromotional: boolean
  ): string | undefined {
    if (usePromotional) {
      return interval === 'monthly' 
        ? tier.stripePriceIds.monthlyPromo 
        : tier.stripePriceIds.yearlyPromo;
    }

    return interval === 'monthly' 
      ? tier.stripePriceIds.monthly 
      : tier.stripePriceIds.yearly;
  }

  private getCurrencyForCountry(country: string): string {
    const currencyMap: Record<string, string> = {
      US: 'USD',
      CA: 'CAD',
      MX: 'MXN',
      BR: 'BRL',
      AR: 'ARS',
      GB: 'GBP',
      DE: 'EUR',
      FR: 'EUR',
      ES: 'EUR',
      IT: 'EUR',
      IN: 'INR',
      CN: 'CNY',
      JP: 'JPY',
      AU: 'AUD',
    };

    return currencyMap[country] || 'USD';
  }

  private getDisplayCurrency(country: string): string {
    const currency = this.getCurrencyForCountry(country);
    return Object.keys(UNIFIED_PRICING_CONFIG.displayCurrencies).includes(currency)
      ? currency
      : 'USD';
  }

  private convertToDisplayCurrency(price: Money, targetCurrency: string): Money {
    const convertedAmount = PricingHelpers.convertToDisplayCurrency(
      price.amount,
      price.currency,
      targetCurrency
    );

    return {
      amount: convertedAmount,
      currency: targetCurrency,
      display: PricingHelpers.formatPrice(convertedAmount, targetCurrency),
    };
  }
}

// Singleton instance
export const unifiedPricingService = new UnifiedPricingService();

// Convenience exports
export const calculatePrice = (context: UnifiedPricingContext) => 
  unifiedPricingService.calculatePrice(context);

export const createCheckoutSession = (options: CheckoutSessionOptions) =>
  unifiedPricingService.createCheckoutSession(options);

export const getPricingForDisplay = (ipCountry?: string | null, currency?: string) =>
  unifiedPricingService.getPricingForDisplay(ipCountry, currency);