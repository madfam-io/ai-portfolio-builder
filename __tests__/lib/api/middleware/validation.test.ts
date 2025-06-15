import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateRequest,
  commonSchemas,
  createValidatedHandler,
} from '@/lib/api/middleware/validation';

describe('Validation Middleware', () => {
  describe('validateRequest', () => {
    it('should validate request body successfully', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const middleware = validateRequest({
        body: schema,
      });

      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'John', age: 30 }),
      });

      const result = await middleware(request);
      expect(result).toBeNull();
      expect((request as any).validated.body).toEqual({ name: 'John', age: 30 });
    });

    it('should reject invalid request body', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const middleware = validateRequest({
        body: schema,
      });

      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'John', age: 'invalid' }),
      });

      const result = await middleware(request);
      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(400);

      const data = await result?.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should validate query parameters', async () => {
      const schema = z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      });

      const middleware = validateRequest({
        query: schema,
      });

      const request = new NextRequest('http://localhost/test?page=2&limit=10');

      const result = await middleware(request);
      expect(result).toBeNull();
      expect((request as any).validated.query).toEqual({ page: 2, limit: 10 });
    });

    it('should sanitize string inputs by default', async () => {
      const schema = z.object({
        message: z.string(),
      });

      const middleware = validateRequest({
        body: schema,
        sanitize: true,
      });

      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: '<script>alert("xss")</script>Hello' }),
      });

      const result = await middleware(request);
      expect(result).toBeNull();
      expect((request as any).validated.body.message).toBe('Hello');
    });

    it('should skip sanitization when disabled', async () => {
      const schema = z.object({
        message: z.string(),
      });

      const middleware = validateRequest({
        body: schema,
        sanitize: false,
      });

      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: '<script>alert("xss")</script>Hello' }),
      });

      const result = await middleware(request);
      expect(result).toBeNull();
      expect((request as any).validated.body.message).toBe('<script>alert("xss")</script>Hello');
    });
  });

  describe('commonSchemas', () => {
    it('should validate email correctly', () => {
      expect(() => commonSchemas.email.parse('test@example.com')).not.toThrow();
      expect(() => commonSchemas.email.parse('UPPER@EXAMPLE.COM')).not.toThrow();
      expect(() => commonSchemas.email.parse('invalid')).toThrow();
    });

    it('should validate UUID correctly', () => {
      expect(() => 
        commonSchemas.id.parse('123e4567-e89b-12d3-a456-426614174000')
      ).not.toThrow();
      expect(() => commonSchemas.id.parse('invalid-uuid')).toThrow();
    });

    it('should validate password correctly', () => {
      expect(() => 
        commonSchemas.password.parse('SecureP@ssw0rd123!')
      ).not.toThrow();
      expect(() => commonSchemas.password.parse('weak')).toThrow();
      expect(() => commonSchemas.password.parse('nouppercase123!')).toThrow();
      expect(() => commonSchemas.password.parse('NOLOWERCASE123!')).toThrow();
      expect(() => commonSchemas.password.parse('NoNumbers!')).toThrow();
      expect(() => commonSchemas.password.parse('NoSpecialChars123')).toThrow();
    });

    it('should validate pagination correctly', () => {
      const result = commonSchemas.pagination.parse({
        page: '2',
        limit: '50',
      });
      expect(result).toEqual({
        page: 2,
        limit: 50,
        sortOrder: 'desc',
      });
    });

    it('should validate date range correctly', () => {
      const validRange = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };
      expect(() => commonSchemas.dateRange.parse(validRange)).not.toThrow();

      const invalidRange = {
        startDate: '2024-12-31T23:59:59Z',
        endDate: '2024-01-01T00:00:00Z',
      };
      expect(() => commonSchemas.dateRange.parse(invalidRange)).toThrow();
    });
  });

  describe('createValidatedHandler', () => {
    it('should create a validated handler', async () => {
      const schema = z.object({
        name: z.string(),
      });

      const handler = createValidatedHandler(
        { body: schema },
        async (request) => {
          const { name } = request.validated.body as { name: string };
          return NextResponse.json({ message: `Hello, ${name}!` });
        }
      );

      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'John' }),
      });

      const response = await handler(request);
      const data = await response.json();
      expect(data.message).toBe('Hello, John!');
    });

    it('should return validation error for invalid input', async () => {
      const schema = z.object({
        name: z.string(),
      });

      const handler = createValidatedHandler(
        { body: schema },
        async () => {
          return NextResponse.json({ message: 'Success' });
        }
      );

      const request = new NextRequest('http://localhost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 123 }),
      });

      const response = await handler(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });
  });
});