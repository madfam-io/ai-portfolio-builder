
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ErrorLogger, errorLogger } from '@/lib/services/error/error-logger';
import { describe, test, it, expect, beforeEach, afterEach, jest,  } from '@jest/globals';

/**
 * Tests for Error Logger Service
 */

// Unmock the error logger for this test

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
    const originalEnv = process.env;
    process.env = { ...originalEnv };

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
    it('should return singleton instance', async () => {
      const instance1 = ErrorLogger.getInstance();
      const instance2 = ErrorLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('logError', () => {
    it('should log standard Error objects', async () => {
      const error = new Error('Test error');
      errorLogger.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toBe('Test error');
      expect(logData.level).toBe('error');
    });

    it('should log AppError with additional details', async () => {
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

    it('should log with context information', async () => {
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

    it('should handle non-Error objects', async () => {
      errorLogger.logError('String error');
      expect(consoleSpy).toHaveBeenCalled();

      errorLogger.logError({ message: 'Object error' });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should suppress logs in test environment when ENABLE_TEST_LOGS is not set', async () => {
      process.env.NODE_ENV = 'test';
      delete process.env.ENABLE_TEST_LOGS;

      errorLogger.logError(new Error('Test error'));
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should show logs in test environment when ENABLE_TEST_LOGS is set', async () => {
      process.env.NODE_ENV = 'test';
      process.env.ENABLE_TEST_LOGS = 'true';

      errorLogger.logError(new Error('Test error'));
      expect(consoleSpy).toHaveBeenCalled();

      delete process.env.ENABLE_TEST_LOGS;
    });
  });

  describe('logWarning', () => {
    it('should log warning messages', async () => {
      errorLogger.logWarning('Test warning');

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe('warn');
      expect(logData.message).toBe('Test warning');
    });

    it('should include context in warnings', async () => {
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
    it('should log info messages', async () => {
      errorLogger.logInfo('Test info');

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe('info');
      expect(logData.message).toBe('Test info');
    });
  });

  describe('development vs production logging', () => {
    it('should use JSON format in test environment', async () => {
      errorLogger.logError(new Error('Test env error'));

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.message).toBe('Test env error');
      expect(parsed.level).toBe('error');
    });

    it('should include stack trace in error logs', async () => {
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
    it('should handle ValidationError', async () => {
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

    it('should handle ExternalServiceError', async () => {
      const originalError = new Error('Connection failed');
      const error = new ExternalServiceError('Database', originalError);

      errorLogger.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('External service error: Database');
    });
  });
});
