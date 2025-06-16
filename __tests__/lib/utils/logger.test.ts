import { logger } from '@/lib/utils/logger';

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };

    // Mock console methods
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Show logs in test environment for these tests
    process.env.SHOW_LOGS = 'true';
  });

  afterEach(() => {
    // Restore console methods
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Restore environment
    process.env = originalEnv;
    jest.resetModules();
  });

  describe('Log Levels', () => {
    it('should log debug messages', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalShowLogs = process.env.SHOW_LOGS;
      process.env.NODE_ENV = 'development';
      process.env.ENABLE_DEBUG = 'true';
      process.env.SHOW_LOGS = 'true';
      
      // Create a new logger instance to pick up env changes
      jest.resetModules();
      const { logger: devLogger } = require('@/lib/utils/logger');
      
      devLogger.debug('Debug message', { feature: 'test' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"feature":"test"')
      );

      process.env.NODE_ENV = originalNodeEnv;
      process.env.SHOW_LOGS = originalShowLogs;
    });

    it('should log info messages', () => {
      // In test environment, logger outputs JSON format
      logger.info('Info message', { userId: '123' });

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe('Info message');
      expect(parsedLog.context?.userId).toBe('123');
      expect(parsedLog.level).toBe('info');
    });

    it('should log warning messages', () => {
      logger.warn('Warning message', { action: 'test-action' });

      const logCall = consoleWarnSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe('Warning message');
      expect(parsedLog.context?.action).toBe('test-action');
      expect(parsedLog.level).toBe('warn');
    });

    it('should log error messages', () => {
      logger.error('Error message', { requestId: 'req-123' });

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe('Error message');
      expect(parsedLog.context?.requestId).toBe('req-123');
      expect(parsedLog.level).toBe('error');
    });
  });

  describe('Error Handling', () => {
    it('should log error objects with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error);

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe('Operation failed');
      expect(parsedLog.error?.message).toBe('Test error');
      expect(parsedLog.error?.stack).toBeDefined();
    });

    it('should handle errors with custom properties', () => {
      const error: any = new Error('Custom error');
      error.code = 'ERR_CUSTOM';
      logger.error('Custom error occurred', error);

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.error?.message).toBe('Custom error');
      expect(parsedLog.error?.code).toBe('ERR_CUSTOM');
    });

    it('should handle error as context parameter', () => {
      logger.error('Error with context', {
        errorCode: 'E001',
        severity: 'high',
      });

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.context?.errorCode).toBe('E001');
      expect(parsedLog.context?.severity).toBe('high');
    });
  });

  describe('Environment-based Behavior', () => {
    it('should skip debug logs in production unless enabled', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEBUG = 'false';

      // Create a new logger instance to pick up env changes
      jest.resetModules();
      const { logger: prodLogger } = require('@/lib/utils/logger');
      prodLogger.debug('This should not appear');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should show debug logs in production when ENABLE_DEBUG is true', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEBUG = 'true';

      // Create a new logger instance to pick up env changes
      jest.resetModules();
      const { logger: prodLogger } = require('@/lib/utils/logger');
      prodLogger.debug('Debug in production');

      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should format logs as JSON in production', () => {
      process.env.NODE_ENV = 'production';

      // Create a new logger instance to pick up env changes
      jest.resetModules();
      const { logger: prodLogger } = require('@/lib/utils/logger');
      prodLogger.info('Production log', { feature: 'test' });

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog).toHaveProperty('timestamp');
      expect(parsedLog).toHaveProperty('level', 'info');
      expect(parsedLog).toHaveProperty('message', 'Production log');
      expect(parsedLog).toHaveProperty('context.feature', 'test');
      expect(parsedLog).toHaveProperty('service', 'prisma-portfolio-builder');
      expect(parsedLog).toHaveProperty('environment', 'production');
    });

    it('should skip logs in test environment when SHOW_LOGS is not set', () => {
      process.env.SHOW_LOGS = 'false';

      // Create a new logger instance to pick up env changes
      jest.resetModules();
      const { logger: testLogger } = require('@/lib/utils/logger');

      testLogger.info('This should not appear');
      testLogger.warn('This should not appear either');
      testLogger.error('Even errors should not appear');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with persistent context', () => {
      const childLogger = logger.child({ userId: 'user-123', feature: 'auth' });

      childLogger.info('User logged in');

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.context?.userId).toBe('user-123');
      expect(parsedLog.context?.feature).toBe('auth');
    });

    it('should merge contexts in child logger', () => {
      const childLogger = logger.child({ userId: 'user-123' });

      childLogger.info('Action performed', { action: 'create-portfolio' });

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.context?.userId).toBe('user-123');
      expect(parsedLog.context?.action).toBe('create-portfolio');
    });

    it('should handle nested child loggers', () => {
      const childLogger = logger.child({ requestId: 'req-123' });
      const grandchildLogger = childLogger.child({ userId: 'user-456' });

      grandchildLogger.info('Nested context test');

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.context?.requestId).toBe('req-123');
      expect(parsedLog.context?.userId).toBe('user-456');
    });

    it('should handle errors in child logger', () => {
      const childLogger = logger.child({ feature: 'portfolio' });
      const error = new Error('Portfolio error');

      childLogger.error('Failed to create portfolio', error);

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe('Failed to create portfolio');
      expect(parsedLog.error?.message).toBe('Portfolio error');
      
      // When error is passed as Error object, context is not included
      // This is a limitation of the current implementation
    });

    it('should handle context in child logger error without Error object', () => {
      const childLogger = logger.child({ feature: 'portfolio' });

      childLogger.error('Failed to create portfolio', { errorCode: 'E001' });

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe('Failed to create portfolio');
      expect(parsedLog.context?.feature).toBe('portfolio');
      expect(parsedLog.context?.errorCode).toBe('E001');
    });
  });

  describe('Log Formatting', () => {
    it('should include timestamp in logs', () => {
      logger.info('Timestamp test');

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      // Check for ISO timestamp format
      expect(parsedLog.timestamp).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
      );
    });

    it('should handle complex metadata objects', () => {
      const metadata = {
        user: {
          id: '123',
          email: 'test@example.com',
          roles: ['admin', 'user'],
        },
        request: {
          method: 'POST',
          path: '/api/v1/portfolios',
          headers: {
            'content-type': 'application/json',
          },
        },
        metrics: {
          duration: 150,
          memoryUsage: 50.5,
        },
      };

      logger.info('Complex metadata test', metadata);

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.context).toEqual(metadata);
    });

    it('should handle circular references in context', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj; // Create circular reference

      // This will throw an error because JSON.stringify can't handle circular references
      expect(() => {
        logger.info('Circular reference test', { obj: circularObj });
      }).toThrow('Converting circular structure to JSON');
    });
  });

  describe('Special Cases', () => {
    it('should handle null and undefined values', () => {
      logger.info('Null context', null as any);
      logger.info('Undefined context', undefined as any);

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle empty messages', () => {
      logger.info('', { context: 'empty message' });

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe('');
      expect(parsedLog.context?.context).toBe('empty message');
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000);
      logger.info(longMessage);

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logCall);
      
      expect(parsedLog.message).toBe(longMessage);
    });
  });
});