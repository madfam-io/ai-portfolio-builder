'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaSpinner,
  FaGlobe,
} from 'react-icons/fa';

import BaseLayout from '@/components/layouts/BaseLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Portfolio } from '@/types/portfolio';
import { logger } from '@/lib/utils/logger';
// Removed portfolioService import - will use API calls instead

export default function Dashboard(): React.ReactElement {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's portfolios
  useEffect(() => {
    // If user is not authenticated, redirect to sign in
    if (authLoading === false && user === null) {
      router.push('/auth/signin');
      return;
    }

    // Load user's portfolios
    if (user !== null) {
      void loadPortfolios();
    }
  }, [user, authLoading, router]);

  const loadPortfolios = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/portfolios');
      if (response.ok === false) {
        throw new Error('Failed to fetch portfolios');
      }

      const { data: userPortfolios } = await response.json();
      setPortfolios(userPortfolios);
    } catch (err) {
      logger.error(
        'Failed to load portfolios',
        err instanceof Error ? err : { error: err }
      );
      setError('Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      } else {
        throw new Error('Failed to delete portfolio');
      }
    } catch (err) {
      logger.error(
        'Failed to delete portfolio',
        err instanceof Error ? err : { error: err }
      );
      alert('Failed to delete portfolio');
    }
  };

  const getStatusBadge = (status: Portfolio['status']) => {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'archived':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} ${t.daysAgo}`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} ${t.weekAgo}`;

    return date.toLocaleDateString();
  };

  // Show loading spinner while checking authentication or loading data
  if (authLoading || loading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t.loadingDashboard}
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // If not authenticated (shouldn't reach here due to redirect, but just in case)
  if (!user) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <BaseLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadPortfolios}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.hello}, {user.email?.split('@')[0] || 'User'}!
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-2">
              {t.myPortfolios}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t.managePortfolios}
            </p>
          </div>
          <Link
            href="/editor"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            {t.createNewPortfolio}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t.totalPortfolios}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {portfolios.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t.published}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {portfolios.filter(p => p.status === 'published').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t.totalViews}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {portfolios.reduce((sum, p) => sum + (p.views || 0), 0)}
            </p>
          </div>
        </div>

        {/* Portfolio List */}
        {portfolios.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t.yourPortfolios}
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {portfolios.map(portfolio => (
                <div
                  key={portfolio.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {portfolio.name}
                        </h3>
                        <span className={getStatusBadge(portfolio.status)}>
                          {portfolio.status === 'published'
                            ? t.statusPublished
                            : t.statusDraft}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {portfolio.title}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {t.lastModified} {formatDate(portfolio.updatedAt)}
                        </span>
                        <span>•</span>
                        <span>
                          {portfolio.views || 0} {t.views}
                        </span>
                        {portfolio.subdomain && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaGlobe className="text-xs" />
                              {portfolio.subdomain}.prisma.io
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {portfolio.status === 'published' && (
                        <a
                          href={`https://${portfolio.subdomain}.prisma.io`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="View live portfolio"
                        >
                          <FaEye />
                        </a>
                      )}
                      <Link
                        href={`/editor?id=${portfolio.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Edit portfolio"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete portfolio"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FaPlus className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t.noPortfoliosYet}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t.createFirstPortfolio}
              </p>
              <Link
                href="/editor"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                {t.createPortfolio}
              </Link>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
