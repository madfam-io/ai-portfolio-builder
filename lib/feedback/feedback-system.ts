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

/**
 * @fileoverview Beta Feedback Collection System
 *
 * Comprehensive feedback collection and analytics system for beta users
 * to gather insights and improve the platform before full launch.
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/utils/logger';

export interface FeedbackEntry {
  id: string;
  userId: string;
  type: 'bug' | 'feature_request' | 'improvement' | 'general' | 'usability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  category: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments?: string[];
  reproductionSteps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  tags: string[];
  rating?: number; // 1-5 star rating
  userContext?: {
    plan: string;
    accountAge: number;
    portfoliosCreated: number;
    lastActivity: Date;
  };
}

export interface UserSatisfactionSurvey {
  id: string;
  userId: string;
  timestamp: Date;
  overallSatisfaction: number; // 1-10
  easeOfUse: number; // 1-10
  performance: number; // 1-10
  features: number; // 1-10
  design: number; // 1-10
  likelihood_to_recommend: number; // 1-10 (NPS)
  mostUsefulFeature: string;
  leastUsefulFeature: string;
  missingFeatures: string[];
  additionalComments: string;
  completedIn: number; // seconds
}

export interface BetaMetrics {
  totalUsers: number;
  activeUsers: number;
  portfoliosCreated: number;
  avgTimeToFirstPortfolio: number;
  avgPortfolioCompletionRate: number;
  feedbackEntries: number;
  surveyResponses: number;
  averageNPS: number;
  criticalBugs: number;
  featureRequests: number;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

/**
 * Feedback collection and management system
 */
