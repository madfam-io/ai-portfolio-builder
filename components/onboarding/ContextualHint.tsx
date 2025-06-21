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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, Info, Zap } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { cn } from '@/lib/utils';

interface ContextualHintProps {
  id: string;
  title: string;
  content: string;
  type?: 'info' | 'tip' | 'feature';
  position?: 'top' | 'bottom' | 'left' | 'right';
  targetSelector?: string;
  showAfter?: number; // Delay in ms before showing
  persistent?: boolean; // Don't auto-hide
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ContextualHint({
  id,
  title,
  content,
  type = 'tip',
  position = 'bottom',
  targetSelector,
  showAfter = 1000,
  persistent = false,
  action,
}: ContextualHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [_targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [hintPosition, setHintPosition] = useState({ top: 0, left: 0 });
  const { dismissedHints, dismissHint } = useOnboardingStore();

  // Check if hint was already dismissed
  const isDismissed = dismissedHints.includes(id);

  useEffect(() => {
    if (isDismissed) return;

    // Show hint after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, showAfter);

    // Auto-hide non-persistent hints after 10 seconds
    let hideTimer: NodeJS.Timeout;
    if (!persistent) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, showAfter + 10000);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isDismissed, showAfter, persistent]);

  // Position hint relative to target element
  useEffect(() => {
    if (!targetSelector || !isVisible) return;

    const updatePosition = () => {
      const element = document.querySelector(targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);

        const rect = element.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top - 10;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 10;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
            break;
        }

        setHintPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetSelector, position, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissHint(id);
  };

  if (isDismissed || !isVisible) return null;

  const Icon = {
    info: Info,
    tip: Lightbulb,
    feature: Zap,
  }[type];

  const iconColor = {
    info: 'text-blue-500',
    tip: 'text-yellow-500',
    feature: 'text-purple-500',
  }[type];

  const bgColor = {
    info: 'bg-blue-500/10',
    tip: 'bg-yellow-500/10',
    feature: 'bg-purple-500/10',
  }[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className={cn(
          'fixed z-50 pointer-events-none',
          targetSelector && 'absolute'
        )}
        style={
          targetSelector
            ? {
                top: hintPosition.top,
                left: hintPosition.left,
                transform: getTransform(position),
              }
            : {
                bottom: 24,
                right: 24,
              }
        }
      >
        <Card
          className={cn(
            'max-w-xs shadow-lg border-2 pointer-events-auto',
            bgColor
          )}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  bgColor
                )}
              >
                <Icon className={cn('w-4 h-4', iconColor)} />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm">{title}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 -mt-1 -mr-1"
                    onClick={handleDismiss}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">{content}</p>

                {action && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs mt-2"
                    onClick={() => {
                      action.onClick();
                      handleDismiss();
                    }}
                  >
                    {action.label} →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Arrow pointer for targeted hints */}
        {targetSelector && (
          <div
            className={cn(
              'absolute w-3 h-3 bg-white border-2 border-inherit transform rotate-45',
              position === 'top' && 'bottom-[-6px] left-1/2 -translate-x-1/2',
              position === 'bottom' && 'top-[-6px] left-1/2 -translate-x-1/2',
              position === 'left' && 'right-[-6px] top-1/2 -translate-y-1/2',
              position === 'right' && 'left-[-6px] top-1/2 -translate-y-1/2'
            )}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to get transform based on position
function getTransform(position: string): string {
  switch (position) {
    case 'top':
      return 'translate(-50%, -100%)';
    case 'bottom':
      return 'translate(-50%, 0)';
    case 'left':
      return 'translate(-100%, -50%)';
    case 'right':
      return 'translate(0, -50%)';
    default:
      return 'translate(0, 0)';
  }
}

// Preset hints for common scenarios
export const CommonHints = {
  FirstPortfolio: (
    <ContextualHint
      id="first-portfolio-hint"
      title="Ready to create?"
      content="Start with a template and customize it to match your style. AI will help you write great content!"
      type="tip"
      targetSelector="[data-tour='create-portfolio-btn']"
      position="bottom"
    />
  ),

  AIEnhancement: (
    <ContextualHint
      id="ai-enhancement-hint"
      title="Pro tip: Use AI"
      content="Click the magic wand to enhance your content with AI. It makes your descriptions more compelling!"
      type="feature"
      persistent={true}
    />
  ),

  PublishReady: (
    <ContextualHint
      id="publish-ready-hint"
      title="Looking good!"
      content="Your portfolio is ready to publish. Click the publish button to make it live."
      type="info"
      action={{
        label: 'Publish now',
        onClick: () => {
          /* Publish clicked */
        },
      }}
    />
  ),

  AnalyticsUnlocked: (
    <ContextualHint
      id="analytics-unlocked-hint"
      title="Analytics available!"
      content="Now that your portfolio is live, you can track views and engagement in real-time."
      type="feature"
      showAfter={2000}
    />
  ),
};
