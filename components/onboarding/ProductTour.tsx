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

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { createPortal } from 'react-dom';
import { track } from '@/lib/monitoring/unified/events';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Define tour steps for different pages
const tourSteps: Record<string, TourStep[]> = {
  dashboard: [
    {
      target: '[data-tour="create-portfolio-btn"]',
      title: 'Create Your Portfolio',
      content:
        'Start here to create your first portfolio. It only takes a few minutes!',
      placement: 'bottom',
    },
    {
      target: '[data-tour="portfolio-list"]',
      title: 'Your Portfolios',
      content:
        'All your portfolios will appear here. You can create multiple versions for different audiences.',
      placement: 'right',
    },
    {
      target: '[data-tour="analytics-preview"]',
      title: 'Track Performance',
      content:
        'See how many people view your portfolio and track engagement metrics.',
      placement: 'left',
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Quick Actions',
      content:
        'Access common tasks like editing, sharing, and managing your portfolios.',
      placement: 'top',
    },
  ],
  editor: [
    {
      target: '[data-tour="template-selector"]',
      title: 'Choose a Template',
      content:
        'Pick a professional template that matches your style and industry.',
      placement: 'right',
    },
    {
      target: '[data-tour="ai-enhance-btn"]',
      title: 'AI Enhancement',
      content:
        'Let AI help you write better descriptions and optimize your content.',
      placement: 'left',
    },
    {
      target: '[data-tour="preview-toggle"]',
      title: 'Live Preview',
      content: 'See how your portfolio looks in real-time as you make changes.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="publish-btn"]',
      title: 'Publish When Ready',
      content:
        "Make your portfolio live with one click when you're happy with it.",
      placement: 'left',
    },
  ],
  portfolio: [
    {
      target: '[data-tour="edit-mode"]',
      title: 'Quick Edit Mode',
      content: 'Click here to make quick edits to your live portfolio.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="share-btn"]',
      title: 'Share Your Portfolio',
      content: 'Get a shareable link or download as PDF.',
      placement: 'left',
    },
    {
      target: '[data-tour="variants-tab"]',
      title: 'Portfolio Variants',
      content:
        'Create different versions of your portfolio for different audiences.',
      placement: 'bottom',
    },
  ],
};

export function ProductTour() {
  const { currentTourStep, nextTourStep, previousTourStep, endTour } =
    useOnboardingStore();

  const [currentSteps, setCurrentSteps] = useState<TourStep[]>([]);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const highlightRef = useRef<HTMLDivElement>(null);

  // Determine which tour to show based on current page
  useEffect(() => {
    const pathname = window.location.pathname;
    let steps: TourStep[] = [];

    if (pathname.includes('/dashboard')) {
      steps = tourSteps.dashboard || [];
    } else if (pathname.includes('/editor')) {
      steps = tourSteps.editor || [];
    } else if (pathname.includes('/portfolio')) {
      steps = tourSteps.portfolio || [];
    }

    setCurrentSteps(steps);
  }, []);

  const currentStep = currentSteps[currentTourStep];

  // Find and highlight target element
  useEffect(() => {
    if (!currentStep) return;

    const findElement = () => {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      if (element) {
        setTargetElement(element);

        // Calculate position for tooltip
        const rect = element.getBoundingClientRect();
        const placement = currentStep.placement || 'bottom';

        let top = rect.top;
        let left = rect.left;

        switch (placement) {
          case 'top':
            top = rect.top - 20;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 20;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 20;
            break;
        }

        setPosition({ top, left });

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Try to find element immediately and after a delay
    findElement();
    const timeout = setTimeout(findElement, 500);

    return () => clearTimeout(timeout);
  }, [currentStep, currentTourStep]);

  const handleNext = () => {
    if (currentTourStep < currentSteps.length - 1) {
      nextTourStep();
      track.user.action('tour_step_next', 'system', async () => {}, {
        step: currentTourStep + 1,
        total_steps: currentSteps.length,
      });
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentTourStep > 0) {
      previousTourStep();
      track.user.action('tour_step_previous', 'system', async () => {}, {
        step: currentTourStep - 1,
      });
    }
  };

  const handleSkip = () => {
    endTour();
    track.user.action('tour_skipped', 'system', async () => {}, {
      skipped_at_step: currentTourStep,
      total_steps: currentSteps.length,
    });
  };

  const handleComplete = () => {
    endTour();
    track.user.action('tour_completed', 'system', async () => {}, {
      total_steps: currentSteps.length,
    });
  };

  if (!currentStep || currentSteps.length === 0) return null;

  const progress = ((currentTourStep + 1) / currentSteps.length) * 100;
  const isLastStep = currentTourStep === currentSteps.length - 1;
  const isFirstStep = currentTourStep === 0;

  return createPortal(
    <>
      {/* Backdrop with spotlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] pointer-events-none"
      >
        <div className="absolute inset-0 bg-black/50" />

        {/* Spotlight cutout */}
        {targetElement && (
          <motion.div
            ref={highlightRef}
            className="absolute bg-transparent pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              top: targetElement.getBoundingClientRect().top - 8,
              left: targetElement.getBoundingClientRect().left - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
            }}
          />
        )}
      </motion.div>

      {/* Tour tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[9999]"
        style={{
          top: position.top,
          left: position.left,
          transform: getTransform(currentStep.placement),
        }}
      >
        <Card className="max-w-sm shadow-2xl border-2 p-6">
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {currentTourStep + 1} of {currentSteps.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 -mr-2 -mt-2"
                  onClick={handleSkip}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {currentStep.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStep.content}
              </p>
            </div>

            {/* Action button if provided */}
            {currentStep.action && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={currentStep.action.onClick}
              >
                {currentStep.action.label}
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button size="sm" onClick={handleNext}>
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </>,
    document.body
  );
}

// Helper function to get transform based on placement
function getTransform(placement?: string): string {
  switch (placement) {
    case 'top':
      return 'translate(-50%, -100%)';
    case 'bottom':
      return 'translate(-50%, 0)';
    case 'left':
      return 'translate(-100%, -50%)';
    case 'right':
      return 'translate(0, -50%)';
    default:
      return 'translate(-50%, 0)';
  }
}
