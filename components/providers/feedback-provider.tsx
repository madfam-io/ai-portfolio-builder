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

import { useEffect, useState } from 'react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { SatisfactionSurvey } from '@/components/feedback/SatisfactionSurvey';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { usePathname } from 'next/navigation';

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const { portfolios } = usePortfolioStore();
  const pathname = usePathname();
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyContext, setSurveyContext] = useState<
    'after_publish' | 'weekly_prompt' | 'manual'
  >('manual');

  // Check if we should show satisfaction survey
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Check if user just published a portfolio
    const justPublished = sessionStorage.getItem('just_published_portfolio');
    if (justPublished) {
      sessionStorage.removeItem('just_published_portfolio');
      setSurveyContext('after_publish');
      setShowSurvey(true);
      return;
    }

    // Check if it's been a week since last survey
    const lastSurvey = localStorage.getItem('last_satisfaction_survey');
    if (lastSurvey) {
      const daysSince =
        (Date.now() - parseInt(lastSurvey)) / (1000 * 60 * 60 * 24);
      if (daysSince >= 7 && portfolios.length > 0) {
        setSurveyContext('weekly_prompt');
        setShowSurvey(true);
      }
    } else if (portfolios.length > 0) {
      // First portfolio created, wait a day then show survey
      const firstPortfolioDate = localStorage.getItem('first_portfolio_date');
      if (firstPortfolioDate) {
        const daysSince =
          (Date.now() - parseInt(firstPortfolioDate)) / (1000 * 60 * 60 * 24);
        if (daysSince >= 1) {
          setSurveyContext('weekly_prompt');
          setShowSurvey(true);
        }
      }
    }
  }, [isAuthenticated, user, portfolios]);

  const handleSurveyComplete = () => {
    localStorage.setItem('last_satisfaction_survey', Date.now().toString());
    setShowSurvey(false);
  };

  const handleSurveyDismiss = () => {
    // If dismissed, try again in 3 days
    const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      'last_satisfaction_survey',
      threeDaysFromNow.toString()
    );
    setShowSurvey(false);
  };

  // Don't show feedback widget on certain pages
  const excludedPaths = ['/auth', '/onboarding', '/portfolio'];
  const shouldShowFeedback =
    isAuthenticated && !excludedPaths.some(path => pathname.startsWith(path));

  // User context for feedback
  const userContext = user
    ? {
        plan: 'free', // TODO: Get from user subscription when implemented
        accountAge: Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        portfoliosCreated: portfolios.length,
        lastActivity: new Date(),
      }
    : undefined;

  return (
    <>
      {children}
      {shouldShowFeedback && user && (
        <FeedbackWidget userId={user.id} userContext={userContext} />
      )}
      {showSurvey && user && (
        <SatisfactionSurvey
          userId={user.id}
          userContext={userContext}
          context={surveyContext}
          onComplete={handleSurveyComplete}
          onDismiss={handleSurveyDismiss}
        />
      )}
    </>
  );
}
