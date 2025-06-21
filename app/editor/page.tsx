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

import React, { useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useEditorStore } from '@/lib/store/editor-store';
import { blockConfigs } from '@/lib/editor/block-configs';
import { logger } from '@/lib/utils/logger';

// Dynamically import the editor to avoid SSR issues with drag and drop
const DragDropEditor = dynamic(
  () =>
    import('./components/DragDropEditor').then(mod => ({
      default: mod.DragDropEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex">
        <div className="w-80 border-r">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full" />
        </div>
      </div>
    ),
  }
);

interface EditorPageProps {
  searchParams: {
    portfolioId?: string;
    template?: string;
  };
}

function EditorContent({ searchParams }: EditorPageProps) {
  const { load } = useEditorStore();

  const loadDefaultBlocks = useCallback(() => {
    // Load empty state or basic template
    load([]);
  }, [load]);

  const loadPortfolio = useCallback(
    async (portfolioId: string) => {
      // In a real implementation, this would fetch from the database
      logger.info('Loading portfolio', { portfolioId });

      try {
        // Mock API call
        const response = await fetch(`/api/v1/portfolios/${portfolioId}`);
        if (response.ok) {
          const portfolio = await response.json();
          if (portfolio.blocks) {
            load(portfolio.blocks);
          }
        }
      } catch (error) {
        logger.error('Failed to load portfolio', error as Error);
        loadDefaultBlocks();
      }
    },
    [load, loadDefaultBlocks]
  );

  const loadTemplate = useCallback(
    (templateId: string) => {
      // In a real implementation, this would fetch from the template marketplace
      logger.info('Loading template', { templateId });

      // For demo, create some blocks based on template
      const defaultBlocks = [
        {
          id: 'hero-1',
          type: 'hero' as const,
          data: blockConfigs.hero.defaultData,
          styles: blockConfigs.hero.defaultStyles,
          responsive: {
            desktop: blockConfigs.hero.defaultStyles,
          },
          order: 0,
        },
        {
          id: 'about-1',
          type: 'about' as const,
          data: blockConfigs.about.defaultData,
          styles: blockConfigs.about.defaultStyles,
          responsive: {
            desktop: blockConfigs.about.defaultStyles,
          },
          order: 1,
        },
        {
          id: 'skills-1',
          type: 'skills' as const,
          data: blockConfigs.skills.defaultData,
          styles: blockConfigs.skills.defaultStyles,
          responsive: {
            desktop: blockConfigs.skills.defaultStyles,
          },
          order: 2,
        },
      ];

      load(defaultBlocks);
    },
    [load]
  );

  useEffect(() => {
    // Load initial blocks if template is specified
    if (searchParams.template) {
      loadTemplate(searchParams.template);
    } else if (searchParams.portfolioId) {
      loadPortfolio(searchParams.portfolioId);
    } else {
      // Load with some default blocks for demo
      loadDefaultBlocks();
    }
  }, [
    searchParams.template,
    searchParams.portfolioId,
    loadTemplate,
    loadPortfolio,
    loadDefaultBlocks,
  ]);

  return (
    <div className="h-screen overflow-hidden">
      <Suspense
        fallback={
          <div className="h-screen flex">
            <div className="w-80 border-r bg-background">
              <Skeleton className="h-full" />
            </div>
            <div className="flex-1 bg-slate-50">
              <Skeleton className="h-full" />
            </div>
          </div>
        }
      >
        <DragDropEditor portfolioId={searchParams.portfolioId} />
      </Suspense>
    </div>
  );
}

export default function EditorPage({ searchParams }: EditorPageProps) {
  return (
    <ProtectedRoute>
      <EditorContent searchParams={searchParams} />
    </ProtectedRoute>
  );
}
