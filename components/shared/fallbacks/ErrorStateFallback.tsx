'use client';

import React from 'react';
import {
  FiAlertTriangle,
  FiWifiOff,
  FiLock,
  FiXCircle,
  FiRefreshCw,
  FiHome,
  FiMail,
  FiAlertCircle,
} from 'react-icons/fi';

import { useLanguage } from '@/lib/i18n/refactored-context';
import { ErrorType } from '@/lib/utils/error-handling/error-types';

/**
 * @fileoverview Error State Fallback Components
 *
 * Provides user-friendly error state displays with retry capabilities.
 * Handles various error scenarios with appropriate messaging and actions.
 */

interface ErrorStateProps {
  error?: Error | string;
  errorType?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onReport?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

/**
 * Base Error State Component
 */
export function ErrorState({
  error,
  errorType = 'unknown',
  title,
  description,
  onRetry,
  onGoHome,
  onReport,
  showDetails = false,
  compact = false,
}: ErrorStateProps) {
  const { t } = useLanguage();

  const errorMessage = typeof error === 'string' ? error : error?.message;
  const errorStack = typeof error === 'object' ? error?.stack : undefined;

  if (compact) {
    return (
      <CompactErrorState
        errorType={errorType}
        title={title}
        description={description}
        onRetry={onRetry}
      />
    );
  }

  const errorIcons: Record<ErrorType, React.ReactNode> = {
    network: <FiWifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />,
    authentication: (
      <FiLock className="w-8 h-8 text-red-600 dark:text-red-400" />
    ),
    permission: (
      <FiLock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
    ),
    validation: (
      <FiXCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
    ),
    server: (
      <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
    ),
    notFound: (
      <FiXCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
    ),
    unknown: (
      <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
    ),
  };

  const defaultTitles: Record<ErrorType, string> = {
    network: (t as any).errors?.networkErrorTitle || 'Network Error',
    authentication: (t as any).errors?.authErrorTitle || 'Authentication Error',
    permission: (t as any).errors?.permissionErrorTitle || 'Permission Denied',
    validation: (t as any).errors?.validationErrorTitle || 'Validation Error',
    server: (t as any).errors?.serverErrorTitle || 'Server Error',
    notFound: (t as any).errors?.notFoundTitle || 'Not Found',
    unknown: (t as any).errors?.unknownErrorTitle || 'Unknown Error',
  };

  const defaultDescriptions: Record<ErrorType, string> = {
    network:
      (t as any).errors?.networkErrorDescription ||
      'Please check your internet connection',
    authentication:
      (t as any).errors?.authErrorDescription || 'Please sign in to continue',
    permission:
      (t as any).errors?.permissionErrorDescription ||
      "You don't have permission to access this resource",
    validation:
      (t as any).errors?.validationErrorDescription ||
      'Please check your input and try again',
    server:
      (t as any).errors?.serverErrorDescription ||
      'Our servers are experiencing issues',
    notFound:
      (t as any).errors?.notFoundDescription ||
      'The requested resource was not found',
    unknown:
      (t as any).errors?.unknownErrorDescription ||
      'An unexpected error occurred',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
        {errorIcons[errorType]}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {title || defaultTitles[errorType]}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        {description || defaultDescriptions[errorType]}
      </p>

      {showDetails && errorMessage && (
        <details className="w-full max-w-md mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
            {(t as any).errors?.technicalDetails || 'Technical Details'}
          </summary>
          <div className="space-y-2 mt-2">
            <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
              {errorMessage}
            </p>
            {errorStack && (
              <pre className="text-xs font-mono text-gray-500 dark:text-gray-500 whitespace-pre-wrap overflow-x-auto">
                {errorStack}
              </pre>
            )}
          </div>
        </details>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            {(t as any).errors?.tryAgain || 'Try Again'}
          </button>
        )}

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiHome className="w-4 h-4" />
            {(t as any).errors?.goToHomepage || 'Go to Homepage'}
          </button>
        )}

