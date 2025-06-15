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
  return async () => {
    attempts++;
    if (attempts <= failCount) {
      throw new Error(`Attempt ${attempts} failed`);
    }
    return successValue;
  };
}

describe('Retry Handler', () => {
  describe('retry', () => {
    it('should retry failed operations', async () => {
      const fn = createFailingFunction(2, 'success');
      const result = await retry(fn, { maxAttempts: 3 });
      
      expect(result).toBe('success');
    });

    it('should throw after max attempts', async () => {
      const fn = createFailingFunction(5, 'success');
      
      await expect(retry(fn, { maxAttempts: 3 })).rejects.toThrow('Attempt 3 failed');
    });

    it('should respect retry condition', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new AppError('Not retryable', 'TEST', 400);
      };

      await expect(retry(fn, {
        maxAttempts: 3,
        retryCondition: (error) => {
          return error instanceof AppError && error.statusCode >= 500;
        },
      })).rejects.toThrow('Not retryable');
      
      expect(attempts).toBe(1); // Should not retry
    });

    it('should retry on ExternalServiceError by default', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new ExternalServiceError('API', new Error('Network error'));
        }
        return 'success';
      };

      const result = await retry(fn);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should apply exponential backoff', async () => {
      const startTime = Date.now();
      const fn = createFailingFunction(2, 'success');
      
      await retry(fn, {
        maxAttempts: 3,
        initialDelay: 100,
        backoffMultiplier: 2,
      });
      
      const duration = Date.now() - startTime;
      // Should take at least 100ms (first retry) + 200ms (second retry) = 300ms
      expect(duration).toBeGreaterThanOrEqual(300);
      expect(duration).toBeLessThan(400); // Some buffer for execution time
    });

    it('should respect max delay', async () => {
      const startTime = Date.now();
      const fn = createFailingFunction(3, 'success');
      
      await retry(fn, {
        maxAttempts: 4,
        initialDelay: 100,
        maxDelay: 150,
        backoffMultiplier: 10,
      });
      
      const duration = Date.now() - startTime;
      // Should be capped at 150ms per retry × 3 retries = 450ms
      expect(duration).toBeLessThan(500);
    });

    it('should call onRetry callback', async () => {
      const onRetry = jest.fn();
      const fn = createFailingFunction(2, 'success');
      
      await retry(fn, {
        maxAttempts: 3,
        onRetry,
      });
      
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 2);
    });
  });

  describe('CircuitBreaker', () => {
    it('should allow requests when closed', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = async () => 'success';
      
      const result = await breaker.execute(fn);
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });

    it('should open after threshold failures', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = async () => {
        throw new Error('Failed');
      };

      // Fail 3 times to trip the breaker
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      }
      
      expect(breaker.getState()).toBe('open');
    });

    it('should reject requests when open', async () => {
      const breaker = new CircuitBreaker(1, 1000);
      const fn = async () => {
        throw new Error('Failed');
      };

      // Trip the breaker
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      
      // Should reject without calling function
      await expect(breaker.execute(async () => 'success')).rejects.toThrow(
        'Service temporarily unavailable'
      );
    });

    it('should use fallback when open', async () => {
      const breaker = new CircuitBreaker(1, 1000);
      const fn = async () => {
        throw new Error('Failed');
      };
      const fallback = async () => 'fallback value';

      // Trip the breaker
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      
      // Should use fallback
      const result = await breaker.execute(fn, fallback);
      expect(result).toBe('fallback value');
    });

    it('should enter half-open state after timeout', async () => {
      const breaker = new CircuitBreaker(1, 50, 50); // Short timeouts for testing
      const fn = async () => {
        throw new Error('Failed');
      };

      // Trip the breaker
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      expect(breaker.getState()).toBe('open');
      
      // Wait for retry timeout
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Should attempt the operation (half-open)
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
    });

    it('should reset on success in half-open state', async () => {
      const breaker = new CircuitBreaker(1, 50, 50);
      let shouldFail = true;
      const fn = async () => {
        if (shouldFail) throw new Error('Failed');
        return 'success';
      };

      // Trip the breaker
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      
      // Wait for retry timeout
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Allow success
      shouldFail = false;
      const result = await breaker.execute(fn);
      
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });
  });

  describe('createDebouncedRetry', () => {
    it('should debounce multiple calls', async () => {
      let callCount = 0;
      const fn = async (value: string) => {
        callCount++;
        return value;
      };

      const debounced = createDebouncedRetry(fn, 100);

      // Make multiple calls
      debounced('first');
      debounced('second');
      const resultPromise = debounced('third');

      // Should only execute once with the last value
      const result = await resultPromise;
      expect(result).toBe('third');
      expect(callCount).toBe(1);
    });

    it('should handle errors', async () => {
      const fn = async () => {
        throw new Error('Debounced error');
      };

      const debounced = createDebouncedRetry(fn, 50);
      
      await expect(debounced()).rejects.toThrow('Debounced error');
    });

    it('should execute after delay', async () => {
      const fn = async (value: string) => value;
      const debounced = createDebouncedRetry(fn, 100);

      const startTime = Date.now();
      const result = await debounced('test');
      const duration = Date.now() - startTime;

      expect(result).toBe('test');
      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(150);
    });
  });

  describe('withTimeout', () => {
    it('should resolve if operation completes in time', async () => {
      const promise = new Promise<string>(resolve => {
        setTimeout(() => resolve('success'), 50);
      });

      const result = await withTimeout(promise, 100);
      expect(result).toBe('success');
    });

    it('should reject if operation times out', async () => {
      const promise = new Promise<string>(resolve => {
        setTimeout(() => resolve('success'), 200);
      });

      await expect(withTimeout(promise, 100)).rejects.toThrow(
        'Operation timed out after 100ms'
      );
    });

    it('should use custom timeout error', async () => {
      const promise = new Promise<string>(() => {
        // Never resolves
      });

      const customError = new Error('Custom timeout');
      await expect(withTimeout(promise, 50, customError)).rejects.toThrow(
        'Custom timeout'
      );
    });

    it('should propagate original error if operation fails', async () => {
      const promise = Promise.reject(new Error('Original error'));

      await expect(withTimeout(promise, 100)).rejects.toThrow('Original error');
    });
  });
});