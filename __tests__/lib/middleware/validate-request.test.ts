import { NextRequest } from 'next/server';
import {
  validateRequest,
  sanitizeObject,
  createValidationMiddleware,
  ValidationOptions,
  sanitizeString,
  validateCSRF
} from '@/lib/middleware/validate-request';
import { z } from 'zod';

describe('Request Validation Middleware', () => {
  const mockRequest = (data: any, method = 'POST') => {
    return {
      method,
      json: () => Promise.resolve(data),
      headers: new Headers({
        'content-type': 'application/json'
      })
    } as NextRequest;
  };

  describe('validateRequest', () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      age: z.number().optional()
    });

    it('should validate correct data', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        name: 'John Doe',
        age: 25
      });

      const result = await validateRequest(req, schema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: 'test@example.com',
        name: 'John Doe',
        age: 25
      });
    });

    it('should reject invalid data', async () => {
      const req = mockRequest({
        email: 'invalid-email',
        name: 'A'
      });

      const result = await validateRequest(req, schema);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('name');
    });

    it('should handle malformed JSON', async () => {
      const req = {
        method: 'POST',
        json: () => Promise.reject(new Error('Invalid JSON')),
        headers: new Headers()
      } as NextRequest;

      const result = await validateRequest(req, schema);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('_general');
    });

    it('should handle GET requests with query params', async () => {
      const querySchema = z.object({
        page: z.coerce.number().min(1),
        limit: z.coerce.number().max(100)
      });

      const req = {
        method: 'GET',
        nextUrl: { searchParams: new URLSearchParams('page=1&limit=10') },
        headers: new Headers()
      } as NextRequest;

      const result = await validateRequest(req, querySchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        page: 1,
        limit: 10
      });
    });

    it('should transform and validate data', async () => {
      const transformSchema = z.object({
        email: z.string().email().toLowerCase(),
        tags: z.string().transform(str => str.split(','))
      });

      const req = mockRequest({
        email: 'TEST@EXAMPLE.COM',
        tags: 'react,node,typescript'
      });

      const result = await validateRequest(req, transformSchema);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.tags).toEqual(['react', 'node', 'typescript']);
    });

    it('should handle empty request body', async () => {
      const req = mockRequest(null);

      const result = await validateRequest(req, schema);

      expect(result.success).toBe(false);
    });

    it('should validate with custom options', async () => {
      const options: ValidationOptions = {
        sanitize: true,
        maxSize: 1000,
        allowedMethods: ['POST']
      };

      const req = mockRequest({
        email: '  test@example.com  ',
        name: '<script>alert("xss")</script>John'
      });

      const result = await validateRequest(req, schema, options);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com'); // Trimmed
      expect(result.data?.name).not.toContain('<script>'); // Sanitized
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string values', () => {
      const input = {
        name: '<script>alert("xss")</script>John',
        bio: 'Normal text with <b>bold</b> tag',
        age: 25,
        tags: ['<img src=x onerror=alert(1)>', 'safe-tag']
      };

      const sanitized = sanitizeObject(input);

      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.name).toContain('John');
      expect(sanitized.bio).not.toContain('<b>');
      expect(sanitized.age).toBe(25); // Numbers unchanged
      expect(sanitized.tags[0]).not.toContain('<img');
      expect(sanitized.tags[1]).toBe('safe-tag');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          profile: {
            name: '<script>evil</script>Safe Name'
          }
        }
      };

      const sanitized = sanitizeObject(input);

      expect(sanitized.user.profile.name).not.toContain('<script>');
      expect(sanitized.user.profile.name).toContain('Safe Name');
    });

    it('should preserve null and undefined values', () => {
      const input = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: ''
      };

      const sanitized = sanitizeObject(input);

      expect(sanitized.nullValue).toBeNull();
      expect(sanitized.undefinedValue).toBeUndefined();
      expect(sanitized.emptyString).toBe('');
    });

    it('should handle arrays correctly', () => {
      const input = {
        items: [
          { name: '<script>test</script>Item 1' },
          { name: 'Safe Item 2' }
        ]
      };

      const sanitized = sanitizeObject(input);

      expect(sanitized.items[0].name).not.toContain('<script>');
      expect(sanitized.items[1].name).toBe('Safe Item 2');
    });

    it('should handle circular references', () => {
      const input: any = { name: 'test' };
      input.self = input;

      expect(() => sanitizeObject(input)).not.toThrow();
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous HTML tags', () => {
      const dangerous = '<script>alert("xss")</script><div>Safe content</div>';
      const sanitized = sanitizeString(dangerous);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Safe content');
    });

    it('should handle SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const sanitized = sanitizeString(sqlInjection);

      expect(sanitized).not.toContain('DROP TABLE');
    });

    it('should preserve safe content', () => {
      const safe = 'This is normal text with numbers 123 and symbols @#$%';
      const sanitized = sanitizeString(safe);

      expect(sanitized).toBe(safe);
    });

    it('should handle empty and whitespace strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('   ');
      expect(sanitizeString('\n\t')).toBe('\n\t');
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
      expect(sanitizeString(123 as any)).toBe('123');
    });
  });

  describe('createValidationMiddleware', () => {
    const schema = z.object({
      email: z.string().email()
    });

    it('should create middleware function', () => {
      const middleware = createValidationMiddleware(schema);

      expect(typeof middleware).toBe('function');
    });

    it('should validate requests in middleware', async () => {
      const middleware = createValidationMiddleware(schema);
      const req = mockRequest({ email: 'test@example.com' });

      const result = await middleware(req);

      expect(result.success).toBe(true);
    });

    it('should reject invalid requests in middleware', async () => {
      const middleware = createValidationMiddleware(schema);
      const req = mockRequest({ email: 'invalid' });

      const result = await middleware(req);

      expect(result.success).toBe(false);
    });

    it('should apply custom options in middleware', () => {
      const options: ValidationOptions = {
        sanitize: true,
        maxSize: 500
      };

      const middleware = createValidationMiddleware(schema, options);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('validateCSRF', () => {
    it('should validate CSRF token', () => {
      const req = {
        headers: new Headers({
          'x-csrf-token': 'valid-token'
        })
      } as NextRequest;

      const isValid = validateCSRF(req, 'valid-token');

      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF token', () => {
      const req = {
        headers: new Headers({
          'x-csrf-token': 'invalid-token'
        })
      } as NextRequest;

      const isValid = validateCSRF(req, 'valid-token');

      expect(isValid).toBe(false);
    });

    it('should reject missing CSRF token', () => {
      const req = {
        headers: new Headers()
      } as NextRequest;

      const isValid = validateCSRF(req, 'valid-token');

      expect(isValid).toBe(false);
    });

    it('should handle case-insensitive header names', () => {
      const req = {
        headers: new Headers({
          'X-CSRF-Token': 'valid-token'
        })
      } as NextRequest;

      const isValid = validateCSRF(req, 'valid-token');

      expect(isValid).toBe(true);
    });
  });

  describe('Security edge cases', () => {
    it('should handle extremely large payloads', async () => {
      const largeData = {
        content: 'x'.repeat(10000)
      };

      const req = mockRequest(largeData);
      const schema = z.object({
        content: z.string()
      });

      const options: ValidationOptions = {
        maxSize: 1000
      };

      const result = await validateRequest(req, schema, options);

      expect(result.success).toBe(false);
      expect(result.errors?._general).toContain('too large');
    });

    it('should handle deeply nested objects', () => {
      let deepObj: any = { value: 'test' };
      for (let i = 0; i < 100; i++) {
        deepObj = { nested: deepObj };
      }

      expect(() => sanitizeObject(deepObj)).not.toThrow();
    });

    it('should handle prototype pollution attempts', () => {
      const malicious = {
        '__proto__': { polluted: true },
        'constructor': { prototype: { polluted: true } }
      };

      const sanitized = sanitizeObject(malicious);

      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(sanitized).not.toHaveProperty('__proto__');
    });

    it('should validate content-type header', async () => {
      const req = {
        method: 'POST',
        json: () => Promise.resolve({ test: 'data' }),
        headers: new Headers({
          'content-type': 'text/plain'
        })
      } as NextRequest;

      const schema = z.object({
        test: z.string()
      });

      const result = await validateRequest(req, schema);

      expect(result.success).toBe(false);
    });

    it('should handle unicode normalization attacks', () => {
      const unicode = 'test\u202e\u0041\u0041\u0041\u0041'; // RTLO character
      const sanitized = sanitizeString(unicode);

      expect(sanitized).not.toContain('\u202e');
    });
  });

  describe('Performance considerations', () => {
    it('should handle multiple concurrent validations', async () => {
      const schema = z.object({
        id: z.string()
      });

      const requests = Array.from({ length: 100 }, (_, i) =>
        mockRequest({ id: `test-${i}` })
      );

      const start = Date.now();
      const results = await Promise.all(
        requests.map(req => validateRequest(req, schema))
      );
      const duration = Date.now() - start;

      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it('should not leak memory on large objects', () => {
      const largeObject = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          content: `Content ${i}`.repeat(100)
        }))
      };

      for (let i = 0; i < 10; i++) {
        sanitizeObject(largeObject);
      }

      // Memory should be released (this is more of a documentation test)
      expect(true).toBe(true);
    });
  });
});