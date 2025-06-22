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
 * Dynamic Pricing Engine
 * 
 * Implements geographical pricing with fraud prevention
 */

import currency from 'currency.js';
import {
  Money,
  PricingContext,
  PriceCalculation,
  PriceAdjustment,
  Discount,
  PricingReason,
  GeographicalContext,
  CardInfo,
  Customer,
  PricingStrategy,
} from '../types';
import { PriceManipulationDetector } from '../geo/price-manipulation';

// PPP (Purchasing Power Parity) indices by country
const PPP_INDICES: Record<string, number> = {
  // North America
  US: 1.0,
  CA: 0.85,
  MX: 0.45,
  
  // South America
  BR: 0.35,
  AR: 0.30,
  CL: 0.55,
  CO: 0.40,
  PE: 0.45,
  UY: 0.60,
  
  // Europe
  GB: 0.95,
  DE: 0.90,
  FR: 0.88,
  ES: 0.75,
  IT: 0.78,
  NL: 0.92,
  SE: 0.95,
  NO: 1.10,
  CH: 1.20,
  PL: 0.50,
  CZ: 0.55,
  HU: 0.48,
  RO: 0.42,
  
  // Asia
  JP: 0.85,
  KR: 0.80,
  CN: 0.50,
  IN: 0.25,
  ID: 0.35,
  TH: 0.45,
  VN: 0.30,
  PH: 0.35,
  MY: 0.48,
  SG: 0.90,
  HK: 0.95,
  TW: 0.70,
  
  // Middle East & Africa
  AE: 0.85,
  SA: 0.70,
  IL: 0.88,
  TR: 0.35,
  EG: 0.30,
  ZA: 0.45,
  NG: 0.35,
  KE: 0.38,
  MA: 0.42,
  
  // Oceania
  AU: 0.95,
  NZ: 0.85,
};

// Discount policies
const DISCOUNT_POLICIES: Discount[] = [
  {
    id: 'geo_emerging_markets',
    type: 'geographical',
    amount: 50, // 50% off
    eligibility: {
      countries: ['IN', 'ID', 'PH', 'VN', 'BD', 'PK', 'NG', 'EG'],
    },
    validUntil: new Date('2025-12-31'),
  },
  {
    id: 'geo_latam',
    type: 'geographical',
    amount: 40, // 40% off
    eligibility: {
      countries: ['BR', 'MX', 'AR', 'CO', 'CL', 'PE'],
    },
    validUntil: new Date('2025-12-31'),
  },
  {
    id: 'student_global',
    type: 'student',
    amount: 50, // 50% off
    eligibility: {
      requiresVerification: true,
    },
    validUntil: new Date('2025-12-31'),
  },
];

export interface DynamicPricingConfig {
  strategy: PricingStrategy;
  enableManipulationDetection?: boolean;
  customPPPIndices?: Record<string, number>;
  customDiscounts?: Discount[];
  minimumPrice?: Money;
}

/**
 * Dynamic pricing engine with geographical optimization
 */
export class DynamicPricingEngine {
  private manipulationDetector: PriceManipulationDetector;
  private pppIndices: Record<string, number>;
  private discounts: Discount[];
  
  constructor(private config: DynamicPricingConfig) {
    this.manipulationDetector = new PriceManipulationDetector();
    this.pppIndices = { ...PPP_INDICES, ...(config.customPPPIndices || {}) };
    this.discounts = [...DISCOUNT_POLICIES, ...(config.customDiscounts || [])];
  }
  
