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
  });

  describe('Log Levels', () => {
    it('should log debug messages', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('Debug message', { feature: 'test' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"feature":"test"')
      );
    });

    it('should log info messages', () => {
      logger.info('Info message', { userId: '123' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Info message')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"123"')
      );
    });

    it('should log warning messages', () => {
      logger.warn('Warning message', { action: 'test-action' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Warning message')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action":"test-action"')
      );
    });

    it('should log error messages', () => {
      logger.error('Error message', { requestId: 'req-123' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error message')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"requestId":"req-123"')
      );
    });
  });

  describe('Error Handling', () => {
    it('should log error objects with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Operation failed')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error: Test error')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('at ')
      ); // Stack trace
    });

    it('should handle errors with custom properties', () => {
      const error: any = new Error('Custom error');
      error.code = 'ERR_CUSTOM';
      logger.error('Custom error occurred', error);

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('Custom error');
      expect(logOutput).toContain('ERR_CUSTOM');
    });

    it('should handle error as context parameter', () => {
      logger.error('Error with context', {
        errorCode: 'E001',
        severity: 'high',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"errorCode":"E001"')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"severity":"high"')
      );
    });
  });

  describe('Environment-based Behavior', () => {
    it('should skip debug logs in production unless enabled', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEBUG = 'false';

      // Create a new logger instance to pick up env changes
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

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"user-123"')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"feature":"auth"')
      );
    });

    it('should merge contexts in child logger', () => {
      const childLogger = logger.child({ userId: 'user-123' });

      childLogger.info('Action performed', { action: 'create-portfolio' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"user-123"')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action":"create-portfolio"')
      );
    });

    it('should handle nested child loggers', () => {
      const childLogger = logger.child({ requestId: 'req-123' });
      const grandchildLogger = childLogger.child({ userId: 'user-456' });

      grandchildLogger.info('Nested context test');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"requestId":"req-123"')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"user-456"')
      );
    });

    it('should handle errors in child logger', () => {
      const childLogger = logger.child({ feature: 'portfolio' });
      const error = new Error('Portfolio error');

      childLogger.error('Failed to create portfolio', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Failed to create portfolio')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Portfolio error')
      );
    });
  });

  describe('Log Formatting', () => {
    it('should include timestamp in logs', () => {
      logger.info('Timestamp test');

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      // Check for ISO timestamp format
      expect(logOutput).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
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

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(metadata))
      );
    });

    it('should handle circular references in context', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj; // Create circular reference

      // This should not throw an error
      expect(() => {
        logger.info('Circular reference test', { obj: circularObj });
      }).not.toThrow();
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

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] ')
      );
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000);
      logger.info(longMessage);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(longMessage)
      );
    });
  });
});
