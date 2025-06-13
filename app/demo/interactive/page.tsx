'use client';

import React, { useState, useEffect } from 'react';

import { AIEnhancementStep } from './components/AIEnhancementStep';
import { DemoHeader } from './components/DemoHeader';
import { EditorStep } from './components/EditorStep';
import { PreviewStep } from './components/PreviewStep';
import { TemplateSelectionStep } from './components/TemplateSelectionStep';

import { useRealTimePreview } from '@/hooks/useRealTimePreview';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePerformanceTracking } from '@/lib/utils/performance';
import { generateSamplePortfolio } from '@/lib/utils/sampleData';
import { showToast } from '@/lib/utils/toast';
import { Portfolio, TemplateType } from '@/types/portfolio';

export default function InteractiveDemoPage(): React.ReactElement {
  const { t } = useLanguage();
  usePerformanceTracking('InteractiveDemoPage');

  const [currentStep, setCurrentStep] = useState<
    'template' | 'ai-enhance' | 'editor' | 'preview'
  >('template');
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
    switch (currentStep) {
      case 'template':
        setCurrentStep('ai-enhance');
        break;
      case 'ai-enhance':
        setCurrentStep('editor');
        break;
      case 'editor':
        setCurrentStep('preview');
        break;
      case 'preview':
        // Could navigate to signup or other action
        break;
    }
  };

  const handlePreviousStep = (): void => {
    switch (currentStep) {
      case 'ai-enhance':
        setCurrentStep('template');
        break;
      case 'editor':
        setCurrentStep('ai-enhance');
        break;
      case 'preview':
        setCurrentStep('editor');
        break;
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
        {currentStep === 'ai-enhance' && (
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
        )}

        {currentStep === 'template' && (
          <TemplateSelectionStep
            selectedTemplate={selectedTemplate}
            isLoading={isLoading}
            onTemplateChange={handleTemplateChange}
            onNextStep={handleNextStep}
            translations={{
              demoChooseYourTemplate: t.demoChooseYourTemplate || 'Choose Your Template',
              demoStartBySelecting: t.demoStartBySelecting || 'Start by selecting a template that matches your profession',
              demoLoadingTemplates: t.demoLoadingTemplates || 'Loading templates...',
            }}
          />
        )}

        {currentStep === 'editor' && (
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
              demoInteractiveDemoMode: t.demoInteractiveDemoMode || 'Interactive Demo Mode',
              demoThisIsPreview: t.demoThisIsPreview || 'This is a preview of the editor. Sign up to save your portfolio.',
              demoBasicInformation: t.demoBasicInformation || 'Basic Information',
              demoName: t.demoName || 'Name',
              demoTitle: t.demoTitle || 'Title',
              demoBio: t.demoBio || 'Bio',
              demoProjects: t.demoProjects || 'Projects',
              demoAddProject: t.demoAddProject || 'Add Project',
              demoSkills: t.demoSkills || 'Skills',
              demoAvailableInFullVersion: t.demoAvailableInFullVersion || 'Available in Full Version',
              demoAiBioEnhancement: t.demoAiBioEnhancement || 'AI Bio Enhancement',
              demoProjectManagement: t.demoProjectManagement || 'Project Management',
              demoSkillsExperience: t.demoSkillsExperience || 'Skills & Experience',
              demoCustomSections: t.demoCustomSections || 'Custom Sections',
              demoLinkedinImport: t.demoLinkedinImport || 'LinkedIn Import',
              demoGithubIntegration: t.demoGithubIntegration || 'GitHub Integration',
              demoLoadingPreview: t.demoLoadingPreview || 'Loading preview...',
            }}
          />
        )}

        {currentStep === 'preview' && (
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
              demoGetStartedFreeTrial: t.demoGetStartedFreeTrial || 'Get Started - Free Trial',
              demoShareDemo: t.demoShareDemo || 'Share Demo',
            }}
          />
        )}
      </main>
    </div>
  );
}