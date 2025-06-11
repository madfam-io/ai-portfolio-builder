/**
 * @fileoverview Offline State Fallback Components
 *
 * Provides user-friendly offline state displays when the application
 * loses internet connectivity or server connection.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { FiWifiOff, FiRefreshCw, FiCloud } from 'react-icons/fi';
import { useLanguage } from '@/lib/i18n/refactored-context';

/**
 * Full Page Offline State
 */
export function OfflineState({
  onRetry,
  showRetry = true,
}: {
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  const { t } = useLanguage();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);

    // Check if we're back online
    if (navigator.onLine) {
      onRetry?.();
    }

    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 relative">
            <FiWifiOff className="w-10 h-10 text-gray-600 dark:text-gray-400" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {(t.errors as any)?.offlineTitle || "You're Offline"}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {(t.errors as any)?.offlineDescription ||
              'Check your internet connection and try again'}
          </p>
        </div>

        {showRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
            />
            {isRetrying
              ? (t.common as any)?.retrying || 'Retrying...'
              : (t.errors as any)?.tryAgain || 'Try Again'}
          </button>
        )}

        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {(t.errors as any)?.offlineCapabilities ||
              'While offline, you can:'}
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              • {(t.errors as any)?.offlineViewCached || 'View cached content'}
            </li>
            <li>
              • {(t.errors as any)?.offlineEditLocal || 'Edit local data'}
            </li>
            <li>
              •{' '}
              {(t.errors as any)?.offlineSyncLater ||
                'Changes will sync when online'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Offline Indicator
 */
export function OfflineIndicator() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <FiWifiOff className="w-5 h-5 text-red-400" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {(t.errors as any)?.offlineMode || 'Offline Mode'}
          </p>
          <p className="text-xs text-gray-300">
            {(t.errors as any)?.offlineModeDescription ||
              'Limited functionality available'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Offline Banner
 */
export function OfflineBanner() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || !isVisible) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiWifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {(t.errors as any)?.offlineBanner || 'You are currently offline'}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Offline Card for sections
 */
export function OfflineCard({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
      <FiCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title || (t.errors as any)?.offlineContent || 'Offline Content'}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description ||
          (t.errors as any)?.offlineContentDescription ||
          'This content is not available offline'}
      </p>
    </div>
  );
}

/**
 * Connection Status Hook
 */
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}
