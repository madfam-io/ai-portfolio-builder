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

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: 'subdomain' | 'seo' | 'review';
  t: Record<string, string | undefined>; // Translation object
}

export function ProgressIndicator({ currentStep, t }: ProgressIndicatorProps) {
  const steps = [
    { id: 'subdomain', label: t.webAddress || 'Web Address', number: 1 },
    { id: 'seo', label: t.seoSettings || 'SEO', number: 2 },
    { id: 'review', label: t.review || 'Review', number: 3 },
  ];

  const getProgressWidth = () => {
    switch (currentStep) {
      case 'subdomain':
        return '33%';
      case 'seo':
        return '66%';
      case 'review':
        return '100%';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
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