  /**
   * Calculate dynamic price based on context
   */
  async calculatePrice(context: PricingContext): Promise<PriceCalculation> {
    const { basePrice, cardCountry, ipCountry, vpnDetected, customer } = context;
    
    // Check for price manipulation
    let manipulationDetected = false;
    if (this.config.enableManipulationDetection !== false && (cardCountry || ipCountry)) {
      const geoContext: GeographicalContext = {
        ipCountry,
        ipCurrency: this.getCurrencyForCountry(ipCountry || 'US'),
        vpnDetected,
        vpnConfidence: vpnDetected ? 0.8 : 0,
        proxyDetected: false,
        timezone: 'UTC',
        language: 'en',
        suspiciousActivity: false,
        riskScore: vpnDetected ? 50 : 0,
      };
      
      const cardInfo: CardInfo | null = cardCountry ? {
        bin: '000000',
        brand: 'unknown',
        type: 'credit',
        issuerCountry: cardCountry,
        supportedGateways: [],
        features: {
          supports3DSecure: true,
          supportsInstallments: false,
          supportsTokenization: true,
          requiresCVV: true,
        },
      } : null;
      
      const manipulationCheck = this.manipulationDetector.detectManipulation(
        geoContext,
        cardInfo,
        customer || null,
        ipCountry
      );
      
      manipulationDetected = manipulationCheck.detected && manipulationCheck.confidence > 0.6;
    }
    
    // Determine pricing country
    const pricingCountry = this.determinePricingCountry(
      cardCountry,
      ipCountry,
      vpnDetected,
      manipulationDetected
    );
    
    // Get eligible discounts
    const eligibleDiscounts = this.getEligibleDiscounts(
      pricingCountry,
      customer,
      manipulationDetected
    );
    
    // Calculate price adjustment
    const adjustment = this.calculateAdjustment(
      basePrice,
      pricingCountry,
      eligibleDiscounts,
      manipulationDetected
    );
    
    // Apply adjustment
    const displayPrice = this.applyAdjustment(basePrice, adjustment);
    
    // Get display currency
    const displayCurrency = this.getDisplayCurrency(pricingCountry);
    
    // Convert to display currency if needed
    const convertedPrice = await this.convertCurrency(displayPrice, displayCurrency);
    
    // Calculate savings
    const savingsAmount = adjustment.type === 'discount' ? adjustment.amount : undefined;
    
    // Generate reasoning
    const reasoning = this.generateReasoning(
      pricingCountry,
      cardCountry,
      ipCountry,
      vpnDetected,
      manipulationDetected,
      adjustment
    );
    
    return {
      displayPrice: convertedPrice,
      displayCurrency,
      basePrice,
      adjustment: adjustment.type !== 'none' ? adjustment : undefined,
      cardCountryPrice: cardCountry ? await this.getCountryPrice(basePrice, cardCountry) : undefined,
      reasoning,
      discountApplied: adjustment.type === 'discount',
      savingsAmount,
      eligibleDiscounts,
    };
  }
  
  /**
   * Get price for a specific country
   */
  async getCountryPrice(basePrice: Money, country: string): Promise<Money> {
    const pppIndex = this.pppIndices[country] || 1.0;
    const adjustedAmount = basePrice.amount * pppIndex;
    
    // Apply rounding strategy
    const rounded = this.applyRounding(adjustedAmount);
    
    // Ensure minimum price
    const finalAmount = this.ensureMinimumPrice(rounded);
    
    const currency = this.getCurrencyForCountry(country);
    const converted = await this.convertCurrency(
      { ...basePrice, amount: finalAmount },
      currency
    );
    
    return converted;
  }
  
  /**
   * Validate a discount code
   */
  validateDiscountCode(code: string, context: PricingContext): Discount | null {
    // This would connect to a discount code system
    // For demo, we'll check against predefined codes
    const discountCodes: Record<string, Discount> = {
      'STUDENT50': {
        id: 'student_code',
        type: 'student',
        amount: 50,
        eligibility: { requiresVerification: true },
      },
      'LAUNCH20': {
        id: 'launch_promo',
        type: 'promotional',
        amount: 20,
        eligibility: {},
        validUntil: new Date('2024-12-31'),
      },
    };
    
    const discount = discountCodes[code.toUpperCase()];
    if (!discount) return null;
    
    // Check validity
    if (discount.validUntil && new Date() > discount.validUntil) {
      return null;
    }
    
    // Check eligibility
    if (!this.isEligibleForDiscount(discount, context)) {
      return null;
    }
    
    return discount;
  }
  
