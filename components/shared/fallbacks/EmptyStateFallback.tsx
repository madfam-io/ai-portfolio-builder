'use client';

import {
  Database,
  FileText,
  Folder,
  Image,
  Inbox,
  Search,
  ShoppingBag,
  Upload,
  Users,
} from 'lucide-react';
import React from 'react';

import { useLanguage } from '@/lib/i18n/refactored-context';

/**
 * @fileoverview Empty State Fallback Components
 *
 * Provides user-friendly empty state displays when no data is available.
 * Includes call-to-action prompts and helpful guidance.
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Base Empty State Component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      {icon && <div className="mb-4">{icon}</div>}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-sm">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * No Results Empty State
 */
export function NoResultsState({
  searchTerm,
  onClearSearch,
  suggestions: _suggestions,
}: {
  searchTerm?: string;
  onClearSearch?: () => void;
  suggestions?: string[];
}) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      }
      title={
        searchTerm
          ? (t as any).emptyStates?.noSearchResults || 'No search results'
          : (t as any).emptyStates?.noResults || 'No results'
      }
      description={
        searchTerm
          ? (
              (t as any).emptyStates?.noSearchResultsDescription ||
              'No results found for "{term}"'
            ).replace('{term}', searchTerm)
          : (t as any).emptyStates?.noResultsDescription ||
            'No results to display'
      }
      action={
        onClearSearch
          ? {
              label: (t as any).emptyStates?.clearSearch || 'Clear search',
              onClick: onClearSearch,
            }
          : undefined
      }
    />
  );
}

/**
 * No Portfolios Empty State
 */
export function NoPortfoliosState({
  onCreatePortfolio,
}: {
  onCreatePortfolio: () => void;
}) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={
        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
          <FileText className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
      }
      title={(t as any).emptyStates?.noPortfolios || 'No portfolios yet'}
      description={
        (t as any).emptyStates?.noPortfoliosDescription ||
        'Create your first portfolio to get started'
      }
      action={{
        label:
          (t as any).emptyStates?.createFirstPortfolio ||
          'Create First Portfolio',
        onClick: onCreatePortfolio,
      }}
    />
  );
}

/**
 * No Projects Empty State
 */
export function NoProjectsState({
  onAddProject,
}: {
  onAddProject: () => void;
}) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <Folder className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      }
      title={(t as any).emptyStates?.noProjects || 'No projects yet'}
      description={
        (t as any).emptyStates?.noProjectsDescription ||
        'Add your first project to showcase your work'
      }
      action={{
        label: (t as any).emptyStates?.addFirstProject || 'Add First Project',
        onClick: onAddProject,
      }}
    />
  );
}

/**
 * No Data Empty State
 */
export function NoDataState({
  type = 'generic',
}: {
  type?: 'generic' | 'analytics' | 'users' | 'products';
}) {
  const { t } = useLanguage();

  const configs = {
    generic: {
      icon: <Database className="w-8 h-8 text-gray-400 dark:text-gray-500" />,
      title: (t as any).emptyStates?.noData || 'No data available',
      description:
        (t as any).emptyStates?.noDataDescription ||
        'There is no data to display at this time',
    },
    analytics: {
      icon: <Database className="w-8 h-8 text-gray-400 dark:text-gray-500" />,
      title: (t as any).emptyStates?.noAnalyticsData || 'No analytics data',
      description:
        (t as any).emptyStates?.noAnalyticsDataDescription ||
        'Analytics data will appear here once available',
    },
    users: {
      icon: <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />,
      title: (t as any).emptyStates?.noUsers || 'No users found',
      description:
        (t as any).emptyStates?.noUsersDescription ||
        'No users match your criteria',
    },
    products: {
      icon: (
        <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      ),
      title: (t as any).emptyStates?.noProducts || 'No products found',
      description:
        (t as any).emptyStates?.noProductsDescription ||
        'No products are available',
    },
  };

  const config = configs[type];

  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          {config.icon}
        </div>
      }
      title={config.title}
      description={config.description}
    />
  );
}

/**
 * Upload Empty State
 */
export function UploadEmptyState({
  onUpload,
  acceptedFormats,
  maxSize,
}: {
  onUpload: () => void;
  acceptedFormats?: string[];
  maxSize?: string;
}) {
  const { t } = useLanguage();

  return (
    <div
      onClick={onUpload}
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer"
    >
      <EmptyState
        icon={
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        }
        title={(t as any).emptyStates?.uploadTitle || 'Upload files'}
        description={
          acceptedFormats
            ? `${(t as any).emptyStates?.uploadDescription || 'Upload your files'} ${acceptedFormats.join(', ')}${maxSize ? ` (${(t as any).emptyStates?.maxSize || 'Max size'} ${maxSize})` : ''}`
            : (t as any).emptyStates?.uploadDescription ||
              'Drag and drop files here or click to browse'
        }
      />
    </div>
  );
}

/**
 * No Images Empty State
 */
export function NoImagesState({ onAddImage }: { onAddImage: () => void }) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      }
      title={(t as any).emptyStates?.noImages || 'No images uploaded'}
      description={
        (t as any).emptyStates?.noImagesDescription ||
        'Upload images to get started'
      }
      action={{
        label: (t as any).emptyStates?.uploadImage || 'Upload Image',
        onClick: onAddImage,
      }}
    />
  );
}

/**
 * Generic Empty List State
 */
export function EmptyListState({
  itemType,
  onAdd,
}: {
  itemType: string;
  onAdd: () => void;
}) {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      }
      title={((t as any).emptyStates?.noItems || 'No {type} found').replace(
        '{type}',
        itemType
      )}
      description={(
        (t as any).emptyStates?.noItemsDescription ||
        'Add your first {type} to get started'
      ).replace('{type}', itemType)}
      action={{
        label: `${(t as any).common?.add || 'Add'} ${itemType}`,
        onClick: onAdd,
      }}
    />
  );
}

/**
 * Empty Table State
 */
export function EmptyTableState({
  columns,
  message,
}: {
  columns: number;
  message?: string;
}) {
  const { t } = useLanguage();

  return (
    <tr>
      <td colSpan={columns} className="py-12">
        <EmptyState
          icon={
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Inbox className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
          }
          title={
            message ||
            (t as any).emptyStates?.noTableData ||
            'No data available'
          }
        />
      </td>
    </tr>
  );
}

/**
 * Inline Empty State for compact spaces
 */
export function InlineEmptyState({
  message,
  icon: Icon = Inbox,
}: {
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-gray-500 dark:text-gray-400">
      <Icon className="w-4 h-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
