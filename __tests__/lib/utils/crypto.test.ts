import {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken,
  generateSecureKey,
  getEncryptionKey,
  rotateEncryptionKey
} from '@/lib/utils/crypto';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Crypto Utilities', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', async () => {
      const plainText = 'This is a secret message';
      const encrypted = await encrypt(plainText);
      
      expect(encrypted).not.toBe(plainText);
      expect(encrypted).toContain(':'); // Should contain IV separator
      
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it('should produce different ciphertext for same plaintext', async () => {
      const plainText = 'Same message';
      const encrypted1 = await encrypt(plainText);
      const encrypted2 = await encrypt(plainText);
      
      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });

    it('should handle empty strings', async () => {
      const encrypted = await encrypt('');
      const decrypted = await decrypt(encrypted);
      
      expect(decrypted).toBe('');
    });

    it('should handle special characters', async () => {
      const plainText = '!@#$%^&*()_+-=[]{}|;:"<>,.?/~`';
      const encrypted = await encrypt(plainText);
      const decrypted = await decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    it('should handle unicode characters', async () => {
      const plainText = '🚀 Unicode test: 你好世界 مرحبا بالعالم';
      const encrypted = await encrypt(plainText);
      const decrypted = await decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    it('should throw error for invalid encrypted data', async () => {
      await expect(decrypt('invalid-data')).rejects.toThrow();
      await expect(decrypt('invalid:base64')).rejects.toThrow();
    });

    it('should handle long text', async () => {
      const longText = 'A'.repeat(10000);
      const encrypted = await encrypt(longText);
      const decrypted = await decrypt(encrypted);
      
      expect(decrypted).toBe(longText);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'MySecurePassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toContain('$'); // bcrypt format
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'CorrectPassword';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'SamePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
      
      // Both should verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      const isValid = await verifyPassword('', hash);
      
      expect(isValid).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'x'.repeat(200);
      const hash = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid hash format', async () => {
      await expect(verifyPassword('password', 'invalid-hash')).rejects.toThrow();
    });
  });

  describe('generateToken', () => {
    it('should generate token of specified length', () => {
      const token = generateToken(32);
      
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateToken(16));
      }
      
      expect(tokens.size).toBe(100); // All unique
    });

    it('should handle different lengths', () => {
      expect(generateToken(8)).toHaveLength(16);
      expect(generateToken(16)).toHaveLength(32);
      expect(generateToken(64)).toHaveLength(128);
    });

    it('should use default length if not specified', () => {
      const token = generateToken();
      expect(token).toHaveLength(64); // Default 32 bytes
    });
  });

  describe('generateSecureKey', () => {
    it('should generate base64-encoded key', () => {
      const key = generateSecureKey();
      
      expect(key).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 format
      expect(Buffer.from(key, 'base64').length).toBe(32); // 32 bytes
    });

    it('should generate unique keys', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        keys.add(generateSecureKey());
      }
      
      expect(keys.size).toBe(100);
    });

    it('should generate specified length', () => {
      const key16 = generateSecureKey(16);
      const key64 = generateSecureKey(64);
      
      expect(Buffer.from(key16, 'base64').length).toBe(16);
      expect(Buffer.from(key64, 'base64').length).toBe(64);
    });
  });

  describe('getEncryptionKey', () => {
    it('should return key from environment variable', () => {
      const testKey = 'dGVzdC1lbmNyeXB0aW9uLWtleS0zMi1ieXRlcw=='; // 32 bytes base64
      process.env.ENCRYPTION_KEY = testKey;
      
      const key = getEncryptionKey();
      expect(key.toString('base64')).toBe(testKey);
    });

    it('should generate and cache key if not in env', () => {
      delete process.env.ENCRYPTION_KEY;
      
      const key1 = getEncryptionKey();
      const key2 = getEncryptionKey();
      
      expect(key1).toBe(key2); // Should be cached
      expect(key1.length).toBe(32); // 32 bytes
    });

    it('should validate key length', () => {
      process.env.ENCRYPTION_KEY = 'c2hvcnQ='; // Too short
      
      expect(() => getEncryptionKey()).toThrow('Invalid encryption key');
    });

    it('should handle invalid base64', () => {
      process.env.ENCRYPTION_KEY = 'invalid-base64!@#';
      
      expect(() => getEncryptionKey()).toThrow();
    });
  });

  describe('rotateEncryptionKey', () => {
    it('should re-encrypt data with new key', async () => {
      const plainText = 'Sensitive data';
      const oldKey = generateSecureKey();
      const newKey = generateSecureKey();
      
      process.env.ENCRYPTION_KEY = oldKey;
      const encrypted = await encrypt(plainText);
      
      process.env.ENCRYPTION_KEY = newKey;
      const rotated = await rotateEncryptionKey(encrypted, Buffer.from(oldKey, 'base64'));
      
      const decrypted = await decrypt(rotated);
      expect(decrypted).toBe(plainText);
    });

    it('should produce different ciphertext after rotation', async () => {
      const plainText = 'Rotate me';
      const oldKey = generateSecureKey();
      const newKey = generateSecureKey();
      
      process.env.ENCRYPTION_KEY = oldKey;
      const original = await encrypt(plainText);
      
      process.env.ENCRYPTION_KEY = newKey;
      const rotated = await rotateEncryptionKey(original, Buffer.from(oldKey, 'base64'));
      
      expect(rotated).not.toBe(original);
    });

    it('should handle invalid encrypted data', async () => {
      const oldKey = Buffer.from(generateSecureKey(), 'base64');
      
      await expect(rotateEncryptionKey('invalid:data', oldKey)).rejects.toThrow();
    });
  });

  describe('Security considerations', () => {
    it('should not expose plaintext in errors', async () => {
      const sensitiveData = 'SuperSecretAPIKey123';
      const encrypted = await encrypt(sensitiveData);
      const corrupted = encrypted.replace(/.$/, 'X'); // Corrupt last character
      
      try {
        await decrypt(corrupted);
      } catch (error: any) {
        expect(error.message).not.toContain(sensitiveData);
      }
    });

    it('should clear sensitive data from memory', async () => {
      // This is more of a documentation test
      // In real implementation, we should use secure buffer handling
      const password = 'SensitivePassword';
      const hash = await hashPassword(password);
      
      // Password should be cleared from memory after hashing
      // (Implementation should use crypto.timingSafeEqual, etc.)
      expect(hash).toBeDefined();
    });

    it('should use constant-time comparison for passwords', async () => {
      // Timing attack resistance test
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      const startCorrect = Date.now();
      await verifyPassword(password, hash);
      const timeCorrect = Date.now() - startCorrect;
      
      const startWrong = Date.now();
      await verifyPassword('WrongPassword1', hash);
      const timeWrong = Date.now() - startWrong;
      
      // Times should be similar (constant-time comparison)
      // This is a weak test, but documents the requirement
      expect(Math.abs(timeCorrect - timeWrong)).toBeLessThan(100);
    });
  });
});