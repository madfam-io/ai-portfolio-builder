import { getCSPDirectives, formatCSPHeader, generateNonce } from '@/lib/security/csp';

describe('Content Security Policy', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('getCSPDirectives', () => {
    it('should return CSP directives for production', () => {
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

    it('should return CSP directives for development', () => {
      process.env.NODE_ENV = 'development';
      const directives = getCSPDirectives();

      expect(directives['script-src']).toContain("'unsafe-inline'");
      expect(directives['script-src']).toContain("'unsafe-eval'");
    });

    it('should include necessary external domains', () => {
      const directives = getCSPDirectives();

      // Check for Supabase domains
      expect(directives['img-src']).toContain('https://*.supabase.co');
      expect(directives['connect-src']).toContain('https://*.supabase.co');

      // Check for Google Analytics
      expect(directives['script-src']).toContain('https://www.googletagmanager.com');
      expect(directives['connect-src']).toContain('https://www.google-analytics.com');

      // Check for fonts
      expect(directives['font-src']).toContain('https://fonts.gstatic.com');

      // Check for social login providers
      expect(directives['img-src']).toContain('https://avatars.githubusercontent.com');
      expect(directives['img-src']).toContain('https://lh3.googleusercontent.com');
    });

    it('should include WebSocket support for development', () => {
      process.env.NODE_ENV = 'development';
      const directives = getCSPDirectives();

      expect(directives['connect-src']).toContain('ws://localhost:*');
      expect(directives['connect-src']).toContain('http://localhost:*');
    });
  });

  describe('formatCSPHeader', () => {
    it('should format CSP directives as a string', () => {
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

    it('should filter out empty values', () => {
      const directives = {
        'default-src': ["'self'", ''],
        'script-src': ["'self'", '', 'https://example.com'],
      };

      const header = formatCSPHeader(directives);

      expect(header).not.toContain("''");
      expect(header).toContain("default-src 'self'");
      expect(header).toContain("script-src 'self' https://example.com");
    });

    it('should handle empty directives object', () => {
      const header = formatCSPHeader({});
      expect(header).toBe('');
    });
  });

  describe('generateNonce', () => {
    it('should generate a base64 encoded nonce', () => {
      const nonce = generateNonce();

      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
      // Base64 pattern
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should generate unique nonces', () => {
      const nonces = new Set();
      for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce());
      }
      // All nonces should be unique
      expect(nonces.size).toBe(100);
    });

    it('should handle environments without crypto', () => {
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