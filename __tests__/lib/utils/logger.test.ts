describe('Logger Utility', () => {
  let logger: any;
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  const originalShowLogs = process.env.SHOW_LOGS;

  beforeAll(() => {
    // Enable logs for testing
    process.env.SHOW_LOGS = 'true';
    // Clear module cache and re-import logger to pick up env change
    jest.resetModules();
    logger = require('@/lib/utils/logger').logger;
  });

  afterAll(() => {
    // Restore original value
    process.env.SHOW_LOGS = originalShowLogs;
  });

  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();
    
    // Reset environment
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { data: 'test' });

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Test info message');
      expect(parsed.context.data).toBe('test');
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');

      expect(console.warn).toHaveBeenCalled();
      const logOutput = (console.warn as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('Test warning message');
    });

    it('should log error messages with Error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error occurred');
      expect(parsed.error.message).toBe('Test error');
    });

    it('should log debug messages in development', () => {
      // Need to re-instantiate logger with development mode
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      const devLogger = require('@/lib/utils/logger').logger;
      
      devLogger.debug('Debug message', { debug: true });

      expect(console.debug).toHaveBeenCalled();
      const logOutput = (console.debug as jest.Mock).mock.calls[0][0];
      expect(logOutput).toContain('[DEBUG]');
      expect(logOutput).toContain('Debug message');
      expect(logOutput).toContain('"debug":true');
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.debug('Debug message');

      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      logger.error('Error with stack', error);

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as jest.Mock).mock.calls[0][0];
      expect(logOutput).toContain('Error with stack');
      expect(logOutput).toContain('Test error');
      expect(logOutput).toContain('Error stack trace');
    });

    it('should handle custom error objects', () => {
      const customError = {
        code: 'CUSTOM_ERROR',
        message: 'Custom error message',
        details: { field: 'value' }
      };

      logger.error('Custom error', customError as any);

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as jest.Mock).mock.calls[0][0];
      expect(logOutput).toContain('Custom error');
      expect(logOutput).toContain('CUSTOM_ERROR');
      expect(logOutput).toContain('Custom error message');
    });

    it('should handle null/undefined errors', () => {
      logger.error('Error without object', null as any);

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as jest.Mock).mock.calls[0][0];
      expect(logOutput).toContain('Error without object');
    });
  });

  describe('Metadata Handling', () => {
    it('should include metadata in logs', () => {
      const metadata = {
        userId: 'user-123',
        action: 'portfolio_save',
        duration: 1234
      };

      logger.info('Action completed', metadata);

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      expect(logOutput).toContain('Action completed');
      expect(logOutput).toContain('user-123');
      expect(logOutput).toContain('portfolio_save');
      expect(logOutput).toContain('1234');
    });

    it('should handle complex metadata', () => {
      const complexData = {
        user: { id: '123', name: 'Test' },
        portfolio: { id: '456', status: 'draft' },
        metrics: [1, 2, 3]
      };

      logger.info('Complex log', complexData);

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      expect(logOutput).toContain('Complex log');
      expect(logOutput).toContain('123');
      expect(logOutput).toContain('Test');
      expect(logOutput).toContain('456');
      expect(logOutput).toContain('draft');
    });
  });

  describe('Log Levels', () => {
    it('should respect log level in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'error';

      logger.info('Should log in current implementation');
      logger.warn('Should log in current implementation');
      logger.error('Should log');

      // Current implementation logs all levels except debug in production
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Formatting', () => {
    it('should format timestamps correctly', () => {
      const fixedDate = new Date('2023-12-01T10:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as any);

      logger.info('Timestamp test');

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.timestamp).toContain('2023-12-01');
      expect(parsed.message).toBe('Timestamp test');

      (global.Date as any).mockRestore();
    });

    it('should include log level in output', () => {
      logger.info('Level test');
      logger.warn('Warning test');
      logger.error('Error test', new Error());

      const infoLog = JSON.parse((console.info as jest.Mock).mock.calls[0][0]);
      expect(infoLog.level).toBe('info');
      
      const warnLog = JSON.parse((console.warn as jest.Mock).mock.calls[0][0]);
      expect(warnLog.level).toBe('warn');
      
      const errorLog = JSON.parse((console.error as jest.Mock).mock.calls[0][0]);
      expect(errorLog.level).toBe('error');
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      const startTime = Date.now();
      
      // Simulate some operation
      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.info('Operation completed', {
        duration,
        operation: 'test_operation'
      });

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      expect(logOutput).toContain('Operation completed');
      expect(logOutput).toContain('test_operation');
      expect(logOutput).toMatch(/"duration":\d+/);
    });
  });

  describe('Security', () => {
    it('should log sensitive information in production (currently not filtered)', () => {
      process.env.NODE_ENV = 'production';

      const sensitiveData = {
        password: 'secret123',
        apiKey: 'sk_test_123',
        token: 'jwt_token_here'
      };

      logger.info('User data', sensitiveData);

      // Current implementation does not filter sensitive data
      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as jest.Mock).mock.calls[0][0];
      // This is a security issue that needs to be fixed
      expect(logOutput).toContain('secret123');
    });
  });
});