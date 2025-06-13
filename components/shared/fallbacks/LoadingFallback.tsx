'use client';

import React from 'react';
import { FiLoader } from 'react-icons/fi';

import { useLanguage } from '@/lib/i18n/refactored-context';

/**
 * @fileoverview Loading Fallback Components
 *
 * Comprehensive loading states and skeleton screens for the PRISMA platform.
 * Provides consistent loading experiences across different UI patterns.
 */

/**
 * Full Page Loading Fallback
 */
export function FullPageLoader({
  message,
  transparent = false,
}: {
  message?: string;
  transparent?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        transparent ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-900'
      }`}
    >
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <FiLoader className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-ping" />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {message || (t as any).common?.loading || 'Loading...'}
        </p>
      </div>
    </div>
  );
}

/**
 * Inline Loading Spinner
 */
export function InlineLoader({
  size = 'md',
  color = 'purple',
  message,
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'gray' | 'white';
  message?: string;
}) {
  const { t: _t } = useLanguage();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    purple: 'text-purple-600 dark:text-purple-400',
    gray: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <FiLoader
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      />
      {message && (
        <span className={`text-sm ${colorClasses[color]}`}>{message}</span>
      )}
    </div>
  );
}

/**
 * Button Loading State
 */
export function ButtonLoader({
  children,
  loading,
  loadingText,
  className = '',
}: {
  children: React.ReactNode;
  loading: boolean;
  loadingText?: string;
  className?: string;
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <button disabled className={`${className} opacity-60 cursor-not-allowed`}>
        <InlineLoader
          size="sm"
          color="white"
          message={loadingText || (t as any).common?.loading || 'Loading...'}
        />
      </button>
    );
  }

  return <>{children}</>;
}

/**
 * Card Skeleton Loader
 */
export function CardSkeleton({
  count = 1,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse ${className}`}
        >
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table Skeleton Loader
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Form Skeleton Loader
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
      <div className="flex gap-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Text Content Skeleton
 */
export function TextSkeleton({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          style={{
            width: index === lines - 1 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Image Skeleton Loader
 */
export function ImageSkeleton({
  width = 'w-full',
  height = 'h-64',
  rounded = 'rounded-lg',
}: {
  width?: string;
  height?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`${width} ${height} bg-gray-200 dark:bg-gray-700 ${rounded} animate-pulse`}
    />
  );
}

/**
 * Profile Skeleton Loader
 */
export function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
        >
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Navigation Skeleton
 */
export function NavigationSkeleton() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="hidden md:flex space-x-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Generic Content Loader with customizable layout
 */
export function ContentLoader({
  type = 'card',
  repeat = 1,
}: {
  type?: 'card' | 'list' | 'grid' | 'table' | 'form';
  repeat?: number;
}) {
  switch (type) {
    case 'card':
      return <CardSkeleton count={repeat} />;
    case 'table':
      return <TableSkeleton rows={repeat} />;
    case 'form':
      return <FormSkeleton fields={repeat} />;
    case 'list':
      return (
        <div className="space-y-4">
          {Array.from({ length: repeat }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <ProfileSkeleton />
            </div>
          ))}
        </div>
      );
    case 'grid':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton count={repeat} />
        </div>
      );
    default:
      return <CardSkeleton count={repeat} />;
  }
}
