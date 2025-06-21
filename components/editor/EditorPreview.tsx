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

import React from 'react';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';
import { Portfolio } from '@/types/portfolio';
import { DeveloperTemplate } from '@/components/templates/DeveloperTemplate';
import { DesignerTemplate } from '@/components/templates/DesignerTemplate';
import { ConsultantTemplate } from '@/components/templates/ConsultantTemplate';
interface EditorPreviewProps {
  portfolio: Portfolio;
  mode?: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

/**
 * EditorPreview Component
 *
 * Real-time preview of the portfolio using actual templates
 * Shows how the portfolio will look when published
 */
export function EditorPreview({
  portfolio,
  mode = 'desktop',
  className,
}: EditorPreviewProps) {
  const { t } = useLanguage();
  const previewMode = mode;

  // Select template based on portfolio template type
  const renderTemplate = () => {
    switch (portfolio.template) {
      case 'developer':
        return <DeveloperTemplate portfolio={portfolio} />;
      case 'designer':
        return <DesignerTemplate portfolio={portfolio} />;
      case 'consultant':
      case 'business':
        return <ConsultantTemplate portfolio={portfolio} />;
      case 'educator':
        // For now, use consultant template for educator
        return <ConsultantTemplate portfolio={portfolio} />;
      case 'creative':
        // For now, use designer template for creative
        return <DesignerTemplate portfolio={portfolio} />;
      case 'minimal':
      case 'modern':
      default:
        // Default to developer template
        return <DeveloperTemplate portfolio={portfolio} />;
    }
  };

  const getPreviewClasses = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-[375px] mx-auto';
      case 'tablet':
        return 'max-w-[768px] mx-auto';
      default:
        return 'w-full';
    }
  };

  return (
    <div className={cn('h-full flex flex-col bg-muted/30', className)}>
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <p className="text-sm font-medium text-muted-foreground">
          {t.livePreview || 'Live Preview'} -{' '}
          {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)}
        </p>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <div className="h-full overflow-y-auto">
          <div
            className={cn(
              'bg-white dark:bg-gray-800 min-h-full shadow-xl transition-all duration-300',
              getPreviewClasses()
            )}
          >
            {/* Render actual portfolio template */}
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
}
