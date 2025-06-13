'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiSparkles } from 'react-icons/hi';
} from 'react-icons/fi';
import {
  FiArrowLeft,
  FiBookOpen,
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiCheck,

import { AIModelComparison } from '@/components/demo/AIModelComparison';
import { AnimatedBioEnhancement } from '@/components/demo/AnimatedBioEnhancement';
import { ProjectEnhancementDemo } from '@/components/demo/ProjectEnhancementDemo';
import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { useRealTimePreview } from '@/hooks/useRealTimePreview';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePerformanceTracking } from '@/lib/utils/performance';
import { generateSamplePortfolio } from '@/lib/utils/sampleData';
import { showToast } from '@/lib/utils/toast';
import { Portfolio, TemplateType } from '@/types/portfolio';


export default function InteractiveDemoPage(): React.ReactElement {
  const { t } = useLanguage();
  usePerformanceTracking('InteractiveDemoPage');

  const [currentStep, setCurrentStep] = useState<
    'template' | 'ai-enhance' | 'editor' | 'preview'
  >('template');
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('developer');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState('llama-3.1');
  const [currentAITask, setCurrentAITask] = useState<
    'bio' | 'project' | 'template'
  >('bio');

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
    onPreviewChange: _config => {
      // Preview config change handled by state - no logging needed for development demo
    },
  });

  const handleTemplateChange = async (
    template: TemplateType
  ): Promise<void> => {
    setIsLoading(true);
    setSelectedTemplate(template);

    // Simulate template application delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPortfolio = generateSamplePortfolio(template);
    setPortfolio(newPortfolio);
    setIsLoading(false);
  };

  const handlePortfolioChange = (updatedPortfolio: Portfolio): void => {
    setPortfolio(updatedPortfolio);
  };

  const handleNextStep = (): void => {
    switch (currentStep) {
      case 'template':
        setCurrentStep('ai-enhance');
        break;
      case 'ai-enhance':
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

  const handlePreviousStep = (): void => {
    switch (currentStep) {
      case 'ai-enhance':
        setCurrentStep('template');
        break;
      case 'editor':
        setCurrentStep('ai-enhance');
        break;
      case 'preview':
        setCurrentStep('editor');
        break;
    }
  };

  const handleRefresh = (): void => {
    const refreshedPortfolio = generateSamplePortfolio(portfolio.template);
    setPortfolio(refreshedPortfolio);
  };

  const handleExport = (): void => {
    // Demo export functionality with simulated download
    const exportOptions = `Export Options Available in Full Version:
• PDF Export - Professional PDF with custom styling
• HTML Export - Complete website package
• JSON Export - Raw portfolio data
• WordPress Export - Import-ready format
• GitHub Pages - Deploy-ready static site

Your portfolio would be downloaded as: ${portfolio.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.pdf`;

    showToast.custom(
      <div className="max-w-md">
        <h3 className="font-semibold mb-2">Export Options</h3>
        <p className="text-sm whitespace-pre-line">{exportOptions}</p>
      </div>,
      { duration: 6000 }
    );
  };

  const handleShare = (): void => {
    // Demo share functionality with rich options
    const shareUrl = `https://${portfolio.name.toLowerCase().replace(/\s+/g, '')}.prisma.madfam.io`;
    const shareOptions = `Share Your Portfolio:

🔗 Direct Link: ${shareUrl}
📧 Email signature ready
💼 LinkedIn profile link
🐦 Twitter card optimized
📱 QR code generation

Social preview includes:
• Custom meta tags
• Open Graph images
• Twitter cards
• SEO optimization`;

    showToast.custom(
      <div className="max-w-md">
        <h3 className="font-semibold mb-2">Share Your Portfolio</h3>
        <p className="text-sm whitespace-pre-line">{shareOptions}</p>
      </div>,
      { duration: 6000 }
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
              <span>{t.demoBackToDemo}</span>
            </Link>

            <div className="flex items-center space-x-2">
              <FiBookOpen className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {t.demoPrismaInteractiveDemo}
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
              1. {t.demoTemplate}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                currentStep === 'ai-enhance'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              2. AI Enhance
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                currentStep === 'editor'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              3. {t.demoEdit}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                currentStep === 'preview'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              4. {t.demoPreview}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={t.demoResetDemo}
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <Link
              href="/auth/signup"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <FiSave className="w-4 h-4" />
              <span>{t.demoCreateAccount}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {currentStep === 'ai-enhance' && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Enhancements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Watch how our AI transforms your content into compelling,
                professional narratives
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Bio Enhancement Demo */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Bio Enhancement</h3>
                    <HiSparkles className="w-6 h-6" />
                  </div>
                  <p className="text-purple-100">
                    Transform basic descriptions into powerful professional
                    summaries
                  </p>
                </div>

                <div className="p-6">
                  <AnimatedBioEnhancement
                    originalBio={
                      portfolio.bio ||
                      "I'm a software developer with 5 years of experience building web applications."
                    }
                    onEnhance={enhancedBio => {
                      handlePortfolioChange({ ...portfolio, bio: enhancedBio });
                    }}
                    template={selectedTemplate}
                  />
                </div>
              </div>

              {/* Project Enhancement Demo */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                  <h3 className="text-xl font-bold mb-2">
                    Project Enhancement
                  </h3>
                  <p className="text-blue-100">
                    Transform project descriptions with STAR format
                  </p>
                </div>

                <div className="p-6">
                  <ProjectEnhancementDemo
                    projects={portfolio.projects}
                    onProjectEnhance={(projectId, enhancedDescription) => {
                      const updatedProjects = portfolio.projects.map(p =>
                        p.id === projectId
                          ? { ...p, description: enhancedDescription }
                          : p
                      );
                      handlePortfolioChange({
                        ...portfolio,
                        projects: updatedProjects,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* AI Model Selection Preview */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
              <AIModelComparison
                selectedModel={selectedAIModel}
                onModelSelect={setSelectedAIModel}
                activeTask={currentAITask}
              />
            </div>

            <div className="mt-8 text-center space-y-4">
              {/* Task Selector */}
              <div className="flex justify-center space-x-2 mb-6">
                <button
                  onClick={() => setCurrentAITask('bio')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentAITask === 'bio'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Bio Enhancement
                </button>
                <button
                  onClick={() => setCurrentAITask('project')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentAITask === 'project'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Project Descriptions
                </button>
                <button
                  onClick={() => setCurrentAITask('template')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentAITask === 'template'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Template Selection
                </button>
              </div>

              <button
                onClick={handleNextStep}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Continue to Editor
              </button>
            </div>
          </div>
        )}

        {currentStep === 'template' && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t.demoChooseYourTemplate}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t.demoStartBySelecting}
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
                      {t.demoLoadingTemplates}
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
                Continue to Import
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
                    {t.demoEditPortfolio}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePreviousStep}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t.demoBack}
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {t.demoPreview}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      {t.demoInteractiveDemoMode}
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {t.demoThisIsPreview}
                    </p>
                  </div>

                  <div className="grid gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t.demoBasicInformation}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="portfolio-name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            {t.demoName}
                          </label>
                          <input
                            id="portfolio-name"
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
                          <label
                            htmlFor="portfolio-title"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            {t.demoTitle}
                          </label>
                          <input
                            id="portfolio-title"
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
                          <label
                            htmlFor="portfolio-bio"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            {t.demoBio}
                          </label>
                          <textarea
                            id="portfolio-bio"
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
                        {t.demoTemplateSelection}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {t.demoYouveSelected}{' '}
                        <strong>{portfolio.template}</strong> template.{' '}
                        {t.demoInFullEditor}
                      </p>
                      <button
                        onClick={() => setCurrentStep('template')}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        {t.demoChangeTemplate}
                      </button>
                    </div>

                    {/* Projects Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Projects
                      </h3>
                      <div className="space-y-4">
                        {portfolio.projects
                          .slice(0, 2)
                          .map((project, index) => (
                            <div
                              key={project.id}
                              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                            >
                              <input
                                type="text"
                                value={project.title}
                                onChange={e => {
                                  const updatedProjects = [
                                    ...portfolio.projects,
                                  ];
                                  updatedProjects[index] = {
                                    ...project,
                                    title: e.target.value,
                                  };
                                  handlePortfolioChange({
                                    ...portfolio,
                                    projects: updatedProjects,
                                  });
                                }}
                                className="w-full font-medium text-gray-900 dark:text-white mb-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none"
                                placeholder="Project Title"
                              />
                              <textarea
                                value={project.description}
                                onChange={e => {
                                  const updatedProjects = [
                                    ...portfolio.projects,
                                  ];
                                  updatedProjects[index] = {
                                    ...project,
                                    description: e.target.value,
                                  };
                                  handlePortfolioChange({
                                    ...portfolio,
                                    projects: updatedProjects,
                                  });
                                }}
                                rows={2}
                                className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent resize-none outline-none"
                                placeholder="Project description..."
                              />
                              <div className="mt-2">
                                <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                                  <HiSparkles className="inline w-3 h-3 mr-1" />
                                  Enhance with AI
                                </button>
                              </div>
                            </div>
                          ))}
                        <button className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          + Add Project
                        </button>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Skills
                      </h3>
                      <div className="space-y-3">
                        {portfolio.skills.slice(0, 5).map((skill, index) => (
                          <div
                            key={skill.name}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {skill.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <select
                                value={skill.level || 'intermediate'}
                                onChange={e => {
                                  const updatedSkills = [...portfolio.skills];
                                  updatedSkills[index] = {
                                    ...skill,
                                    level: e.target.value as
                                      | 'beginner'
                                      | 'intermediate'
                                      | 'advanced'
                                      | 'expert',
                                  };
                                  handlePortfolioChange({
                                    ...portfolio,
                                    skills: updatedSkills,
                                  });
                                }}
                                className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">
                                  Intermediate
                                </option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                              </select>
                            </div>
                          </div>
                        ))}
                        <button className="w-full py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                          + Add Skill
                        </button>
                      </div>
                    </div>

                    {/* Additional Features */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t.demoAvailableInFullVersion}
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span>{t.demoAiBioEnhancement}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span>{t.demoProjectManagement}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span>{t.demoSkillsExperience}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>{t.demoCustomSections}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span>{t.demoLinkedinImport}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span>{t.demoGithubIntegration}</span>
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
                      <FiCheck className="w-4 h-4" />
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
                        isInteractive: false,
                      }}
                      fallback={
                        <div className="flex items-center justify-center h-96">
                          <div className="text-center">
                            <FiRefreshCw className="animate-spin text-3xl text-purple-600 mx-auto mb-4" />
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
                    onClick={handlePreviousStep}
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
                      onClick={handleExport}
                      className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      Export
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {t.demoShareDemo}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