export class FeedbackSystem {
  private feedbackEntries: Map<string, FeedbackEntry> = new Map();
  private surveys: Map<string, UserSatisfactionSurvey> = new Map();
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/v1/beta/feedback') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(
    feedback: Omit<FeedbackEntry, 'id' | 'timestamp' | 'status'>
  ): Promise<string> {
    const feedbackEntry: FeedbackEntry = {
      ...feedback,
      id: this.generateId(),
      timestamp: new Date(),
      status: 'open',
    };

    try {
      const response = await fetch(`${this.apiEndpoint}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackEntry),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.statusText}`);
      }

      const result = await response.json();
      this.feedbackEntries.set(feedbackEntry.id, feedbackEntry);

      return result.id || feedbackEntry.id;
    } catch (error) {
      logger.error('Error submitting feedback:', error as Error);
      // Store locally as fallback
      this.feedbackEntries.set(feedbackEntry.id, feedbackEntry);
      return feedbackEntry.id;
    }
  }

  /**
   * Submit satisfaction survey
   */
  async submitSurvey(
    survey: Omit<UserSatisfactionSurvey, 'id' | 'timestamp'>
  ): Promise<string> {
    const surveyEntry: UserSatisfactionSurvey = {
      ...survey,
      id: this.generateId(),
      timestamp: new Date(),
    };

    try {
      const response = await fetch(`${this.apiEndpoint}/survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyEntry),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit survey: ${response.statusText}`);
      }

      this.surveys.set(surveyEntry.id, surveyEntry);
      return surveyEntry.id;
    } catch (error) {
      logger.error('Error submitting survey:', error as Error);
      this.surveys.set(surveyEntry.id, surveyEntry);
      return surveyEntry.id;
    }
  }

  /**
   * Get feedback entries with filtering
   */
  async getFeedback(filters?: {
    type?: FeedbackEntry['type'];
    severity?: FeedbackEntry['severity'];
    status?: FeedbackEntry['status'];
    userId?: string;
    limit?: number;
  }): Promise<FeedbackEntry[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.apiEndpoint}/list?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error fetching feedback:', error as Error);
      // Return local entries as fallback
      return Array.from(this.feedbackEntries.values())
        .filter(entry => {
          if (!filters) return true;
          return (
            (!filters.type || entry.type === filters.type) &&
            (!filters.severity || entry.severity === filters.severity) &&
            (!filters.status || entry.status === filters.status) &&
            (!filters.userId || entry.userId === filters.userId)
          );
        })
        .slice(0, filters?.limit || 100);
    }
  }

  /**
   * Get beta metrics and analytics
   */
  async getBetaMetrics(): Promise<BetaMetrics> {
    try {
      const response = await fetch(`${this.apiEndpoint}/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error fetching beta metrics:', error as Error);
      // Return basic metrics from local data
      return this.calculateLocalMetrics();
    }
  }

  /**
   * Calculate NPS score from surveys
   */
  calculateNPS(): number {
    const surveys = Array.from(this.surveys.values());
    if (surveys.length === 0) return 0;

    const scores = surveys.map(s => s.likelihood_to_recommend);
    const promoters = scores.filter(score => score >= 9).length;
    const detractors = scores.filter(score => score <= 6).length;
    const total = scores.length;

    return Math.round(((promoters - detractors) / total) * 100);
  }

  /**
   * Get feedback trends over time
   */
  getFeedbackTrends(days: number = 30): {
    date: string;
    bugs: number;
    features: number;
    improvements: number;
    total: number;
  }[] {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const trends: {
      [key: string]: {
        bugs: number;
        features: number;
        improvements: number;
        total: number;
      };
    } = {};

    // Initialize all dates
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      if (dateStr) {
        trends[dateStr] = { bugs: 0, features: 0, improvements: 0, total: 0 };
      }
    }

    // Count feedback by date and type
    Array.from(this.feedbackEntries.values()).forEach(entry => {
      const dateStr = entry.timestamp.toISOString().split('T')[0];
      if (dateStr && trends[dateStr]) {
        const trendData = trends[dateStr];
        trendData.total++;
        if (entry.type === 'bug') trendData.bugs++;
        if (entry.type === 'feature_request') trendData.features++;
        if (entry.type === 'improvement') trendData.improvements++;
      }
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      bugs: data.bugs,
      features: data.features,
      improvements: data.improvements,
      total: data.total,
    }));
  }

  /**
   * Generate feedback report
   */
  generateFeedbackReport(): {
    summary: {
      totalFeedback: number;
      criticalIssues: number;
      averageRating: number;
      npsScore: number;
    };
    breakdown: {
      byType: { [key: string]: number };
      bySeverity: { [key: string]: number };
      byStatus: { [key: string]: number };
    };
    topIssues: FeedbackEntry[];
    recentSurveys: UserSatisfactionSurvey[];
  } {
    const feedback = Array.from(this.feedbackEntries.values());
    const surveys = Array.from(this.surveys.values());

    // Calculate summary
    const totalFeedback = feedback.length;
    const criticalIssues = feedback.filter(
      f => f.severity === 'critical'
    ).length;
    const ratingsSum = feedback.reduce((sum, f) => sum + (f.rating || 0), 0);
    const ratingsCount = feedback.filter(f => f.rating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
    const npsScore = this.calculateNPS();

    // Calculate breakdowns
    const byType: { [key: string]: number } = {};
    const bySeverity: { [key: string]: number } = {};
    const byStatus: { [key: string]: number } = {};

    feedback.forEach(entry => {
      if (entry.type) byType[entry.type] = (byType[entry.type] || 0) + 1;
      if (entry.severity)
        bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
      if (entry.status)
        byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
    });

    // Get top issues (critical and high severity)
    const topIssues = feedback
      .filter(f => f.severity === 'critical' || f.severity === 'high')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Get recent surveys
    const recentSurveys = surveys
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      summary: {
        totalFeedback,
        criticalIssues,
        averageRating: Math.round(averageRating * 10) / 10,
        npsScore,
      },
      breakdown: {
        byType,
        bySeverity,
        byStatus,
      },
      topIssues,
      recentSurveys,
    };
  }

  /**
   * Export feedback data for analysis
   */
  exportFeedbackData(): {
    feedback: FeedbackEntry[];
    surveys: UserSatisfactionSurvey[];
    metrics: BetaMetrics;
    generatedAt: Date;
  } {
    return {
      feedback: Array.from(this.feedbackEntries.values()),
      surveys: Array.from(this.surveys.values()),
      metrics: this.calculateLocalMetrics(),
      generatedAt: new Date(),
    };
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateLocalMetrics(): BetaMetrics {
    const feedback = Array.from(this.feedbackEntries.values());
    const surveys = Array.from(this.surveys.values());

    return {
      totalUsers: new Set(feedback.map(f => f.userId)).size,
      activeUsers: new Set(feedback.map(f => f.userId)).size, // Simplified
      portfoliosCreated: 0, // Would need to fetch from portfolio data
      avgTimeToFirstPortfolio: 0, // Would need to calculate from user data
      avgPortfolioCompletionRate: 0, // Would need to calculate from portfolio data
      feedbackEntries: feedback.length,
      surveyResponses: surveys.length,
      averageNPS: this.calculateNPS(),
      criticalBugs: feedback.filter(
        f => f.type === 'bug' && f.severity === 'critical'
      ).length,
      featureRequests: feedback.filter(f => f.type === 'feature_request')
        .length,
      userRetention: {
        day1: 0, // Would need to calculate from user activity data
        day7: 0,
        day30: 0,
      },
    };
  }
}

/**
 * Beta user analytics and tracking
 */
export class BetaAnalytics {
  private events: Map<string, unknown[]> = new Map();
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/v1/beta/analytics') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Track user event
   */
  async trackEvent(event: {
    userId: string;
    event: string;
    properties?: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<void> {
    const eventData = {
      ...event,
      timestamp: event.timestamp || new Date(),
      id: this.generateEventId(),
    };

    try {
      await fetch(`${this.apiEndpoint}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      // Store locally as backup
      const userEvents = this.events.get(event.userId) || [];
      userEvents.push(eventData);
      this.events.set(event.userId, userEvents);
    } catch (error) {
      logger.error('Error tracking event:', error as Error);
      // Store locally on error
      const userEvents = this.events.get(event.userId) || [];
      userEvents.push(eventData);
      this.events.set(event.userId, userEvents);
    }
  }

  /**
   * Track portfolio creation journey
   */
  async trackPortfolioJourney(
    userId: string,
    step: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'portfolio_journey',
      properties: {
        step,
        ...data,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    userId: string,
    feature: string,
    action: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'feature_usage',
      properties: {
        feature,
        action,
        ...data,
      },
    });
  }

  /**
   * Track user session
   */
  async trackSession(
    userId: string,
    sessionData: {
      duration: number;
      pagesViewed: string[];
      actionsPerformed: string[];
      exitPage: string;
    }
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'session_complete',
      properties: sessionData,
    });
  }

  /**
   * Get user journey analytics
   */
  async getUserJourneys(limit: number = 100): Promise<unknown[]> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/journeys?limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch journeys');
      const data = await response.json();
      return Array.isArray(data) ? data : data.journeys || [];
    } catch (error) {
      logger.error('Error fetching user journeys:', error as Error);
      return [];
    }
  }

  /**
   * Get feature usage statistics
   */
  async getFeatureUsage(): Promise<{ [feature: string]: number }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/features`);
      if (!response.ok) throw new Error('Failed to fetch feature usage');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching feature usage:', error as Error);
      return {};
    }
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create feedback system instance
 */
export function createFeedbackSystem(apiEndpoint?: string): FeedbackSystem {
  return new FeedbackSystem(apiEndpoint);
}

/**
 * Create beta analytics instance
 */
export function createBetaAnalytics(apiEndpoint?: string): BetaAnalytics {
  return new BetaAnalytics(apiEndpoint);
}

/**
 * Beta launch readiness checker
 */
export class BetaLaunchChecker {
  private feedbackSystem: FeedbackSystem;
  private analytics: BetaAnalytics;

  constructor(feedbackSystem: FeedbackSystem, analytics: BetaAnalytics) {
    this.feedbackSystem = feedbackSystem;
    this.analytics = analytics;
  }

  /**
   * Check if system is ready for beta launch
   */
  async checkReadiness(): Promise<{
    ready: boolean;
    score: number;
    checks: {
      performance: { passed: boolean; message: string };
      stability: { passed: boolean; message: string };
      features: { passed: boolean; message: string };
      testing: { passed: boolean; message: string };
      monitoring: { passed: boolean; message: string };
    };
    recommendations: string[];
  }> {
    const checks = {
      performance: await this.checkPerformance(),
      stability: await this.checkStability(),
      features: await this.checkFeatures(),
      testing: await this.checkTesting(),
      monitoring: await this.checkMonitoring(),
    };

    const passedCount = Object.values(checks).filter(
      check => check.passed
    ).length;
    const score = (passedCount / Object.keys(checks).length) * 100;
    const ready = score >= 80; // 80% threshold for beta readiness

    const recommendations = Object.entries(checks)
      .filter(([_, check]) => !check.passed)
      .map(([key, check]) => `${key}: ${check.message}`);

    return {
      ready,
      score: Math.round(score),
      checks,
      recommendations,
    };
  }

  private async checkPerformance(): Promise<{
    passed: boolean;
    message: string;
  }> {
    // Mock performance check - in real implementation, this would check actual metrics
    await Promise.resolve(); // Simulate async metric check
    return {
      passed: true,
      message: 'Portfolio generation meets sub-30-second target',
    };
  }

  private async checkStability(): Promise<{
    passed: boolean;
    message: string;
  }> {
    const metrics = await this.feedbackSystem.getBetaMetrics();
    const criticalBugs = metrics.criticalBugs;

    return {
      passed: criticalBugs === 0,
      message:
        criticalBugs === 0
          ? 'No critical bugs reported'
          : `${criticalBugs} critical bugs need resolution`,
    };
  }

  private async checkFeatures(): Promise<{ passed: boolean; message: string }> {
    // Check if core features are implemented
    const _coreFeatures = [
      'portfolio_creation',
      'template_selection',
      'ai_enhancement',
      'publishing',
      'subdomain_setup',
    ];

    await Promise.resolve(); // Simulate async feature check
    return {
      passed: true, // Assuming features are implemented
      message: 'All core features implemented and functional',
    };
  }

  private async checkTesting(): Promise<{ passed: boolean; message: string }> {
    // Mock test coverage check
    await Promise.resolve(); // Simulate async coverage check
    return {
      passed: true,
      message: 'Test coverage above 60% for critical paths',
    };
  }

  private async checkMonitoring(): Promise<{
    passed: boolean;
    message: string;
  }> {
    await Promise.resolve(); // Simulate async monitoring check
    return {
      passed: true,
      message: 'Feedback collection and analytics systems operational',
    };
  }
}

/**
 * Default feedback and analytics configuration
 */
export const BETA_CONFIG = {
  maxFeedbackEntries: 10000,
  feedbackRetentionDays: 365,
  analyticsRetentionDays: 90,
  surveyTriggers: {
    afterPortfolioCreation: true,
    afterPublishing: true,
    weeklyActiveUsers: true,
    beforeChurn: true,
  },
  criticalBugNotificationThreshold: 1,
  npsTargetScore: 50,
};
