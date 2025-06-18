'use client';

import React, { useState, useEffect } from 'react';

import { useRealTimePreview } from '@/hooks/useRealTimePreview';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePerformanceTracking } from '@/lib/utils/performance';
import { generateSamplePortfolio } from '@/lib/utils/sampleData';
import { showToast } from '@/lib/utils/toast';
import { Portfolio, TemplateType } from '@/types/portfolio';

import { AIEnhancementStep } from './components/AIEnhancementStep';
import { DemoHeader } from './components/DemoHeader';
import { EditorStep } from './components/EditorStep';
import { PreviewStep } from './components/PreviewStep';
import { TemplateSelectionStep } from './components/TemplateSelectionStep';

type DemoStep = 'template' | 'ai-enhance' | 'editor' | 'preview';

interface StepRendererProps {
  currentStep: DemoStep;
  portfolio: Portfolio;
  selectedTemplate: TemplateType;
  isLoading: boolean;
  selectedAIModel: string;
  currentAITask: 'bio' | 'project' | 'template';
  previewConfig: Record<string, unknown>;
  previewDimensions: Record<string, unknown>;
  handleTemplateChange: (template: TemplateType) => Promise<void>;
  handlePortfolioChange: (portfolio: Portfolio) => void;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleExport: () => void;
  handleShare: () => void;
  handleRefresh: () => void;
  setSelectedAIModel: (model: string) => void;
  setCurrentAITask: (task: 'bio' | 'project' | 'template') => void;
  setPreviewMode: (mode: string) => void;
  toggleFullscreen: () => void;
  setZoomLevel: (level: number) => void;
  toggleSectionBorders: () => void;
  toggleInteractiveElements: () => void;
  getResponsiveBreakpoints: () => Array<{
    name: string;
    width: number;
    icon: React.ReactNode;
  }>;
  testResponsiveBreakpoint: (breakpoint: string) => void;
  t: Record<string, string | undefined>;
}

// Helper component to render current step
function StepRenderer({
  currentStep,
  portfolio,
  selectedTemplate,
  isLoading,
  selectedAIModel,
  currentAITask,
  previewConfig,
  previewDimensions,
  handleTemplateChange,
  handlePortfolioChange,
  handleNextStep,
  handlePreviousStep,
  handleExport,
  handleShare,
  handleRefresh,
  setSelectedAIModel,
  setCurrentAITask,
  setPreviewMode,
  toggleFullscreen,
  setZoomLevel,
  toggleSectionBorders,
  toggleInteractiveElements,
  getResponsiveBreakpoints,
  testResponsiveBreakpoint,
  t,
}: StepRendererProps) {
  switch (currentStep) {
    case 'ai-enhance':
      return (
        <AIEnhancementStep
          portfolio={portfolio}
          selectedTemplate={selectedTemplate}
          selectedAIModel={selectedAIModel}
          currentAITask={currentAITask}
          onPortfolioChange={handlePortfolioChange}
          onNextStep={handleNextStep}
          onAIModelSelect={setSelectedAIModel}
          onAITaskChange={setCurrentAITask}
        />
      );

    case 'template':
      return (
        <TemplateSelectionStep
          selectedTemplate={selectedTemplate}
          isLoading={isLoading}
          onTemplateChange={handleTemplateChange}
          onNextStep={handleNextStep}
          translations={{
            demoChooseYourTemplate:
              t.demoChooseYourTemplate || 'Choose Your Template',
            demoStartBySelecting:
              t.demoStartBySelecting ||
              'Start by selecting a template that matches your profession',
            demoLoadingTemplates:
              t.demoLoadingTemplates || 'Loading templates...',
          }}
        />
      );

    case 'editor':
      return (
        <EditorStep
          portfolio={portfolio}
          previewConfig={previewConfig}
          onPortfolioChange={handlePortfolioChange}
          onNextStep={handleNextStep}
          onPreviousStep={handlePreviousStep}
          translations={{
            demoEditPortfolio: t.demoEditPortfolio || 'Edit Portfolio',
            demoBack: t.demoBack || 'Back',
            demoPreview: t.demoPreview || 'Preview',
            demoInteractiveDemoMode:
              t.demoInteractiveDemoMode || 'Interactive Demo Mode',
            demoThisIsPreview:
              t.demoThisIsPreview ||
              'This is a preview of the editor. Sign up to save your portfolio.',
            demoBasicInformation: t.demoBasicInformation || 'Basic Information',
            demoName: t.demoName || 'Name',
            demoTitle: t.demoTitle || 'Title',
            demoBio: t.demoBio || 'Bio',
            demoProjects: t.demoProjects || 'Projects',
            demoAddProject: t.demoAddProject || 'Add Project',
            demoSkills: t.demoSkills || 'Skills',
            demoAvailableInFullVersion:
              t.demoAvailableInFullVersion || 'Available in Full Version',
            demoAiBioEnhancement:
              t.demoAiBioEnhancement || 'AI Bio Enhancement',
            demoProjectManagement:
              t.demoProjectManagement || 'Project Management',
            demoSkillsExperience:
              t.demoSkillsExperience || 'Skills & Experience',
            demoCustomSections: t.demoCustomSections || 'Custom Sections',
            demoLinkedinImport: t.demoLinkedinImport || 'LinkedIn Import',
            demoGithubIntegration:
              t.demoGithubIntegration || 'GitHub Integration',
            demoLoadingPreview: t.demoLoadingPreview || 'Loading preview...',
          }}
        />
      );

    case 'preview':
      return (
        <PreviewStep
          portfolio={portfolio}
          previewConfig={previewConfig}
          previewDimensions={previewDimensions}
          onPreviousStep={handlePreviousStep}
          onExport={handleExport}
          onShare={handleShare}
          onRefresh={handleRefresh}
          setPreviewMode={setPreviewMode}
          toggleFullscreen={toggleFullscreen}
          setZoomLevel={setZoomLevel}
          toggleSectionBorders={toggleSectionBorders}
          toggleInteractiveElements={toggleInteractiveElements}
          getResponsiveBreakpoints={getResponsiveBreakpoints}
          testResponsiveBreakpoint={testResponsiveBreakpoint}
          translations={{
            demoLoadingControls: t.demoLoadingControls || 'Loading controls...',
            demoLoadingPreview: t.demoLoadingPreview || 'Loading preview...',
            demoBackToEditor: t.demoBackToEditor || 'Back to Editor',
            demoLoveWhatYouSee: t.demoLoveWhatYouSee || 'Love what you see?',
            demoGetStartedFreeTrial:
              t.demoGetStartedFreeTrial || 'Get Started - Free Trial',
            demoShareDemo: t.demoShareDemo || 'Share Demo',
          }}
        />
      );

    default:
      return null;
  }
}