  // Private methods
  
  private determinePricingCountry(
    cardCountry?: string,
    ipCountry?: string | null,
    vpnDetected?: boolean,
    manipulationDetected?: boolean
  ): string {
    // If manipulation detected, use more conservative pricing
    if (manipulationDetected) {
      // Prefer card country as it's harder to fake
      if (cardCountry) return cardCountry;
      // Otherwise use base country
      return this.config.strategy.baseCountry;
    }
    
    // If VPN detected but not manipulation, still consider the request
    if (vpnDetected && cardCountry && ipCountry && cardCountry !== ipCountry) {
      // Use card country for pricing
      return cardCountry;
    }
    
    // Normal flow: prefer card country, then IP country
    return cardCountry || ipCountry || this.config.strategy.baseCountry;
  }
  
  private getEligibleDiscounts(
    country: string,
    customer?: Customer,
    manipulationDetected?: boolean
  ): Discount[] {
    if (manipulationDetected && this.config.strategy.blockVPNDiscounts) {
      return []; // No discounts for suspected manipulation
    }
    
    return this.discounts.filter(discount => {
      // Check country eligibility
      if (discount.eligibility.countries && 
          !discount.eligibility.countries.includes(country)) {
        return false;
      }
      
      // Check account age
      if (discount.eligibility.minAccountAge && customer) {
        const accountAge = this.getAccountAgeInDays(customer.accountCreatedAt);
        if (accountAge < discount.eligibility.minAccountAge) {
          return false;
        }
      }
      
      // Check validity
      if (discount.validUntil && new Date() > discount.validUntil) {
        return false;
      }
      
      return true;
    });
  }
  
  private calculateAdjustment(
    basePrice: Money,
    country: string,
    eligibleDiscounts: Discount[],
    manipulationDetected: boolean
  ): PriceAdjustment {
    if (manipulationDetected) {
      return { type: 'none', percentage: 0, amount: basePrice, reason: 'Price manipulation detected' };
    }
    
    // Get PPP adjustment
    const pppIndex = this.pppIndices[country] || 1.0;
    const pppAdjustment = 1 - pppIndex;
    
    // Get best discount
    const bestDiscount = eligibleDiscounts.reduce((best, current) => 
      current.amount > best.amount ? current : best,
      { amount: 0 } as Discount
    );
    
    // Use the better of PPP or discount
    let adjustmentPercentage = Math.max(pppAdjustment, bestDiscount.amount / 100);
    
    // Apply strategy rules
    if (!this.config.strategy.enableGeographicalPricing) {
      adjustmentPercentage = bestDiscount.amount / 100; // Only promotional discounts
    }
    
    if (adjustmentPercentage === 0) {
      return { type: 'none', percentage: 0, amount: basePrice, reason: 'No adjustment applicable' };
    }
    
    const adjustmentAmount = basePrice.amount * adjustmentPercentage;
    
    return {
      type: adjustmentPercentage > 0 ? 'discount' : 'markup',
      percentage: Math.abs(adjustmentPercentage),
      amount: {
        amount: Math.abs(adjustmentAmount),
        currency: basePrice.currency,
        display: this.formatMoney(Math.abs(adjustmentAmount), basePrice.currency),
      },
      reason: bestDiscount.amount > 0 ? 
        `${bestDiscount.type} discount applied` : 
        `Geographical pricing for ${country}`,
    };
  }
  
  private applyAdjustment(basePrice: Money, adjustment: PriceAdjustment): Money {
    if (adjustment.type === 'none') {
      return basePrice;
    }
    
    const multiplier = adjustment.type === 'discount' 
      ? (1 - adjustment.percentage)
      : (1 + adjustment.percentage);
    
    const adjustedAmount = basePrice.amount * multiplier;
    const rounded = this.applyRounding(adjustedAmount);
    const final = this.ensureMinimumPrice(rounded);
    
    return {
      amount: final,
      currency: basePrice.currency,
      display: this.formatMoney(final, basePrice.currency),
    };
  }
  
