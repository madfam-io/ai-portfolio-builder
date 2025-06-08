'use client';

import BaseLayout from '@/components/layouts/BaseLayout';
// import { useLanguage } from '@/lib/i18n/simple-context'; // Not used yet
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaEdit, FaEye, FaTrash } from 'react-icons/fa';

export default function Dashboard() {
  // const { t } = useLanguage(); // Not used yet

  const portfolios = [
    {
      id: 1,
      name: 'My Professional Portfolio',
      status: 'Published',
      lastModified: '2 days ago',
      views: 234,
    },
    {
      id: 2,
      name: 'Creative Portfolio',
      status: 'Draft',
      lastModified: '1 week ago',
      views: 0,
    },
  ];

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Portfolios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and create your professional portfolios
            </p>
          </div>
          <Link
            href="/editor"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Create New Portfolio
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Portfolios
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {portfolios.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Published
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {portfolios.filter(p => p.status === 'Published').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Views
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
              Your Portfolios
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
                      {portfolio.status} • Modified {portfolio.lastModified} •{' '}
                      {portfolio.views} views
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
              No portfolios yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first portfolio to get started
            </p>
            <Link
              href="/editor"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Create Portfolio
            </Link>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
