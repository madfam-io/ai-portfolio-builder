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

import {
  captureEvent,
  EVENTS,
  USER_PROPERTIES,
  setUserProperties,
} from '@/lib/analytics/posthog/client';

/**
 * PostHog Analytics Service
 *
 * Centralized service for tracking key business metrics and user behavior
 */
export class PostHogAnalyticsService {
  /**
   * Track user signup with source attribution
   */
  static trackSignup(userId: string, email: string, source?: string) {
    captureEvent(EVENTS.USER_SIGNED_UP, {
      userId,
      email,
      source: source || 'organic',
      timestamp: new Date().toISOString(),
    });

    // Set initial user properties
    setUserProperties({
      [USER_PROPERTIES.SIGNUP_SOURCE]: source || 'organic',
      [USER_PROPERTIES.TOTAL_PORTFOLIOS]: 0,
      [USER_PROPERTIES.TOTAL_VARIANTS]: 0,
      [USER_PROPERTIES.TOTAL_PUBLISHES]: 0,
      [USER_PROPERTIES.ONBOARDING_COMPLETED]: false,
    });
  }

  /**
   * Track portfolio creation with AI usage
   */
  static trackPortfolioCreated(
    portfolioId: string,
    useAI: boolean,
    template?: string
  ) {
    captureEvent(EVENTS.PORTFOLIO_CREATED, {
      portfolioId,
      useAI,
      template: template || 'default',
      timestamp: new Date().toISOString(),
    });

    // Increment user portfolio count
    setUserProperties({
      [USER_PROPERTIES.TOTAL_PORTFOLIOS]: '+1',
    });
  }

  /**
   * Track portfolio publication
   */
  static trackPortfolioPublished(portfolioId: string, subdomain: string) {
    captureEvent(EVENTS.PORTFOLIO_PUBLISHED, {
      portfolioId,
      subdomain,
      timestamp: new Date().toISOString(),
    });

    setUserProperties({
      [USER_PROPERTIES.TOTAL_PUBLISHES]: '+1',
    });
  }

  /**
   * Track subscription events for revenue tracking
   */
  static trackSubscriptionStarted(
    userId: string,
    plan: string,
    amount: number,
    interval: 'monthly' | 'yearly'
  ) {
    captureEvent(EVENTS.SUBSCRIPTION_STARTED, {
      userId,
      plan,
      amount,
      interval,
      mrr: interval === 'monthly' ? amount : amount / 12,
      timestamp: new Date().toISOString(),
    });

    setUserProperties({
      [USER_PROPERTIES.SUBSCRIPTION_TIER]: plan,
    });
  }

  /**
   * Track referral events for viral coefficient
   */
  static trackReferralSent(referrerId: string, channel: string) {
    captureEvent('referral_sent', {
      referrerId,
      channel,
      timestamp: new Date().toISOString(),
    });
  }

  static trackReferralConverted(
    referrerId: string,
    referredUserId: string,
    reward?: number
  ) {
    captureEvent('referral_converted', {
      referrerId,
      referredUserId,
      reward,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track AI feature usage
   */
  static trackAIUsage(
    feature: string,
    success: boolean,
    model?: string,
    processingTime?: number
  ) {
    captureEvent(EVENTS.AI_CONTENT_GENERATED, {
      feature,
      success,
      model,
      processingTime,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track engagement metrics
   */
  static trackEngagement(
    action: string,
    target: string,
    metadata?: Record<string, any>
  ) {
    captureEvent(`engagement_${action}`, {
      action,
      target,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track feature adoption
   */
  static trackFeatureUsage(feature: string, action: string, value?: any) {
    captureEvent(`feature_${feature}_${action}`, {
      feature,
      action,
      value,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track conversion funnel events
   */
  static trackFunnelStep(
    funnel: string,
    step: string,
    metadata?: Record<string, any>
  ) {
    captureEvent(`funnel_${funnel}_${step}`, {
      funnel,
      step,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track error events for monitoring
   */
  static trackError(
    error: string,
    context: string,
    severity: 'low' | 'medium' | 'high'
  ) {
    captureEvent('error_occurred', {
      error,
      context,
      severity,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track performance metrics
   */
  static trackPerformance(metric: string, value: number, unit: string) {
    captureEvent('performance_metric', {
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
    });
  }
}
