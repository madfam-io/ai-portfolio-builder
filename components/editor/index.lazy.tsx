/**
 * Lazy-loaded editor components for code splitting
 * Only loads editor components when needed by authenticated users
 */

import React from 'react';
import dynamic from 'next/dynamic';

// Loading component for editor
const EditorLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Loading Portfolio Editor...
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Preparing your workspace
      </p>
    </div>
  </div>
);

// Lazy load main editor components
export const PortfolioEditor = dynamic(
  () => import('./PortfolioEditor'),
  {
    loading: EditorLoader,
    ssr: false,
  }
);

export const PortfolioPreview = dynamic(
  () =>
    import('./PortfolioPreview').then(mod => ({
      default: mod.PortfolioPreview,
    })),
  {
    ssr: false,
  }
);

export const EditorSidebar = dynamic(
  () =>
    import('./EditorSidebar').then(mod => ({
      default: mod.EditorSidebar,
    })),
  {
    ssr: false,
  }
);

export const EditorToolbar = dynamic(
  () =>
    import('./EditorToolbar').then(mod => ({
      default: mod.EditorToolbar,
    })),
  {
    ssr: false,
  }
);

export const TemplateSelector = dynamic(
  () =>
    import('./TemplateSelector').then(mod => ({
      default: mod.TemplateSelector,
    })),
  {
    ssr: false,
  }
);

export const AIEnhancementButton = dynamic(
  () =>
    import('./AIEnhancementButton').then(mod => ({
      default: mod.AIEnhancementButton,
    })),
  {
    ssr: false,
  }
);

// Preload editor components (useful when navigating to editor)
export function preloadEditorComponents(): Promise<void> {
  return Promise.all([
    import('./PortfolioEditor'),
    import('./PortfolioPreview'),
    import('./EditorSidebar'),
    import('./EditorToolbar'),
  ]).then(() => {});
}

// Export regular components for backward compatibility
export { PreviewControls } from './PreviewControls';
export { EditorHeader } from './EditorHeader';
