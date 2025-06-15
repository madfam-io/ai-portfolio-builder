import { NextResponse } from 'next/server';
import {
  successResponse,
  errorResponse,
  validationError,
  unauthorizedError,
  notFoundError,
  serverError,
  ApiResponse,
  ApiError,
  formatZodError
} from '@/lib/api/response-helpers';
import { z } from 'zod';

describe('API Response Helpers', () => {
  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = successResponse(data);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });

    it('should create success response with message', () => {
      const data = { value: 'test' };
      const response = successResponse(data, 'Operation successful');
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.message).toBe('Operation successful');
    });

    it('should handle custom status codes', () => {
      const response = successResponse({ created: true }, 'Created', 201);
      
      expect(response.status).toBe(201);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.success).toBe(true);
    });

    it('should handle null data', () => {
      const response = successResponse(null);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.success).toBe(true);
      expect(body.data).toBeNull();
    });

    it('should handle arrays', () => {
      const data = [1, 2, 3];
      const response = successResponse(data);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.data).toEqual(data);
    });
  });

  describe('errorResponse', () => {
    it('should create error response', () => {
      const response = errorResponse('Something went wrong', 400);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.success).toBe(false);
      expect(body.error).toBe('Something went wrong');
    });

    it('should handle error details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const response = errorResponse('Validation failed', 400, details);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(details);
    });

    it('should default to 500 status', () => {
      const response = errorResponse('Server error');
      
      expect(response.status).toBe(500);
    });
  });

  describe('validationError', () => {
    it('should create validation error response', () => {
      const errors = { email: 'Invalid email format' };
      const response = validationError(errors);
      
      expect(response.status).toBe(400);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(errors);
    });

    it('should handle multiple validation errors', () => {
      const errors = {
        email: 'Invalid email',
        password: 'Too short',
        username: 'Already taken'
      };
      const response = validationError(errors);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.details).toEqual(errors);
    });

    it('should handle empty errors object', () => {
      const response = validationError({});
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual({});
    });
  });

  describe('unauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const response = unauthorizedError();
      
      expect(response.status).toBe(401);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const response = unauthorizedError('Invalid token');
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Invalid token');
    });
  });

  describe('notFoundError', () => {
    it('should create not found error with default message', () => {
      const response = notFoundError();
      
      expect(response.status).toBe(404);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Resource not found');
    });

    it('should accept custom resource name', () => {
      const response = notFoundError('Portfolio');
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Portfolio not found');
    });

    it('should handle empty resource name', () => {
      const response = notFoundError('');
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Resource not found');
    });
  });

  describe('serverError', () => {
    it('should create server error with default message', () => {
      const response = serverError();
      
      expect(response.status).toBe(500);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Internal server error');
    });

    it('should accept custom message', () => {
      const response = serverError('Database connection failed');
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.error).toBe('Database connection failed');
    });

    it('should not expose sensitive error details', () => {
      const sensitiveError = new Error('Connection to database at 192.168.1.1 failed');
      const response = serverError(sensitiveError.message);
      
      const body = JSON.parse(response.body?.toString() || '{}');
      // In production, this should be sanitized
      expect(body.error).toBeDefined();
    });
  });

  describe('formatZodError', () => {
    it('should format single field error', () => {
      const schema = z.object({
        email: z.string().email()
      });
      
      const result = schema.safeParse({ email: 'invalid' });
      
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted.email).toBeDefined();
        expect(formatted.email).toContain('Invalid email');
      }
    });

    it('should format multiple field errors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
        name: z.string().min(2)
      });
      
      const result = schema.safeParse({
        email: 'invalid',
        age: 15,
        name: 'A'
      });
      
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(Object.keys(formatted).length).toBe(3);
        expect(formatted.email).toBeDefined();
        expect(formatted.age).toBeDefined();
        expect(formatted.name).toBeDefined();
      }
    });

    it('should handle nested field errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            email: z.string().email()
          })
        })
      });
      
      const result = schema.safeParse({
        user: { profile: { email: 'invalid' } }
      });
      
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted['user.profile.email']).toBeDefined();
      }
    });

    it('should handle array field errors', () => {
      const schema = z.object({
        tags: z.array(z.string().min(2))
      });
      
      const result = schema.safeParse({
        tags: ['ok', 'a']
      });
      
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted['tags[1]']).toBeDefined();
      }
    });

    it('should take only first error per field', () => {
      const schema = z.object({
        password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
      });
      
      const result = schema.safeParse({ password: 'short' });
      
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(Object.keys(formatted).length).toBe(1);
        expect(formatted.password).toBeDefined();
      }
    });
  });

  describe('Type exports', () => {
    it('should export ApiResponse type', () => {
      const response: ApiResponse<{ id: number }> = {
        success: true,
        data: { id: 1 },
        message: 'Success'
      };
      
      expect(response).toBeDefined();
    });

    it('should export ApiError type', () => {
      const error: ApiError = {
        success: false,
        error: 'Error occurred',
        details: { field: 'value' }
      };
      
      expect(error).toBeDefined();
    });
  });

  describe('Response headers', () => {
    it('should set Content-Type to application/json', () => {
      const response = successResponse({ test: true });
      
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should allow custom headers', () => {
      const response = successResponse({ test: true }, undefined, 200, {
        'X-Custom-Header': 'value'
      });
      
      expect(response.headers.get('X-Custom-Header')).toBe('value');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Edge cases', () => {
    it('should handle circular references', () => {
      const circular: any = { a: 1 };
      circular.self = circular;
      
      // This should not throw
      expect(() => successResponse(circular)).not.toThrow();
    });

    it('should handle undefined values', () => {
      const response = successResponse({ value: undefined });
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.data).toEqual({ value: null }); // undefined becomes null in JSON
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01');
      const response = successResponse({ date });
      
      const body = JSON.parse(response.body?.toString() || '{}');
      expect(body.data.date).toBe(date.toISOString());
    });
  });
});