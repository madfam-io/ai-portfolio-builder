/**
 * @madfam/smart-payments - Test Suite
 * 
 * Test suite for world-class payment gateway detection and routing system
 * 
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Dynamic Pricing Engine Test Suite
 * 
 * Tests for geographical pricing with fraud prevention
 */

import { DynamicPricingEngine } from '../../pricing/dynamic-pricing';
import { 
  PricingContext, 
  Money, 
  Customer, 
  PricingStrategy,
  Discount 
} from '../../types';

describe('DynamicPricingEngine', () => {
  let engine: DynamicPricingEngine;
  
  const basePrice: Money = {
    amount: 100,
    currency: 'USD',
    display: '$100.00',
  };

  const defaultStrategy: PricingStrategy = {
    enableGeographicalPricing: true,
    baseCountry: 'US',
    baseCurrency: 'USD',
    discounts: {},
    roundingStrategy: 'nearest',
    displayLocalCurrency: true,
  };

  beforeEach(() => {
    engine = new DynamicPricingEngine({
      strategy: defaultStrategy,
      enableManipulationDetection: true,
    });
  });

  describe('calculatePrice', () => {
    it('should apply US pricing for US customers', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
      };

      const result = await engine.calculatePrice(context);

      expect(result.displayPrice.amount).toBe(100);
      expect(result.displayCurrency).toBe('USD');
      expect(result.discountApplied).toBe(false);
      expect(result.reasoning.applied).toBe('card_country');
    });

    it('should apply geographical discount for India', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'IN',
        ipCountry: 'IN',
        vpnDetected: false,
      };

      const result = await engine.calculatePrice(context);

      expect(result.displayPrice.amount).toBeLessThan(basePrice.amount);
      expect(result.displayCurrency).toBe('INR');
      expect(result.discountApplied).toBe(true);
      expect(result.adjustment?.type).toBe('discount');
      expect(result.eligibleDiscounts).toContainEqual(
        expect.objectContaining({
          type: 'geographical',
          id: 'geo_emerging_markets',
        })
      );
    });

    it('should apply LATAM discount for Brazil', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'BR',
        ipCountry: 'BR',
        vpnDetected: false,
      };

      const result = await engine.calculatePrice(context);

      expect(result.displayPrice.amount).toBeLessThan(basePrice.amount);
      expect(result.displayCurrency).toBe('BRL');
      expect(result.discountApplied).toBe(true);
      expect(result.eligibleDiscounts).toContainEqual(
        expect.objectContaining({
          type: 'geographical',
          id: 'geo_latam',
        })
      );
    });

    it('should block discounts when manipulation detected', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'IN',
        vpnDetected: true,
      };

      const result = await engine.calculatePrice(context);

      expect(result.discountApplied).toBe(false);
      expect(result.displayPrice.amount).toBe(basePrice.amount);
      expect(result.reasoning.factors).toContain('Suspicious activity detected');
    });

    it('should use card country when VPN detected', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'MX',
        ipCountry: 'US',
        vpnDetected: true,
      };

      const result = await engine.calculatePrice(context);

      expect(result.reasoning.applied).toBe('card_country');
      expect(result.displayCurrency).toBe('MXN');
      expect(result.discountApplied).toBe(true);
    });

    it('should apply student discount when eligible', async () => {
      const studentCustomer: Customer = {
        id: 'student_123',
        accountCreatedAt: new Date('2023-01-01'),
        previousPurchases: 2,
        totalSpent: { amount: 50, currency: 'USD', display: '$50' },
      };

      const customDiscounts: Discount[] = [{
        id: 'student_verified',
        type: 'student',
        amount: 50,
        eligibility: { requiresVerification: true },
      }];

      const studentEngine = new DynamicPricingEngine({
        strategy: defaultStrategy,
        customDiscounts,
      });

      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
        customer: studentCustomer,
      };

      const result = await studentEngine.calculatePrice(context);

      expect(result.eligibleDiscounts).toContainEqual(
        expect.objectContaining({
          type: 'student',
          amount: 50,
        })
      );
    });

    it('should handle currency conversion', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'GB',
        ipCountry: 'GB',
        vpnDetected: false,
      };

      const result = await engine.calculatePrice(context);

      expect(result.displayCurrency).toBe('GBP');
      expect(result.displayPrice.currency).toBe('GBP');
      expect(result.displayPrice.amount).toBeLessThan(basePrice.amount); // GBP is stronger
    });

    it('should apply rounding strategy', async () => {
      const roundUpEngine = new DynamicPricingEngine({
        strategy: {
          ...defaultStrategy,
          roundingStrategy: 'up',
        },
      });

      const context: PricingContext = {
        basePrice: { amount: 99.49, currency: 'USD', display: '$99.49' },
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
      };

      const result = await roundUpEngine.calculatePrice(context);

      expect(result.displayPrice.amount).toBe(100);
    });

    it('should respect minimum price', async () => {
      const minPriceEngine = new DynamicPricingEngine({
        strategy: defaultStrategy,
        minimumPrice: { amount: 50, currency: 'USD', display: '$50' },
      });

      const context: PricingContext = {
        basePrice: { amount: 100, currency: 'USD', display: '$100' },
        cardCountry: 'BD', // 80% discount country
        ipCountry: 'BD',
        vpnDetected: false,
      };

      const result = await minPriceEngine.calculatePrice(context);

      expect(result.displayPrice.amount).toBeGreaterThanOrEqual(50);
    });

    it('should track eligible discounts even if not applied', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'IN',
        ipCountry: 'US',
        vpnDetected: true, // Will block discount
      };

      const result = await engine.calculatePrice(context);

      expect(result.eligibleDiscounts.length).toBeGreaterThan(0);
      expect(result.discountApplied).toBe(false);
    });
  });

  describe('getCountryPrice', () => {
    it('should calculate PPP-adjusted prices', async () => {
      const usPrice = await engine.getCountryPrice(basePrice, 'US');
      const inPrice = await engine.getCountryPrice(basePrice, 'IN');
      const brPrice = await engine.getCountryPrice(basePrice, 'BR');

      expect(usPrice.amount).toBe(100);
      expect(inPrice.amount).toBeLessThan(30); // ~25% of US price
      expect(brPrice.amount).toBeLessThan(40); // ~35% of US price
    });

    it('should handle unknown countries', async () => {
      const unknownPrice = await engine.getCountryPrice(basePrice, 'ZZ');
      
      expect(unknownPrice.amount).toBeLessThan(100); // Default 30% multiplier
      expect(unknownPrice.amount).toBeGreaterThan(20);
    });
  });

  describe('validateDiscountCode', () => {
    it('should validate known discount codes', () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
      };

      const discount = engine.validateDiscountCode('STUDENT50', context);

      expect(discount).toMatchObject({
        id: 'student_code',
        type: 'student',
        amount: 50,
      });
    });

    it('should reject expired discount codes', () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
      };

      const discount = engine.validateDiscountCode('LAUNCH20', context);

      // This code expired in 2024
      expect(discount).toBeNull();
    });

    it('should reject invalid discount codes', () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
      };

      const discount = engine.validateDiscountCode('INVALID123', context);

      expect(discount).toBeNull();
    });

    it('should be case-insensitive', () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
      };

      const discount1 = engine.validateDiscountCode('student50', context);
      const discount2 = engine.validateDiscountCode('STUDENT50', context);

      expect(discount1).toEqual(discount2);
    });
  });

  describe('manipulation detection', () => {
    it('should detect geographical arbitrage', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'IN',
        vpnDetected: true,
      };

      const result = await engine.calculatePrice(context);

      expect(result.reasoning.factors).toContain('VPN usage detected');
      expect(result.reasoning.factors).toContain('Location mismatch');
      expect(result.discountApplied).toBe(false);
    });

    it('should allow legitimate travel', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'CA',
        vpnDetected: false,
      };

      const result = await engine.calculatePrice(context);

      // Should use IP country pricing for legitimate travel
      expect(result.reasoning.applied).toBe('ip_country');
    });

    it('should respect strategy settings', async () => {
      const noBlockEngine = new DynamicPricingEngine({
        strategy: {
          ...defaultStrategy,
          blockVPNDiscounts: false,
        },
      });

      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'IN',
        vpnDetected: true,
      };

      const result = await noBlockEngine.calculatePrice(context);

      // Should allow discount even with VPN
      expect(result.discountApplied).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle no geographical pricing', async () => {
      const noGeoEngine = new DynamicPricingEngine({
        strategy: {
          ...defaultStrategy,
          enableGeographicalPricing: false,
        },
      });

      const context: PricingContext = {
        basePrice,
        cardCountry: 'IN',
        ipCountry: 'IN',
        vpnDetected: false,
      };

      const result = await noGeoEngine.calculatePrice(context);

      // Should still check for promotional discounts but not PPP
      expect(result.adjustment?.type).toBe('none');
    });

    it('should handle missing location data', async () => {
      const context: PricingContext = {
        basePrice,
        cardCountry: undefined,
        ipCountry: null,
        vpnDetected: false,
      };

      const result = await engine.calculatePrice(context);

      expect(result.displayPrice.amount).toBe(basePrice.amount);
      expect(result.reasoning.applied).toBe('base_price');
    });

    it('should handle customer with old account', async () => {
      const oldCustomer: Customer = {
        id: 'old_customer',
        accountCreatedAt: new Date('2020-01-01'),
        previousPurchases: 50,
        totalSpent: { amount: 5000, currency: 'USD', display: '$5000' },
      };

      const context: PricingContext = {
        basePrice,
        cardCountry: 'US',
        ipCountry: 'US',
        vpnDetected: false,
        customer: oldCustomer,
      };

      const result = await engine.calculatePrice(context);

      // Should not affect pricing for loyal customers
      expect(result.discountApplied).toBe(false);
    });
  });
});