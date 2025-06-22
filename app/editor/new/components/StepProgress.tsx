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

import { cn } from '@/lib/utils';

type Step = 'basic' | 'template' | 'import' | 'enhance';

interface StepProgressProps {
  currentStep: Step;
  t: Record<string, string | undefined>; // Translation object
}

export function StepProgress({ currentStep, t }: StepProgressProps) {
  const steps = [
    { id: 'basic', label: t.basicInfo || 'Basic Info', number: 1 },
    { id: 'template', label: t.template || 'Template', number: 2 },
    { id: 'import', label: t.import || 'Import', number: 3 },
    { id: 'enhance', label: t.enhance || 'Enhance', number: 4 },
  ];

  const getProgressWidth = () => {
    switch (currentStep) {
      case 'basic':
        return '25%';
      case 'template':
        return '50%';
      case 'import':
        return '75%';
      case 'enhance':
        return '100%';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map(step => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-2',
              step.id === currentStep ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step.id === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {step.number}
            </div>
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: getProgressWidth() }}
        />
      </div>
    </div>
  );
}
