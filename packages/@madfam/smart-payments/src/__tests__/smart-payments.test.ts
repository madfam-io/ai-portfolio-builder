/**
 * @madfam/smart-payments - Test Suite
 * 
 * Test suite for world-class payment gateway detection and routing system
 * 
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * SmartPayments Orchestrator Test Suite
 * 
 * Integration tests for the main SmartPayments class
 */

import { SmartPayments, ProcessPaymentRequest } from '../smart-payments';
import { 
  SmartPaymentsConfig, 
  Money, 
  Customer,
  Gateway,
  SmartPaymentsError
} from '../types';

describe('SmartPayments', () => {
  let smartPayments: SmartPayments;

  const defaultConfig: SmartPaymentsConfig = {
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
    ui: {
      showSavingsAmount: true,
      showProcessingTime: true,
      showGatewayLogos: true,
      showFeeBreakdown: true,
    },
    cache: {
      enableBINCache: true,
      enableGeoCache: true,
      ttl: 300,
      maxSize: 1000,
    },
  };

  beforeEach(() => {
    smartPayments = new SmartPayments(defaultConfig);
  });

  describe('processPayment', () => {
    const baseRequest: ProcessPaymentRequest = {
      amount: { amount: 100, currency: 'USD', display: '$100' },
      ipAddress: '8.8.8.8',
    };

    it('should process payment without card number', async () => {
      const response = await smartPayments.processPayment(baseRequest);

      expect(response.paymentOptions).toBeDefined();
      expect(response.paymentOptions.recommendedGateway).toBeDefined();
      expect(response.pricing).toBeDefined();
      expect(response.geoContext).toBeDefined();
    });

    it('should process payment with card number', async () => {
      const request: ProcessPaymentRequest = {
        ...baseRequest,
        cardNumber: '4111111111111111',
      };

      const response = await smartPayments.processPayment(request);

      expect(response.cardInfo).toBeDefined();
      expect(response.cardInfo?.brand).toBe('visa');
      expect(response.cardInfo?.issuerCountry).toBe('US');
    });

    it('should detect and handle VPN usage', async () => {
      const request: ProcessPaymentRequest = {
        ...baseRequest,
        ipAddress: '104.200.50.123', // VPN IP
      };

      const response = await smartPayments.processPayment(request);

      expect(response.geoContext?.vpnDetected).toBe(true);
      expect(response.riskAssessment).toBeDefined();
      expect(response.warnings).toBeDefined();
    });

    it('should calculate geographical pricing', async () => {
      const request: ProcessPaymentRequest = {
        ...baseRequest,
        cardNumber: '5162590000000000', // Brazilian card
        ipAddress: '200.0.0.1', // Brazilian IP (mock)
      };

      const response = await smartPayments.processPayment(request);

      expect(response.pricing.displayCurrency).toBe('BRL');
      expect(response.pricing.discountApplied).toBe(true);
      expect(response.pricing.eligibleDiscounts).toHaveLength(1);
    });

    it('should handle customer preferences', async () => {
      const customer: Customer = {
        id: 'cust_123',
        accountCreatedAt: new Date('2023-01-01'),
        previousPurchases: 10,
        totalSpent: { amount: 1000, currency: 'USD', display: '$1000' },
        preferences: {
          preferredGateway: 'paypal',
          preferredCurrency: 'EUR',
        },
      };

      const request: ProcessPaymentRequest = {
        ...baseRequest,
        customer,
      };

      const response = await smartPayments.processPayment(request);

      // PayPal should be considered in routing
      expect(response.paymentOptions.reasoning.factors).toContainEqual(
        expect.objectContaining({
          factor: 'customer_preference',
        })
      );
    });

    it('should handle high-risk transactions', async () => {
      const request: ProcessPaymentRequest = {
        ...baseRequest,
        ipAddress: '197.210.0.1', // Nigerian IP (mock)
      };

      const response = await smartPayments.processPayment(request);

      expect(response.riskAssessment?.risk).toMatch(/high|critical/);
      expect(response.warnings).toContain(response.riskAssessment?.recommendation);
    });

    it('should include headers in context building', async () => {
      const request: ProcessPaymentRequest = {
        ...baseRequest,
        headers: {
          'accept-language': 'es-MX,es;q=0.9',
          'x-timezone': 'America/Mexico_City',
        },
      };

      const response = await smartPayments.processPayment(request);

      expect(response.geoContext?.language).toBe('es');
      expect(response.geoContext?.timezone).toBe('America/Mexico_City');
    });

    it('should handle errors gracefully', async () => {
      const request: ProcessPaymentRequest = {
        ...baseRequest,
        cardNumber: 'invalid-card',
      };

      const response = await smartPayments.processPayment(request);

      expect(response.warnings).toContain('Could not detect card information');
      expect(response.paymentOptions).toBeDefined(); // Should still work
    });

    it('should apply business rules for 3D Secure', async () => {
      const request: ProcessPaymentRequest = {
        ...baseRequest,
        ipAddress: '104.200.50.123', // VPN IP for high risk
      };

      const response = await smartPayments.processPayment(request);

      // Should prefer 3D Secure capable gateways
      expect(
        response.paymentOptions.recommendedGateway.supportedFeatures
      ).toContain('3D Secure');
    });

    it('should check transaction limits', async () => {
      const request: ProcessPaymentRequest = {
        amount: { amount: 10000, currency: 'USD', display: '$10,000' },
        ipAddress: '8.8.8.8',
      };

      const response = await smartPayments.processPayment(request);

      // PayPal has $10k limit
      if (response.paymentOptions.recommendedGateway.gateway === 'paypal') {
        expect(response.warnings).toContain('Transaction amount exceeds gateway limit');
      }
    });
  });

  describe('lookupBIN', () => {
    it('should lookup BIN information', async () => {
      const response = await smartPayments.lookupBIN('411111');

      expect(response.success).toBe(true);
      expect(response.cardInfo).toBeDefined();
      expect(response.cardInfo?.brand).toBe('visa');
    });

    it('should handle invalid BIN', async () => {
      const response = await smartPayments.lookupBIN('123');

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('lookupGeo', () => {
    it('should lookup geographical information', async () => {
      const response = await smartPayments.lookupGeo('8.8.8.8');

      expect(response.success).toBe(true);
      expect(response.context).toBeDefined();
      expect(response.context?.ipCountry).toBe('US');
    });

    it('should include headers in lookup', async () => {
      const headers = {
        'accept-language': 'ja-JP',
      };

      const response = await smartPayments.lookupGeo('8.8.8.8', headers);

      expect(response.context?.language).toBe('ja');
    });
  });

  describe('calculateGatewayFees', () => {
    it('should calculate fees for specific gateway', () => {
      const amount: Money = { amount: 100, currency: 'USD', display: '$100' };
      
      const fees = smartPayments.calculateGatewayFees('stripe', amount);

      expect(fees.percentageFee.amount).toBe(2.9);
      expect(fees.fixedFee.amount).toBe(0.30);
      expect(fees.totalFee.amount).toBe(3.20);
    });

    it('should calculate international fees', () => {
      const amount: Money = { amount: 100, currency: 'USD', display: '$100' };
      
      const fees = smartPayments.calculateGatewayFees('stripe', amount, true);

      expect(fees.internationalFee).toBeDefined();
      expect(fees.totalFee.amount).toBeGreaterThan(3.20);
    });
  });

  describe('getAvailableGateways', () => {
    it('should return gateways for specific country', () => {
      const gateways = smartPayments.getAvailableGateways('BR');

      expect(gateways).toContain('mercadopago');
      expect(gateways).toContain('stripe');
      expect(gateways).toContain('lemonsqueezy');
    });

    it('should not include region-specific gateways', () => {
      const gateways = smartPayments.getAvailableGateways('US');

      expect(gateways).not.toContain('mercadopago');
      expect(gateways).not.toContain('razorpay');
    });
  });

  describe('validateDiscountCode', () => {
    it('should validate discount codes', () => {
      const request: ProcessPaymentRequest = {
        amount: { amount: 100, currency: 'USD', display: '$100' },
      };

      const isValid = smartPayments.validateDiscountCode('STUDENT50', request);

      expect(isValid).toBe(true);
    });

    it('should reject invalid codes', () => {
      const request: ProcessPaymentRequest = {
        amount: { amount: 100, currency: 'USD', display: '$100' },
      };

      const isValid = smartPayments.validateDiscountCode('INVALID', request);

      expect(isValid).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw SmartPaymentsError for critical failures', async () => {
      // Create a payment that will fail
      const request: ProcessPaymentRequest = {
        amount: { amount: -100, currency: 'INVALID', display: 'Invalid' },
      };

      await expect(smartPayments.processPayment(request)).rejects.toThrow(SmartPaymentsError);
    });
  });
});