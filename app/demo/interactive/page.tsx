'use client';

import React, { useState, useEffect } from 'react';

import { useRealTimePreview, PreviewMode } from '@/hooks/useRealTimePreview';
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
  previewConfig: {
    mode: PreviewMode;
    state: 'editing' | 'preview' | 'fullscreen';
    zoomLevel: number;
    showSectionBorders: boolean;
    showInteractiveElements: boolean;
  };
  previewDimensions: {
    width: string | number;
    height: string | number;
    scale: number;
  };
  handleTemplateChange: (template: TemplateType) => Promise<void>;
  handlePortfolioChange: (portfolio: Portfolio) => void;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleExport: () => void;
  handleShare: () => void;
  handleRefresh: () => void;
  setSelectedAIModel: (model: string) => void;
  setCurrentAITask: (task: 'bio' | 'project' | 'template') => void;
  setPreviewMode: (mode: PreviewMode) => void;
  toggleFullscreen: () => void;
  setZoomLevel: (level: number) => void;
  toggleSectionBorders: () => void;
  toggleInteractiveElements: () => void;
  getResponsiveBreakpoints: () => Array<{
    name: string;
    width: number;
    height: number;
  }>;
  testResponsiveBreakpoint: (width: number, height: number) => void;
  t: Record<string, string | undefined>;
}

// Step renderer components to reduce complexity
const AIStepRenderer = ({
  portfolio,
  selectedTemplate,
  selectedAIModel,
  currentAITask,
  handlePortfolioChange,
  handleNextStep,
  setSelectedAIModel,
  setCurrentAITask,
}: {
  portfolio: Portfolio;
  selectedTemplate: TemplateType;
  selectedAIModel: string;
  currentAITask: 'bio' | 'project' | 'template';
  handlePortfolioChange: (portfolio: Portfolio) => void;
  handleNextStep: () => void;
  setSelectedAIModel: (model: string) => void;
  setCurrentAITask: (task: 'bio' | 'project' | 'template') => void;
}) => (
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

const TemplateStepRenderer = ({
  selectedTemplate,
  isLoading,
  handleTemplateChange,
  handleNextStep,
  t,
}: {
  selectedTemplate: TemplateType;
  isLoading: boolean;
  handleTemplateChange: (template: TemplateType) => Promise<void>;
  handleNextStep: () => void;
  t: Record<string, string | undefined>;
}) => (
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
      demoLoadingTemplates: t.demoLoadingTemplates || 'Loading templates...',
    }}
  />
);

// eslint-disable-next-line complexity
const EditorStepRenderer = ({
  portfolio,
  previewConfig,
  handlePortfolioChange,
  handleNextStep,
  handlePreviousStep,
  t,
}: {
  portfolio: Portfolio;
  previewConfig: {
    mode: PreviewMode;
    state: 'editing' | 'preview' | 'fullscreen';
    zoomLevel: number;
    showSectionBorders: boolean;
    showInteractiveElements: boolean;
  };
  handlePortfolioChange: (portfolio: Portfolio) => void;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  t: Record<string, string | undefined>;
}) => (
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
      demoAiBioEnhancement: t.demoAiBioEnhancement || 'AI Bio Enhancement',
      demoProjectManagement: t.demoProjectManagement || 'Project Management',
      demoSkillsExperience: t.demoSkillsExperience || 'Skills & Experience',
      demoCustomSections: t.demoCustomSections || 'Custom Sections',
      demoLinkedinImport: t.demoLinkedinImport || 'LinkedIn Import',
      demoGithubIntegration: t.demoGithubIntegration || 'GitHub Integration',
      demoLoadingPreview: t.demoLoadingPreview || 'Loading preview...',
    }}
  />
);

const PreviewStepRenderer = ({
  portfolio,
  previewConfig,
  previewDimensions,
  handlePreviousStep,
  handleExport,
  handleShare,
  handleRefresh,
  setPreviewMode,
  toggleFullscreen,
  setZoomLevel,
  toggleSectionBorders,
  toggleInteractiveElements,
  getResponsiveBreakpoints,
  testResponsiveBreakpoint,
  t,
}: {
  portfolio: Portfolio;
  previewConfig: {
    mode: PreviewMode;
    state: 'editing' | 'preview' | 'fullscreen';
    zoomLevel: number;
    showSectionBorders: boolean;
    showInteractiveElements: boolean;
  };
  previewDimensions: {
    width: string | number;
    height: string | number;
    scale: number;
  };
  handlePreviousStep: () => void;
  handleExport: () => void;
  handleShare: () => void;
  handleRefresh: () => void;
  setPreviewMode: (mode: PreviewMode) => void;
  toggleFullscreen: () => void;
  setZoomLevel: (level: number) => void;
  toggleSectionBorders: () => void;
  toggleInteractiveElements: () => void;
  getResponsiveBreakpoints: () => Array<{
    name: string;
    width: number;
    height: number;
  }>;
  testResponsiveBreakpoint: (width: number, height: number) => void;
  t: Record<string, string | undefined>;
}) => (
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

// Simplified step renderer function
function StepRenderer(props: StepRendererProps) {
  const { currentStep } = props;

  switch (currentStep) {
    case 'ai-enhance':
      return <AIStepRenderer {...props} />;
    case 'template':
      return <TemplateStepRenderer {...props} />;
    case 'editor':
      return <EditorStepRenderer {...props} />;
    case 'preview':
      return <PreviewStepRenderer {...props} />;
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
      const nextStep = stepOrder[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);
      }
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
      const prevStep = stepOrder[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
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
