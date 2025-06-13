'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiFileText, FiHome, FiSearch } from 'react-icons/fi';

import { useLanguage } from '@/lib/i18n/refactored-context';

/**
 * @fileoverview Not Found (404) Fallback Components
 *
 * Provides user-friendly 404 and not found state displays
 * with helpful navigation options.
 */

/**
 * Full Page 404 Not Found
 */
export function NotFoundPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleGoHome = (): void => {
    router.push('/');
  };

  const handleGoBack = (): void => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-purple-200 dark:text-purple-900/50">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <FiFileText className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {(t.errors as unknown)?.pageNotFoundTitle || '404 - Page Not Found'}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {(t.errors as unknown)?.pageNotFoundDescription ||
            "The page you're looking for doesn't exist"}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiHome className="w-5 h-5" />
            {(t.errors as unknown)?.goToHomepage || 'Go to Homepage'}
          </button>

          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiArrowLeft className="w-5 h-5" />
            {(t.errors as unknown)?.goBack || 'Go Back'}
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            {(t.errors as unknown)?.helpfulLinks || 'Helpful Links'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/portfolios"
              className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
            >
              {(t.navigation as unknown)?.portfolios || 'Portfolios'}
            </a>
            <a
              href="/templates"
              className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
            >
              {(t.navigation as unknown)?.templates || 'Templates'}
            </a>
            <a
              href="/contact"
              className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
            >
              {(t.navigation as unknown)?.contact || 'Contact'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Resource Not Found Component
 */
export function ResourceNotFound({
  resourceType,
  resourceId,
  onGoBack,
}: {
  resourceType: string;
  resourceId?: string;
  onGoBack?: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleGoBack = (): void => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <FiFileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {resourceType} {(t.errors as unknown)?.notFound || 'Not Found'}
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        {(
          (t.errors as unknown)?.resourceNotFoundDescription ||
          "The {type} you're looking for doesn't exist"
        ).replace('{type}', resourceType.toLowerCase())}
        {resourceId && (
          <span className="block mt-1 font-mono text-xs">ID: {resourceId}</span>
        )}
      </p>

      <button
        onClick={handleGoBack}
        className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        {(t.errors as unknown)?.goBack || 'Go Back'}
      </button>
    </div>
  );
}

/**
 * Search No Results
 */
export function SearchNotFound({
  query,
  suggestions,
  onClearSearch,
  onSearch,
}: {
  query: string;
  suggestions?: string[];
  onClearSearch: () => void;
  onSearch: (query: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <FiSearch className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {(t.errors as unknown)?.noSearchResults || 'No Search Results'}
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        {(t.errors as unknown)?.noSearchResultsFor || 'No results found for'}{' '}
        &quot;
        <span className="font-medium">{query}</span>&quot;
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {(t.errors as unknown)?.searchSuggestions || 'Search suggestions'}:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSearch(suggestion)}
                className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onClearSearch}
        className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        {(t.errors as unknown)?.clearSearch || 'Clear Search'}
      </button>
    </div>
  );
}

/**
 * Dynamic Route Not Found
 */
export function DynamicNotFound({
  segment,
  validOptions,
}: {
  segment: string;
  validOptions?: string[];
}) {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-red-600 dark:text-red-400">
          ?
        </span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {(t.errors as unknown)?.invalidRoute || 'Invalid Route'}
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
        &quot;<span className="font-mono font-medium">{segment}</span>&quot;{' '}
        {(t.errors as unknown)?.isNotValid || 'is not a valid route segment'}
      </p>

      {validOptions && validOptions.length > 0 && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {(t.errors as unknown)?.validOptions || 'Valid options'}:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {validOptions.map((option, index) => (
              <span
                key={index}
                className="text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded"
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        {(t.errors as unknown)?.goBack || 'Go Back'}
      </button>
    </div>
  );
}
