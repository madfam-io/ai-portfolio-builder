/**
 * @fileoverview Error Type Definitions
 * 
 * Defines error types and interfaces used throughout
 * the error handling system.
 */

/**
 * Error type categories
 */
export type ErrorType =
  | 'network'
  | 'authentication'
  | 'permission'
  | 'validation'
  | 'server'
  | 'notFound'
  | 'unknown';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error report interface
 */
export interface ErrorReport {
  id: string;
  timestamp: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    buildVersion?: string;
    environment: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}

/**
 * Error boundary configuration
 */
export interface ErrorBoundaryConfig {
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableLogging?: boolean;
  enableReporting?: boolean;
  showDetails?: boolean;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  maxRetries?: number;
}

/**
 * Error recovery options
 */
export interface ErrorRecoveryOptions {
  retry?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
  fallback?: {
    component?: React.ComponentType;
    message?: string;
  };
  redirect?: {
    path: string;
    delay?: number;
  };
}

/**
 * Error handler function type
 */
export type ErrorHandler = (
  error: Error,
  context?: Record<string, any>
) => void | Promise<void>;

/**
 * Error filter function type
 */
export type ErrorFilter = (error: Error) => boolean;

/**
 * Error transformer function type
 */
export type ErrorTransformer = (error: Error) => Error;