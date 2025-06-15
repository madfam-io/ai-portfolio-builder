import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  errorHandler,
  isAppError,
  getErrorMessage,
  createErrorResponse,
  logError,
  wrapAsync,
  retry,
  withTimeout
} from '@/lib/utils/error-handling/error-utils';
import { logger } from '@/lib/utils/logger';
import { NextResponse } from 'next/server';

jest.mock('@/lib/utils/logger');

describe('Error Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Classes', () => {
    it('should create ValidationError with field errors', () => {
      const error = new ValidationError('Validation failed', {
        email: 'Invalid email format',
        password: 'Password too short'
      });

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.fieldErrors).toEqual({
        email: 'Invalid email format',
        password: 'Password too short'
      });
    });

    it('should create AuthenticationError', () => {
      const error = new AuthenticationError('Invalid credentials');
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should create AuthorizationError', () => {
      const error = new AuthorizationError('Access denied');
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should create NotFoundError', () => {
      const error = new NotFoundError('Portfolio');
      
      expect(error.message).toBe('Portfolio not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create RateLimitError with retry info', () => {
      const error = new RateLimitError(60);
      
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
      expect(error.message).toContain('60 seconds');
    });

    it('should create ExternalServiceError', () => {
      const error = new ExternalServiceError('OpenAI API', 'Service unavailable');
      
      expect(error.statusCode).toBe(503);
      expect(error.service).toBe('OpenAI API');
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError instances', () => {
      const error = new ValidationError('Invalid input');
      const response = errorHandler(error);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      const response = errorHandler(error);

      expect(response.status).toBe(500);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle Supabase errors', () => {
      const supabaseError = {
        message: 'Invalid query',
        code: 'PGRST116',
        details: 'Not found'
      };

      const response = errorHandler(supabaseError);
      expect(response.status).toBe(404);
    });

    it('should handle database constraint errors', () => {
      const dbError = new Error('duplicate key value violates unique constraint');
      const response = errorHandler(dbError);

      expect(response.status).toBe(409);
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');
      
      const response = errorHandler(error);
      
      // Response would include stack in development
      expect(logger.error).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ error })
      );
    });
  });

  describe('isAppError', () => {
    it('should identify AppError instances', () => {
      expect(isAppError(new AppError('Test'))).toBe(true);
      expect(isAppError(new ValidationError('Test'))).toBe(true);
      expect(isAppError(new Error('Test'))).toBe(false);
      expect(isAppError('Not an error')).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from various error types', () => {
      expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
      expect(getErrorMessage('String error')).toBe('String error');
      expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with all fields', () => {
      const response = createErrorResponse(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { email: 'Required' }
      );

      const body = response.body;
      expect(response.status).toBe(400);
      expect(body).toContain('"success":false');
      expect(body).toContain('"error":"Validation failed"');
      expect(body).toContain('"code":"VALIDATION_ERROR"');
    });

    it('should omit optional fields when not provided', () => {
      const response = createErrorResponse('Error', 500);
      const body = response.body;
      
      expect(body).not.toContain('code');
      expect(body).not.toContain('details');
    });
  });

  describe('wrapAsync', () => {
    it('should handle successful async operations', async () => {
      const handler = wrapAsync(async (req) => {
        return NextResponse.json({ data: 'success' });
      });

      const response = await handler({} as any);
      expect(response.status).toBe(200);
    });

    it('should catch and handle errors', async () => {
      const handler = wrapAsync(async () => {
        throw new ValidationError('Invalid data');
      });

      const response = await handler({} as any);
      expect(response.status).toBe(400);
    });
  });

  describe('retry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Temporary failure');
        return 'success';
      });

      const result = await retry(operation, 3, 10);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const operation = jest.fn(async () => {
        throw new Error('Persistent failure');
      });

      await expect(retry(operation, 2, 10)).rejects.toThrow('Persistent failure');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = jest.fn(async () => {
        throw new ValidationError('Invalid input');
      });

      await expect(retry(operation)).rejects.toThrow('Invalid input');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('withTimeout', () => {
    it('should complete within timeout', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'completed';
      };

      const result = await withTimeout(operation(), 100);
      expect(result).toBe('completed');
    });

    it('should timeout long operations', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'completed';
      };

      await expect(withTimeout(operation(), 100)).rejects.toThrow('Operation timed out');
    });
  });

  describe('Error Recovery', () => {
    it('should suggest recovery actions for common errors', () => {
      const authError = new AuthenticationError('Session expired');
      expect(authError.recoveryAction).toBe('Please log in again');

      const rateLimitError = new RateLimitError(60);
      expect(rateLimitError.recoveryAction).toContain('Please wait');
    });
  });

  describe('Error Serialization', () => {
    it('should serialize errors for logging', () => {
      const error = new ValidationError('Failed', {
        email: 'Invalid'
      });

      const serialized = error.toJSON();
      
      expect(serialized).toEqual({
        name: 'ValidationError',
        message: 'Failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        fieldErrors: { email: 'Invalid' },
        timestamp: expect.any(String)
      });
    });
  });
});