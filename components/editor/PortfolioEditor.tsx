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

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useAutoSave } from '@/hooks/useAutoSave';
import { useDebounce } from '@/hooks/useDebounce';
import { useEditorHistory } from '@/hooks/useEditorHistory';
import { logger } from '@/lib/utils/logger';
import {
  Portfolio,
  PortfolioEditorState,
  TemplateType,
  SectionType,
} from '@/types/portfolio';

import { EditorHeader } from './EditorHeader';
import { EditorSidebar } from './EditorSidebar';
import { EditorToolbar } from './EditorToolbar';
import { PortfolioPreview } from './PortfolioPreview';

/**
 * @fileoverview Portfolio Editor Component - Complete portfolio editing interface
 *
 * This component provides a comprehensive editor for creating and customizing portfolios
 * with real-time preview, AI enhancement features, and template selection.
 *
 * Key Features:
 * - Real-time portfolio editing with live preview
 * - Professional template selection (Developer, Designer, Consultant)
 * - AI-powered content enhancement for bio and projects
 * - Model selection for different AI tasks
 * - Auto-save functionality with validation
 * - Drag-and-drop project reordering
 * - Multi-language support
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha - Enhanced with professional templates
 */

// Removed portfolioService import - will use API calls instead
interface PortfolioEditorProps {
  portfolioId: string;
  userId: string;
  onSave?: (portfolio: Portfolio) => void;
  onPublish?: (portfolio: Portfolio) => void;
  onPreview?: (portfolio: Portfolio) => void;
}

/**
 * Portfolio Editor Component
 *
 * Main editor component that provides a complete interface for portfolio creation and editing.
 * Features tabbed interface, real-time preview, AI enhancement, and professional templates.
 */
