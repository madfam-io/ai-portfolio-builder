'use client';

import React, { useState } from 'react';
import {
  FiLinkedin,
  FiGithub,
  FiUpload,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import HiSparkles from 'react-icons/hi/HiSparkles';

import { GitHubIntegration } from '@/components/integrations/GitHubIntegration';
import { LinkedInImport } from '@/components/integrations/LinkedInImport';
import { ResumeParser } from '@/components/integrations/ResumeParser';

interface ImportedData {
  name?: string;
  bio?: string;
  headline?: string;
  summary?: string;
  location?: string;
  connections?: number;
  projects?: Array<{
    title?: string;
    name?: string; // GitHub uses 'name', Resume uses 'title'
    description: string;
    url?: string;
    technologies?: string[];
    confidence?: number; // Resume parser adds confidence scores
  }>;
  skills?: Array<{
    name: string;
    level?: string;
    endorsements?: number; // LinkedIn has endorsements
  }>;
  experience?: Array<{
    company: string;
    position: string;
    duration?: string; // LinkedIn format
    startDate?: string; // Resume format
    endDate?: string;
    description: string;
  }>;
  education?: Array<{
    institution?: string; // Resume format
    school?: string; // LinkedIn format
    degree: string;
    field: string;
    year?: string; // LinkedIn format
    startDate?: string; // Resume format
    endDate?: string;
  }>;
}

interface SmartImportOptionsProps {
  onDataImport?: (source: string, data: ImportedData) => void;
  isDemo?: boolean;
  className?: string;
}

export function SmartImportOptions(): JSX.Element ({
  onDataImport,
  isDemo = true,
  className = '',
}: SmartImportOptionsProps): React.ReactElement {
  const [activeImport, setActiveImport] = useState<
    'linkedin' | 'github' | 'resume' | null
  >(null);
  const [completedImports, setCompletedImports] = useState<Set<string>>(
    new Set()
  );

  const importOptions = [
    {
      id: 'linkedin',
      title: 'LinkedIn Profile',
      description:
        'Import your professional experience, skills, and connections',
      icon: FiLinkedin,
      color: 'from-blue-600 to-blue-700',
      features: [
        'Work experience',
        'Skills & endorsements',
        'Education & certifications',
        'Professional summary',
      ],
      estimatedTime: '30 seconds',
    },
    {
      id: 'github',
      title: 'GitHub Repositories',
      description: 'Showcase your best coding projects and contributions',
      icon: FiGithub,
      color: 'from-gray-800 to-gray-900',
      features: [
        'Repository analysis',
        'Code metrics',
        'Project highlights',
        'Technology stack',
      ],
      estimatedTime: '45 seconds',
    },
    {
      id: 'resume',
      title: 'Resume Upload',
      description: 'Parse your existing resume with AI-powered extraction',
      icon: FiUpload,
      color: 'from-green-600 to-green-700',
      features: [
        'Smart text extraction',
        'Section identification',
        'Data validation',
        'Format conversion',
      ],
      estimatedTime: '60 seconds',
    },
  ];

  const handleImportComplete = (source: string, data: ImportedData): void => {
    setCompletedImports(prev => new Set([...prev, source]));
    if (onDataImport !== undefined && onDataImport !== null) {
      onDataImport(source, data);
    }
  };

  const handleBackToOptions = (): void => {
    setActiveImport(null);
  };

  if (activeImport !== undefined && activeImport !== null) {
    return (
      <div className={className}>
        <div className="mb-6">
          <button
            onClick={handleBackToOptions}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FiArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to import options</span>
          </button>
        </div>

        {activeImport === 'linkedin' && (
          <LinkedInImport
            onImport={data => handleImportComplete('linkedin', data)}
            isDemo={isDemo}
          />
        )}

        {activeImport === 'github' && (
          <GitHubIntegration
            onImport={data => handleImportComplete('github', data)}
            isDemo={isDemo}
          />
        )}

        {activeImport === 'resume' && (
          <ResumeParser
            onParse={data => handleImportComplete('resume', data)}
            isDemo={isDemo}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Smart Import Options
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Import your professional data from multiple sources to create a
          comprehensive portfolio
        </p>
      </div>

      {/* Progress Overview */}
      {completedImports.size > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Import Progress
            </h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedImports.size} of {importOptions.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(completedImports.size / importOptions.length) * 100}%`,
              }}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <HiSparkles className="w-4 h-4" />
            <span>
              Great progress! Your portfolio is getting richer with each import.
            </span>
          </div>
        </div>
      )}

      {/* Import Options Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {importOptions.map(option => {
          const IconComponent = option.icon;
          const isCompleted = completedImports.has(option.id);

          return (
            <div
              key={option.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-xl ${
                isCompleted ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() =>
                setActiveImport(option.id as 'linkedin' | 'github' | 'resume')
              }
            >
              {isCompleted && (
                <div className="absolute top-0 right-0 bg-green-500 text-white p-2 rounded-bl-lg">
                  <FiCheck className="w-4 h-4" />
                </div>
              )}

              {/* Header */}
              <div
                className={`bg-gradient-to-r ${option.color} text-white p-6`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <IconComponent className="w-8 h-8" />
                  <div>
                    <h4 className="text-xl font-bold">{option.title}</h4>
                  </div>
                </div>
                <p className="text-white/90 text-sm">{option.description}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estimated time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.estimatedTime}
                    </span>
                  </div>

                  <button
                    className={`w-full bg-gradient-to-r ${option.color} text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 group-hover:shadow-lg flex items-center justify-center space-x-2`}
                  >
                    {isCompleted ? (
                      <>
                        <FiCheck className="w-4 h-4" />
                        <span>View Details</span>
                      </>
                    ) : (
                      <>
                        <IconComponent className="w-4 h-4" />
                        <span>Import Now</span>
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combination Benefits */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
          Combine Multiple Sources for Maximum Impact
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiLinkedin className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
              Professional Network
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Leverage your professional connections and endorsements
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiGithub className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
              Technical Expertise
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showcase your coding skills and project contributions
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiUpload className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
              Complete History
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Capture every detail from your existing resume
            </p>
          </div>
        </div>
      </div>

      {completedImports.size === importOptions.length && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-6 py-3 rounded-full">
            <FiCheck className="w-5 h-5" />
            <span className="font-medium">
              All imports completed! Your portfolio is now comprehensive.
            </span>
          </div>
        </div>
      )}

      {isDemo && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Demo mode - Experience the import process without connecting real
            accounts
          </p>
        </div>
      )}
    </div>
  );
}
