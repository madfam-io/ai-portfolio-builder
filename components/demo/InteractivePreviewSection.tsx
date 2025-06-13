'use client';

import Link from 'next/link';
import React from 'react';
import FiArrowLeft from 'react-icons/fi/FiArrowLeft';
import FiCheck from 'react-icons/fi/FiCheck';

import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { Portfolio } from '@/types/portfolio';

interface InteractivePreviewSectionProps {
  portfolio: Portfolio;
  previewConfig: {
    mode: 'desktop' | 'tablet' | 'mobile';
    theme: 'light' | 'dark';
    showGrid: boolean;
  };
  previewDimensions: {
    width: string;
    height: string;
    scale: number;
  };
  t: any; // TODO: Add proper translation type
  onPreviousStep: () => void;
  onExport: () => void;
}

export function InteractivePreviewSection({
  portfolio,
  previewConfig,
  previewDimensions,
  t,
  onPreviousStep,
  onExport,
}: InteractivePreviewSectionProps): React.ReactElement {
  return (
    <>
      {/* Preview Container */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 flex items-center justify-center min-h-[600px]">
        <div className="relative bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden">
          <div
            className="mx-auto transition-all duration-300"
            style={{
              width:
                previewDimensions.width === '100%'
                  ? '100%'
                  : previewDimensions.width,
              height:
                previewDimensions.height === '100%'
                  ? 'calc(100% - 120px)'
                  : previewDimensions.height,
              transform: `scale(${previewDimensions.scale})`,
              transformOrigin: 'center top',
              maxWidth: '100%',
              maxHeight: 'calc(100% - 120px)',
            }}
          >
            <div className="overflow-y-auto h-full" data-preview-container>
              <LazyWrapper
                component={() =>
                  import('@/components/editor/PortfolioPreview').then(mod => ({
                    default: mod.PortfolioPreview,
                  }))
                }
                componentProps={{
                  portfolio: portfolio,
                  mode: previewConfig.mode,
                  isInteractive: false,
                }}
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin text-3xl text-purple-600 mx-auto mb-4">
                        ⟳
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t.demoLoadingPreview}
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and Features */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {/* Features bar */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span>Custom Domain Support</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span>SEO Optimized</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span>Analytics Dashboard</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span>SSL Certificate</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onPreviousStep}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t.demoBackToEditor}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t.demoLoveWhatYouSee}
              </p>
              <Link
                href="/auth/signup"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>{t.demoGetStartedFreeTrial}</span>
                <FiArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={onExport}
                className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
