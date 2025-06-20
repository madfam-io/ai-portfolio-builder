'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { EditorLayout } from '@/components/editor/EditorLayout';
import { EditorSidebarEnhanced } from '@/components/editor/EditorSidebarEnhanced';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PerformanceMonitor } from '@/lib/performance/optimization';
import { createMobileOptimizer } from '@/lib/performance/mobile-optimization';
import { SectionType } from '@/types/portfolio';
import {
  trackEditorSectionEdited,
  trackPortfolioUpdated,
  trackEditorThemeChanged,
} from '@/lib/analytics/posthog/events';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GuidedTour } from '@/components/onboarding/GuidedTour';
import {
  editorTourSteps,
  shouldShowTour,
  markTourCompleted,
} from '@/components/onboarding/tours/editor-tour';
import { CompletionBadge } from '@/components/portfolio/CompletionBadge';

/**
 * Portfolio Editor Content Component
 *
 * Enhanced editor interface with AI features, real-time preview, and drag-and-drop
 */
export function EditorContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('hero');
  const [previewMode, setPreviewMode] = useState<
    'desktop' | 'tablet' | 'mobile'
  >('desktop');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Check if tour should be shown
  useEffect(() => {
    if (shouldShowTour('editor')) {
      // Delay tour start to ensure DOM is ready
      setTimeout(() => setShowTour(true), 1000);
    }
  }, []);
  const [performanceMonitor] = useState(() => new PerformanceMonitor());
  const [mobileOptimizer] = useState(() => createMobileOptimizer());

  const {
    currentPortfolio,
    savePortfolio,
    updatePortfolioData,
    canUndo,
    canRedo,
    undo,
    redo,
  } = usePortfolioStore();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    performanceMonitor.startTimer('portfolioSave');

    try {
      await savePortfolio();
      setLastSaved(new Date());

      performanceMonitor.endTimer('portfolioSave');

      toast({
        title: t.success || 'Success',
        description: t.portfolioSaved || 'Portfolio saved successfully',
      });
    } catch (_error) {
      performanceMonitor.endTimer('portfolioSave');
      toast({
        title: t.error || 'Error',
        description: t.failedToSave || 'Failed to save portfolio',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [savePortfolio, toast, t, performanceMonitor]);

  const enhanceBio = async () => {
    if (!currentPortfolio?.bio) return;

    const response = await fetch('/api/v1/ai/enhance-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio: currentPortfolio.bio,
        context: {
          title: currentPortfolio.title || 'Professional',
          skills: currentPortfolio.skills?.map(s =>
            typeof s === 'string' ? s : s.name
          ) || ['Professional'],
          experience:
            currentPortfolio.experience?.map(exp => ({
              company: exp.company || 'Company',
              position: exp.position || 'Position',
              duration: `${exp.startDate || 'Present'} - ${exp.endDate || 'Present'}`,
            })) || [],
          industry: currentPortfolio.template || 'professional',
          tone: 'professional' as const,
          targetLength: 'concise' as const,
        },
      }),
    });

    if (!response.ok) return;

    const result = await response.json();
    if (result.success && result.data?.content) {
      updatePortfolioData('bio', result.data.content);
    }
  };

  const enhanceProjects = async () => {
    if (!currentPortfolio?.projects?.length) return;

    for (const project of currentPortfolio.projects) {
      const response = await fetch('/api/v1/ai/optimize-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: project.description,
          technologies: project.technologies,
        }),
      });

      if (!response.ok) continue;

      const { optimizedDescription } = await response.json();
      const updatedProjects = currentPortfolio.projects.map(p =>
        p.id === project.id ? { ...p, description: optimizedDescription } : p
      );
      updatePortfolioData('projects', updatedProjects);
    }
  };

  const handleAIEnhancement = async () => {
    if (!currentPortfolio) return;

    setIsAIProcessing(true);
    performanceMonitor.startTimer('aiProcessing');

    try {
      await enhanceBio();
      await enhanceProjects();

      performanceMonitor.endTimer('aiProcessing');

      toast({
        title: t.success || 'Success',
        description:
          t.contentEnhanced || 'Your content has been enhanced with AI',
      });
    } catch (_error) {
      performanceMonitor.endTimer('aiProcessing');
      toast({
        title: t.error || 'Error',
        description:
          t.aiEnhancementFailed || 'Failed to enhance content with AI',
        variant: 'destructive',
      });
    } finally {
      setIsAIProcessing(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return t.justNow || 'just now';
    if (minutes === 1) return t.oneMinuteAgo || '1 min ago';
    if (minutes < 60) return `${minutes} ${t.minutesAgo || 'min ago'}`;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize mobile optimizations
  useEffect(() => {
    mobileOptimizer.initialize();
  }, [mobileOptimizer]);

  // Enhanced auto-save with visual feedback
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (currentPortfolio?.hasUnsavedChanges) {
        setIsSaving(true);
        try {
          await savePortfolio();
          setLastSaved(new Date());
        } catch (_error) {
          // Error handling already in savePortfolio
        } finally {
          setIsSaving(false);
        }
      }
    }, 30000);

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
  }, [canUndo, canRedo, undo, redo, showPreview, handleSave]);

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
          <h2 className="text-2xl font-bold mb-4">
            {t.noPortfolioSelected || 'No portfolio selected'}
          </h2>
          <Button onClick={() => router.push('/dashboard')}>
            {t.backToDashboard || 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout>
      {/* Enhanced Top Toolbar */}
      <div className="h-16 border-b bg-background">
        <div className="flex items-center justify-between w-full h-full px-4">
          {/* Left side - Portfolio name and status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">{currentPortfolio.name}</h1>
              <CompletionBadge
                portfolio={currentPortfolio}
                className="text-xs"
              />
              {currentPortfolio.hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  {t.unsavedChanges || 'Unsaved changes'}
                </Badge>
              )}
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  {t.saved || 'Saved'} {formatTime(lastSaved)}
                </span>
              )}
            </div>

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

          {/* Center - Preview toggle and device modes */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
              title={`${t.togglePreview || 'Toggle Preview'} (Cmd/Ctrl+P)`}
              data-tour="preview-toggle"
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

            {showPreview && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('desktop')}
                    className="h-8 px-2"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('tablet')}
                    className="h-8 px-2"
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('mobile')}
                    className="h-8 px-2"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right side - Save, AI Enhancement, and Publish */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || !currentPortfolio.hasUnsavedChanges}
              title={`${t.save || 'Save'} (Cmd/Ctrl+S)`}
              data-tour="save-button"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? t.saving || 'Saving...' : t.save || 'Save'}
            </Button>

            {/* AI Enhancement Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAIEnhancement}
              disabled={isAIProcessing}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
              data-tour="ai-enhance"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAIProcessing
                ? t.enhancing || 'Enhancing...'
                : t.aiEnhance || 'AI Enhance'}
            </Button>

            <Button
              size="sm"
              onClick={handlePublish}
              data-tour="publish-button"
            >
              {t.publish || 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="editor-sidebar">
          <EditorSidebarEnhanced
            portfolio={currentPortfolio}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onSectionUpdate={(section, updates) => {
              // Handle section updates
              if (typeof updates === 'object' && updates !== null) {
                Object.entries(updates).forEach(([field, value]) => {
                  // Track analytics for section edits
                  trackEditorSectionEdited(currentPortfolio.id, section, {
                    edit_type: 'update',
                    field,
                  });

                  // Track theme changes specifically
                  if (field === 'customization' || field === 'template') {
                    trackEditorThemeChanged(currentPortfolio.id, {
                      customization_type: field,
                    });
                  }

                  // For nested data fields, we need to update the data object
                  if (
                    [
                      'experience',
                      'education',
                      'projects',
                      'skills',
                      'certifications',
                      'customization',
                      'contact',
                      'social',
                    ].includes(field)
                  ) {
                    updatePortfolioData(field, value);
                  } else {
                    updatePortfolioData(field, value);
                  }
                });

                // Track general portfolio update
                trackPortfolioUpdated(currentPortfolio.id, {
                  section,
                  update_type: 'manual',
                });
              }
            }}
          />
        </div>

        {/* Preview Area */}
        <div
          className={cn(
            'border-l transition-all duration-300',
            showPreview ? 'flex-1' : 'w-0 overflow-hidden'
          )}
        >
          <EditorPreview
            portfolio={currentPortfolio}
            mode={previewMode}
            className="h-full"
          />
        </div>
      </div>

      {/* Guided Tour */}
      <GuidedTour
        steps={editorTourSteps}
        startTour={showTour}
        onComplete={() => {
          setShowTour(false);
          markTourCompleted('editor');
        }}
        onSkip={() => {
          setShowTour(false);
          markTourCompleted('editor');
        }}
      />
    </EditorLayout>
  );
}
