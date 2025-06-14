'use client';

import { Save, Eye, EyeOff, Undo, Redo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { SectionType } from '@/types/portfolio';

/**
 * Portfolio Editor Page
 *
 * Main editor interface for creating and editing portfolios
 * Features split-screen design with real-time preview
 */
function EditorContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('hero');
  const [errors] = useState<Record<string, string>>({});

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
        await savePortfolio();
        setIsSaving(false);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentPortfolio, savePortfolio]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePortfolio();
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // TODO: Implement publish functionality
    router.push('/editor/publish');
  };

  if (!currentPortfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t.noPortfolioSelected}</h2>
          <Button onClick={() => router.push('/dashboard')}>
            {t.backToDashboard}
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
                title={`${t.undo} (Cmd/Ctrl+Z)`}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => redo()}
                disabled={!canRedo}
                title={`${t.redo} (Cmd/Ctrl+Shift+Z)`}
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
              title={`${t.togglePreview} (Cmd/Ctrl+P)`}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  {t.hidePreview}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {t.showPreview}
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
              title={`${t.save} (Cmd/Ctrl+S)`}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? t.saving : t.save}
            </Button>
            <Button size="sm" onClick={handlePublish}>
              {t.publish}
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
                updatePortfolioData(field, value);
              });
            }
          }}
          errors={errors}
        />

        {/* Canvas/Form Area */}
        <div className={`flex-1 flex ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <EditorCanvas
            portfolio={currentPortfolio}
            onDataChange={data => {
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

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}
