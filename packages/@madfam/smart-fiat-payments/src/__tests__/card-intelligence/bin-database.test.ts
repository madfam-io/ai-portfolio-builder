/**
 * @madfam/smart-fiat-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * BIN Database Test Suite
 *
 * Tests for BIN lookup functionality
 */

import {
  InMemoryBINDatabase,
  APIBINDatabase,
  BINLookupError,
} from '../../card-intelligence/bin-database';

describe('BIN Database', () => {
  describe('InMemoryBINDatabase', () => {
    let db: InMemoryBINDatabase;

    beforeEach(() => {
      db = new InMemoryBINDatabase();
    });

    it('should lookup known Visa BIN', async () => {
      const result = await db.lookup('411111');
      expect(result).toMatchObject({
        bin: '411111',
        brand: 'visa',
        type: 'credit',
        issuerCountry: 'US',
      });
    });

    it('should lookup known Mastercard BIN', async () => {
      const result = await db.lookup('555555');
      expect(result).toMatchObject({
        brand: 'mastercard',
        type: 'credit',
      });
    });

    it('should lookup Mexican bank BIN', async () => {
      const result = await db.lookup('421394');
      expect(result).toMatchObject({
        brand: 'visa',
        issuerCountry: 'MX',
        issuerName: 'Banamex',
        issuerCurrency: 'MXN',
      });
    });

    it('should lookup Brazilian bank BIN', async () => {
      const result = await db.lookup('548129');
      expect(result).toMatchObject({
        brand: 'mastercard',
        issuerCountry: 'BR',
        issuerName: 'Banco do Brasil',
        issuerCurrency: 'BRL',
      });
    });

    it('should handle unknown BIN with defaults', async () => {
      const result = await db.lookup('999999');
      expect(result).toMatchObject({
        bin: '999999',
        brand: 'unknown',
        type: 'credit',
        issuerCountry: 'US',
        issuerCurrency: 'USD',
      });
    });

    it('should throw error for invalid BIN format', async () => {
      await expect(db.lookup('123')).rejects.toThrow(BINLookupError);
      await expect(db.lookup('')).rejects.toThrow(
        'BIN must be at least 6 digits'
      );
    });

    it('should clean BIN input', async () => {
      const result = await db.lookup('4111-11');
      expect(result.bin).toBe('411111');
    });

    it('should detect card features based on country', async () => {
      // Mexican card should support installments
      const mxCard = await db.lookup('547074');
      expect(mxCard.features?.supportsInstallments).toBe(true);
      expect(mxCard.features?.maxInstallments).toBe(12);

      // US card should not support installments by default
      const usCard = await db.lookup('411111');
      expect(usCard.features?.supportsInstallments).toBe(false);
    });

    it('should check if BIN is supported', () => {
      expect(db.isSupported('411111')).toBe(true);
      expect(db.isSupported('555555')).toBe(true);
      expect(db.isSupported('999999')).toBe(false); // Unknown BIN not in ranges
    });
  });

  describe('APIBINDatabase', () => {
    let apiDb: APIBINDatabase;
    let fallbackDb: InMemoryBINDatabase;

    beforeEach(() => {
      fallbackDb = new InMemoryBINDatabase();
      apiDb = new APIBINDatabase(
        'test-api-key',
        'https://api.test.com',
        fallbackDb
      );
    });

    it('should fallback to in-memory database when API fails', async () => {
      // Since API is not implemented, it should use fallback
      const result = await apiDb.lookup('411111');
      expect(result).toMatchObject({
        brand: 'visa',
        type: 'credit',
      });
    });

    it('should check support through fallback', () => {
      expect(apiDb.isSupported('411111')).toBe(true);
    });
  });

  describe('Card Features Detection', () => {
    let db: InMemoryBINDatabase;

    beforeEach(() => {
      db = new InMemoryBINDatabase();
    });

    it('should detect 3D Secure support', async () => {
      const visa = await db.lookup('411111');
      expect(visa.features?.supports3DSecure).toBe(true);

      const amex = await db.lookup('378282');
      expect(amex.features?.supports3DSecure).toBe(false);
    });

    it('should detect installment support by region', async () => {
      // LATAM cards support installments
      const brazil = await db.lookup('516259'); // Itaú
      expect(brazil.features?.supportsInstallments).toBe(true);

      const mexico = await db.lookup('554620'); // BBVA Mexico
      expect(mexico.features?.supportsInstallments).toBe(true);

      // US cards typically don't
      const us = await db.lookup('411111');
      expect(us.features?.supportsInstallments).toBe(false);
    });

    it('should detect CVV requirements', async () => {
      const visa = await db.lookup('411111');
      expect(visa.features?.requiresCVV).toBe(true);

      const unionpay = await db.lookup('620000');
      expect(unionpay.features?.requiresCVV).toBe(true); // UnionPay detected but defaults to requiresCVV
    });
  });
});