  private applyRounding(amount: number): number {
    const strategy = this.config.strategy.roundingStrategy;
    
    switch (strategy) {
      case 'nearest':
        return Math.round(amount);
      case 'up':
        return Math.ceil(amount);
      case 'down':
        return Math.floor(amount);
      default:
        return amount;
    }
  }
  
  private ensureMinimumPrice(amount: number): number {
    if (!this.config.minimumPrice) {
      return amount;
    }
    
    return Math.max(amount, this.config.minimumPrice.amount);
  }
  
  private async convertCurrency(price: Money, targetCurrency: string): Promise<Money> {
    if (price.currency === targetCurrency) {
      return price;
    }
    
    // Simplified currency conversion
    // In production, would use real exchange rate API
    const rates: Record<string, Record<string, number>> = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        INR: 83,
        BRL: 5.0,
        MXN: 17,
        ARS: 350,
        JPY: 150,
        CNY: 7.2,
      },
    };
    
    const rate = rates[price.currency]?.[targetCurrency] || 1;
    const convertedAmount = currency(price.amount).multiply(rate).value;
    
    return {
      amount: convertedAmount,
      currency: targetCurrency,
      display: this.formatMoney(convertedAmount, targetCurrency),
    };
  }
  
  private getCurrencyForCountry(country: string): string {
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
    };
    
    return currencyMap[country] || 'USD';
  }
  
  private getDisplayCurrency(country: string): string {
    if (!this.config.strategy.displayLocalCurrency) {
      return this.config.strategy.baseCurrency;
    }
    
    return this.getCurrencyForCountry(country);
  }
  
  private generateReasoning(
    pricingCountry: string,
    cardCountry?: string,
    ipCountry?: string | null,
    vpnDetected?: boolean,
    manipulationDetected?: boolean,
    adjustment?: PriceAdjustment
  ): PricingReason {
    const factors: string[] = [];
    let applied: PricingReason['applied'] = 'base_price';
    let explanation = '';
    
    if (manipulationDetected) {
      applied = 'base_price';
      explanation = 'Base pricing applied due to security concerns';
      factors.push('Suspicious activity detected');
      
      if (vpnDetected) factors.push('VPN usage detected');
      if (cardCountry && ipCountry && cardCountry !== ipCountry) {
        factors.push('Location mismatch');
      }
    } else if (cardCountry && cardCountry === pricingCountry) {
      applied = 'card_country';
      explanation = `Pricing adjusted for ${cardCountry} based on your card`;
      factors.push('Card issuing country detected');
      
      if (adjustment && adjustment.type === 'discount') {
        factors.push(`${(adjustment.percentage * 100).toFixed(0)}% regional discount applied`);
      }
    } else if (ipCountry && ipCountry === pricingCountry) {
      applied = 'ip_country';
      explanation = `Pricing adjusted for ${ipCountry} based on your location`;
      factors.push('Geographic location detected');
      
      if (vpnDetected) {
        factors.push('VPN detected but not blocking discount');
      }
    } else {
      explanation = 'Standard pricing applied';
      factors.push('Default pricing region');
    }
    
    return { applied, explanation, factors };
  }
  
  private isEligibleForDiscount(discount: Discount, context: PricingContext): boolean {
    const { eligibility } = discount;
    
    // Country check
    if (eligibility.countries) {
      const country = context.cardCountry || context.ipCountry;
      if (!country || !eligibility.countries.includes(country)) {
        return false;
      }
    }
    
    // Customer checks
    if (context.customer) {
      if (eligibility.minAccountAge) {
        const age = this.getAccountAgeInDays(context.customer.accountCreatedAt);
        if (age < eligibility.minAccountAge) return false;
      }
    }
    
    return true;
  }
  
  private getAccountAgeInDays(createdAt: Date): number {
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  
  private formatMoney(amount: number, cur: string): string {
    return currency(amount, { symbol: cur }).format();
  }
}