export default function InteractiveDemoPage(): React.ReactElement {
  const { t } = useLanguage();
  usePerformanceTracking('InteractiveDemoPage');

  const [currentStep, setCurrentStep] = useState<DemoStep>('template');
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('developer');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState('llama-3.1');
  const [currentAITask, setCurrentAITask] = useState<
    'bio' | 'project' | 'template'
  >('bio');

  // Initialize portfolio with sample data immediately
  const [portfolio, setPortfolio] = useState<Portfolio>(() =>
    generateSamplePortfolio('developer')
  );

  // Update portfolio when template changes
  useEffect(() => {
    const samplePortfolio = generateSamplePortfolio(selectedTemplate);
    setPortfolio(samplePortfolio);
  }, [selectedTemplate]);

  const {
    previewConfig,
    previewDimensions,
    setPreviewMode,
    toggleFullscreen,
    setZoomLevel,
    toggleSectionBorders,
    toggleInteractiveElements,
    getResponsiveBreakpoints,
    testResponsiveBreakpoint,
  } = useRealTimePreview({
    portfolio,
    onPreviewChange: _config => {
      // Preview config change handled by state - no logging needed for development demo
    },
  });

  const handleTemplateChange = async (
    template: TemplateType
  ): Promise<void> => {
    setIsLoading(true);
    setSelectedTemplate(template);

    // Simulate template application delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPortfolio = generateSamplePortfolio(template);
    setPortfolio(newPortfolio);
    setIsLoading(false);
  };

  const handlePortfolioChange = (updatedPortfolio: Portfolio): void => {
    setPortfolio(updatedPortfolio);
  };

  const handleNextStep = (): void => {
    const stepOrder: DemoStep[] = [
      'template',
      'ai-enhance',
      'editor',
      'preview',
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePreviousStep = (): void => {
    const stepOrder: DemoStep[] = [
      'template',
      'ai-enhance',
      'editor',
      'preview',
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleRefresh = (): void => {
    setCurrentStep('template');
    setSelectedTemplate('developer');
    setPortfolio(generateSamplePortfolio('developer'));
    showToast.success(t.demoDemoReset || 'Demo has been reset');
  };

  const handleExport = (): void => {
    showToast.success(
      t.demoExportFeature || 'Export feature available in full version'
    );
  };

  const handleShare = (): void => {
    showToast.success(
      t.demoShareFeature || 'Share feature available in full version'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <DemoHeader
        currentStep={currentStep}
        onRefresh={handleRefresh}
        translations={{
          demoInteractiveDemo: t.demoInteractiveDemo || 'Interactive Demo',
          demoTemplate: t.demoTemplate || 'Template',
          demoEdit: t.demoEdit || 'Edit',
          demoPreview: t.demoPreview || 'Preview',
          demoResetDemo: t.demoResetDemo || 'Reset Demo',
          demoCreateAccount: t.demoCreateAccount || 'Create Account',
        }}
      />

      <main className="flex-1">
        <StepRenderer
          currentStep={currentStep}
          portfolio={portfolio}
          selectedTemplate={selectedTemplate}
          isLoading={isLoading}
          selectedAIModel={selectedAIModel}
          currentAITask={currentAITask}
          previewConfig={previewConfig}
          previewDimensions={previewDimensions}
          handleTemplateChange={handleTemplateChange}
          handlePortfolioChange={handlePortfolioChange}
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
          handleExport={handleExport}
          handleShare={handleShare}
          handleRefresh={handleRefresh}
          setSelectedAIModel={setSelectedAIModel}
          setCurrentAITask={setCurrentAITask}
          setPreviewMode={setPreviewMode}
          toggleFullscreen={toggleFullscreen}
          setZoomLevel={setZoomLevel}
          toggleSectionBorders={toggleSectionBorders}
          toggleInteractiveElements={toggleInteractiveElements}
          getResponsiveBreakpoints={getResponsiveBreakpoints}
          testResponsiveBreakpoint={testResponsiveBreakpoint}
          t={t}
        />
      </main>
    </div>
  );
}
