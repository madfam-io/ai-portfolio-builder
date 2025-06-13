'use client';

import React from 'react';
import { FaPalette } from 'react-icons/fa';
import {
  FiAward,
  FiBriefcase,
  FiLayout,
  FiPlus,
  FiSettings,
  FiUser,
} from 'react-icons/fi';

import { SmartImportOptions } from '@/components/demo/SmartImportOptions';
import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { Portfolio } from '@/types/portfolio';

// ;
// ;

interface InteractiveEditorSectionProps {
  portfolio: Portfolio;
  activeSection: string;
  showImportOptions: boolean;
  t: unknown; // TODO: Add proper translation type
  onPortfolioChange: (portfolio: Portfolio) => void;
  onSectionChange: (section: string) => void;
  onToggleImportOptions: () => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
}

export function InteractiveEditorSection({
  portfolio,
  activeSection,
  showImportOptions,
  t,
  onPortfolioChange,
  onSectionChange,
  onToggleImportOptions,
  onPreviousStep,
  onNextStep,
}: InteractiveEditorSectionProps): React.ReactElement {
  const handleSectionUpdate = (sectionId: string, content: unknown) => {
    // In the real app, this would update the specific section
    // For demo, we'll just update the portfolio bio as an example
    if (sectionId === 'bio') {
      onPortfolioChange({ ...portfolio, bio: content as string });
    }
  };

  // Placeholder for future functionality
  const handleAddSection = (): void => {
    // Demo placeholder - in real app would add new section
    // For now, just a no-op
  };

  const sections = [
    { id: 'bio', label: (t as any).demoSectionBio, icon: FiUser },
    {
      id: 'experience',
      label: (t as any).demoSectionExperience,
      icon: FiBriefcase,
    },
    { id: 'skills', label: (t as any).demoSectionSkills, icon: FiAward },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {(t as any).demoSections}
        </h3>
        <div className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          ))}
          <button
            onClick={handleAddSection}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span className="text-sm font-medium">
              {(t as any).demoAddSection}
            </span>
          </button>
        </div>

        {/* Tools Section */}
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {(t as any).demoTools}
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              <FaPalette className="w-4 h-4" />
              <span className="text-sm">{(t as any).demoCustomizeTheme}</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              <FiLayout className="w-4 h-4" />
              <span className="text-sm">{(t as any).demoChangeLayout}</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              <FiSettings className="w-4 h-4" />
              <span className="text-sm">{(t as any).demoSettings}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {(t as any).demoEditPortfolio}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {(t as any).demoEditorDescription}
          </p>
        </div>

        {/* Smart Import Options */}
        {showImportOptions && (
          <div className="mb-6">
            <SmartImportOptions onDataImport={() => onToggleImportOptions()} />
          </div>
        )}

        {/* Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <LazyWrapper
            component={() => import('@/components/editor/PortfolioEditor')}
            componentProps={{
              portfolio: portfolio,
              activeSection: activeSection,
              onUpdate: handleSectionUpdate,
            }}
            fallback={
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            }
          />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onPreviousStep}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {(t as any).demoBackToAI}
          </button>
          <button
            onClick={onNextStep}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            {(t as any).demoPreviewPortfolio}
          </button>
        </div>
      </div>
    </div>
  );
}
