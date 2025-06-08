'use client';

// import { useLanguage } from '@/lib/i18n/simple-context'; // Not used yet
import Link from 'next/link';
import { useState } from 'react';
import {
  FaArrowLeft,
  FaSave,
  FaEye,
  FaUpload,
  FaImage,
  FaFileAlt,
  FaPlus,
} from 'react-icons/fa';

export default function Editor() {
  // const { t } = useLanguage(); // Not used yet
  const [portfolioName, setPortfolioName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const templates = [
    { id: 'modern', name: 'Modern', preview: 'Clean and minimalist design' },
    { id: 'creative', name: 'Creative', preview: 'Bold and artistic layout' },
    { id: 'professional', name: 'Professional', preview: 'Corporate style' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 mr-8"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <input
                type="text"
                placeholder="Portfolio Name"
                value={portfolioName}
                onChange={e => setPortfolioName(e.target.value)}
                className="text-lg font-medium bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FaEye className="mr-2" />
                Preview
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <FaSave className="mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Portfolio Builder
            </h2>

            {/* Template Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Template
              </h3>
              <div className="space-y-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {template.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Content Sections
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <FaFileAlt className="mr-3 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">About</span>
                </button>
                <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <FaImage className="mr-3 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    Projects
                  </span>
                </button>
                <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <FaUpload className="mr-3 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    Experience
                  </span>
                </button>
                <button className="w-full flex items-center justify-center p-3 text-purple-600 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                  <FaPlus className="mr-2" />
                  Add Section
                </button>
              </div>
            </div>

            {/* Import Options */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Import Data
              </h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <div className="font-medium text-gray-900 dark:text-white">
                    LinkedIn Profile
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Import your professional info
                  </div>
                </button>
                <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <div className="font-medium text-gray-900 dark:text-white">
                    GitHub Projects
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Add your repositories
                  </div>
                </button>
                <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Upload CV/Resume
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Extract from PDF
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FaImage className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Portfolio Preview
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Your portfolio will appear here as you build it
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <FaPlus className="mr-2" />
                Add Your First Section
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
