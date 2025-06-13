'use client';

import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { Portfolio } from '@/types/portfolio';

interface PreviewStepProps {
  portfolio: Portfolio;
  previewConfig: {
    mode: 'desktop' | 'tablet' | 'mobile';
    state: 'editing' | 'preview' | 'fullscreen';
    zoomLevel: number;
    showSectionBorders: boolean;
    showInteractiveElements: boolean;
  };
  previewDimensions: {
    width: string | number;
    height: string | number;
    scale: number;
  };
  onPreviousStep: () => void;
  onExport: () => void;
  onShare: () => void;
  onRefresh: () => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  toggleFullscreen: () => void;
  setZoomLevel: (level: number) => void;
  toggleSectionBorders: () => void;
  toggleInteractiveElements: () => void;
  getResponsiveBreakpoints: () => Array<{ name: string; width: number }>;
  testResponsiveBreakpoint: (width: number, height: number) => void;
  translations: {
    demoLoadingControls: string;
    demoLoadingPreview: string;
    demoBackToEditor: string;
    demoLoveWhatYouSee: string;
    demoGetStartedFreeTrial: string;
    demoShareDemo: string;
  };
}

export function PreviewStep({
  portfolio,
  previewConfig,
  previewDimensions,
  onPreviousStep,
  onExport,
  onShare,
  onRefresh,
  setPreviewMode,
  toggleFullscreen,
  setZoomLevel,
  toggleSectionBorders,
  toggleInteractiveElements,
  getResponsiveBreakpoints,
  testResponsiveBreakpoint,
  translations: t,
}: PreviewStepProps): React.ReactElement {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Preview Controls */}
      <LazyWrapper
        component={() =>
          import('@/components/editor/PreviewControls').then(mod => ({
            default: mod.PreviewControls,
          }))
        }
        componentProps={{
          previewMode: previewConfig.mode,
          previewState: previewConfig.state,
          zoomLevel: previewConfig.zoomLevel,
          showSectionBorders: previewConfig.showSectionBorders,
          showInteractiveElements: previewConfig.showInteractiveElements,
          onPreviewModeChange: setPreviewMode,
          onToggleFullscreen: toggleFullscreen,
          onZoomChange: setZoomLevel,
          onToggleSectionBorders: toggleSectionBorders,
          onToggleInteractiveElements: toggleInteractiveElements,
          onRefresh,
          onExport,
          onShare,
          responsiveBreakpoints: getResponsiveBreakpoints(),
          onTestBreakpoint: testResponsiveBreakpoint,
        }}
        fallback={
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin text-lg text-purple-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                {t.demoLoadingControls}
              </span>
            </div>
          </div>
        }
      />

      {/* Preview Content */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div className="h-full flex flex-col items-center justify-center p-4">
          {/* Browser Chrome */}
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Portfolio URL:
              </h3>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                Live Preview
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  https://
                  {portfolio.name.toLowerCase().replace(/\s+/g, '')}
                  .prisma.madfam.io
                </span>
              </div>
              <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
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
            <div
              className="overflow-y-auto h-full"
              data-preview-container
            >
              <LazyWrapper
                component={() =>
                  import('@/components/editor/PortfolioPreview').then(
                    mod => ({ default: mod.PortfolioPreview })
                  )
                }
                componentProps={{
                  portfolio: portfolio,
                  mode: previewConfig.mode,
                  isInteractive: previewConfig.showInteractiveElements,
                  showSectionBorders: previewConfig.showSectionBorders,
                }}
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <RefreshCw className="animate-spin text-3xl text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {t.demoLoadingPreview}
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          {/* Features List */}
          <div className="mt-4 max-w-2xl w-full">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
                <span>Custom Domain Support</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
                <span>SEO Optimized</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
                <span>Analytics Dashboard</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
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
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={onExport}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={onShare}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {t.demoShareDemo}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}