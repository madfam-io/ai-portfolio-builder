/**
 * Lazy-loaded template components for code splitting
 * Reduces initial bundle size by loading templates on demand
 */

import dynamic from 'next/dynamic';
import React from 'react';
import { ComponentType } from 'react';

import { Portfolio } from '@/types/portfolio';

// Loading component for templates
const TemplateLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading template...</p>
    </div>
  </div>
);

// Define template props type
export interface TemplateProps {
  portfolio: Portfolio;
  preview?: boolean;
}

// Lazy load templates with loading states
export const DeveloperTemplate = dynamic<TemplateProps>(
  () =>
    import('./DeveloperTemplate').then(mod => ({
      default: mod.DeveloperTemplate,
    })),
  {
    loading: TemplateLoader,
    ssr: false, // Disable SSR for templates to improve performance
  }
);

export const DesignerTemplate = dynamic<TemplateProps>(
  () =>
    import('./DesignerTemplate').then(mod => ({
      default: mod.DesignerTemplate,
    })),
  {
    loading: TemplateLoader,
    ssr: false,
  }
);

export const ConsultantTemplate = dynamic<TemplateProps>(
  () =>
    import('./ConsultantTemplate').then(mod => ({
      default: mod.ConsultantTemplate,
    })),
  {
    loading: TemplateLoader,
    ssr: false,
  }
);

// Template map for dynamic selection
export const LAZY_TEMPLATES: Record<string, ComponentType<TemplateProps>> = {
  developer: DeveloperTemplate,
  designer: DesignerTemplate,
  consultant: ConsultantTemplate,
};

// Helper function to get lazy template by name
export function getLazyTemplate(
  templateName: string
): ComponentType<TemplateProps> | null {
  return LAZY_TEMPLATES[templateName] || null;
}

// Preload a specific template (useful for predictive loading)
export function preloadTemplate(templateName: string): Promise<void> {
  switch (templateName) {
    case 'developer':
      return import('./DeveloperTemplate').then(() => {});
    case 'designer':
      return import('./DesignerTemplate').then(() => {});
    case 'consultant':
      return import('./ConsultantTemplate').then(() => {});
    default:
      return Promise.resolve();
  }
}

// Preload all templates (useful for editor initialization)
export function preloadAllTemplates(): Promise<void> {
  return Promise.all([
    preloadTemplate('developer'),
    preloadTemplate('designer'),
    preloadTemplate('consultant'),
  ]).then(() => {});
}
