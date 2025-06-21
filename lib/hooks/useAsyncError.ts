/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * useAsyncError Hook
 * Provides error handling for async operations in React components
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { errorLogger, getErrorMessage } from '@/lib/services/error';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface UseAsyncOptions {
  /**
   * Retry failed operations
   */
  retry?: boolean;
  /**
   * Number of retry attempts
   */
  retryCount?: number;
  /**
   * Delay between retries in ms
   */
  retryDelay?: number;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;
  /**
   * Callback when operation succeeds
   */
  onSuccess?: <T>(data: T) => void;
  /**
   * Whether to log errors
   */
  logErrors?: boolean;
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
): AsyncState<T> & {
  execute: () => Promise<void>;
  reset: () => void;
} {
  const {
    retry = false,
    retryCount = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
    logErrors = true,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const mounted = useRef(true);
  const currentRetryCount = useRef(0);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!mounted.current) return;

    setState({
      data: null,
      error: null,
      isLoading: true,
      isError: false,
      isSuccess: false,
    });

    try {
      const data = await asyncFunction();

      if (!mounted.current) return;

      setState({
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      });

      currentRetryCount.current = 0;
      onSuccess?.(data);
    } catch (error) {
      if (!mounted.current) return;

      const errorObj =
        error instanceof Error ? error : new Error(getErrorMessage(error));

      // Log error if enabled
      if (logErrors) {
        errorLogger.logError(errorObj, {
          component: 'useAsync',
          metadata: {
            retryCount: currentRetryCount.current,
            retry,
          },
        });
      }

      // Retry logic
      if (retry && currentRetryCount.current < retryCount) {
        currentRetryCount.current++;
        setTimeout(() => {
          if (mounted.current) {
            execute();
          }
        }, retryDelay * currentRetryCount.current);
        return;
      }

      setState({
        data: null,
        error: errorObj,
        isLoading: false,
        isError: true,
        isSuccess: false,
      });

      onError?.(errorObj);
    }
  }, [
    asyncFunction,
    retry,
    retryCount,
    retryDelay,
    onError,
    onSuccess,
    logErrors,
  ]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
    currentRetryCount.current = 0;
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for handling async operations that run on mount
 */
export function useAsyncEffect<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {}
): AsyncState<T> {
  const async = useAsync(asyncFunction, options);

  useEffect(() => {
    async.execute();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return async;
}

/**
 * Hook for handling async form submissions
 */
export function useAsyncForm<TData, TResponse>(
  submitFunction: (data: TData) => Promise<TResponse>,
  options: UseAsyncOptions = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<TResponse | null>(null);

  const submit = useCallback(
    async (data: TData) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await submitFunction(data);
        setResponse(result);
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(getErrorMessage(error));

        setError(errorObj);

        if (options.logErrors !== false) {
          errorLogger.logError(errorObj, {
            component: 'useAsyncForm',
            action: 'form_submission',
          });
        }

        options.onError?.(errorObj);
        throw errorObj;
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitFunction, options]
  );

  const reset = useCallback(() => {
    setError(null);
    setResponse(null);
    setIsSubmitting(false);
  }, []);

  return {
    submit,
    reset,
    isSubmitting,
    error,
    response,
    isError: !!error,
    isSuccess: !!response && !error,
  };
}

/**
 * Hook for handling errors in event handlers
 */
export function useErrorHandler() {
  return useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    errorLogger.logError(error, {
      component: 'useErrorHandler',
      metadata: errorInfo ? { errorInfo } : undefined,
    });
  }, []);
}
