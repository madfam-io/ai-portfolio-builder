import { logger } from '@/lib/utils/logger';

describe('Logger Utility', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
    
    // Clear environment
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    // Restore all spies
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test info message'
      );
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Test warning message'
      );
    });

    it('should log error messages with Error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Error occurred',
        error
      );
    });

    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('Debug message');
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Debug message'
      );
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.debug('Debug message');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      logger.error('Error:', error);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Error:',
        error
      );
    });

    it('should handle custom error objects', () => {
      const customError = {
        message: 'Custom error',
        code: 'ERR_001',
        details: { field: 'test' },
      };
      
      logger.error('Custom error occurred', customError);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Custom error occurred',
        customError
      );
    });

    it('should handle null/undefined errors', () => {
      logger.error('Error occurred', null);
      logger.error('Another error', undefined);
      
      expect(consoleSpy.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('Metadata Handling', () => {
    it('should include metadata in logs', () => {
      const metadata = { userId: '123', action: 'login' };
      logger.info('User action', metadata);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'User action',
        metadata
      );
    });

    it('should handle complex metadata', () => {
      const complexData = {
        user: { id: '123', name: 'Test' },
        timestamp: new Date(),
        array: [1, 2, 3],
      };
      
      logger.info('Complex data', complexData);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Complex data',
        complexData
      );
    });
  });

  describe('Log Levels', () => {
    it('should respect log level in production', () => {
      process.env.NODE_ENV = 'production';
      
      // In production, debug should not log
      logger.debug('Debug in prod');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      
      // But other levels should work
      logger.info('Info in prod');
      logger.warn('Warn in prod');
      logger.error('Error in prod');
      
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('Formatting', () => {
    it('should format timestamps correctly', () => {
      const beforeTime = new Date().toISOString();
      logger.info('Test message');
      const afterTime = new Date().toISOString();
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should include log level in output', () => {
      logger.info('Info test');
      logger.warn('Warn test');
      logger.error('Error test');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Info test'
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Warn test'
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Error test'
      );
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      const metrics = {
        duration: 1234,
        operationName: 'fetchData',
        itemCount: 100,
      };
      
      logger.info('Performance metrics', metrics);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Performance metrics',
        metrics
      );
    });
  });

  describe('Security', () => {
    it('should log sensitive information in production (currently not filtered)', () => {
      process.env.NODE_ENV = 'production';
      
      // Create a new logger instance to pick up env changes
      const { logger: prodLogger } = require('@/lib/utils/logger');
      
      const sensitiveData = {
        password: 'secret123',
        apiKey: 'sk_test_123',
        creditCard: '4111111111111111',
      };
      
      prodLogger.warn('Sensitive data warning', sensitiveData);
      
      // In production, output is JSON formatted
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('"level":"warn"')
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Sensitive data warning"')
      );
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with persistent context', () => {
      const childLogger = logger.child({ userId: '123', feature: 'test' });
      
      childLogger.info('Child log message');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Child log message')
      );
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"123"')
      );
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('"feature":"test"')
      );
    });
  });
});