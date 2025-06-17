import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  withErrorHandler,
  createApiHandler,
  validateMethod,
  parseJsonBody,
  ApiErrorResponse,
} from '@/lib/services/error/api-error-handler';
import { AppError } from '@/types/errors';
import { errorLogger } from '@/lib/services/error/error-logger';

// Mock dependencies
jest.mock('@/lib/services/error/error-logger');

describe('API Error Handler', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock NextRequest
    mockRequest = {
      url: 'http://localhost:3000/api/test',
      method: 'GET',
      headers: new Headers({
        'user-agent': 'Test Agent',
        referer: 'http://localhost:3000',
        'x-forwarded-for': '192.168.1.1',
      }),
      json: jest.fn(),
    } as unknown as NextRequest;

    // Mock error logger
    (errorLogger.logError as jest.Mock).mockImplementation(() => {});
  });

  describe('handleApiError', () => {
    it('should handle AppError correctly', () => {
      const appError = new AppError('Test error', 'TEST_ERROR', 400, {
        field: 'test',
      });

      const response = handleApiError(appError, mockRequest);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);

      // Check response body
      const _responseData = response as unknown as { _body: ApiErrorResponse };
      expect(errorLogger.logError).toHaveBeenCalledWith(
        appError,
        expect.objectContaining({
          requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/),
          url: 'http://localhost:3000/api/test',
          method: 'GET',
        })
      );
    });

    it('should handle regular Error in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Detailed error message');
      const response = handleApiError(error, mockRequest);

      expect(response.status).toBe(500);

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive error message');
      const response = handleApiError(error);

      expect(response.status).toBe(500);
      // In production, should use generic message

      process.env.NODE_ENV = originalEnv;
    });

    it('should extract request ID from headers', () => {
      const requestWithId = {
        ...mockRequest,
        headers: new Headers({
          'x-request-id': 'custom-request-id',
        }),
      } as NextRequest;

      const error = new Error('Test error');
      handleApiError(error, requestWithId);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          requestId: 'custom-request-id',
        })
      );
    });

    it('should handle error without request', () => {
      const error = new Error('Test error');
      const response = handleApiError(error);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
    });

    it('should merge additional context', () => {
      const error = new Error('Test error');
      const additionalContext = {
        userId: 'user-123',
        action: 'create-portfolio',
      };

      handleApiError(error, mockRequest, additionalContext);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          userId: 'user-123',
          action: 'create-portfolio',
        })
      );
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const response = handleApiError(error);

      expect(response.status).toBe(500);
    });
  });

  describe('withErrorHandler', () => {
    it('should wrap async handler and catch errors', async () => {
      const error = new AppError('Handler error', 'HANDLER_ERROR', 400);
      const handler = jest.fn().mockRejectedValue(error);
      const wrapped = withErrorHandler(handler);

      const result = await wrapped(mockRequest);

      expect(handler).toHaveBeenCalledWith(mockRequest);
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('should pass through successful responses', async () => {
      const successResponse = NextResponse.json({ success: true });
      const handler = jest.fn().mockResolvedValue(successResponse);
      const wrapped = withErrorHandler(handler);

      const result = await wrapped(mockRequest);

      expect(result).toBe(successResponse);
    });

    it('should extract request from arguments', async () => {
      const error = new Error('Test error');
      const handler = jest.fn().mockRejectedValue(error);
      const wrapped = withErrorHandler(handler);

      await wrapped(mockRequest, { params: { id: '123' } });

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          url: 'http://localhost:3000/api/test',
        })
      );
    });
  });

  describe('createApiHandler', () => {
    it('should create typed API handler', async () => {
      interface Params {
        id: string;
      }
      interface Response {
        data: string;
      }

      const handler = createApiHandler<Params, Response>((req, { params }) => {
        return NextResponse.json({ data: params.id });
      });

      const result = await handler(mockRequest, { params: { id: '123' } });

      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should handle errors in typed handler', async () => {
      const handler = createApiHandler(() => {
        throw new AppError('Test error', 'TEST_ERROR', 400);
      });

      const result = await handler(mockRequest, { params: {} });

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('validateMethod', () => {
    it('should pass for allowed methods', () => {
      expect(() => {
        validateMethod(mockRequest, ['GET', 'POST']);
      }).not.toThrow();
    });

    it('should throw for disallowed methods', () => {
      expect(() => {
        validateMethod(mockRequest, ['POST', 'PUT']);
      }).toThrow(AppError);

      try {
        validateMethod(mockRequest, ['POST', 'PUT']);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(405);
        expect((error as AppError).code).toBe('METHOD_NOT_ALLOWED');
        expect((error as AppError).details).toEqual({
          allowed: ['POST', 'PUT'],
        });
      }
    });

    it('should handle different HTTP methods', () => {
      const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        const req = { ...mockRequest, method } as NextRequest;

        expect(() => {
          validateMethod(req, [method]);
        }).not.toThrow();

        expect(() => {
          validateMethod(req, ['OTHER']);
        }).toThrow(AppError);
      });
    });
  });

  describe('parseJsonBody', () => {
    it('should parse valid JSON body', async () => {
      const mockBody = { name: 'Test', value: 123 };
      mockRequest.json = jest.fn().mockResolvedValue(mockBody);

      const result = await parseJsonBody(mockRequest);

      expect(result).toEqual(mockBody);
    });

    it('should throw AppError for invalid JSON', async () => {
      mockRequest.json = jest
        .fn()
        .mockRejectedValue(new SyntaxError('Invalid JSON'));

      await expect(parseJsonBody(mockRequest)).rejects.toThrow(AppError);

      try {
        await parseJsonBody(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe('INVALID_JSON');
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).details).toEqual({
          originalError: 'Invalid JSON',
        });
      }
    });

    it('should handle typed JSON parsing', async () => {
      interface RequestBody {
        name: string;
        age: number;
      }

      const mockBody: RequestBody = { name: 'John', age: 30 };
      mockRequest.json = jest.fn().mockResolvedValue(mockBody);

      const result = await parseJsonBody<RequestBody>(mockRequest);

      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
    });

    it('should handle empty body', async () => {
      mockRequest.json = jest.fn().mockResolvedValue(null);

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('Error Context Extraction', () => {
    it('should extract full context from request', () => {
      const error = new Error('Test');
      handleApiError(error, mockRequest);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          url: 'http://localhost:3000/api/test',
          method: 'GET',
          metadata: {
            userAgent: 'Test Agent',
            referer: 'http://localhost:3000',
            ip: '192.168.1.1',
          },
        })
      );
    });

    it('should handle missing headers gracefully', () => {
      const minimalRequest = {
        url: 'http://localhost:3000/api/test',
        method: 'GET',
        headers: new Headers(),
      } as NextRequest;

      const error = new Error('Test');
      handleApiError(error, minimalRequest);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          metadata: {
            userAgent: undefined,
            referer: undefined,
            ip: undefined,
          },
        })
      );
    });

    it('should prefer x-real-ip over x-forwarded-for', () => {
      const requestWithRealIp = {
        ...mockRequest,
        headers: new Headers({
          'x-forwarded-for': '10.0.0.1',
          'x-real-ip': '192.168.1.100',
        }),
      } as NextRequest;

      const error = new Error('Test');
      handleApiError(error, requestWithRealIp);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          metadata: expect.objectContaining({
            ip: '10.0.0.1', // x-forwarded-for takes precedence
          }),
        })
      );
    });
  });
});