        {onReport && (
          <button
            onClick={onReport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FiMail className="w-4 h-4" />
            {(t as any).errors?.reportBug || 'Report Bug'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Error State for inline usage
 */
function CompactErrorState({
  errorType,
  title,
  description,
  onRetry,
}: {
  errorType: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();

  const errorColors: Record<ErrorType, string> = {
    network: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    authentication:
      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    permission:
      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    validation:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    server: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    notFound:
      'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    unknown: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  return (
    <div className={`border rounded-lg p-4 ${errorColors[errorType]}`}>
      <div className="flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {title && (
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-red-700 dark:text-red-300">
              {description}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
            >
              <FiRefreshCw className="w-3 h-3" />
              {(t as any).errors?.retry || 'Retry'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Network Error State
 */
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useLanguage();

  return (
    <ErrorState
      errorType="network"
      title={(t as any).errors?.networkErrorTitle || 'Network Error'}
      description={
        (t as any).errors?.networkErrorDescription ||
        'Please check your internet connection'
      }
      onRetry={onRetry}
    />
  );
}

/**
 * Authentication Error State
 */
export function AuthErrorState({ onLogin }: { onLogin: () => void }) {
  const { t } = useLanguage();

  return (
    <ErrorState
      errorType="authentication"
      title={(t as any).errors?.authErrorTitle || 'Authentication Error'}
      description={
        (t as any).errors?.authErrorDescription || 'Please sign in to continue'
      }
      onRetry={onLogin}
    />
  );
}

/**
 * Permission Denied State
 */
export function PermissionDeniedState({
  resource,
  onGoBack,
}: {
  resource?: string;
  onGoBack?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <ErrorState
      errorType="permission"
      title={(t as any).errors?.permissionErrorTitle || 'Permission Denied'}
      description={
        resource
          ? (
              (t as any).errors?.permissionErrorDescriptionResource ||
              "You don't have permission to access {resource}"
            ).replace('{resource}', resource)
          : (t as any).errors?.permissionErrorDescription ||
            "You don't have permission to access this resource"
      }
      onGoHome={onGoBack}
    />
  );
}

/**
 * Not Found State
 */
export function NotFoundState({
  resource,
  onGoHome,
}: {
  resource?: string;
  onGoHome?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <ErrorState
      errorType="notFound"
      title={
        resource
          ? `${resource} ${(t as any).errors?.notFound || 'Not Found'}`
          : (t as any).errors?.notFoundTitle || 'Not Found'
      }
      description={
        (t as any).errors?.notFoundDescription ||
        'The requested resource was not found'
      }
      onGoHome={onGoHome}
    />
  );
}

/**
 * Form Validation Error State
 */
export function ValidationErrorState({
  errors,
  onCorrect,
}: {
  errors?: string[];
  onCorrect?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            {(t as any).errors?.validationErrorTitle || 'Validation Error'}
          </h4>
          {errors && errors.length > 0 && (
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li
                  key={index}
                  className="text-sm text-red-700 dark:text-red-300"
                >
                  • {error}
                </li>
              ))}
            </ul>
          )}
          {onCorrect && (
            <button
              onClick={onCorrect}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              {(t as any).errors?.correctErrors || 'Please correct the errors'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Server Error State
 */
export function ServerErrorState({
  onRetry,
  onReport,
}: {
  onRetry?: () => void;
  onReport?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <ErrorState
      errorType="server"
      title={(t as any).errors?.serverErrorTitle || 'Server Error'}
      description={
        (t as any).errors?.serverErrorDescription ||
        'Our servers are experiencing issues'
      }
      onRetry={onRetry}
      onReport={onReport}
    />
  );
}

/**
 * Timeout Error State
 */
export function TimeoutErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useLanguage();

  return (
    <ErrorState
      errorType="network"
      title={(t as any).errors?.timeoutErrorTitle || 'Request Timeout'}
      description={
        (t as any).errors?.timeoutErrorDescription ||
        'The request took too long to complete'
      }
      onRetry={onRetry}
    />
  );
}
