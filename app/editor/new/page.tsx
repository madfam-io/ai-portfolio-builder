/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { TemplateType } from '@/types/portfolio';

// Import step components
import { BasicInfoStep } from './components/BasicInfoStep';
import { TemplateStep } from './components/TemplateStep';
import { ImportStep } from './components/ImportStep';
import { EnhanceStep } from './components/EnhanceStep';
import { StepProgress } from './components/StepProgress';

type Step = 'basic' | 'template' | 'import' | 'enhance';

function NewPortfolioContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { createPortfolio } = usePortfolioStore();

  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isCreating, setIsCreating] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    template: 'modern' as TemplateType,
    importSource: 'manual' as 'linkedin' | 'github' | 'manual' | 'cv',
    enhanceContent: true,
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData({ ...formData, ...updates });
  };

  const handleNext = () => {
    const steps: Step[] = ['basic', 'template', 'import', 'enhance'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as Step);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['basic', 'template', 'import', 'enhance'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as Step);
    }
  };

  const handleCreatePortfolio = async () => {
    setIsCreating(true);
    try {
      const portfolio = await createPortfolio({
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        template: formData.template,
      });

      toast({
        title: t.success || 'Success',
        description: t.portfolioCreated || 'Your portfolio has been created!',
      });

      // Redirect to editor
      router.push(`/editor/${portfolio.id}`);
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description:
          t.failedToCreatePortfolio ||
          'Failed to create portfolio. Please try again.',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            t={t}
          />
        );

      case 'template':
        return (
          <TemplateStep
            selectedTemplate={formData.template}
            onSelectTemplate={template => updateFormData({ template })}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
          />
        );

      case 'import':
        return (
          <ImportStep
            selectedSource={formData.importSource}
            onSelectSource={source => updateFormData({ importSource: source })}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
          />
        );

      case 'enhance':
        return (
          <EnhanceStep
            isCreating={isCreating}
            onCreate={handleCreatePortfolio}
            onBack={handleBack}
            t={t}
          />
        );
    }
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
          {/* Progress indicator */}
          <StepProgress currentStep={currentStep} t={t} />

          {/* Step content */}
          <Card>
            <CardContent className="pt-6">{renderStep()}</CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}

export default function NewPortfolioPage() {
  return (
    <ProtectedRoute>
      <NewPortfolioContent />
    </ProtectedRoute>
  );
}
