'use client';

import { useState, useEffect } from 'react';
import { Portfolio, TemplateType } from '@/types/portfolio';
import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { usePerformanceTracking } from '@/lib/utils/performance';
import { useRealTimePreview } from '@/hooks/useRealTimePreview';
import { generateSamplePortfolio } from '@/lib/utils/sampleData';
import {
  FiArrowLeft,
  FiBookOpen,
  FiSettings,
  FiSave,
  FiRefreshCw,
} from 'react-icons/fi';
import Link from 'next/link';

export default function InteractiveDemoPage() {
  usePerformanceTracking('InteractiveDemoPage');

  const [currentStep, setCurrentStep] = useState<
    'template' | 'editor' | 'preview'
  >('template');
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('developer');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize portfolio with sample data immediately
  const [portfolio, setPortfolio] = useState<Portfolio>(() =>
    generateSamplePortfolio('developer')
  );

  // Update portfolio when template changes
  useEffect(() => {
    const samplePortfolio = generateSamplePortfolio(selectedTemplate);
    setPortfolio(samplePortfolio);
  }, [selectedTemplate]);

  const {
    previewConfig,
    previewDimensions,
    setPreviewMode,
    toggleFullscreen,
    setZoomLevel,
    toggleSectionBorders,
    toggleInteractiveElements,
    getResponsiveBreakpoints,
    testResponsiveBreakpoint,
  } = useRealTimePreview({
    portfolio,
    onPreviewChange: config => {
      console.log('Preview config changed:', config);
    },
  });

  const handleTemplateChange = async (template: TemplateType) => {
    setIsLoading(true);
    setSelectedTemplate(template);

    // Simulate template application delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPortfolio = generateSamplePortfolio(template);
    setPortfolio(newPortfolio);
    setIsLoading(false);
  };

  const handlePortfolioChange = (updatedPortfolio: Portfolio) => {
    setPortfolio(updatedPortfolio);
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'template':
        setCurrentStep('editor');
        break;
      case 'editor':
        setCurrentStep('preview');
        break;
      case 'preview':
        // Could navigate to signup or other action
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'editor':
        setCurrentStep('template');
        break;
      case 'preview':
        setCurrentStep('editor');
        break;
    }
  };

  const handleRefresh = () => {
    const refreshedPortfolio = generateSamplePortfolio(portfolio.template);
    setPortfolio(refreshedPortfolio);
  };

  const handleExport = () => {
    // Demo export functionality
    alert(
      'In the full version, this would export your portfolio as PDF, HTML, or other formats.'
    );
  };

  const handleShare = () => {
    // Demo share functionality
    alert(
      'In the full version, this would generate a shareable link to your portfolio.'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/demo"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Demo</span>
            </Link>

            <div className="flex items-center space-x-2">
              <FiBookOpen className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                PRISMA Interactive Demo
              </span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                currentStep === 'template'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              1. Template
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                currentStep === 'editor'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              2. Edit
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                currentStep === 'preview'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              3. Preview
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Reset Demo"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <Link
              href="/auth/signup"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <FiSave className="w-4 h-4" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {currentStep === 'template' && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Template
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Start by selecting a template that matches your profession and
                style. Each template is optimized for specific industries and
                career paths.
              </p>
            </div>

            <LazyWrapper
              component={() =>
                import('@/components/editor/TemplateSelector').then(mod => ({
                  default: mod.TemplateSelector,
                }))
              }
              componentProps={{
                currentTemplate: selectedTemplate,
                onTemplateChange: handleTemplateChange,
                isLoading: isLoading,
              }}
              fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <FiRefreshCw className="animate-spin text-3xl text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading templates...
                    </p>
                  </div>
                </div>
              }
            />

            <div className="mt-8 text-center">
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Editor
              </button>
            </div>
          </div>
        )}

        {currentStep === 'editor' && (
          <div className="h-[calc(100vh-80px)] flex">
            {/* Editor Sidebar */}
            <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Portfolio
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePreviousStep}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Interactive Demo Mode
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      This is a preview of the portfolio editor. In the full
                      version, you&apos;ll have complete control over all
                      sections, AI enhancement features, and real-time
                      collaboration.
                    </p>
                  </div>

                  <div className="grid gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={portfolio.name}
                            onChange={e =>
                              handlePortfolioChange({
                                ...portfolio,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={portfolio.title}
                            onChange={e =>
                              handlePortfolioChange({
                                ...portfolio,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bio
                          </label>
                          <textarea
                            value={portfolio.bio}
                            onChange={e =>
                              handlePortfolioChange({
                                ...portfolio,
                                bio: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Template Selection
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        You&apos;ve selected the{' '}
                        <strong>{portfolio.template}</strong> template. In the
                        full editor, you can switch between templates and see
                        live previews.
                      </p>
                      <button
                        onClick={() => setCurrentStep('template')}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        Change Template
                      </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Available in Full Version
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>AI Bio Enhancement</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Project Management</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Skills & Experience</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Custom Sections</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>LinkedIn Import</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>GitHub Integration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900">
              <div className="h-full overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="p-8">
                    <LazyWrapper
                      component={() =>
                        import('@/components/editor/PortfolioPreview').then(
                          mod => ({ default: mod.PortfolioPreview })
                        )
                      }
                      componentProps={{
                        portfolio: portfolio,
                        mode: previewConfig.mode,
                        isInteractive: false,
                      }}
                      fallback={
                        <div className="flex items-center justify-center h-96">
                          <div className="text-center">
                            <FiRefreshCw className="animate-spin text-3xl text-purple-600 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                              Loading preview...
                            </p>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
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
                onRefresh: handleRefresh,
                onExport: handleExport,
                onShare: handleShare,
                responsiveBreakpoints: getResponsiveBreakpoints(),
                onTestBreakpoint: testResponsiveBreakpoint,
              }}
              fallback={
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex items-center justify-center">
                    <FiRefreshCw className="animate-spin text-lg text-purple-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Loading controls...
                    </span>
                  </div>
                </div>
              }
            />

            {/* Preview Content */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <div className="h-full flex items-center justify-center p-4">
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                  style={{
                    width:
                      previewDimensions.width === '100%'
                        ? '100%'
                        : previewDimensions.width,
                    height:
                      previewDimensions.height === '100%'
                        ? '100%'
                        : previewDimensions.height,
                    transform: `scale(${previewDimensions.scale})`,
                    transformOrigin: 'center top',
                    maxWidth: '100%',
                    maxHeight: '100%',
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
                        isInteractive: false,
                      }}
                      fallback={
                        <div className="flex items-center justify-center h-96">
                          <div className="text-center">
                            <FiRefreshCw className="animate-spin text-3xl text-purple-600 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                              Loading preview...
                            </p>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousStep}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Back to Editor
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Love what you see? Create your own portfolio!
                  </p>
                  <Link
                    href="/auth/signup"
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Get Started - Free Trial
                  </Link>
                </div>

                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  Share Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
