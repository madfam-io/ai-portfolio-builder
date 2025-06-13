import { ErrorType } from './error-types';

/**
 * @fileoverview Error Handling Utilities
 *
 * Core utilities for error serialization, type detection,
 * and user-friendly error message generation.
 */

/**
 * Serialize error for logging and transmission
 */
export function serializeError(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: (error as unknown).cause,
      // Include any custom properties
      ...Object.getOwnPropertyNames(error).reduce(
        (acc, key) => {
          if (!['name', 'message', 'stack', 'cause'].includes(key)) {
            acc[key] = (error as unknown)[key];
          }
          return acc;
        },
        {} as Record<string, any>
      ),
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      type: 'string',
    };
  }

  if (error && typeof error === 'object') {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return {
        message: 'Unable to serialize error object',
        type: 'object',
      };
    }
  }

  return {
    message: String(error),
    type: typeof error,
  };
}

/**
 * Detect error type from error object
 */
export function getErrorType(error: unknown): ErrorType {
  if (!error) return 'unknown';

  const errorMessage = getErrorMessage(error).toLowerCase();
  const errorName = error instanceof Error ? error.name.toLowerCase() : '';

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror') ||
    errorMessage.includes('timeout') ||
    errorName.includes('network') ||
    errorName.includes('timeout')
  ) {
    return 'network';
  }

  // Authentication errors
  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('auth') ||
    errorMessage.includes('login') ||
    errorMessage.includes('token') ||
    errorMessage.includes('session') ||
    errorName.includes('auth')
  ) {
    return 'authentication';
  }

  // Permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('access denied') ||
    errorMessage.includes('not allowed') ||
    errorName.includes('permission')
  ) {
    return 'permission';
  }

  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('must be') ||
    errorMessage.includes('should be') ||
    errorName.includes('validation')
  ) {
    return 'validation';
  }

  // Server errors
  if (
    errorMessage.includes('server') ||
    errorMessage.includes('500') ||
    errorMessage.includes('internal') ||
    errorName.includes('server')
  ) {
    return 'server';
  }

  // Not found errors
  if (
    errorMessage.includes('not found') ||
    errorMessage.includes('404') ||
    errorMessage.includes('does not exist') ||
    errorName.includes('notfound')
  ) {
    return 'notFound';
  }

  return 'unknown';
}

/**
 * Get error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unknown error occurred';
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);

  const friendlyMessages: Record<ErrorType, (msg: string) => string> = {
    network: () =>
      'Unable to connect. Please check your internet connection and try again.',
    authentication: () =>
      'Your session has expired. Please sign in again to continue.',
    permission: () => "You don't have permission to perform this action.",
    validation: msg => {
      // Try to extract field name from validation error
      const fieldMatch = msg.match(/field[:\s]+(\w+)/i);
      if (fieldMatch) {
        return `Please check the ${fieldMatch[1]} field and try again.`;
      }
      return 'Please check your input and try again.';
    },
    server: () =>
      'Our servers are experiencing issues. Please try again later.',
    notFound: () => 'The requested resource could not be found.',
    unknown: () => 'Something went wrong. Please try again.',
  };

  return friendlyMessages[errorType](errorMessage);
}

/**
 * Get error context for logging
 */
export function getErrorContext() {
  const context: Record<string, any> = {
    timestamp: new Date().toISOString(),
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    viewport:
      typeof window !== 'undefined'
        ? {
            width: window.innerWidth,
            height: window.innerHeight,
          }
        : null,
  };

  // Add user context if available
  if (typeof window !== 'undefined' && (window as unknown).__USER_CONTEXT__) {
    context.user = (window as unknown).__USER_CONTEXT__;
  }

  return context;
}

/**
 * Create error with additional context
 */
export function createContextualError(
  message: string,
  type: ErrorType,
  context?: Record<string, any>
): Error {
  const error = new Error(message);
  error.name = type.charAt(0).toUpperCase() + type.slice(1) + 'Error';

  if (context) {
    Object.assign(error, { context });
  }

  return error;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const errorType = getErrorType(error);
  const retryableTypes: ErrorType[] = ['network', 'server'];

  if (retryableTypes.includes(errorType)) {
    return true;
  }

  // Check for specific error codes
  const errorMessage = getErrorMessage(error).toLowerCase();
  const retryableMessages = [
    'timeout',
    'network',
    'fetch',
    '502',
    '503',
    '504',
    'service unavailable',
  ];

  return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'redirect' | 'ignore';
  action: () => void | Promise<void>;
  delay?: number;
  maxAttempts?: number;
}

export function getErrorRecoveryStrategy(
  error: unknown,
  context?: {
    onRetry?: () => void | Promise<void>;
    onFallback?: () => void;
    onRedirect?: (path: string) => void;
  }
): ErrorRecoveryStrategy | null {
  const errorType = getErrorType(error);

  switch (errorType) {
    case 'network':
    case 'server':
      if (context?.onRetry && isRetryableError(error)) {
        return {
          type: 'retry',
          action: context.onRetry,
          delay: 1000,
          maxAttempts: 3,
        };
      }
      break;

    case 'authentication':
      if (context?.onRedirect) {
        return {
          type: 'redirect',
          action: () => context.onRedirect!('/auth/signin'),
        };
      }
      break;

    case 'permission':
      if (context?.onRedirect) {
        return {
          type: 'redirect',
          action: () => context.onRedirect!('/'),
        };
      }
      break;

    case 'notFound':
      if (context?.onRedirect) {
        return {
          type: 'redirect',
          action: () => context.onRedirect!('/404'),
        };
      }
      break;

    default:
      if (context?.onFallback) {
        return {
          type: 'fallback',
          action: context.onFallback,
        };
      }
  }

  return null;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  description: string;
  details?: string;
} {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);
  const userMessage = getUserFriendlyMessage(error);

  const titles: Record<ErrorType, string> = {
    network: 'Connection Error',
    authentication: 'Authentication Required',
    permission: 'Access Denied',
    validation: 'Invalid Input',
    server: 'Server Error',
    notFound: 'Not Found',
    unknown: 'Error',
  };

  return {
    title: titles[errorType],
    description: userMessage,
    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
  };
}

/**
 * Aggregate multiple errors
 */
export class AggregateError extends Error {
  public errors: Error[];

  constructor(errors: Error[], message?: string) {
    super(message || `${errors.length} errors occurred`);
    this.name = 'AggregateError';
    this.errors = errors;
  }

  getAllMessages(): string[] {
    return this.errors.map(err => err.message);
  }

  hasErrorType(type: ErrorType): boolean {
    return this.errors.some(err => getErrorType(err) === type);
  }
}
