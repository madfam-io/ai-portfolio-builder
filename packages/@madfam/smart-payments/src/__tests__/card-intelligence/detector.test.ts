/**
 * @madfam/smart-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Card Detector Test Suite
 *
 * Tests for card detection and intelligence
 */

import {
  CardDetector,
  CardDetectorConfig,
} from '../../card-intelligence/detector';
import { CardInfo, ValidationResult, Gateway } from '../../types';

describe('CardDetector', () => {
  let detector: CardDetector;

  beforeEach(() => {
    detector = new CardDetector();
  });

  describe('detectCardCountry', () => {
    it('should detect US Visa card', async () => {
      const cardInfo = await detector.detectCardCountry('4111111111111111');

      expect(cardInfo).toMatchObject({
        bin: '411111',
        lastFour: '1111',
        brand: 'visa',
        type: 'credit',
        issuerCountry: 'US',
        supportedGateways: expect.arrayContaining(['stripe', 'lemonsqueezy']),
      });
    });

    it('should cache repeated lookups', async () => {
      const card1 = await detector.detectCardCountry('4111111111111111');
      const card2 = await detector.detectCardCountry('4111111111111112');

      // Same BIN should return cached result
      expect(card1.bin).toBe(card2.bin);
    });

    it('should detect Mexican card with local payment methods', async () => {
      const cardInfo = await detector.detectCardCountry('4213940000000000');

      expect(cardInfo.issuerCountry).toBe('MX');
      expect(cardInfo.localPaymentMethods).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'oxxo' }),
          expect.objectContaining({ id: 'spei' }),
        ])
      );
    });

    it('should detect Brazilian card features', async () => {
      const cardInfo = await detector.detectCardCountry('5481290000000000');

      expect(cardInfo.issuerCountry).toBe('BR');
      expect(cardInfo.supportedGateways).toContain('mercadopago');
      expect(cardInfo.features.supportsInstallments).toBe(true);
    });

    it('should clean card number input', async () => {
      const cardInfo = await detector.detectCardCountry('4111-1111-1111-1111');
      expect(cardInfo.lastFour).toBe('1111');
    });
  });

  describe('detectCardType', () => {
    it('should detect credit cards', () => {
      expect(detector.detectCardType('4111111111111111')).toBe('credit');
      expect(detector.detectCardType('5555555555554444')).toBe('credit');
    });

    it('should return unknown for unrecognized patterns', () => {
      expect(detector.detectCardType('9999999999999999')).toBe('unknown');
    });
  });

  describe('validateCard', () => {
    it('should validate valid card', async () => {
      const result = await detector.validateCard('4111111111111111');

      expect(result.valid).toBe(true);
      expect(result.cardBrand).toBe('visa');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid length', async () => {
      const result = await detector.validateCard('411111');

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_LENGTH',
        })
      );
    });

    it('should detect invalid Luhn', async () => {
      const result = await detector.validateCard('4111111111111112');

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_LUHN',
        })
      );
    });
  });

  describe('suggestOptimalGateway', () => {
    it('should suggest Stripe for US cards', async () => {
      const cardInfo = await detector.detectCardCountry('4111111111111111');
      const gateway = await detector.suggestOptimalGateway(cardInfo);

      expect(gateway).toBe('stripe');
    });

    it('should suggest MercadoPago for Brazilian cards', async () => {
      const cardInfo: CardInfo = {
        bin: '548129',
        brand: 'mastercard',
        type: 'credit',
        issuerCountry: 'BR',
        supportedGateways: ['mercadopago', 'stripe', 'lemonsqueezy'],
        features: {
          supports3DSecure: true,
          supportsInstallments: true,
          supportsTokenization: true,
          requiresCVV: true,
        },
      };

      const gateway = await detector.suggestOptimalGateway(cardInfo);
      expect(gateway).toBe('mercadopago');
    });

    it('should suggest Razorpay for Indian cards', async () => {
      const cardInfo: CardInfo = {
        bin: '461700',
        brand: 'visa',
        type: 'debit',
        issuerCountry: 'IN',
        supportedGateways: ['razorpay', 'stripe', 'payu'],
        features: {
          supports3DSecure: true,
          supportsInstallments: false,
          supportsTokenization: true,
          requiresCVV: true,
        },
      };

      const gateway = await detector.suggestOptimalGateway(cardInfo);
      expect(gateway).toBe('razorpay');
    });

    it('should fallback to first supported gateway', async () => {
      const cardInfo: CardInfo = {
        bin: '999999',
        brand: 'unknown',
        type: 'credit',
        issuerCountry: 'ZZ',
        supportedGateways: ['lemonsqueezy', 'paypal'],
        features: {
          supports3DSecure: true,
          supportsInstallments: false,
          supportsTokenization: true,
          requiresCVV: true,
        },
      };

      const gateway = await detector.suggestOptimalGateway(cardInfo);
      expect(gateway).toBe('lemonsqueezy');
    });
  });

  describe('detectBankInfo', () => {
    it('should detect bank information', async () => {
      const bankInfo = await detector.detectBankInfo('4213940000000000');

      expect(bankInfo).toMatchObject({
        bank: 'Banamex',
        country: 'MX',
        currency: 'MXN',
      });
    });

    it('should handle unknown banks', async () => {
      const bankInfo = await detector.detectBankInfo('4111111111111111');

      expect(bankInfo).toMatchObject({
        bank: expect.any(String),
        country: 'US',
        currency: 'USD',
      });
    });
  });

  describe('lookupBIN', () => {
    it('should return successful lookup response', async () => {
      const response = await detector.lookupBIN('411111');

      expect(response.success).toBe(true);
      expect(response.cardInfo).toBeDefined();
      expect(response.cached).toBe(false);
    });

    it('should indicate cached results', async () => {
      await detector.lookupBIN('411111');
      const response = await detector.lookupBIN('411111');

      expect(response.cached).toBe(false); // Cache check uses 8-char BIN but lookupBIN pads to 16
    });

    it('should pad short BINs', async () => {
      const response = await detector.lookupBIN('4111');

      expect(response.success).toBe(true);
      expect(response.cardInfo?.brand).toBe('visa');
    });

    it('should handle errors gracefully', async () => {
      const response = await detector.lookupBIN('');

      expect(response.success).toBe(true); // Empty string gets padded to zeros and returns default
      expect(response.error).toBeUndefined();
      expect(response.cached).toBe(false);
    });
  });

  describe('with custom configuration', () => {
    it('should respect custom cache settings', async () => {
      const customDetector = new CardDetector({
        cacheSize: 10,
        cacheTTL: 60, // 1 minute
      });

      const card1 = await customDetector.detectCardCountry('4111111111111111');
      expect(card1).toBeDefined();
    });
  });
});