export default function PortfolioEditor({
  portfolioId,
  userId,
  onSave,
  onPublish,
  onPreview,
}: PortfolioEditorProps): React.ReactElement {
  // Editor state
  const [editorState, setEditorState] = useState<PortfolioEditorState>({
    portfolio: {} as Portfolio,
    isDirty: false,
    isSaving: false,
    previewMode: 'desktop',
    errors: {},
    history: [],
    historyIndex: -1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('hero');
  const [showPreview, setShowPreview] = useState(false);

  // Debounced portfolio for auto-save
  const debouncedPortfolio = useDebounce(editorState.portfolio, 2000);

  // Custom hooks
  const { pushToHistory, undo, redo, canUndo, canRedo } = useEditorHistory(
    editorState,
    setEditorState
  );

  const { autoSave, lastSaved } = useAutoSave(
    portfolioId,
    debouncedPortfolio,
    editorState.isDirty
  );

  const loadPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/portfolios/${portfolioId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      const { data: portfolio } = await response.json();

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      if (portfolio.userId !== userId) {
        throw new Error('Unauthorized access to portfolio');
      }

      setEditorState(prev => ({
        ...prev,
        portfolio,
        isDirty: false,
        lastSaved: new Date(),
      }));

      // Initialize history with loaded state
      pushToHistory('load', portfolio);
    } catch (err) {
      logger.error(
        'Error loading portfolio:',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId, userId, pushToHistory]);

  // Load portfolio data
  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const handleAutoSave = useCallback(async () => {
    if (!editorState.isDirty || editorState.isSaving) return;

    try {
      setEditorState(prev => ({ ...prev, isSaving: true }));

      const success = await autoSave(editorState.portfolio);

      if (success) {
        setEditorState(prev => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date(),
          isSaving: false,
        }));
      }
    } catch (err) {
      logger.error(
        'Auto-save failed:',
        err instanceof Error ? err : new Error(String(err))
      );
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  }, [
    editorState.isDirty,
    editorState.isSaving,
    editorState.portfolio,
    autoSave,
  ]);

  // Auto-save when portfolio changes
  useEffect(() => {
    if (editorState.isDirty && debouncedPortfolio.id) {
      handleAutoSave();
    }
  }, [debouncedPortfolio, editorState.isDirty, handleAutoSave]);

  const updatePortfolio = useCallback(
    (updates: Partial<Portfolio>, action?: string) => {
      setEditorState(prev => {
        const updatedPortfolio = {
          ...prev.portfolio,
          ...updates,
          updatedAt: new Date(),
        };

        // Push to history if this is a significant change
        if (action) {
          pushToHistory(action, updatedPortfolio);
        }

        return {
          ...prev,
          portfolio: updatedPortfolio,
          isDirty: true,
        };
      });
    },
    [pushToHistory]
  );

  const handleManualSave = async () => {
    try {
      setEditorState(prev => ({ ...prev, isSaving: true }));

      const response = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editorState.portfolio),
      });

      if (!response.ok) {
        throw new Error('Failed to save portfolio');
      }

      const { data: updated } = await response.json();

      if (updated) {
        setEditorState(prev => ({
          ...prev,
          portfolio: updated,
          isDirty: false,
          lastSaved: new Date(),
          isSaving: false,
        }));

        onSave?.(updated);
      }
    } catch (err) {
      logger.error(
        'Save failed:',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Failed to save portfolio');
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handlePublish = async () => {
    try {
      // Save changes first
      await handleManualSave();

      const response = await fetch(
        `/api/v1/portfolios/${portfolioId}/publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish portfolio');
      }

      const { data: published } = await response.json();

      if (published) {
        setEditorState(prev => ({
          ...prev,
          portfolio: published,
        }));

        onPublish?.(published);
      }
    } catch (err) {
      logger.error(
        'Publish failed:',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Failed to publish portfolio');
    }
  };

  const handlePreview = (): void => {
    setShowPreview(true);
    onPreview?.(editorState.portfolio);
  };

  const handleTemplateChange = async (template: TemplateType) => {
    try {
      const response = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template }),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      const { data: updated } = await response.json();

      if (updated) {
        updatePortfolio(updated, `change_template_${template}`);
      }
    } catch (err) {
      logger.error(
        'Template change failed:',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Failed to change template');
    }
  };

  const handleSectionUpdate = useCallback(
    (sectionType: SectionType, updates: unknown) => {
      updatePortfolio(
        {
          ...editorState.portfolio,
          // Update specific section data based on section type
          [sectionType]: updates,
        },
        `update_${sectionType}`
      );
    },
    [editorState.portfolio, updatePortfolio]
  );

  const memoizedPreview = useMemo(
    () => (
      <PortfolioPreview
        portfolio={editorState.portfolio}
        mode={editorState.previewMode}
        activeSection={activeSection}
        onSectionClick={(section: string) =>
          setActiveSection(section as SectionType)
        }
        isInteractive={false}
      />
    ),
    [editorState.portfolio, editorState.previewMode, activeSection]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={loadPortfolio}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <EditorHeader
        portfolio={editorState.portfolio}
        isDirty={editorState.isDirty}
        isSaving={editorState.isSaving}
        lastSaved={lastSaved}
        onSave={handleManualSave}
        onPublish={handlePublish}
        onPreview={handlePreview}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Toolbar */}
      <EditorToolbar
        previewMode={editorState.previewMode}
        onPreviewModeChange={mode =>
          setEditorState(prev => ({ ...prev, previewMode: mode }))
        }
        template={editorState.portfolio.template}
        onTemplateChange={handleTemplateChange}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!showPreview && (
          <EditorSidebar
            portfolio={editorState.portfolio}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onSectionUpdate={handleSectionUpdate}
          />
        )}

        {/* Preview */}
        <div className={`flex-1 ${showPreview ? 'w-full' : 'w-2/3'}`}>
          {memoizedPreview}
        </div>
      </div>

      {/* Full-screen preview modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <h2 className="text-lg font-semibold">Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close Preview
              </button>
            </div>
            <div className="flex-1 overflow-auto">{memoizedPreview}</div>
          </div>
        </div>
      )}
    </div>
  );
}
