/**
 * @madfam/smart-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Card Validators Test Suite
 *
 * Tests for card validation utilities
 */

import {
  validateCardNumber,
  validateExpiry,
  validateCVV,
  detectCardBrand,
  isValidLuhn,
  formatCardNumber,
  maskCardNumber,
  getCardBrandDisplayName,
} from '../../card-intelligence/validators';

describe('Card Validators', () => {
  describe('validateCardNumber', () => {
    it('should validate valid Visa card', () => {
      const result = validateCardNumber('4111111111111111');
      expect(result.valid).toBe(true);
      expect(result.cardBrand).toBe('visa');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid Mastercard', () => {
      const result = validateCardNumber('5555555555554444');
      expect(result.valid).toBe(true);
      expect(result.cardBrand).toBe('mastercard');
    });

    it('should validate valid Amex card', () => {
      const result = validateCardNumber('378282246310005');
      expect(result.valid).toBe(true);
      expect(result.cardBrand).toBe('amex');
    });

    it('should detect invalid Luhn checksum', () => {
      const result = validateCardNumber('4111111111111112');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_CHECKSUM',
        })
      );
    });

    it('should handle card with spaces', () => {
      const result = validateCardNumber('4111 1111 1111 1111');
      expect(result.valid).toBe(true);
    });

    it('should reject empty card number', () => {
      const result = validateCardNumber('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'REQUIRED',
        })
      );
    });

    it('should reject card with invalid length', () => {
      const result = validateCardNumber('41111');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_LENGTH',
        })
      );
    });
  });

  describe('validateExpiry', () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    it('should validate valid future expiry', () => {
      const futureMonth = '12';
      const futureYear = String(currentYear + 1);
      const result = validateExpiry(futureMonth, futureYear);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept current month', () => {
      const result = validateExpiry(String(currentMonth), String(currentYear));
      expect(result.valid).toBe(true);
    });

    it('should reject expired card', () => {
      const pastMonth = '01';
      const pastYear = String(currentYear - 1);
      const result = validateExpiry(pastMonth, pastYear);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'EXPIRED',
        })
      );
    });

    it('should reject invalid month', () => {
      const result = validateExpiry('13', String(currentYear));
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_MONTH',
        })
      );
    });

    it('should handle 2-digit year', () => {
      const twoDigitYear = String(currentYear + 1).slice(-2);
      const result = validateExpiry('12', twoDigitYear);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCVV', () => {
    it('should validate 3-digit CVV for Visa', () => {
      const result = validateCVV('123', 'visa');
      expect(result.valid).toBe(true);
    });

    it('should validate 4-digit CVV for Amex', () => {
      const result = validateCVV('1234', 'amex');
      expect(result.valid).toBe(true);
    });

    it('should reject wrong CVV length for Amex', () => {
      const result = validateCVV('123', 'amex');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_LENGTH',
        })
      );
    });

    it('should reject non-numeric CVV', () => {
      const result = validateCVV('12a', 'visa');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_FORMAT',
        })
      );
    });

    it('should default to 3-digit when brand unknown', () => {
      const result = validateCVV('123');
      expect(result.valid).toBe(true);
    });
  });

  describe('detectCardBrand', () => {
    const brandTests = [
      { number: '4111111111111111', brand: 'visa' },
      { number: '5555555555554444', brand: 'mastercard' },
      { number: '2221000000000009', brand: 'mastercard' },
      { number: '378282246310005', brand: 'amex' },
      { number: '371449635398431', brand: 'amex' },
      { number: '6011111111111117', brand: 'discover' },
      { number: '3056930009020004', brand: 'diners' },
      { number: '3566002020360505', brand: 'jcb' },
      { number: '6200000000000005', brand: 'unionpay' },
      { number: '5066991111111118', brand: 'elo' },
      { number: '6062826786276634', brand: 'hipercard' },
    ];

    brandTests.forEach(({ number, brand }) => {
      it(`should detect ${brand} card`, () => {
        expect(detectCardBrand(number)).toBe(brand);
      });
    });

    it('should return unknown for unrecognized card', () => {
      expect(detectCardBrand('9999999999999999')).toBe('unknown');
    });
  });

  describe('isValidLuhn', () => {
    it('should validate correct Luhn checksum', () => {
      expect(isValidLuhn('4111111111111111')).toBe(true);
      expect(isValidLuhn('5555555555554444')).toBe(true);
      expect(isValidLuhn('378282246310005')).toBe(true);
    });

    it('should reject incorrect Luhn checksum', () => {
      expect(isValidLuhn('4111111111111112')).toBe(false);
      expect(isValidLuhn('5555555555554445')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isValidLuhn('')).toBe(false);
    });

    it('should handle short numbers', () => {
      expect(isValidLuhn('123')).toBe(false);
    });
  });

  describe('formatCardNumber', () => {
    it('should format Visa/Mastercard as 4-4-4-4', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('5555555555554444')).toBe('5555 5555 5555 4444');
    });

    it('should format Amex as 4-6-5', () => {
      expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
    });

    it('should format Diners as 4-6-4', () => {
      expect(formatCardNumber('30569309025904')).toBe('3056 930902 5904');
    });

    it('should use detected brand when not provided', () => {
      expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
    });

    it('should handle partial card numbers', () => {
      expect(formatCardNumber('411111')).toBe('4111 11');
    });
  });

  describe('maskCardNumber', () => {
    it('should mask all but last 4 digits', () => {
      expect(maskCardNumber('4111111111111111')).toBe('••••••••••••1111');
      expect(maskCardNumber('378282246310005')).toBe('•••••••••••0005');
    });

    it('should handle card with spaces', () => {
      expect(maskCardNumber('4111 1111 1111 1111')).toBe('••••••••••••1111');
    });

    it('should handle short numbers', () => {
      expect(maskCardNumber('1234')).toBe('1234');
      expect(maskCardNumber('12345')).toBe('•2345');
    });
  });

  describe('getCardBrandDisplayName', () => {
    it('should return proper display names', () => {
      expect(getCardBrandDisplayName('visa')).toBe('Visa');
      expect(getCardBrandDisplayName('mastercard')).toBe('Mastercard');
      expect(getCardBrandDisplayName('amex')).toBe('American Express');
      expect(getCardBrandDisplayName('discover')).toBe('Discover');
      expect(getCardBrandDisplayName('diners')).toBe('Diners Club');
      expect(getCardBrandDisplayName('jcb')).toBe('JCB');
      expect(getCardBrandDisplayName('unionpay')).toBe('UnionPay');
      expect(getCardBrandDisplayName('elo')).toBe('Elo');
      expect(getCardBrandDisplayName('hipercard')).toBe('Hipercard');
      expect(getCardBrandDisplayName('unknown')).toBe('Card');
    });
  });
});
