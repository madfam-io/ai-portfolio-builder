/**
 * @madfam/feedback
 *
 * World-class feedback collection and analytics system
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

import type {
  FeedbackEntry,
  SatisfactionSurvey,
  FeedbackEvent,
  BetaMetrics,
  FeedbackTrend,
  FeedbackFilter,
  PaginatedResponse,
} from '../../core/types';
import { BaseStorageAdapter } from './interface';

/**
 * In-Memory Storage Adapter
 *
 * Simple in-memory storage for development and testing
 * Data is lost when the process restarts
 */
export class MemoryStorageAdapter extends BaseStorageAdapter {
  private feedback: Map<string, FeedbackEntry> = new Map();
  private surveys: Map<string, SatisfactionSurvey> = new Map();
  private events: FeedbackEvent[] = [];
  private isHealthy: boolean = true;

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  // Feedback operations
  createFeedback(
    feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>
  ): FeedbackEntry {
    const entry: FeedbackEntry = {
      ...feedback,
      id: this.generateId('feedback'),
      timestamp: new Date(),
    };

    this.feedback.set(entry.id, entry);
    return entry;
  }

  getFeedback(id: string): FeedbackEntry | null {
    return this.feedback.get(id) || null;
  }

  listFeedback(
    filter?: FeedbackFilter
  ): PaginatedResponse<FeedbackEntry> {
    let items = Array.from(this.feedback.values());

    // Apply type filter
    if (filter?.type) {
      items = items.filter(item => item.type === filter.type);
    }

    // Apply severity filter
    if (filter?.severity) {
      items = items.filter(item => item.severity === filter.severity);
    }

    // Apply status filter
    if (filter?.status) {
      items = items.filter(item => item.status === filter.status);
    }

    // Apply user filter
    if (filter?.userId) {
      items = items.filter(item => item.userId === filter.userId);
    }

    // Apply category filter
    if (filter?.category) {
      items = items.filter(item => item.category === filter.category);
    }

    // Apply tags filter
    if (filter?.tags && filter.tags.length > 0) {
      items = items.filter(item =>
        filter.tags?.some(tag => item.tags.includes(tag)) ?? false
      );
    }

    // Apply common filters (date range, sorting)
    items = this.applyFilter(items, filter);

    return this.paginate(items, filter);
  }

  updateFeedback(
    id: string,
    updates: Partial<FeedbackEntry>
  ): FeedbackEntry {
    const existing = this.feedback.get(id);
    if (!existing) {
      throw new Error(`Feedback ${id} not found`);
    }

    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID change
      timestamp: existing.timestamp, // Preserve original timestamp
    };

    this.feedback.set(id, updated);
    return updated;
  }

  deleteFeedback(id: string): boolean {
    return this.feedback.delete(id);
  }

  // Survey operations
  createSurvey(
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp'>
  ): SatisfactionSurvey {
    const entry: SatisfactionSurvey = {
      ...survey,
      id: this.generateId('survey'),
      timestamp: new Date(),
    };

    this.surveys.set(entry.id, entry);
    return entry;
  }

  getSurvey(id: string): SatisfactionSurvey | null {
    return this.surveys.get(id) || null;
  }

  listSurveys(
    filter?: Partial<FeedbackFilter>
  ): PaginatedResponse<SatisfactionSurvey> {
    let items = Array.from(this.surveys.values());

    // Apply user filter
    if (filter?.userId) {
      items = items.filter(item => item.userId === filter.userId);
    }

    // Apply common filters
    items = this.applyFilter(items, filter as FeedbackFilter);

    return this.paginate(items, filter as FeedbackFilter);
  }

  // Event operations
  trackEvent(
    event: Omit<FeedbackEvent, 'id' | 'timestamp'>
  ): void {
    const entry: FeedbackEvent = {
      ...event,
      id: this.generateId('event'),
      timestamp: new Date(),
    };

    this.events.push(entry);

    // Limit events to prevent memory issues
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000); // Keep last 5000
    }
  }

  getEvents(filter?: Partial<FeedbackFilter>): FeedbackEvent[] {
    let items = [...this.events];

    // Apply user filter
    if (filter?.userId) {
      items = items.filter(item => item.userId === filter.userId);
    }

    // Apply common filters
    items = this.applyFilter(items, filter as FeedbackFilter);

    // Apply limit
    if (filter?.limit) {
      items = items.slice(0, filter.limit);
    }

    return items;
  }

  // Metrics
  getMetrics(): BetaMetrics {
    const feedbackArray = Array.from(this.feedback.values());
    const surveyArray = Array.from(this.surveys.values());

    // Calculate unique users
    const uniqueUsers = new Set([
      ...feedbackArray.map(f => f.userId),
      ...surveyArray.map(s => s.userId),
    ]);

    // Calculate NPS
    const npsScores = surveyArray.map(s => s.likelihoodToRecommend);
    const promoters = npsScores.filter(score => score >= 9).length;
    const detractors = npsScores.filter(score => score <= 6).length;
    const nps =
      npsScores.length > 0
        ? Math.round(((promoters - detractors) / npsScores.length) * 100)
        : 0;

    // Count bugs and features
    const criticalBugs = feedbackArray.filter(
      f => f.type === 'bug' && f.severity === 'critical'
    ).length;
    const featureRequests = feedbackArray.filter(
      f => f.type === 'feature_request'
    ).length;

    return {
      totalUsers: uniqueUsers.size,
      activeUsers: uniqueUsers.size, // Simplified for in-memory
      portfoliosCreated: 0, // Would need external data
      avgTimeToFirstPortfolio: 0, // Would need external data
      avgPortfolioCompletionRate: 0, // Would need external data
      feedbackEntries: feedbackArray.length,
      surveyResponses: surveyArray.length,
      averageNPS: nps,
      criticalBugs,
      featureRequests,
      userRetention: {
        day1: 85, // Mock data
        day7: 70,
        day30: 50,
      },
    };
  }

  getFeedbackTrends(days: number): FeedbackTrend[] {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const trends: Record<string, FeedbackTrend> = {};

    // Initialize all dates
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      trends[dateStr] = {
        date: dateStr,
        bugs: 0,
        features: 0,
        improvements: 0,
        total: 0,
      };
    }

    // Count feedback by date and type
    Array.from(this.feedback.values()).forEach(entry => {
      const dateStr = entry.timestamp.toISOString().split('T')[0];
      if (trends[dateStr]) {
        trends[dateStr].total++;
        if (entry.type === 'bug') trends[dateStr].bugs++;
        if (entry.type === 'feature_request') trends[dateStr].features++;
        if (entry.type === 'improvement') trends[dateStr].improvements++;
      }
    });

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Utility
  health(): boolean {
    return this.isHealthy;
  }

  migrate(): void {
    // No migration needed for in-memory storage
    return;
  }

  // Test utilities
  setHealth(healthy: boolean): void {
    this.isHealthy = healthy;
  }

  clear(): void {
    this.feedback.clear();
    this.surveys.clear();
    this.events = [];
  }

  getStats(): {
    feedbackCount: number;
    surveyCount: number;
    eventCount: number;
  } {
    return {
      feedbackCount: this.feedback.size,
      surveyCount: this.surveys.size,
      eventCount: this.events.length,
    };
  }
}
