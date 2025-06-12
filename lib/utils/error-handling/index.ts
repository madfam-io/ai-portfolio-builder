/**
 * @fileoverview Error Handling Index
 *
 * Central export point for all error handling utilities.
 */

// Error types
export type {
  ErrorType,
  ErrorSeverity,
  ErrorReport,
  ErrorBoundaryConfig,
  ErrorRecoveryOptions,
  ErrorHandler,
  ErrorFilter,
  ErrorTransformer,
} from './error-types';

// Error utilities
export {
  serializeError,
  getErrorType,
  getErrorMessage,
  getUserFriendlyMessage,
  getErrorContext,
  createContextualError,
  isRetryableError,
  getErrorRecoveryStrategy,
  formatErrorForDisplay,
  AggregateError,
} from './error-utils';

// Error monitoring
export {
  default as errorMonitoring,
  captureError,
  commonFilters,
} from './error-monitoring';
