/**
 * @madfam/smart-payments - Test Suite
 * 
 * Test suite for world-class payment gateway detection and routing system
 * 
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Integration Test Suite
 * 
 * End-to-end tests for the complete smart payments flow
 */

import { SmartPayments } from '../smart-payments';
import { SmartPaymentsConfig } from '../types';

describe('SmartPayments Integration', () => {
  let smartPayments: SmartPayments;

  const config: SmartPaymentsConfig = {
    gateways: [],
    pricingStrategy: {
      enableGeographicalPricing: true,
      baseCountry: 'US',
      baseCurrency: 'USD',
      discounts: {},
      roundingStrategy: 'nearest',
      displayLocalCurrency: true,
    },
    fraudPrevention: {
      enableVPNDetection: true,
      blockVPNDiscounts: true,
      requireCardCountryMatch: false,
      maxRiskScore: 75,
    },
  };

  beforeEach(() => {
    smartPayments = new SmartPayments(config);
  });

  describe('End-to-end payment flows', () => {
    it('should process US card payment successfully', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 100, currency: 'USD', display: '$100' },
        cardNumber: '4111111111111111',
        ipAddress: '8.8.8.8',
      });

      expect(result).toMatchObject({
        paymentOptions: expect.objectContaining({
          recommendedGateway: expect.objectContaining({
            gateway: 'stripe',
            fees: expect.any(Object),
            estimatedTotal: expect.any(Object),
          }),
          userChoice: expect.any(Boolean),
        }),
        cardInfo: expect.objectContaining({
          brand: 'visa',
          issuerCountry: 'US',
        }),
        geoContext: expect.objectContaining({
          ipCountry: 'US',
          vpnDetected: false,
        }),
        pricing: expect.objectContaining({
          displayCurrency: 'USD',
          discountApplied: false,
        }),
      });
    });

    it('should apply geographical discount for Brazilian card', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 100, currency: 'USD', display: '$100' },
        cardNumber: '5162590000000000',
        ipAddress: '200.0.0.1', // Mock Brazilian IP
      });

      expect(result.cardInfo?.issuerCountry).toBe('BR');
      expect(result.pricing.displayCurrency).toBe('BRL');
      expect(result.pricing.discountApplied).toBe(true);
      expect(result.pricing.displayPrice.amount).toBeLessThan(100);
      expect(result.paymentOptions.recommendedGateway.gateway).toBe('mercadopago');
    });

    it('should detect and handle VPN usage', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 100, currency: 'USD', display: '$100' },
        cardNumber: '4111111111111111',
        ipAddress: '104.200.50.123', // VPN IP
      });

      expect(result.geoContext?.vpnDetected).toBe(true);
      expect(result.riskAssessment).toBeDefined();
      expect(result.riskAssessment?.factors).toContainEqual(
        expect.objectContaining({
          type: 'vpn_detected',
        })
      );
      expect(result.warnings).toBeDefined();
    });

    it('should handle high-risk transaction with 3D Secure preference', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 1000, currency: 'USD', display: '$1,000' },
        ipAddress: '197.210.0.1', // Nigerian IP (high risk)
      });

      expect(result.riskAssessment?.risk).toMatch(/high|critical/);
      expect(
        result.paymentOptions.recommendedGateway.supportedFeatures
      ).toContain('3D Secure');
    });

    it('should offer installments for eligible LATAM cards', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 1000, currency: 'MXN', display: '$1,000 MXN' },
        cardNumber: '5470740000000000', // Mexican card
        ipAddress: '201.0.0.1', // Mexican IP
      });

      expect(result.cardInfo?.issuerCountry).toBe('MX');
      expect(result.paymentOptions.recommendedGateway.installmentOptions).toBeDefined();
      expect(result.paymentOptions.recommendedGateway.installmentOptions).toHaveLength(3);
    });

    it('should respect customer preferences', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 50, currency: 'USD', display: '$50' },
        customer: {
          id: 'cust_123',
          accountCreatedAt: new Date(),
          previousPurchases: 5,
          totalSpent: { amount: 500, currency: 'USD', display: '$500' },
          preferences: {
            preferredGateway: 'paypal',
          },
        },
      });

      expect(result.paymentOptions.reasoning.factors).toContainEqual(
        expect.objectContaining({
          factor: 'customer_preference',
          impact: 'positive',
        })
      );
    });

    it('should handle missing data gracefully', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 100, currency: 'USD', display: '$100' },
        // No card number, no IP
      });

      expect(result.paymentOptions).toBeDefined();
      expect(result.pricing).toBeDefined();
      expect(result.warnings).not.toContain('critical error');
    });

    it('should validate discount codes', async () => {
      const isValid = smartPayments.validateDiscountCode('STUDENT50', {
        amount: { amount: 100, currency: 'USD', display: '$100' },
      });

      expect(isValid).toBe(true);
    });

    it('should calculate gateway fees accurately', () => {
      const fees = smartPayments.calculateGatewayFees(
        'stripe',
        { amount: 100, currency: 'USD', display: '$100' },
        true // international
      );

      expect(fees.percentageFee.amount).toBe(2.9);
      expect(fees.fixedFee.amount).toBe(0.30);
      expect(fees.internationalFee?.amount).toBe(1);
      expect(fees.totalFee.amount).toBe(4.20);
    });

    it('should provide correct available gateways by country', () => {
      const brazilGateways = smartPayments.getAvailableGateways('BR');
      const indiaGateways = smartPayments.getAvailableGateways('IN');
      const usGateways = smartPayments.getAvailableGateways('US');

      expect(brazilGateways).toContain('mercadopago');
      expect(brazilGateways).toContain('stripe');
      
      expect(indiaGateways).toContain('razorpay');
      expect(indiaGateways).not.toContain('mercadopago');
      
      expect(usGateways).toContain('stripe');
      expect(usGateways).not.toContain('razorpay');
    });
  });

  describe('Performance', () => {
    it('should process payments within 200ms', async () => {
      const start = Date.now();
      
      await smartPayments.processPayment({
        amount: { amount: 100, currency: 'USD', display: '$100' },
        cardNumber: '4111111111111111',
        ipAddress: '8.8.8.8',
      });
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should cache repeated lookups', async () => {
      // First call
      const start1 = Date.now();
      await smartPayments.lookupBIN('411111');
      const duration1 = Date.now() - start1;
      
      // Second call (cached)
      const start2 = Date.now();
      await smartPayments.lookupBIN('411111');
      const duration2 = Date.now() - start2;
      
      // Cached call should be much faster
      expect(duration2).toBeLessThan(duration1 / 2);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid card numbers gracefully', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 100, currency: 'USD', display: '$100' },
        cardNumber: 'invalid-card',
        ipAddress: '8.8.8.8',
      });

      expect(result.warnings).toContain('Could not detect card information');
      expect(result.paymentOptions).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      const result = await smartPayments.processPayment({
        amount: { amount: 100, currency: 'USD', display: '$100' },
        ipAddress: 'invalid-ip',
      });

      expect(result.paymentOptions).toBeDefined();
      expect(result.pricing).toBeDefined();
    });
  });
});