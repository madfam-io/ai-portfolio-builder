
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

import crypto from 'crypto';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import { logger } from '@/lib/utils/logger';
import { describe, it, expect, beforeEach, afterEach, jest,  } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn().mockReturnValue(void 0),
    warn: jest.fn().mockReturnValue(void 0),
    info: jest.fn().mockReturnValue(void 0),
    debug: jest.fn().mockReturnValue(void 0),
  },
}));

describe('Crypto Utilities', () => {
  const originalEnv = process.env;
  const testKey = crypto.randomBytes(32).toString('hex');

  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('encrypt', () => {
    it('should encrypt text successfully', async () => {
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

    it('should generate different IVs for same text', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const plainText = 'Same message';
      const result1 = encrypt(plainText);
      const result2 = encrypt(plainText);

      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should handle empty strings', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const result = encrypt('');

      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('tag');
    });

    it('should handle unicode text', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const unicodeText = '🔐 Unicode encryption test 测试';
      const result = encrypt(unicodeText);

      expect(result).toHaveProperty('encrypted');
      expect(result.encrypted).not.toBe(unicodeText);
    });

    it('should handle long text', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const longText = 'A'.repeat(10000);
      const result = encrypt(longText);

      expect(result).toHaveProperty('encrypted');
      expect(result.encrypted.length).toBeGreaterThan(longText.length);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted text correctly', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const plainText = 'Secret message to decrypt';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should handle empty string encryption/decryption', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle unicode text encryption/decryption', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const unicodeText = '🔓 Decrypted unicode 解密';
      const encrypted = encrypt(unicodeText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(unicodeText);
    });

    it('should fail with tampered data', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const encrypted = encrypt('Original message');

      // Tamper with the encrypted data
      const tamperedData = {
        ...encrypted,
        encrypted: encrypted.encrypted.slice(0, -2) + 'ff',
      };

      expect(() => decrypt(tamperedData)).toThrow();
    });

    it('should fail with wrong auth tag', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const encrypted = encrypt('Original message');

      // Tamper with the auth tag
      const tamperedData = {
        ...encrypted,
        tag: crypto.randomBytes(16).toString('hex'),
      };

      expect(() => decrypt(tamperedData)).toThrow();
    });

    it('should fail with invalid IV', async () => {
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
    it('should throw error in production without encryption key', async () => {
      delete process.env.ENCRYPTION_KEY;
      process.env.NODE_ENV = 'production';

      expect(() => encrypt('test')).toThrow(
        'ENCRYPTION_KEY must be set in production environment'
      );

      expect(logger.error).toHaveBeenCalledWith(
        'CRITICAL: ENCRYPTION_KEY not set in production environment'
      );
    });

    it('should generate development key when not in production', async () => {
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

    it('should reuse same development key during runtime', async () => {
      delete process.env.ENCRYPTION_KEY;
      process.env.NODE_ENV = 'development';

      const encrypted1 = encrypt('test message');
      const encrypted2 = encrypt('test message');

      // Should be able to decrypt both with same key
      const decrypted1 = decrypt(encrypted1);
      const decrypted2 = decrypt(encrypted2);

      expect(decrypted1).toBe('test message');
      expect(decrypted2).toBe('test message');

      // Both operations should succeed, indicating key reuse
      expect(decrypted1).toEqual(decrypted2);
    });

    it('should validate encryption key format', async () => {
      process.env.ENCRYPTION_KEY = 'invalid-key-format';

      expect(() => encrypt('test')).toThrow(
        'ENCRYPTION_KEY must be a 64-character hexadecimal string'
      );
    });

    it('should accept valid 64-char hex key', async () => {
      process.env.ENCRYPTION_KEY = '0123456789abcdef'.repeat(4); // 64 chars

      const result = encrypt('test');
      expect(result).toHaveProperty('encrypted');
    });

    it('should fail with wrong encryption key on decrypt', async () => {
      process.env.ENCRYPTION_KEY = testKey;
      const encrypted = encrypt('Secret message');

      // Change to different key
      process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

      expect(() => decrypt(encrypted)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const specialText = '!@#$%^&*()_+-=[]{}|;\':",.<>?/~`';
      const encrypted = encrypt(specialText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(specialText);
    });

    it('should handle JSON data', async () => {
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

    it('should handle newlines and whitespace', async () => {
      process.env.ENCRYPTION_KEY = testKey;

      const textWithWhitespace = 'Line 1\nLine 2\tTabbed\r\nWindows line';
      const encrypted = encrypt(textWithWhitespace);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(textWithWhitespace);
    });

    it('should handle base64 encoded data', async () => {
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
