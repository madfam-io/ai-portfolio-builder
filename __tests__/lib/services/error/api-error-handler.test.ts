/**
 * Tests for API Error Handler
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  withErrorHandler,
  createApiHandler,
  validateMethod,
  parseJsonBody,
} from '@/lib/services/error/api-error-handler';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ConflictError,
} from '@/types/errors';

// Mock NextRequest
function createMockRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
} = {}): NextRequest {
  const { 
    url = 'http://localhost:3000/api/test',
    method = 'GET',
    headers = {},
    body = null
  } = options;

  const mockRequest = {
    url,
    method,
    headers: new Headers(headers),
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;

  return mockRequest;
}

describe('API Error Handler', () => {
  describe('handleApiError', () => {
    it('should handle AppError correctly', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      const response = handleApiError(error);

      expect(response).toBeInstanceOf(NextResponse);
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      
      expect(response.status).toBe(400);
      expect(data?.error).toBeDefined();
      expect(data.error.message).toBe('Invalid input');
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.statusCode).toBe(400);
    });

    it('should handle standard Error', () => {
      const error = new Error('Something went wrong');
      const response = handleApiError(error);

      expect(response.status).toBe(500);
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should handle non-Error objects', () => {
      const response = handleApiError('String error');
      
      expect(response.status).toBe(500);
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      expect(data.error.message).toBe('An unexpected error occurred');
    });

    it('should include request context when provided', () => {
      const request = createMockRequest({
        headers: { 'x-request-id': 'test-123' },
      });
      
      const error = new Error('Test error');
      const response = handleApiError(error, request);
      
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      expect(data.error.requestId).toBe('test-123');
    });

    it('should generate request ID if not provided', () => {
      const request = createMockRequest();
      const error = new Error('Test error');
      const response = handleApiError(error, request);
      
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      expect(data.error.requestId).toMatch(/^req_/);
    });

    it('should hide error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new ValidationError('Error with details', {
        sensitive: 'data',
      });
      const response = handleApiError(error);
      
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      expect(data.error.details).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new ValidationError('Error with details', {
        field: 'email',
      });
      const response = handleApiError(error);
      
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      expect(data.error.details).toBeDefined();
      expect(data.error.details.field).toBe('email');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('withErrorHandler', () => {
    it('should wrap async functions and catch errors', async () => {
      const handler = withErrorHandler(async () => {
        throw new AuthenticationError();
      });

      const result = await handler();
      
      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });

    it('should pass through successful responses', async () => {
      const successResponse = NextResponse.json({ success: true });
      const handler = withErrorHandler(() => Promise.resolve(successResponse));

      const result = await handler();
      expect(result).toBe(successResponse);
    });

    it('should extract request from arguments', async () => {
      const request = createMockRequest();
      const handler = withErrorHandler(async (_req: NextRequest) => {
        throw new Error('Test error');
      });

      const result = await handler(request);
      
      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = response.body ? JSON.parse(response.body.toString()) : null;
      expect(data.error.requestId).toBeDefined();
    });
  });

  describe('createApiHandler', () => {
    it('should create type-safe API handlers', async () => {
      const handler = createApiHandler(async (req, context) => {
        return NextResponse.json({ 
          message: 'Success',
          params: context.params,
        });
      });

      const request = createMockRequest();
      const result = await handler(request, { params: { id: '123' } });
      
      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should handle errors in API handlers', async () => {
      const handler = createApiHandler(async () => {
        throw new ConflictError('Resource already exists');
      });

      const request = createMockRequest();
      const result = await handler(request, { params: {} });
      
      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(409);
    });
  });

  describe('validateMethod', () => {
    it('should pass for allowed methods', () => {
      const request = createMockRequest({ method: 'POST' });
      
      expect(() => {
        validateMethod(request, ['GET', 'POST']);
      }).not.toThrow();
    });

    it('should throw for disallowed methods', () => {
      const request = createMockRequest({ method: 'DELETE' });
      
      expect(() => {
        validateMethod(request, ['GET', 'POST']);
      }).toThrow(AppError);
      
      try {
        validateMethod(request, ['GET', 'POST']);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(405);
        expect((error as AppError).code).toBe('METHOD_NOT_ALLOWED');
      }
    });
  });

  describe('parseJsonBody', () => {
    it('should parse valid JSON body', async () => {
      const body = { test: 'data' };
      const request = createMockRequest({ body });
      
      const result = await parseJsonBody(request);
      expect(result).toEqual(body);
    });

    it('should throw ValidationError for invalid JSON', async () => {
      const request = createMockRequest();
      // Override json method to throw
      (request as any).json = () => {
        return Promise.reject(new SyntaxError('Invalid JSON'));
      };
      
      await expect(parseJsonBody(request)).rejects.toThrow(ValidationError);
      
      try {
        await parseJsonBody(request);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Invalid JSON in request body');
      }
    });

    it('should preserve type safety', async () => {
      interface TestData {
        name: string;
        age: number;
      }
      
      const body: TestData = { name: 'Test', age: 25 };
      const request = createMockRequest({ body });
      
      const result = await parseJsonBody<TestData>(request);
      expect(result.name).toBe('Test');
      expect(result.age).toBe(25);
    });
  });
});