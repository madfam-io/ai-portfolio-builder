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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Gift,
  Zap,
} from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { track } from '@/lib/monitoring/unified/events';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  action: string;
  route?: string;
  reward?: string;
  icon?: React.ReactNode;
}

const checklistItems: ChecklistItem[] = [
  {
    id: 'complete-profile',
    title: 'Complete Your Profile',
    description: 'Add your professional information',
    action: 'Complete Profile',
    route: '/settings/profile',
    reward: '🎯 Unlock AI suggestions',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'create-portfolio',
    title: 'Create Your First Portfolio',
    description: 'Build your professional showcase',
    action: 'Create Portfolio',
    route: '/editor/new',
    reward: '🚀 Get your custom URL',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'enhance-with-ai',
    title: 'Enhance Content with AI',
    description: 'Let AI improve your descriptions',
    action: 'Try AI Enhancement',
    route: '/editor',
    reward: '✨ 10 free AI credits',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'publish-portfolio',
    title: 'Publish Your Portfolio',
    description: 'Make your portfolio live',
    action: 'Publish Now',
    route: '/dashboard',
    reward: '🌟 Share with the world',
    icon: <Gift className="w-4 h-4" />,
  },
  {
    id: 'invite-feedback',
    title: 'Get Feedback',
    description: 'Share with friends for feedback',
    action: 'Share Portfolio',
    route: '/dashboard',
    reward: '💬 Improve with insights',
  },
  {
    id: 'explore-analytics',
    title: 'Explore Analytics',
    description: 'Track your portfolio performance',
    action: 'View Analytics',
    route: '/analytics',
    reward: '📊 Data-driven insights',
  },
];

export function OnboardingChecklist() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const { dismissHint } = useOnboardingStore();

  // Mock completed items (in real app, this would come from user data)
  const completedItems = new Set<string>(['complete-profile']);

  const progress = Math.round(
    (completedItems.size / checklistItems.length) * 100
  );
  const remainingTasks = checklistItems.length - completedItems.size;

  const handleAction = (item: ChecklistItem) => {
    track.user.action(
      'checklist_item_clicked',
      'system',
      async () => {
        if (item.route) {
          await router.push(item.route);
        }
      },
      {
        item_id: item.id,
        item_title: item.title,
      }
    );
  };

  const handleDismiss = () => {
    setDismissing(true);
    setTimeout(() => {
      dismissHint('onboarding-checklist');
    }, 300);
  };

  if (dismissing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-40 max-w-sm"
    >
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Getting Started</CardTitle>
              {remainingTasks === 0 && (
                <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">
                  Complete!
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isExpanded && (
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {completedItems.size} of {checklistItems.length} tasks complete
              </p>
            </div>
          )}
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0">
                <div className="mb-4">
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {remainingTasks} tasks remaining
                    </span>
                    {progress === 100 && (
                      <span className="text-green-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        All done!
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {checklistItems.map((item, index) => {
                    const isCompleted = completedItems.has(item.id);
                    const isNext =
                      !isCompleted &&
                      checklistItems
                        .slice(0, index)
                        .every(i => completedItems.has(i.id));

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg transition-colors',
                            isCompleted && 'opacity-60',
                            isNext && 'bg-primary/5 border border-primary/20'
                          )}
                        >
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                  isNext
                                    ? 'border-primary'
                                    : 'border-muted-foreground/30'
                                )}
                              >
                                {item.icon || <Circle className="w-2 h-2" />}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={cn(
                                'font-medium text-sm',
                                isCompleted && 'line-through'
                              )}
                            >
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                            {item.reward && !isCompleted && (
                              <p className="text-xs text-primary mt-1">
                                {item.reward}
                              </p>
                            )}
                          </div>

                          {!isCompleted && (
                            <Button
                              size="sm"
                              variant={isNext ? 'default' : 'outline'}
                              className="text-xs h-7"
                              onClick={() => handleAction(item)}
                            >
                              {item.action}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {progress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg text-center"
                  >
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                      🎉 Congratulations!
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {`You've completed all onboarding tasks`}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => router.push('/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
