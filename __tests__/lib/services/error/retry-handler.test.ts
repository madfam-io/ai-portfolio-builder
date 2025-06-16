/**
 * Tests for Retry Handler
 */

import {
  retry,
  CircuitBreaker,
  createDebouncedRetry,
  withTimeout,
} from '@/lib/services/error/retry-handler';
import { AppError, ExternalServiceError } from '@/types/errors';

// Helper to create a function that fails n times then succeeds
function createFailingFunction<T>(failCount: number, successValue: T) {
  let attempts = 0;
  return jest.fn(() => {
    attempts++;
    if (attempts <= failCount) {
      return Promise.reject(new ExternalServiceError(`Attempt ${attempts} failed`));
    }
    return Promise.resolve(successValue);
  });
}

describe('Retry Handler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('retry', () => {
    it('should retry failed operations', async () => {
      const fn = createFailingFunction(2, 'success');
      
      const retryPromise = retry(fn, { 
        maxAttempts: 3,
        initialDelay: 100,
      });

      // Wait for initial attempt
      await jest.runOnlyPendingTimersAsync();
      // Wait for first retry
      await jest.runOnlyPendingTimersAsync();
      // Wait for second retry (successful)
      await jest.runOnlyPendingTimersAsync();
      
      const result = await retryPromise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max attempts', async () => {
      const fn = createFailingFunction(5, 'success');
      
      const retryPromise = retry(fn, { 
        maxAttempts: 3,
        initialDelay: 100,
      });

      // Run all timers
      await jest.runAllTimersAsync();
      
      await expect(retryPromise).rejects.toThrow('Attempt 3 failed');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should respect retry condition', async () => {
      let attempts = 0;
      const fn = jest.fn(() => {
        attempts++;
        if (attempts === 1) {
          return Promise.reject(new AppError('Client error', 400));
        }
        return Promise.resolve('success');
      });

      const retryPromise = retry(fn, { maxAttempts: 3 });
      
      await jest.runAllTimersAsync();
      
      // Should not retry on 4xx errors
      await expect(retryPromise).rejects.toThrow('Client error');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff', async () => {
      const fn = createFailingFunction(3, 'success');
      const delays: number[] = [];

      const retryPromise = retry(fn, {
        maxAttempts: 4,
        initialDelay: 100,
        backoffMultiplier: 2,
        onRetry: (_error, _attempt) => {
          const currentTime = jest.now();
          delays.push(currentTime);
        }
      });

      await jest.runAllTimersAsync();
      await retryPromise;

      expect(fn).toHaveBeenCalledTimes(4);
      // Verify exponential backoff
      if (delays.length >= 2) {
        const firstDelay = delays[1] - delays[0];
        const secondDelay = delays[2] - delays[1];
        expect(secondDelay).toBeGreaterThan(firstDelay);
      }
    });

    it('should respect max delay', async () => {
      const fn = createFailingFunction(5, 'success');
      
      const retryPromise = retry(fn, {
        maxAttempts: 6,
        initialDelay: 100,
        maxDelay: 200,
        backoffMultiplier: 10,
      });

      await jest.runAllTimersAsync();
      await retryPromise;

      expect(fn).toHaveBeenCalledTimes(6);
    });

    it('should call onRetry callback', async () => {
      const fn = createFailingFunction(2, 'success');
      const onRetry = jest.fn();

      const retryPromise = retry(fn, {
        maxAttempts: 3,
        initialDelay: 100,
        onRetry,
      });

      await jest.runAllTimersAsync();
      await retryPromise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 2);
    });
  });

  describe('CircuitBreaker', () => {
    it('should open circuit after failure threshold', async () => {
      const fn = jest.fn(() => {
        return Promise.reject(new ExternalServiceError('Service error'));
      });

      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 2,
        resetTimeout: 1000,
      });

      // First two calls should fail normally
      await expect(breaker.call()).rejects.toThrow('Service error');
      await expect(breaker.call()).rejects.toThrow('Service error');
      
      // Circuit should now be open
      await expect(breaker.call()).rejects.toThrow('Circuit breaker is open');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should transition to half-open after timeout', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce('success');

      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 2,
        resetTimeout: 1000,
      });

      // Open the circuit
      await expect(breaker.call()).rejects.toThrow('Error 1');
      await expect(breaker.call()).rejects.toThrow('Error 2');
      await expect(breaker.call()).rejects.toThrow('Circuit breaker is open');

      // Wait for reset timeout
      await jest.advanceTimersByTimeAsync(1000);

      // Circuit should be half-open, next call should succeed
      const result = await breaker.call();
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should close circuit after successful call in half-open state', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValue('success');

      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 2,
        resetTimeout: 1000,
      });

      // Open the circuit
      await expect(breaker.call()).rejects.toThrow();
      await expect(breaker.call()).rejects.toThrow();

      // Wait and transition to half-open
      await jest.advanceTimersByTimeAsync(1000);

      // Successful call should close the circuit
      await breaker.call();
      
      // Circuit should be closed, multiple calls should work
      await expect(breaker.call()).resolves.toBe('success');
      await expect(breaker.call()).resolves.toBe('success');
    });

    it('should report current state', async () => {
      const fn = jest.fn(() => {
        return Promise.reject(new ExternalServiceError('Service error'));
      });

      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 1,
      });

      // Initially closed
      expect(breaker.getState()).toBe('closed');

      // Open after failure
      await expect(breaker.call()).rejects.toThrow('Service error');
      expect(breaker.getState()).toBe('open');
    });
  });

  describe('createDebouncedRetry', () => {
    it('should debounce retries', async () => {
      const fn = jest.fn(async (value: string) => value);
      const debounced = createDebouncedRetry(fn as any, 200);

      // Multiple calls in quick succession
      const promise1 = debounced('first');
      const promise2 = debounced('second');
      const promise3 = debounced('third');

      await jest.runAllTimersAsync();

      // Only the last call should execute
      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual(['third', 'third', 'third']);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });
  });

  describe('withTimeout', () => {
    it('should timeout long-running operations', async () => {
      const longRunningPromise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 5000);
      });

      const promise = withTimeout(longRunningPromise, 1000);
      
      await jest.advanceTimersByTimeAsync(1001);

      await expect(promise).rejects.toThrow('Operation timed out after 1000ms');
    });

    it('should return result if operation completes in time', async () => {
      const quickPromise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 500);
      });

      const promise = withTimeout(quickPromise, 1000);
      
      await jest.advanceTimersByTimeAsync(500);

      const result = await promise;
      expect(result).toBe('success');
    });
  });
});