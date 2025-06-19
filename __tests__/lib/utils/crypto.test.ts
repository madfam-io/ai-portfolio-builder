import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import crypto from 'crypto';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/utils/logger');

describe('Crypto Utilities', () => {
  const originalEnv = process.env;
  const testKey = crypto.randomBytes(32).toString('hex');

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('encrypt', () => {
    it('should encrypt text successfully', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const plainText = 'This is a secret message';
      const result = encrypt(plainText);

      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('tag');
      expect(result.encrypted).not.toBe(plainText);
      expect(result.iv).toMatch(/^[0-9a-f]{32}$/i);
      expect(result.tag).toMatch(/^[0-9a-f]{32}$/i);
    });

    it('should generate different IVs for same text', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const plainText = 'Same message';
      const result1 = encrypt(plainText);
      const result2 = encrypt(plainText);

      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should handle empty strings', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const result = encrypt('');

      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('tag');
    });

    it('should handle unicode text', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const unicodeText = '🔐 Unicode encryption test 测试';
      const result = encrypt(unicodeText);

      expect(result).toHaveProperty('encrypted');
      expect(result.encrypted).not.toBe(unicodeText);
    });

    it('should handle long text', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const longText = 'A'.repeat(10000);
      const result = encrypt(longText);

      expect(result).toHaveProperty('encrypted');
      expect(result.encrypted.length).toBeGreaterThan(longText.length);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted text correctly', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const plainText = 'Secret message to decrypt';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should handle empty string encryption/decryption', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle unicode text encryption/decryption', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const unicodeText = '🔓 Decrypted unicode 解密';
      const encrypted = encrypt(unicodeText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(unicodeText);
    });

    it('should fail with tampered data', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const encrypted = encrypt('Original message');

      // Tamper with the encrypted data
      const tamperedData = {
        ...encrypted,
        encrypted: encrypted.encrypted.slice(0, -2) + 'ff',
      };

      expect(() => decrypt(tamperedData)).toThrow();
    });

    it('should fail with wrong auth tag', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const encrypted = encrypt('Original message');

      // Tamper with the auth tag
      const tamperedData = {
        ...encrypted,
        tag: crypto.randomBytes(16).toString('hex'),
      };

      expect(() => decrypt(tamperedData)).toThrow();
    });

    it('should fail with invalid IV', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const encrypted = encrypt('Original message');

      // Use invalid IV
      const tamperedData = {
        ...encrypted,
        iv: 'invalid-iv',
      };

      expect(() => decrypt(tamperedData)).toThrow();
    });
  });

  describe('encryption key management', () => {
    it('should throw error in production without encryption key', () => {
      delete process.env.ENCRYPTION_KEY;
      process.env.NODE_ENV = 'production';

      expect(() => encrypt('test')).toThrow(
        'ENCRYPTION_KEY must be set in production environment'
      );

      expect(logger.error).toHaveBeenCalledWith(
        'CRITICAL: ENCRYPTION_KEY not set in production environment'
      );
    });

    it('should generate development key when not in production', () => {
      delete process.env.ENCRYPTION_KEY;
      process.env.NODE_ENV = 'development';

      const result = encrypt('test');
      expect(result).toHaveProperty('encrypted');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('ENCRYPTION_KEY not found')
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Generated development encryption key')
      );
    });

    it('should reuse same development key during runtime', () => {
      delete process.env.ENCRYPTION_KEY;
      process.env.NODE_ENV = 'development';

      const encrypted1 = encrypt('test message');
      const encrypted2 = encrypt('test message');

      // Should be able to decrypt both with same key
      const decrypted1 = decrypt(encrypted1);
      const decrypted2 = decrypt(encrypted2);

      expect(decrypted1).toBe('test message');
      expect(decrypted2).toBe('test message');

      // Should only generate key once
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it('should validate encryption key format', () => {
      process.env.ENCRYPTION_KEY = 'invalid-key-format';

      expect(() => encrypt('test')).toThrow(
        'ENCRYPTION_KEY must be a 64-character hexadecimal string'
      );
    });

    it('should accept valid 64-char hex key', () => {
      process.env.ENCRYPTION_KEY = '0123456789abcdef'.repeat(4); // 64 chars

      const result = encrypt('test');
      expect(result).toHaveProperty('encrypted');
    });

    it('should fail with wrong encryption key on decrypt', () => {
      process.env.ENCRYPTION_KEY = testKey;
      const encrypted = encrypt('Secret message');

      // Change to different key
      process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

      expect(() => decrypt(encrypted)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const specialText = '!@#$%^&*()_+-=[]{}|;\':",.<>?/~`';
      const encrypted = encrypt(specialText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(specialText);
    });

    it('should handle JSON data', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const jsonData = JSON.stringify({
        user: 'test',
        token: 'secret-token',
        nested: { data: true },
      });

      const encrypted = encrypt(jsonData);
      const decrypted = decrypt(encrypted);

      expect(JSON.parse(decrypted)).toEqual(JSON.parse(jsonData));
    });

    it('should handle newlines and whitespace', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const textWithWhitespace = 'Line 1\nLine 2\tTabbed\r\nWindows line';
      const encrypted = encrypt(textWithWhitespace);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(textWithWhitespace);
    });

    it('should handle base64 encoded data', () => {
      process.env.ENCRYPTION_KEY = testKey;

      const binaryData = crypto.randomBytes(100);
      const base64Text = binaryData.toString('base64');

      const encrypted = encrypt(base64Text);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(base64Text);
      expect(Buffer.from(decrypted, 'base64')).toEqual(binaryData);
    });
  });
});
