'use client';

import { useState, useEffect } from 'react';
import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/minimal-context';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaEye, FaTrash, FaSpinner } from 'react-icons/fa';

// Mock portfolio type - will be replaced with real database schema
interface Portfolio {
  id: string;
  name: string;
  status: 'published' | 'draft';
  lastModified: string;
  views: number;
  user_id: string;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock portfolios data - will be replaced with real API calls
  const mockPortfolios: Portfolio[] = user ? [
    {
      id: '1',
      name: t.portfolioName1,
      status: 'published',
      lastModified: `2 ${t.daysAgo}`,
      views: 234,
      user_id: user.id,
    },
    {
      id: '2',
      name: t.portfolioName2,
      status: 'draft',
      lastModified: t.weekAgo,
      views: 0,
      user_id: user.id,
    },
  ] : [];

  useEffect(() => {
    // If user is not authenticated, redirect to sign in
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Load user's portfolios (mock data for now)
    if (user) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPortfolios(mockPortfolios);
        setLoading(false);
      }, 1000);
    }
  }, [user, authLoading, router]);

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

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.hello}, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}!
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
              {portfolios.reduce((sum, p) => sum + p.views, 0)}
            </p>
          </div>
        </div>

        {/* Portfolio List */}
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
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {portfolio.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {portfolio.status === 'published' ? t.statusPublished : t.statusDraft} • {t.lastModified} {portfolio.lastModified} •{' '}
                      {portfolio.views} {t.views}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <FaEye />
                    </button>
                    <Link
                      href={`/editor/${portfolio.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <FaEdit />
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {portfolios.length === 0 && (
          <div className="text-center py-12">
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
        )}
      </div>
    </BaseLayout>
  );
}
