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

import { RefreshCw } from 'lucide-react';
import React from 'react';

import { LazyWrapper } from '@/components/shared/LazyWrapper';
import { TemplateType } from '@/types/portfolio';

interface TemplateSelectionStepProps {
  selectedTemplate: TemplateType;
  isLoading: boolean;
  onTemplateChange: (template: TemplateType) => Promise<void>;
  onNextStep: () => void;
  translations: {
    demoChooseYourTemplate: string;
    demoStartBySelecting: string;
    demoLoadingTemplates: string;
  };
}

export function TemplateSelectionStep({
  selectedTemplate,
  isLoading,
  onTemplateChange,
  onNextStep,
  translations: t,
}: TemplateSelectionStepProps): React.ReactElement {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t.demoChooseYourTemplate}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t.demoStartBySelecting}
        </p>
      </div>

      <LazyWrapper<{
        currentTemplate: TemplateType;
        onTemplateChange: (template: TemplateType) => Promise<void>;
        isLoading: boolean;
      }>
        component={() =>
          import('@/components/editor/TemplateSelector').then(mod => ({
            default: mod.TemplateSelector,
          }))
        }
        componentProps={{
          currentTemplate: selectedTemplate,
          onTemplateChange,
          isLoading,
        }}
        fallback={
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <RefreshCw className="animate-spin text-3xl text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t.demoLoadingTemplates}
              </p>
            </div>
          </div>
        }
      />

      <div className="mt-8 text-center">
        <button
          onClick={onNextStep}
          disabled={isLoading}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Import
        </button>
      </div>
    </div>
  );
}
