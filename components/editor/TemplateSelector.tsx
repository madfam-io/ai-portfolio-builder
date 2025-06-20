'use client';

import { Check, Eye, Grid, Layout } from 'lucide-react';
import { useState, useMemo } from 'react';

import {
  getAvailableTemplates,
  getTemplateConfig,
  TemplateConfig,
} from '@/lib/templates/templateConfig';
import { logger } from '@/lib/utils/logger';
import { TemplateType } from '@/types/portfolio';

/**
 * @fileoverview Enhanced Template Selector Component
 *
 * Provides an intuitive interface for selecting and previewing portfolio templates
 * with live preview cards, industry targeting, and feature comparisons.
 */

interface TemplateSelectorProps {
  currentTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  isLoading?: boolean;
}

interface TemplateCardProps {
  template: TemplateConfig;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  isLoading?: boolean;
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
  isLoading,
}: TemplateCardProps) {
  return (
    <div
      className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Template preview */}
      <div
        className="h-32 rounded-lg mb-4 relative overflow-hidden"
        style={{ backgroundColor: template.colorScheme.background }}
      >
        {/* Mock layout preview */}
        <div className="absolute inset-2 space-y-1">
          {/* Header */}
          <div
            className="h-4 rounded-sm"
            style={{
              backgroundColor: template.colorScheme.primary,
              opacity: 0.8,
            }}
          />
          {/* Content blocks */}
          <div className="grid grid-cols-3 gap-1">
            <div
              className="h-3 rounded-sm"
              style={{
                backgroundColor: template.colorScheme.secondary,
                opacity: 0.6,
              }}
            />
            <div
              className="h-3 rounded-sm col-span-2"
              style={{
                backgroundColor: template.colorScheme.text,
                opacity: 0.3,
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div
              className="h-6 rounded-sm"
              style={{
                backgroundColor: template.colorScheme.accent,
                opacity: 0.7,
              }}
            />
            <div
              className="h-6 rounded-sm"
              style={{
                backgroundColor: template.colorScheme.secondary,
                opacity: 0.5,
              }}
            />
          </div>
          {/* Footer */}
          <div
            className="h-2 rounded-sm w-3/4"
            style={{ backgroundColor: template.colorScheme.text, opacity: 0.4 }}
          />
        </div>
      </div>

      {/* Template info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {template.description}
          </p>
        </div>

        {/* Industry tags */}
        <div className="flex flex-wrap gap-1">
          {template.industry.slice(0, 2).map((industry, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {industry}
            </span>
          ))}
          {template.industry.length > 2 && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
              +{template.industry.length - 2}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {template.features.showcaseProjects && <Grid className="w-4 h-4" />}
            {template.features.includeTestimonials && (
              <Layout className="w-4 h-4" />
            )}
            <Eye className="w-4 h-4" />
          </div>

          {/* Preview button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onPreview();
            }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 dark:bg-gray-900/75 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}

export function TemplateSelector({
  currentTemplate,
  onTemplateChange,
  isLoading = false,
}: TemplateSelectorProps) {
  const [filterIndustry, setFilterIndustry] = useState<string>('');

  const templates = useMemo(() => getAvailableTemplates(), []);

  const filteredTemplates = useMemo(() => {
    if (!filterIndustry) return templates;
    return templates.filter(template =>
      template.industry.some(industry =>
        industry.toLowerCase().includes(filterIndustry.toLowerCase())
      )
    );
  }, [templates, filterIndustry]);

  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    templates.forEach(template => {
      template.industry.forEach(industry => industries.add(industry));
    });
    return Array.from(industries).sort();
  }, [templates]);

  const handleTemplateSelect = (templateId: TemplateType) => {
    if (templateId !== currentTemplate) {
      onTemplateChange(templateId);
    }
  };

  const handlePreview = (templateId: TemplateType) => {
    // This could open a modal or navigate to a preview page
    logger.debug('Preview template:', { templateId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Template
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a template that best represents your professional style
        </p>
      </div>

      {/* Industry filter */}
      {allIndustries.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setFilterIndustry('')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              !filterIndustry
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Industries
          </button>
          {allIndustries.map(industry => (
            <button
              key={industry}
              onClick={() => setFilterIndustry(industry)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterIndustry === industry
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const config = getTemplateConfig(template.id);
          return (
            <TemplateCard
              key={template.id}
              template={config}
              isSelected={template.id === currentTemplate}
              onSelect={() => handleTemplateSelect(template.id)}
              onPreview={() => handlePreview(template.id)}
              isLoading={isLoading && template.id === currentTemplate}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try a different industry filter or browse all templates
          </p>
          <button
            onClick={() => setFilterIndustry('')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Show All Templates
          </button>
        </div>
      )}

      {/* Current template info */}
      {currentTemplate && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Current Template: {getTemplateConfig(currentTemplate).name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getTemplateConfig(currentTemplate).description}
          </p>
        </div>
      )}
    </div>
  );
}
