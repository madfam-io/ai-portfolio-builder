'use client';

import { Sparkles } from 'lucide-react';
import React from 'react';

import { AIModelComparison } from '@/components/demo/AIModelComparison';
import { AnimatedBioEnhancement } from '@/components/demo/AnimatedBioEnhancement';
import { ProjectEnhancementDemo } from '@/components/demo/ProjectEnhancementDemo';
import { Portfolio, TemplateType } from '@/types/portfolio';

interface AIEnhancementStepProps {
  portfolio: Portfolio;
  selectedTemplate: TemplateType;
  selectedAIModel: string;
  currentAITask: 'bio' | 'project' | 'template';
  onPortfolioChange: (portfolio: Portfolio) => void;
  onNextStep: () => void;
  onAIModelSelect: (model: string) => void;
  onAITaskChange: (task: 'bio' | 'project' | 'template') => void;
}

export function AIEnhancementStep({
  portfolio,
  selectedTemplate,
  selectedAIModel,
  currentAITask,
  onPortfolioChange,
  onNextStep,
  onAIModelSelect,
  onAITaskChange,
}: AIEnhancementStepProps): React.ReactElement {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          AI-Powered Enhancements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Watch how our AI transforms your content into compelling, professional
          narratives
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Bio Enhancement Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Bio Enhancement</h3>
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-purple-100">
              Transform basic descriptions into powerful professional summaries
            </p>
          </div>

          <div className="p-6">
            <AnimatedBioEnhancement
              originalBio={
                portfolio.bio ||
                "I'm a software developer with 5 years of experience building web applications."
              }
              onEnhance={enhancedBio => {
                onPortfolioChange({ ...portfolio, bio: enhancedBio });
              }}
              template={selectedTemplate}
            />
          </div>
        </div>

        {/* Project Enhancement Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <h3 className="text-xl font-bold mb-2">Project Enhancement</h3>
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
                onPortfolioChange({
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
          onModelSelect={onAIModelSelect}
          activeTask={currentAITask}
        />
      </div>

      <div className="mt-8 text-center space-y-4">
        {/* Task Selector */}
        <div className="flex justify-center space-x-2 mb-6">
          <button
            onClick={() => onAITaskChange('bio')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentAITask === 'bio'
                ? 'bg-purple-600 text-white'
                : &apos;bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Bio Enhancement
          </button>
          <button
            onClick={() => onAITaskChange('project')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentAITask === 'project'
                ? 'bg-purple-600 text-white'
                : &apos;bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Project Descriptions
          </button>
          <button
            onClick={() => onAITaskChange('template')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentAITask === 'template'
                ? 'bg-purple-600 text-white'
                : &apos;bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Template Selection
          </button>
        </div>

        <button
          onClick={onNextStep}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Continue to Editor
        </button>
      </div>
    </div>
  );
}
