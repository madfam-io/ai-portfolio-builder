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

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';

export interface TourStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  startTour?: boolean;
}

export function GuidedTour({
  steps,
  onComplete,
  onSkip,
  startTour = false,
}: GuidedTourProps) {
  const [isActive, setIsActive] = useState(startTour);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const { t } = useLanguage();

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return;

    // Scroll element into view
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Get element position
    const rect = targetElement.getBoundingClientRect();
    setTargetRect(rect);

    // Add highlight class
    targetElement.classList.add('tour-highlight');

    return () => {
      targetElement.classList.remove('tour-highlight');
    };
  }, [isActive, currentStep, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setCurrentStep(0);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsActive(false);
    setCurrentStep(0);
    onSkip?.();
  };

  if (!isActive || !targetRect) return null;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const placement = currentStepData?.placement || 'bottom';
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 20;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipHeight - offset;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + offset;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth - 10;
    }

    if (top < 10) top = 10;
    if (top + tooltipHeight > viewportHeight - 10) {
      top = viewportHeight - tooltipHeight - 10;
    }

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <>
      {/* Backdrop with spotlight */}
      <div className="fixed inset-0 z-[9998]" onClick={handleSkip}>
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute bg-transparent"
          style={{
            top: targetRect.top - 5,
            left: targetRect.left - 5,
            width: targetRect.width + 10,
            height: targetRect.height + 10,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
          }}
        />
      </div>

      {/* Tooltip */}
      <Card
        className="fixed z-[9999] w-80 p-6 shadow-2xl"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-lg font-semibold mb-2">{currentStepData?.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {currentStepData?.content}
        </p>

        {currentStepData?.action && (
          <Button
            size="sm"
            onClick={currentStepData?.action.onClick}
            className="mb-4 w-full"
          >
            {currentStepData?.action.label}
          </Button>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentStep
                    ? 'bg-primary'
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1
                ? t.finish || 'Finish'
                : t.next || 'Next'}
              {currentStep < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9997;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
          }
        }
      `}</style>
    </>
  );
}
