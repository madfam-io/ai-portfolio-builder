/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Central export for all error handling utilities
 */

// Re-export error types
export * from '@/types/errors';

// Export error logger
export {
  errorLogger,
  type ErrorContext,
  type ErrorLogEntry,
} from './error-logger';

// Export API error handler
export {
  handleApiError,
  withErrorHandler,
  createApiHandler,
  validateMethod,
  parseJsonBody,
  type ApiErrorResponse,
} from './api-error-handler';

// Export retry and recovery utilities
export {
  retry,
  CircuitBreaker,
  createDebouncedRetry,
  withTimeout,
  type RetryOptions,
} from './retry-handler';

// Export global error handler
export { globalErrorHandler } from './global-error-handler';

// Export React error boundary components
export {
  ErrorBoundary,
  ComponentErrorBoundary,
  useErrorHandler,
} from '@/components/error/error-boundary';
