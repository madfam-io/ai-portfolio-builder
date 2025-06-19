
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

import { jest, describe, test, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AppError, ExternalServiceError } from '@/types/errors';
import { errorLogger } from '@/lib/services/error/error-logger';
import {
  retry,
  CircuitBreaker,
  createDebouncedRetry,
  withTimeout,
} from '@/lib/services/error/retry-handler';


// Mock dependencies
jest.mock('@/lib/services/error/error-logger');

// Mock timers
jest.useFakeTimers();

describe('Retry Handler', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await retry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new ExternalServiceError('Service unavailable'))
        .mockRejectedValueOnce(new ExternalServiceError('Service unavailable'))
        .mockResolvedValue('success');

      const promise = retry(mockFn);

      // Fast-forward through retries
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(errorLogger.logWarning).toHaveBeenCalledTimes(2);
    });

    it('should fail after max attempts', async () => {
      const error = new ExternalServiceError('Service unavailable');
      const mockFn = jest.fn().mockRejectedValue(error);

      const promise = retry(mockFn, { maxAttempts: 3 });

      // Fast-forward through all retries
      await jest.runAllTimersAsync();

      await await await expect(promise).rejects.toThrow(error);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const error = new AppError('Bad request', 'BAD_REQUEST', 400);
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(retry(mockFn)).rejects.toThrow(error);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should use custom retry condition', async () => {
      const error = new Error('Custom error');
      const mockFn = jest.fn().mockRejectedValue(error);

      const retryCondition = jest.fn().mockReturnValue(false);

      await expect(retry(mockFn, { retryCondition })).rejects.toThrow(error);

      expect(retryCondition).toHaveBeenCalledWith(error);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new ExternalServiceError('Error'))
        .mockRejectedValueOnce(new ExternalServiceError('Error'))
        .mockResolvedValue('success');

      // Use real timers for this test to avoid timeout issues
      jest.useRealTimers();

      const result = await retry(mockFn, {
        initialDelay: 10,
        backoffMultiplier: 2,
        maxAttempts: 3,
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);

      // Restore fake timers for other tests
      jest.useFakeTimers();
    });

    it('should respect max delay', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValue(new ExternalServiceError('Error'));

      const promise = retry(mockFn, {
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 2000,
        backoffMultiplier: 10,
      });

      // Fast-forward through all retries
      await jest.runAllTimersAsync();

      await await await expect(promise).rejects.toThrow();

      // Check that delay was capped at maxDelay
      const logCalls = (errorLogger.logWarning as jest.Mock).mock.calls;
      const lastDelay = logCalls[logCalls.length - 1][1].metadata.delay;
      expect(lastDelay).toBe(2000);
    });

    it('should call onRetry callback', async () => {
      const onRetry = jest.fn().mockReturnValue(void 0);
      const error = new ExternalServiceError('Error');
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const promise = retry(mockFn, { onRetry });

      await jest.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledWith(error, 1);
    });

    it('should retry on network errors', async () => {
      const networkError = new Error('network timeout');
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');

      const promise = retry(mockFn);

      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx errors', async () => {
      const serverError = new AppError('Server error', 'SERVER_ERROR', 503);
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue('success');

      const promise = retry(mockFn);

      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker(3, 60000, 30000);
    });

    it('should execute function when closed', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should trip after threshold failures', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Fail threshold times
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn);
        } catch {}
      }

      expect(circuitBreaker.getState()).toBe('open');
      expect(errorLogger.logWarning).toHaveBeenCalledWith(
        'Circuit breaker tripped',
        expect.any(Object)

    });

    it('should reject immediately when open', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn);
        } catch {}
      }

      // Should reject without calling function
      mockFn.mockClear();

      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow(
        'Service temporarily unavailable'

      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should use fallback when open', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
      const fallback = jest.fn().mockResolvedValue('fallback');

      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn);
        } catch {}
      }

      const result = await circuitBreaker.execute(mockFn, fallback);

      expect(result).toBe('fallback');
      expect(fallback).toHaveBeenCalled();
    });

    it('should transition to half-open after timeout', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('Failure'))
        .mockRejectedValue(new Error('Failure'))
        .mockRejectedValue(new Error('Failure'))
        .mockResolvedValue('success');

      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn);
        } catch {}
      }

      expect(circuitBreaker.getState()).toBe('open');

      // Advance time past retry timeout
      jest.advanceTimersByTime(30001);

      // Should try again in half-open state
      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe('closed');
      expect(errorLogger.logInfo).toHaveBeenCalledWith('Circuit breaker reset');
    });

    it('should re-open if half-open attempt fails', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn);
        } catch {}
      }

      // Advance to half-open
      jest.advanceTimersByTime(30001);

      // Fail in half-open state
      try {
        await circuitBreaker.execute(mockFn);
      } catch {}

      expect(circuitBreaker.getState()).toBe('open');
    });

    it('should reset on successful execution in half-open', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('Failure'))
        .mockRejectedValue(new Error('Failure'))
        .mockRejectedValue(new Error('Failure'))
        .mockResolvedValue('success');

      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn);
        } catch {}
      }

      // Advance to half-open
      jest.advanceTimersByTime(30001);

      // Succeed in half-open state
      await circuitBreaker.execute(mockFn);

      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should handle async fallback functions', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
      const asyncFallback = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'async fallback';
      });

      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFn);
        } catch {}
      }

      const promise = circuitBreaker.execute(mockFn, asyncFallback);
      jest.advanceTimersByTime(100);

      const result = await promise;
      expect(result).toBe('async fallback');
    });
  });

  describe('createDebouncedRetry', () => {
    it('should debounce multiple calls', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const debouncedFn = createDebouncedRetry(mockFn, 10); // Reduce delay for faster test

      // Make multiple calls
      const promise1 = debouncedFn('arg1');
      const promise2 = debouncedFn('arg2');
      const promise3 = debouncedFn('arg3');

      // Fast-forward past debounce delay
      jest.advanceTimersByTime(20);
      await Promise.resolve(); // Allow promises to resolve

      const results = await Promise.all([promise1, promise2, promise3]);

      // Only last call should execute
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
      expect(results).toEqual(['success', 'success', 'success']);
    });

    it('should handle errors in debounced function', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const debouncedFn = createDebouncedRetry(mockFn, 100);

      const promise = debouncedFn();

      jest.advanceTimersByTime(100);

      await await await expect(promise).rejects.toThrow(error);
    });

    it('should reset state after execution', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const debouncedFn = createDebouncedRetry(mockFn, 100);

      // First call
      const promise1 = debouncedFn('arg1');
      jest.advanceTimersByTime(100);
      await promise1;

      // Second call after reset
      const promise2 = debouncedFn('arg2');
      jest.advanceTimersByTime(100);
      await promise2;

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1');
      expect(mockFn).toHaveBeenNthCalledWith(2, 'arg2');
    });
  });

  describe('withTimeout', () => {
    it('should resolve if promise completes before timeout', async () => {
      const promise = Promise.resolve('success');

      const result = await withTimeout(promise, 1000);

      expect(result).toBe('success');
    });

    it('should reject if promise times out', async () => {
      const slowPromise = new Promise(resolve => {
        setTimeout(() => resolve('success'), 2000);
      });

      const promise = withTimeout(slowPromise, 1000);

      jest.advanceTimersByTime(1000);

      await await await expect(promise).rejects.toThrow('Operation timed out after 1000ms');
    });

    it('should use custom timeout error', async () => {
      const slowPromise = new Promise(() => {});
      const customError = new Error('Custom timeout');

      const promise = withTimeout(slowPromise, 100, customError);

      jest.advanceTimersByTime(100);

      await await await expect(promise).rejects.toThrow(customError);
    });

    it('should handle already rejected promises', async () => {
      const error = new Error('Original error');
      const rejectedPromise = Promise.reject(error);

      await expect(withTimeout(rejectedPromise, 1000)).rejects.toThrow(error);
    });
  });
});
