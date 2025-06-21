/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { ArrowLeft, BookOpen, Save, Settings } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface DemoHeaderProps {
  currentStep: 'template' | 'ai-enhance' | 'editor' | 'preview';
  onRefresh: () => void;
  translations: {
    demoInteractiveDemo: string;
    demoTemplate: string;
    demoEdit: string;
    demoPreview: string;
    demoResetDemo: string;
    demoCreateAccount: string;
  };
}

export function DemoHeader({
  currentStep,
  onRefresh,
  translations: t,
}: DemoHeaderProps): React.ReactElement {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>{t.demoInteractiveDemo}</span>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
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
              onClick={onRefresh}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={t.demoResetDemo}
            >
              <Settings className="w-5 h-5" />
            </button>
            <Link
              href="/auth/signup"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{t.demoCreateAccount}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
