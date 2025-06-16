/**
 * Tests for Error Logger Service
 */

import { ErrorLogger, errorLogger } from '@/lib/services/error/error-logger';
import {
  AppError,
  ValidationError,
  ExternalServiceError,
} from '@/types/errors';

describe('ErrorLogger', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let originalEnv: string | undefined;
  let originalTestLogs: string | undefined;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    originalEnv = process.env.NODE_ENV;
    originalTestLogs = process.env.ENABLE_TEST_LOGS;
    // Enable logs for testing
    process.env.ENABLE_TEST_LOGS = 'true';
    // Reset singleton instance for each test
    (ErrorLogger as any).instance = undefined;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
    if (originalTestLogs !== undefined) {
      process.env.ENABLE_TEST_LOGS = originalTestLogs;
    } else {
      delete process.env.ENABLE_TEST_LOGS;
    }
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ErrorLogger.getInstance();
      const instance2 = ErrorLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('logError', () => {
    it('should log standard Error objects', () => {
      const error = new Error('Test error');
      errorLogger.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toBe('Test error');
      expect(logData.level).toBe('error');
    });

    it('should log AppError with additional details', () => {
      const error = new AppError('Test app error', 'TEST_ERROR', 400, {
        field: 'test',
      });

      errorLogger.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toBe('Test app error');
      expect(logData.code).toBe('TEST_ERROR');
      expect(logData.statusCode).toBe(400);
      expect(logData.details).toEqual({ field: 'test' });
    });

    it('should log with context information', () => {
      const error = new Error('Context error');
      errorLogger.logError(error, {
        userId: 'user123',
        component: 'TestComponent',
        action: 'test_action',
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.context.component).toBe('TestComponent');
      expect(logData.context.action).toBe('test_action');
      expect(logData.context.userId).toBe('user123');
    });

    it('should handle non-Error objects', () => {
      errorLogger.logError('String error');
      expect(consoleSpy).toHaveBeenCalled();

      errorLogger.logError({ message: 'Object error' });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should suppress logs in test environment when ENABLE_TEST_LOGS is not set', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.ENABLE_TEST_LOGS;

      errorLogger.logError(new Error('Test error'));
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should show logs in test environment when ENABLE_TEST_LOGS is set', () => {
      process.env.NODE_ENV = 'test';
      process.env.ENABLE_TEST_LOGS = 'true';

      errorLogger.logError(new Error('Test error'));
      expect(consoleSpy).toHaveBeenCalled();

      delete process.env.ENABLE_TEST_LOGS;
    });
  });

  describe('logWarning', () => {
    it('should log warning messages', () => {
      errorLogger.logWarning('Test warning');

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe('warn');
      expect(logData.message).toBe('Test warning');
    });

    it('should include context in warnings', () => {
      errorLogger.logWarning('Warning with context', {
        component: 'TestComponent',
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.context.component).toBe('TestComponent');
    });
  });

  describe('logInfo', () => {
    it('should log info messages', () => {
      errorLogger.logInfo('Test info');

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe('info');
      expect(logData.message).toBe('Test info');
    });
  });

  describe('development vs production logging', () => {
    it('should use JSON format in test environment', () => {
      errorLogger.logError(new Error('Test env error'));

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.message).toBe('Test env error');
      expect(parsed.level).toBe('error');
    });

    it('should include stack trace in error logs', () => {
      const error = new Error('Stack error');
      errorLogger.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.stack).toBeDefined();
      expect(parsed.stack).toContain('Stack error');
    });
  });

  describe('specialized error types', () => {
    it('should handle ValidationError', () => {
      const error = new ValidationError('Invalid input', {
        field: 'email',
        reason: 'invalid format',
      });

      errorLogger.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.message).toBe('Invalid input');
      expect(parsed.code).toBe('VALIDATION_ERROR');
      expect(parsed.details).toEqual({
        field: 'email',
        reason: 'invalid format',
      });
    });

    it('should handle ExternalServiceError', () => {
      const originalError = new Error('Connection failed');
      const error = new ExternalServiceError('Database', originalError);

      errorLogger.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('External service error: Database');
    });
  });
});
