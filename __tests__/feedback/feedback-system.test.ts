/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import {
  FeedbackSystem,
  BetaAnalytics,
  BetaLaunchChecker,
  createFeedbackSystem,
  createBetaAnalytics,
} from '@/lib/feedback/feedback-system';

// Mock fetch for API tests
global.fetch = jest.fn();

describe('Beta Feedback System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('FeedbackSystem', () => {
    it('should submit feedback successfully', async () => {
      const feedbackSystem = new FeedbackSystem();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'feedback_123', success: true }),
      });

      const feedbackData = {
        userId: 'user_123',
        type: 'bug' as const,
        severity: 'high' as const,
        title: 'Template switching issue',
        description: "Templates don't switch properly on mobile",
        category: 'templates',
        userAgent: 'Mozilla/5.0...',
        url: 'https://app.example.com/editor',
        tags: ['mobile', 'templates'],
        rating: 3,
        userContext: {
          plan: 'free',
          accountAge: 7,
          portfoliosCreated: 1,
          lastActivity: new Date(),
        },
      };

      const feedbackId = await feedbackSystem.submitFeedback(feedbackData);

      expect(feedbackId).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/beta/feedback/submit',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Template switching issue'),
        })
    });

    it('should handle feedback submission failures gracefully', async () => {
      const feedbackSystem = new FeedbackSystem();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')

      const feedbackData = {
        userId: 'user_123',
        type: 'bug' as const,
        severity: 'medium' as const,
        title: 'Test bug',
        description: 'Test description',
        category: 'general',
        userAgent: 'test',
        url: 'test',
        tags: [],
      };

      const feedbackId = await feedbackSystem.submitFeedback(feedbackData);

      expect(feedbackId).toBeDefined(); // Should still return an ID from local storage
    });

    it('should submit satisfaction survey successfully', async () => {
      const feedbackSystem = new FeedbackSystem();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'survey_123', success: true }),
      });

      const surveyData = {
        userId: 'user_123',
        overallSatisfaction: 8,
        easeOfUse: 7,
        performance: 6,
        features: 8,
        design: 9,
        likelihood_to_recommend: 8,
        mostUsefulFeature: 'AI Content Enhancement',
        leastUsefulFeature: 'Analytics Dashboard',
        missingFeatures: ['Custom themes', 'Video backgrounds'],
        additionalComments: 'Great product overall!',
        completedIn: 120,
      };

      const surveyId = await feedbackSystem.submitSurvey(surveyData);

      expect(surveyId).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/beta/feedback/survey',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('AI Content Enhancement'),
        })
    });

    it('should retrieve feedback with filters', async () => {
      const feedbackSystem = new FeedbackSystem();

      const mockFeedback = [
        {
          id: 'feedback_1',
          userId: 'user_123',
          type: 'bug',
          severity: 'high',
          title: 'Critical issue',
          description: 'App crashes',
          status: 'open',
          timestamp: new Date().toISOString(),
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeedback,
      });

      const feedback = await feedbackSystem.getFeedback({
        type: 'bug',
        severity: 'high',
        limit: 10,
      });

      expect(feedback).toEqual(mockFeedback);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/api/v1/beta/feedback/list?type=bug&severity=high&limit=10'
        ),
        expect.objectContaining({ method: 'GET' })
    });

    it('should calculate NPS score correctly', () => {
      const feedbackSystem = new FeedbackSystem();

      // Manually add surveys to test NPS calculation
      const surveys = [
        { likelihood_to_recommend: 9 }, // Promoter
        { likelihood_to_recommend: 10 }, // Promoter
        { likelihood_to_recommend: 8 }, // Passive
        { likelihood_to_recommend: 7 }, // Passive
        { likelihood_to_recommend: 6 }, // Detractor
        { likelihood_to_recommend: 5 }, // Detractor
      ];

      // Mock the surveys map
      const surveysMap = new Map();
      surveys.forEach((survey, index) => {
        surveysMap.set(`survey_${index}`, survey);
      });

      // Access private surveys property for testing
      (feedbackSystem as any).surveys = surveysMap;

      const npsScore = feedbackSystem.calculateNPS();

      // 2 promoters, 2 passives, 2 detractors out of 6 total
      // NPS = (2 - 2) / 6 * 100 = 0
      expect(npsScore).toBe(0);
    });

    it('should generate feedback trends correctly', () => {
      const feedbackSystem = new FeedbackSystem();

      // Mock feedback entries with different dates and types
      const mockEntries = [
        {
          id: 'f1',
          type: 'bug',
          timestamp: new Date(),
        },
        {
          id: 'f2',
          type: 'feature_request',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
        {
          id: 'f3',
          type: 'improvement',
          timestamp: new Date(),
        },
      ];

      const feedbackMap = new Map();
      mockEntries.forEach(entry => {
        feedbackMap.set(entry.id, entry);
      });

      (feedbackSystem as any).feedbackEntries = feedbackMap;

      const trends = feedbackSystem.getFeedbackTrends(7);

      expect(trends).toHaveLength(8); // 7 days + today
      expect(trends.some(trend => trend.total > 0)).toBe(true);
    });

    it('should generate comprehensive feedback report', () => {
      const feedbackSystem = new FeedbackSystem();

      // Mock data for report generation
      const mockFeedback = [
        {
          id: 'f1',
          type: 'bug',
          severity: 'critical',
          status: 'open',
          rating: 2,
          timestamp: new Date(),
        },
        {
          id: 'f2',
          type: 'feature_request',
          severity: 'medium',
          status: 'in_progress',
          rating: 4,
          timestamp: new Date(),
        },
      ];

      const mockSurveys = [
        {
          id: 's1',
          likelihood_to_recommend: 9,
          timestamp: new Date(),
        },
      ];

      const feedbackMap = new Map();
      const surveysMap = new Map();

      mockFeedback.forEach(entry => feedbackMap.set(entry.id, entry));
      mockSurveys.forEach(survey => surveysMap.set(survey.id, survey));

      (feedbackSystem as any).feedbackEntries = feedbackMap;
      (feedbackSystem as any).surveys = surveysMap;

      const report = feedbackSystem.generateFeedbackReport();

      expect(report.summary.totalFeedback).toBe(2);
      expect(report.summary.criticalIssues).toBe(1);
      expect(report.summary.averageRating).toBe(3); // (2 + 4) / 2
      expect(report.breakdown.byType.bug).toBe(1);
      expect(report.breakdown.bySeverity.critical).toBe(1);
      expect(report.topIssues).toHaveLength(1); // Only critical issue
    });
  });

  describe('BetaAnalytics', () => {
    it('should track events successfully', async () => {
      const analytics = new BetaAnalytics();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ eventId: 'event_123', success: true }),
      });

      await analytics.trackEvent({
        userId: 'user_123',
        event: 'portfolio_created',
        properties: {
          template: 'modern',
          timeToComplete: 1200,
          aiUsed: true,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/beta/analytics/track',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('portfolio_created'),
        })
    });

    it('should track portfolio journey events', async () => {
      const analytics = new BetaAnalytics();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await analytics.trackPortfolioJourney('user_123', 'template_selected', {
        template: 'modern',
        previousStep: 'basic_info',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/beta/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('portfolio_journey'),
        })
    });

    it('should track feature usage', async () => {
      const analytics = new BetaAnalytics();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await analytics.trackFeatureUsage(
        'user_123',
        'ai_enhancement',
        'bio_enhanced',
        {
          originalLength: 50,
          enhancedLength: 120,
          quality: 'high',
        }

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/beta/analytics/track',
        expect.objectContaining({
          body: expect.stringContaining('feature_usage'),
        })
    });

    it('should handle tracking failures gracefully', async () => {
      const analytics = new BetaAnalytics();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')

      // Should not throw error
      await expect(
        analytics.trackEvent({
          userId: 'user_123',
          event: 'test_event',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('BetaLaunchChecker', () => {
    it('should check beta readiness correctly', async () => {
      const feedbackSystem = new FeedbackSystem();
      const analytics = new BetaAnalytics();
      const checker = new BetaLaunchChecker(feedbackSystem, analytics);

      // Mock getBetaMetrics to return no critical bugs
      jest.spyOn(feedbackSystem, 'getBetaMetrics').mockResolvedValueOnce({
        totalUsers: 50,
        activeUsers: 35,
        portfoliosCreated: 75,
        avgTimeToFirstPortfolio: 1200,
        avgPortfolioCompletionRate: 0.85,
        feedbackEntries: 25,
        surveyResponses: 18,
        averageNPS: 45,
        criticalBugs: 0, // No critical bugs
        featureRequests: 12,
        userRetention: {
          day1: 0.9,
          day7: 0.7,
          day30: 0.4,
        },
      });

      const readiness = await checker.checkReadiness();

      expect(readiness.ready).toBe(true);
      expect(readiness.score).toBeGreaterThanOrEqual(80);
      expect(readiness.checks.stability.passed).toBe(true);
      expect(readiness.checks.performance.passed).toBe(true);
    });

    it('should flag critical bugs as blocking readiness', async () => {
      const feedbackSystem = new FeedbackSystem();
      const analytics = new BetaAnalytics();
      const checker = new BetaLaunchChecker(feedbackSystem, analytics);

      // Mock getBetaMetrics to return critical bugs
      jest.spyOn(feedbackSystem, 'getBetaMetrics').mockResolvedValueOnce({
        totalUsers: 50,
        activeUsers: 35,
        portfoliosCreated: 75,
        avgTimeToFirstPortfolio: 1200,
        avgPortfolioCompletionRate: 0.85,
        feedbackEntries: 25,
        surveyResponses: 18,
        averageNPS: 45,
        criticalBugs: 2, // Critical bugs present
        featureRequests: 12,
        userRetention: {
          day1: 0.9,
          day7: 0.7,
          day30: 0.4,
        },
      });

      const readiness = await checker.checkReadiness();

      expect(readiness.checks.stability.passed).toBe(false);
      expect(readiness.checks.stability.message).toContain('2 critical bugs');
      expect(readiness.recommendations).toContainEqual(
        expect.stringContaining('2 critical bugs need resolution')

    });
  });

  describe('Factory Functions', () => {
    it('should create feedback system with custom endpoint', () => {
      const customEndpoint = '/api/custom/feedback';
      const feedbackSystem = createFeedbackSystem(customEndpoint);

      expect(feedbackSystem).toBeInstanceOf(FeedbackSystem);
    });

    it('should create beta analytics with custom endpoint', () => {
      const customEndpoint = '/api/custom/analytics';
      const analytics = createBetaAnalytics(customEndpoint);

      expect(analytics).toBeInstanceOf(BetaAnalytics);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full feedback workflow', async () => {
      const feedbackSystem = new FeedbackSystem();

      // Mock successful API responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'feedback_123', success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            totalUsers: 100,
            feedbackEntries: 25,
            criticalBugs: 0,
            averageNPS: 55,
          }),
        });

      // Submit feedback
      const feedbackId = await feedbackSystem.submitFeedback({
        userId: 'user_123',
        type: 'improvement',
        severity: 'medium',
        title: 'Better mobile UX',
        description: 'Mobile interface could be more intuitive',
        category: 'mobile',
        userAgent: 'test',
        url: 'test',
        tags: ['mobile', 'ux'],
      });

      expect(feedbackId).toBe('feedback_123');

      // Get metrics
      const metrics = await feedbackSystem.getBetaMetrics();
      expect(metrics.totalUsers).toBe(100);
      expect(metrics.criticalBugs).toBe(0);
    });

    it('should complete full analytics workflow', async () => {
      const analytics = new BetaAnalytics();

      // Mock successful API responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ eventId: 'event_123', success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            events: [],
            summary: { totalEvents: 50, uniqueUsers: 25 },
          }),
        });

      // Track event
      await analytics.trackEvent({
        userId: 'user_123',
        event: 'portfolio_published',
        properties: { subdomain: 'test-user', publishTime: 300 },
      });

      // Get analytics
      const data = await analytics.getUserJourneys(10);
      expect(data).toEqual([]); // Mock returns empty array
    });
  });
});
