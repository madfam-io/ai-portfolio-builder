
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


// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
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
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) })),
  },
}));

import { describe, test, it, expect, afterEach, jest, beforeEach } from '@jest/globals';
import {
  getCSPDirectives,
  formatCSPHeader,
  generateNonce,
} from '@/lib/security/csp';

describe('Content Security Policy', () => {
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
  });

  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('getCSPDirectives', () => {
    it('should return CSP directives for production', async () => {
      process.env.NODE_ENV = 'production';
      const directives = getCSPDirectives();

      expect(directives['default-src']).toContain("'self'");
      expect(directives['script-src']).toContain("'self'");
      expect(directives['script-src']).not.toContain("'unsafe-inline'");
      expect(directives['style-src']).toContain("'self'");
      expect(directives['img-src']).toContain("'self'");
      expect(directives['font-src']).toContain("'self'");
      expect(directives['connect-src']).toContain("'self'");
    });

    it('should return CSP directives for development', async () => {
      process.env.NODE_ENV = 'development';
      const directives = getCSPDirectives();

      expect(directives['script-src']).toContain("'unsafe-inline'");
      expect(directives['script-src']).toContain("'unsafe-eval'");
    });

    it('should include necessary external domains', async () => {
      const directives = getCSPDirectives();

      // Check for Supabase domains
      expect(directives['img-src']).toContain('https://*.supabase.co');
      expect(directives['connect-src']).toContain('https://*.supabase.co');

      // Check for Google Analytics
      expect(directives['script-src']).toContain(
        'https://www.googletagmanager.com'

      expect(directives['connect-src']).toContain(
        'https://www.google-analytics.com'

      // Check for fonts
      expect(directives['font-src']).toContain('https://fonts.gstatic.com');

      // Check for social login providers
      expect(directives['img-src']).toContain(
        'https://avatars.githubusercontent.com'

      expect(directives['img-src']).toContain(
        'https://lh3.googleusercontent.com'

    });

    it('should include WebSocket support for development', async () => {
      process.env.NODE_ENV = 'development';
      const directives = getCSPDirectives();

      expect(directives['connect-src']).toContain('ws://localhost:*');
      expect(directives['connect-src']).toContain('http://localhost:*');
    });
  });

  describe('formatCSPHeader', () => {
    it('should format CSP directives as a string', async () => {
      const directives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://example.com'],
        'style-src': ["'self'", "'unsafe-inline'"],
      };

      const header = formatCSPHeader(directives);

      expect(header).toContain("default-src 'self'");
      expect(header).toContain("script-src 'self' https://example.com");
      expect(header).toContain("style-src 'self' 'unsafe-inline'");
      expect(header.split(';').length).toBe(3);
    });

    it('should filter out empty values', async () => {
      const directives = {
        'default-src': ["'self'", ''],
        'script-src': ["'self'", '', 'https://example.com'],
      };

      const header = formatCSPHeader(directives);

      expect(header).not.toContain("''");
      expect(header).toContain("default-src 'self'");
      expect(header).toContain("script-src 'self' https://example.com");
    });

    it('should handle empty directives object', async () => {
      const header = formatCSPHeader({});
      expect(header).toBe('');
    });
  });

  describe('generateNonce', () => {
    it('should generate a base64 encoded nonce', async () => {
      const nonce = generateNonce();

      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
      // Base64 pattern
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should generate unique nonces', async () => {
      const nonces = new Set();
      for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce());
      }
      // All nonces should be unique
      expect(nonces.size).toBe(100);
    });

    it('should handle environments without crypto', async () => {
      // Mock crypto not being available
      const originalCrypto = global.crypto;
      (global as any).crypto = undefined;

      const nonce = generateNonce();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);

      // Restore
      (global as any).crypto = originalCrypto;
    });
  });
});
