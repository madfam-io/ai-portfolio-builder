'use client';

import React from 'react';
import { FiCode, FiLayout } from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';

import { TemplateType } from '@/types/portfolio';

interface InteractiveTemplateSectionProps {
  selectedTemplate: TemplateType;
  t: unknown; // TODO: Add proper translation type
  onSelectTemplate: (template: TemplateType) => void;
  onNextStep: () => void;
}

export function InteractiveTemplateSection({
  selectedTemplate,
  t,
  onSelectTemplate,
  onNextStep,
}: InteractiveTemplateSectionProps): React.ReactElement {
  const templates = [
    {
      id: 'developer' as TemplateType,
      name: t.demoTemplates?.developer?.name || 'Developer',
      description:
        t.demoTemplates?.developer?.description ||
        'Clean and modern template for software developers',
      icon: FiCode,
      color: 'purple',
    },
    {
      id: 'designer' as TemplateType,
      name: t.demoTemplates?.designer?.name || 'Designer',
      description:
        t.demoTemplates?.designer?.description ||
        'Creative and visual template for designers',
      icon: FaPalette,
      color: 'pink',
    },
    {
      id: 'consultant' as TemplateType,
      name: t.demoTemplates?.consultant?.name || 'Consultant',
      description:
        t.demoTemplates?.consultant?.description ||
        'Professional template for business consultants',
      icon: FiLayout,
      color: 'blue',
    },
  ];

  return (
    <div className="px-8 py-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t.demoChooseTemplate}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t.demoTemplateDescription}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(template => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? `border-${template.color}-500 bg-${template.color}-50 dark:bg-${template.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  isSelected
                    ? `bg-${template.color}-500 text-white`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {template.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
              {isSelected && (
                <div className="mt-4 flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNextStep}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          {t.demoContinueToAI}
        </button>
      </div>
    </div>
  );
}
