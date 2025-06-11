'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BaseLayout from '@/components/layouts/BaseLayout';
import PortfolioEditor from '@/components/editor/PortfolioEditor';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Portfolio } from '@/types/portfolio';
import { portfolioService } from '@/lib/services/portfolioService';
import Link from 'next/link';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

function EditorContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const portfolioId = searchParams.get('id');

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load portfolio data
  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        if (!portfolioId) {
          // Check for template selection from landing page
          const selectedTemplate =
            searchParams.get('template') ||
            (typeof window !== 'undefined'
              ? localStorage.getItem('selectedTemplate')
              : null) ||
            'developer';

          // Clear the stored template after use
          if (typeof window !== 'undefined') {
            localStorage.removeItem('selectedTemplate');
          }

          // Create a new portfolio with selected template
          const newPortfolio = await portfolioService.createPortfolio({
            name: 'Nuevo Portafolio',
            title: 'Profesional',
            bio: '',
            template: selectedTemplate as
              | 'developer'
              | 'creative'
              | 'business'
              | 'educator',
            userId: 'user-1', // Mock user ID
          });
          setPortfolio(newPortfolio);
          // Update URL with new portfolio ID, preserving template parameter
          router.replace(
            `/editor?id=${newPortfolio.id}&template=${selectedTemplate}`
          );
        } else {
          // Load existing portfolio
          const existingPortfolio =
            await portfolioService.getPortfolio(portfolioId);
          if (!existingPortfolio) {
            setError('Portfolio not found');
            return;
          }
          setPortfolio(existingPortfolio);
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err);
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
      const saved = await portfolioService.updatePortfolio(
        updatedPortfolio.id,
        updatedPortfolio
      );
      if (saved) {
        setPortfolio(saved);
        // Portfolio saved successfully
      }
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      throw error; // Re-throw to let the editor handle the error
    }
  };

  // Publish portfolio handler
  const handlePublish = async () => {
    if (!portfolio) return;

    try {
      const published = await portfolioService.publishPortfolio(portfolio.id);
      if (published) {
        setPortfolio(published);
        // Portfolio published successfully
      }
    } catch (error) {
      console.error('Failed to publish portfolio:', error);
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

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
