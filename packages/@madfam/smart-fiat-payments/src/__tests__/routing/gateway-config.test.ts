/**
 * @madfam/smart-fiat-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Gateway Configuration Test Suite
 *
 * Tests for gateway fee calculations and configurations
 */

import {
  DEFAULT_GATEWAY_CONFIGS,
  GatewayFeeCalculator,
} from '../../routing/gateway-config';
import { Money, Gateway } from '../../types';

describe('GatewayFeeCalculator', () => {
  let calculator: GatewayFeeCalculator;

  beforeEach(() => {
    calculator = new GatewayFeeCalculator();
  });

  describe('calculateFees', () => {
    const testAmount: Money = {
      amount: 100,
      currency: 'USD',
      display: '$100.00',
    };

    it('should calculate Stripe fees correctly', () => {
      const fees = calculator.calculateFees('stripe', testAmount);

      expect(fees.percentageFee.amount).toBeCloseTo(2.9, 2); // 2.9%
      expect(fees.fixedFee.amount).toBeCloseTo(0.3, 2);
      expect(fees.totalFee.amount).toBeCloseTo(3.2, 2);
      expect(fees.processingFee.amount).toBeCloseTo(3.2, 2);
    });

    it('should calculate MercadoPago fees correctly', () => {
      const fees = calculator.calculateFees('mercadopago', testAmount);

      expect(fees.percentageFee.amount).toBeCloseTo(3.99, 2); // 3.99%
      expect(fees.fixedFee.amount).toBe(0); // No fixed fee
      expect(fees.totalFee.amount).toBeCloseTo(3.99, 2);
    });

    it('should calculate LemonSqueezy fees correctly', () => {
      const fees = calculator.calculateFees('lemonsqueezy', testAmount);

      expect(fees.percentageFee.amount).toBe(5); // 5%
      expect(fees.fixedFee.amount).toBe(0.5);
      expect(fees.totalFee.amount).toBe(5.5);
    });

    it('should add international card fees', () => {
      const fees = calculator.calculateFees('stripe', testAmount, true);

      expect(fees.percentageFee.amount).toBeCloseTo(2.9, 2);
      expect(fees.internationalFee?.amount).toBeCloseTo(1, 2); // +1%
      expect(fees.totalFee.amount).toBeCloseTo(4.2, 2); // 2.9% + 0.30 + 1%
    });

    it('should calculate installment fees', () => {
      const fees = calculator.calculateFees(
        'mercadopago',
        testAmount,
        false,
        6
      );

      expect(fees.installmentFee?.amount).toBe(6.99); // 6.99% for 6 months
      expect(fees.totalFee.amount).toBe(10.98); // 3.99% + 6.99%
    });

    it('should handle unknown gateway', () => {
      expect(() => {
        calculator.calculateFees('unknown' as Gateway, testAmount);
      }).toThrow('Unknown gateway');
    });

    it('should convert currency for fixed fees', () => {
      const brlAmount: Money = {
        amount: 100,
        currency: 'BRL',
        display: 'R$100.00',
      };

      const fees = calculator.calculateFees('stripe', brlAmount);

      // Fixed fee should be converted from USD to BRL
      expect(fees.fixedFee.currency).toBe('BRL');
      expect(fees.fixedFee.amount).toBeGreaterThan(0.3); // More than USD value
    });
  });

  describe('getEffectiveRate', () => {
    it('should calculate effective rate including fixed fees', () => {
      const smallAmount: Money = {
        amount: 10,
        currency: 'USD',
        display: '$10',
      };
      const largeAmount: Money = {
        amount: 1000,
        currency: 'USD',
        display: '$1000',
      };

      const smallRate = calculator.getEffectiveRate('stripe', smallAmount);
      const largeRate = calculator.getEffectiveRate('stripe', largeAmount);

      // Small amounts have higher effective rate due to fixed fee
      expect(smallRate).toBeGreaterThan(0.05); // >5%
      expect(largeRate).toBeLessThan(0.035); // <3.5%
    });

    it('should include international fees in effective rate', () => {
      const amount: Money = { amount: 100, currency: 'USD', display: '$100' };

      const domesticRate = calculator.getEffectiveRate('stripe', amount, false);
      const internationalRate = calculator.getEffectiveRate(
        'stripe',
        amount,
        true
      );

      expect(internationalRate).toBeGreaterThan(domesticRate);
      expect(internationalRate - domesticRate).toBeCloseTo(0.01); // 1% difference
    });
  });

  describe('compareGateways', () => {
    it('should compare multiple gateways and sort by cost', () => {
      const amount: Money = { amount: 100, currency: 'USD', display: '$100' };
      const gateways: Gateway[] = [
        'stripe',
        'mercadopago',
        'lemonsqueezy',
        'paypal',
      ];

      const comparison = calculator.compareGateways(gateways, amount);

      expect(comparison).toHaveLength(4);
      expect(comparison[0].gateway).toBe('stripe'); // Lowest fees
      expect(comparison[comparison.length - 1].gateway).toBe('lemonsqueezy'); // Highest fees

      // Check sorting
      for (let i = 1; i < comparison.length; i++) {
        expect(comparison[i].fees.totalFee.amount).toBeGreaterThanOrEqual(
          comparison[i - 1].fees.totalFee.amount
        );
      }
    });

    it('should calculate savings compared to most expensive', () => {
      const amount: Money = { amount: 100, currency: 'USD', display: '$100' };
      const gateways: Gateway[] = ['stripe', 'lemonsqueezy'];

      const comparison = calculator.compareGateways(gateways, amount);

      expect(comparison[0].savings).toBeDefined();
      expect(comparison[0].savings?.amount).toBeGreaterThan(2); // Stripe saves >$2 vs LemonSqueezy
      expect(comparison[1].savings).toBeUndefined(); // Most expensive has no savings
    });

    it('should handle international card comparison', () => {
      const amount: Money = { amount: 100, currency: 'USD', display: '$100' };
      const gateways: Gateway[] = ['stripe', 'mercadopago'];

      const comparison = calculator.compareGateways(gateways, amount, true);

      // MercadoPago has higher international fees
      expect(comparison[0].gateway).toBe('stripe');
      expect(comparison[1].fees.internationalFee?.amount).toBeGreaterThan(
        comparison[0].fees.internationalFee?.amount || 0
      );
    });
  });

  describe('installment rates', () => {
    it('should apply correct MercadoPago installment rates', () => {
      const amount: Money = {
        amount: 1000,
        currency: 'BRL',
        display: 'R$1000',
      };

      const rates = [
        { months: 3, expectedRate: 0.0499 },
        { months: 6, expectedRate: 0.0699 },
        { months: 9, expectedRate: 0.0899 },
        { months: 12, expectedRate: 0.0999 },
        { months: 18, expectedRate: 0.1299 },
      ];

      rates.forEach(({ months, expectedRate }) => {
        const fees = calculator.calculateFees(
          'mercadopago',
          amount,
          false,
          months
        );
        expect(fees.installmentFee?.amount).toBeCloseTo(
          amount.amount * expectedRate
        );
      });
    });

    it('should not apply installment fees for unsupported gateways', () => {
      const amount: Money = { amount: 100, currency: 'USD', display: '$100' };

      const fees = calculator.calculateFees('lemonsqueezy', amount, false, 6);
      expect(fees.installmentFee).toBeUndefined();
    });
  });
});
