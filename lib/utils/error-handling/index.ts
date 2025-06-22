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
  errorMonitoring,
  captureError,
  commonFilters,
} from './error-monitoring';
