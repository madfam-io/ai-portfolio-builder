'use client';

import { Check, RefreshCw } from 'lucide-react';
import React from 'react';

import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { Portfolio } from '@/types/portfolio';

interface EditorStepProps {
  portfolio: Portfolio;
  previewConfig: {
    mode: 'desktop' | 'tablet' | 'mobile';
  };
  onPortfolioChange: (portfolio: Portfolio) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  translations: {
    demoEditPortfolio: string;
    demoBack: string;
    demoPreview: string;
    demoInteractiveDemoMode: string;
    demoThisIsPreview: string;
    demoBasicInformation: string;
    demoName: string;
    demoTitle: string;
    demoBio: string;
    demoProjects: string;
    demoAddProject: string;
    demoSkills: string;
    demoAvailableInFullVersion: string;
    demoAiBioEnhancement: string;
    demoProjectManagement: string;
    demoSkillsExperience: string;
    demoCustomSections: string;
    demoLinkedinImport: string;
    demoGithubIntegration: string;
    demoLoadingPreview: string;
  };
}

export function EditorStep({
  portfolio,
  previewConfig,
  onPortfolioChange,
  onNextStep,
  onPreviousStep,
  translations: t,
}: EditorStepProps): React.ReactElement {
  return (
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
                onClick={onPreviousStep}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.demoBack}
              </button>
              <button
                onClick={onNextStep}
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
                        onPortfolioChange({
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
                        onPortfolioChange({
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
                        onPortfolioChange({
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

              {/* Projects Section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.demoProjects}
                </h3>
                <div className="space-y-3">
                  {portfolio.projects.slice(0, 2).map((project) => (
                    <div
                      key={project.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.description?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                  <button className="w-full py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    + {t.demoAddProject}
                  </button>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.demoSkills}
                </h3>
                <div className="space-y-2">
                  {portfolio.skills.slice(0, 5).map((skill, index) => (
                    <div
                      key={`skill-${index}`}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {skill.level}
                      </span>
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
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{t.demoAiBioEnhancement}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{t.demoProjectManagement}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{t.demoSkillsExperience}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{t.demoCustomSections}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{t.demoLinkedinImport}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
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
        </div>
      </div>
    </div>
  );
}