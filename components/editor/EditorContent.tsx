'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff, Undo, Redo } from 'lucide-react';

import { EditorLayout } from '@/components/editor/EditorLayout';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SectionType } from '@/types/portfolio';

/**
 * Portfolio Editor Content Component
 * 
 * Main editor interface for creating and editing portfolios
 * Features split-screen design with real-time preview
 */
export function EditorContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('hero');
  
  const {
    currentPortfolio,
    savePortfolio,
    updatePortfolioData,
    canUndo,
    canRedo,
    undo,
    redo,
  } = usePortfolioStore();

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (currentPortfolio?.hasUnsavedChanges) {
        setIsSaving(true);
        try {
          await savePortfolio();
          toast({
            title: t.saved || 'Saved',
            description: t.changesSaved || 'Your changes have been saved',
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentPortfolio, savePortfolio, toast, t]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canRedo) redo();
      }
      // Cmd/Ctrl + P = Toggle Preview
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setShowPreview(!showPreview);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, showPreview]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await savePortfolio();
      toast({
        title: t.success || 'Success',
        description: t.portfolioSaved || 'Portfolio saved successfully',
      });
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToSave || 'Failed to save portfolio',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [savePortfolio, toast, t]);

  const handlePublish = async () => {
    // Save before publishing
    if (currentPortfolio?.hasUnsavedChanges) {
      await handleSave();
    }
    router.push(`/editor/${currentPortfolio?.id}/publish`);
  };

  if (!currentPortfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t.noPortfolioSelected || 'No portfolio selected'}</h2>
          <Button onClick={() => router.push('/dashboard')}>
            {t.backToDashboard || 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout>
      {/* Top Toolbar */}
      <div className="h-16 border-b bg-background">
        <div className="flex items-center justify-between w-full h-full px-4">
          {/* Left side - Portfolio name and actions */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{currentPortfolio.name}</h1>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => undo()}
                disabled={!canUndo}
                title={`${t.undo || 'Undo'} (Cmd/Ctrl+Z)`}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => redo()}
                disabled={!canRedo}
                title={`${t.redo || 'Redo'} (Cmd/Ctrl+Shift+Z)`}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center - Preview toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
              title={`${t.togglePreview || 'Toggle Preview'} (Cmd/Ctrl+P)`}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  {t.hidePreview || 'Hide Preview'}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {t.showPreview || 'Show Preview'}
                </>
              )}
            </Button>
          </div>

          {/* Right side - Save and Publish */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || !currentPortfolio.hasUnsavedChanges}
              title={`${t.save || 'Save'} (Cmd/Ctrl+S)`}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? t.saving || 'Saving...' : t.save || 'Save'}
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
            >
              {t.publish || 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <EditorSidebar 
          portfolio={currentPortfolio}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onSectionUpdate={(_section, updates) => {
            // Handle section updates
            if (typeof updates === 'object' && updates !== null) {
              Object.entries(updates).forEach(([field, value]) => {
                // For nested data fields, we need to update the data object
                if (['experience', 'education', 'projects', 'skills', 'certifications', 'customization', 'contact', 'social'].includes(field)) {
                  updatePortfolioData(field, value);
                } else {
                  updatePortfolioData(field, value);
                }
              });
            }
          }}
        />

        {/* Canvas/Form Area */}
        <div className={`flex-1 flex ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <EditorCanvas 
            portfolio={currentPortfolio}
            onDataChange={(data) => {
              // Handle partial portfolio data updates
              if (data && typeof data === 'object') {
                Object.entries(data).forEach(([field, value]) => {
                  updatePortfolioData(`data.${field}`, value);
                });
              }
            }}
          />
        </div>

        {/* Preview Area */}
        {showPreview && (
          <div className="w-1/2 border-l">
            <EditorPreview portfolio={currentPortfolio} />
          </div>
        )}
      </div>
    </EditorLayout>
  );
}