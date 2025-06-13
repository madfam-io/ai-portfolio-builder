'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
// Removed server-side service import - will use API calls instead

import { PortfolioEditor } from '@/components/editor/index.lazy'; // Use lazy-loaded version
import { preloadEditorComponents } from '@/components/editor/index.lazy';
import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { logger } from '@/lib/utils/logger';
import { Portfolio } from '@/types/portfolio';

function EditorContent(): React.ReactElement {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const portfolioId = searchParams.get('id');

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preload editor components when page loads
  useEffect(() => {
    preloadEditorComponents();
  }, []);

  // Load portfolio data
  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        if (portfolioId === null || portfolioId === '') {
          // Check for template selection from landing page
          const selectedTemplate =
            searchParams.get('template') ??
            (typeof window !== 'undefined'
              ? localStorage.getItem('selectedTemplate')
              : null) ??
            'developer';

          // Clear the stored template after use
          if (typeof window !== 'undefined') {
            localStorage.removeItem('selectedTemplate');
          }

          // Create a new portfolio with selected template
          const response = await fetch('/api/v1/portfolios', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'Nuevo Portafolio',
              title: 'Profesional',
              bio: '',
              template: selectedTemplate,
            }),
          });

          if (response.ok === false) {
            throw new Error('Failed to create portfolio');
          }

          const { data: newPortfolio } = await response.json();
          setPortfolio(newPortfolio);
          // Update URL with new portfolio ID, preserving template parameter
          router.replace(
            `/editor?id=${newPortfolio.id}&template=${selectedTemplate}`
          );
        } else {
          // Load existing portfolio
          const response = await fetch(`/api/v1/portfolios/${portfolioId}`);
          if (response.ok === false) {
            setError('Portfolio not found');
            return;
          }
          const { data: existingPortfolio } = await response.json();
          setPortfolio(existingPortfolio);
        }
      } catch (err) {
        logger.error('Failed to load portfolio', err as Error);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [portfolioId, router, searchParams]);

  // Save portfolio handler
  const handleSave = async (updatedPortfolio: Portfolio) => {
    try {
      const response = await fetch(
        `/api/v1/portfolios/${updatedPortfolio.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPortfolio),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save portfolio');
      }

      const { data: saved } = await response.json();
      setPortfolio(saved);
    } catch (error) {
      logger.error('Failed to save portfolio', error as Error);
      throw error; // Re-throw to let the editor handle the error
    }
  };

  // Publish portfolio handler
  const handlePublish = async () => {
    if (!portfolio) return;

    try {
      const response = await fetch(
        `/api/v1/portfolios/${portfolio.id}/publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish portfolio');
      }

      const { data: published } = await response.json();
      setPortfolio(published);
    } catch (error) {
      logger.error('Failed to publish portfolio', error as Error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <BaseLayout className="!bg-gray-50 dark:!bg-gray-900">
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

  // Error state
  if (error) {
    return (
      <BaseLayout className="!bg-gray-50 dark:!bg-gray-900">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                {t.backToDashboard}
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // No portfolio loaded
  if (!portfolio) {
    return (
      <BaseLayout className="!bg-gray-50 dark:!bg-gray-900">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No portfolio found
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Main editor interface
  return (
    <BaseLayout
      className="!bg-gray-50 dark:!bg-gray-900"
      showHeader={false}
      showFooter={false}
    >
      <PortfolioEditor
        portfolioId={portfolio.id}
        userId={portfolio.userId}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </BaseLayout>
  );
}

export default function EditorPage(): React.ReactElement {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
