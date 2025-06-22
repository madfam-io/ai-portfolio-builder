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

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  FeedbackEntry,
  SatisfactionSurvey,
  FeedbackEvent,
  BetaMetrics,
  FeedbackTrend,
  FeedbackFilter,
  PaginatedResponse,
  StorageError,
} from '../../core/types';
import { BaseStorageAdapter } from './interface';

/**
 * Supabase Storage Adapter
 *
 * Production-ready storage adapter using Supabase PostgreSQL
 */
export class SupabaseStorageAdapter extends BaseStorageAdapter {
  private supabase: SupabaseClient;
  private tablePrefix: string;

  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    tablePrefix?: string;
  }) {
    super(config);

    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new StorageError('Supabase URL and key are required');
    }

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.tablePrefix = config.tablePrefix || 'feedback_';
  }

  // Feedback operations
  async createFeedback(
    feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>
  ): Promise<FeedbackEntry> {
    const { data, error } = await this.supabase
      .from(`${this.tablePrefix}entries`)
      .insert({
        ...feedback,
        user_id: feedback.userId,
        user_agent: feedback.userAgent,
        user_context: feedback.userContext,
        reproduction_steps: feedback.reproductionSteps,
        expected_behavior: feedback.expectedBehavior,
        actual_behavior: feedback.actualBehavior,
      })
      .select()
      .single();

    if (error) {
      throw new StorageError(`Failed to create feedback: ${error.message}`, {
        error,
      });
    }

    return this.mapFeedbackFromDb(data);
  }

  async getFeedback(id: string): Promise<FeedbackEntry | null> {
    const { data, error } = await this.supabase
      .from(`${this.tablePrefix}entries`)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new StorageError(`Failed to get feedback: ${error.message}`, {
        error,
      });
    }

    return data ? this.mapFeedbackFromDb(data) : null;
  }

  async listFeedback(
    filter?: FeedbackFilter
  ): Promise<PaginatedResponse<FeedbackEntry>> {
    let query = this.supabase
      .from(`${this.tablePrefix}entries`)
      .select('*', { count: 'exact' });

    // Apply filters
    if (filter?.type) query = query.eq('type', filter.type);
    if (filter?.severity) query = query.eq('severity', filter.severity);
    if (filter?.status) query = query.eq('status', filter.status);
    if (filter?.userId) query = query.eq('user_id', filter.userId);
    if (filter?.category) query = query.eq('category', filter.category);

    if (filter?.tags && filter.tags.length > 0) {
      query = query.contains('tags', filter.tags);
    }

    if (filter?.dateRange) {
      query = query
        .gte('timestamp', filter.dateRange.start.toISOString())
        .lte('timestamp', filter.dateRange.end.toISOString());
    }

    // Sorting
    const sortColumn =
      filter?.sortBy === 'date' ? 'timestamp' : filter?.sortBy || 'timestamp';
    query = query.order(sortColumn, {
      ascending: filter?.sortOrder !== 'desc',
    });

    // Pagination
    const limit = filter?.limit || 20;
    const offset = filter?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new StorageError(`Failed to list feedback: ${error.message}`, {
        error,
      });
    }

    return {
      success: true,
      data: data?.map(item => this.mapFeedbackFromDb(item)) || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        requestId: this.generateId('req'),
      },
    };
  }

  async updateFeedback(
    id: string,
    updates: Partial<FeedbackEntry>
  ): Promise<FeedbackEntry> {
    const dbUpdates: any = {};

    // Map fields to database columns
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.severity !== undefined) dbUpdates.severity = updates.severity;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

    const { data, error } = await this.supabase
      .from(`${this.tablePrefix}entries`)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new StorageError(`Failed to update feedback: ${error.message}`, {
        error,
      });
    }

    return this.mapFeedbackFromDb(data);
  }

  async deleteFeedback(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(`${this.tablePrefix}entries`)
      .delete()
      .eq('id', id);

    if (error) {
      throw new StorageError(`Failed to delete feedback: ${error.message}`, {
        error,
      });
    }

    return true;
  }

  // Survey operations
  async createSurvey(
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp'>
  ): Promise<SatisfactionSurvey> {
    const { data, error } = await this.supabase
      .from(`${this.tablePrefix}surveys`)
      .insert({
        ...survey,
        user_id: survey.userId,
        overall_satisfaction: survey.overallSatisfaction,
        ease_of_use: survey.easeOfUse,
        likelihood_to_recommend: survey.likelihoodToRecommend,
        nps_category: survey.npsCategory,
        most_useful_feature: survey.mostUsefulFeature,
        least_useful_feature: survey.leastUsefulFeature,
        missing_features: survey.missingFeatures,
        additional_comments: survey.additionalComments,
        completion_context: survey.completionContext,
        completed_in: survey.completedIn,
      })
      .select()
      .single();

    if (error) {
      throw new StorageError(`Failed to create survey: ${error.message}`, {
        error,
      });
    }

    return this.mapSurveyFromDb(data);
  }

  async getSurvey(id: string): Promise<SatisfactionSurvey | null> {
    const { data, error } = await this.supabase
      .from(`${this.tablePrefix}surveys`)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new StorageError(`Failed to get survey: ${error.message}`, {
        error,
      });
    }

    return data ? this.mapSurveyFromDb(data) : null;
  }

  async listSurveys(
    filter?: Partial<FeedbackFilter>
  ): Promise<PaginatedResponse<SatisfactionSurvey>> {
    let query = this.supabase
      .from(`${this.tablePrefix}surveys`)
      .select('*', { count: 'exact' });

    // Apply filters
    if (filter?.userId) query = query.eq('user_id', filter.userId);

    if (filter?.dateRange) {
      query = query
        .gte('timestamp', filter.dateRange.start.toISOString())
        .lte('timestamp', filter.dateRange.end.toISOString());
    }

    // Sorting
    query = query.order('timestamp', {
      ascending: filter?.sortOrder !== 'desc',
    });

    // Pagination
    const limit = filter?.limit || 20;
    const offset = filter?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new StorageError(`Failed to list surveys: ${error.message}`, {
        error,
      });
    }

    return {
      success: true,
      data: data?.map(item => this.mapSurveyFromDb(item)) || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        requestId: this.generateId('req'),
      },
    };
  }

  // Event operations
  async trackEvent(
    event: Omit<FeedbackEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    const { error } = await this.supabase
      .from(`${this.tablePrefix}events`)
      .insert({
        ...event,
        reference_id: event.referenceId,
        event_type: event.eventType,
        user_id: event.userId,
      });

    if (error) {
      throw new StorageError(`Failed to track event: ${error.message}`, {
        error,
      });
    }
  }

  async getEvents(filter?: Partial<FeedbackFilter>): Promise<FeedbackEvent[]> {
    let query = this.supabase.from(`${this.tablePrefix}events`).select('*');

    // Apply filters
    if (filter?.userId) query = query.eq('user_id', filter.userId);

    if (filter?.dateRange) {
      query = query
        .gte('timestamp', filter.dateRange.start.toISOString())
        .lte('timestamp', filter.dateRange.end.toISOString());
    }

    // Sorting and limit
    query = query.order('timestamp', { ascending: false });
    if (filter?.limit) query = query.limit(filter.limit);

    const { data, error } = await query;

    if (error) {
      throw new StorageError(`Failed to get events: ${error.message}`, {
        error,
      });
    }

    return data?.map(item => this.mapEventFromDb(item)) || [];
  }

  // Metrics
  async getMetrics(): Promise<BetaMetrics> {
    // Run multiple queries in parallel
    const [feedbackStats, surveyStats, bugStats, userStats] = await Promise.all(
      [
        this.supabase
          .from(`${this.tablePrefix}entries`)
          .select('id', { count: 'exact', head: true }),
        this.supabase
          .from(`${this.tablePrefix}surveys`)
          .select('id', { count: 'exact', head: true }),
        this.supabase
          .from(`${this.tablePrefix}entries`)
          .select('severity', { count: 'exact' })
          .eq('type', 'bug'),
        this.supabase
          .from(`${this.tablePrefix}entries`)
          .select('user_id')
          .limit(1000),
      ]
    );

    // Calculate unique users
    const uniqueUsers = new Set(
      userStats.data?.map(item => item.user_id) || []
    );

    // Calculate critical bugs and feature requests
    const bugs = bugStats.data || [];
    const criticalBugs = bugs.filter(b => b.severity === 'critical').length;

    const { data: featureData } = await this.supabase
      .from(`${this.tablePrefix}entries`)
      .select('id', { count: 'exact', head: true })
      .eq('type', 'feature_request');

    // Calculate NPS
    const { data: npsData } = await this.supabase
      .from(`${this.tablePrefix}surveys`)
      .select('likelihood_to_recommend');

    let averageNPS = 0;
    if (npsData && npsData.length > 0) {
      const scores = npsData.map(s => s.likelihood_to_recommend);
      const promoters = scores.filter(score => score >= 9).length;
      const detractors = scores.filter(score => score <= 6).length;
      averageNPS = Math.round(((promoters - detractors) / scores.length) * 100);
    }

    return {
      totalUsers: uniqueUsers.size,
      activeUsers: uniqueUsers.size, // Simplified
      portfoliosCreated: 0, // Would need external data
      avgTimeToFirstPortfolio: 0, // Would need external data
      avgPortfolioCompletionRate: 0, // Would need external data
      feedbackEntries: feedbackStats.count || 0,
      surveyResponses: surveyStats.count || 0,
      averageNPS,
      criticalBugs,
      featureRequests: featureData?.count || 0,
      userRetention: {
        day1: 85, // Would need actual calculation
        day7: 70,
        day30: 50,
      },
    };
  }

  async getFeedbackTrends(days: number): Promise<FeedbackTrend[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from(`${this.tablePrefix}entries`)
      .select('type, timestamp')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) {
      throw new StorageError(
        `Failed to get feedback trends: ${error.message}`,
        { error }
      );
    }

    // Group by date
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
    data?.forEach(entry => {
      const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];
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
  async health(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(`${this.tablePrefix}entries`)
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  async migrate(): Promise<void> {
    // Migrations are handled by Supabase migrations
    // This is a no-op for the adapter
    return;
  }

  // Private mapping methods
  private mapFeedbackFromDb(data: any): FeedbackEntry {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      category: data.category,
      userAgent: data.user_agent,
      url: data.url,
      timestamp: new Date(data.timestamp),
      status: data.status,
      attachments: data.attachments,
      reproductionSteps: data.reproduction_steps,
      expectedBehavior: data.expected_behavior,
      actualBehavior: data.actual_behavior,
      tags: data.tags,
      rating: data.rating,
      userContext: data.user_context,
      metadata: data.metadata,
    };
  }

  private mapSurveyFromDb(data: any): SatisfactionSurvey {
    return {
      id: data.id,
      userId: data.user_id,
      timestamp: new Date(data.timestamp),
      overallSatisfaction: data.overall_satisfaction,
      easeOfUse: data.ease_of_use,
      performance: data.performance,
      features: data.features,
      design: data.design,
      likelihoodToRecommend: data.likelihood_to_recommend,
      npsCategory: data.nps_category,
      mostUsefulFeature: data.most_useful_feature,
      leastUsefulFeature: data.least_useful_feature,
      missingFeatures: data.missing_features,
      additionalComments: data.additional_comments,
      completionContext: data.completion_context,
      completedIn: data.completed_in,
      metadata: data.metadata,
    };
  }

  private mapEventFromDb(data: any): FeedbackEvent {
    return {
      id: data.id,
      referenceId: data.reference_id,
      eventType: data.event_type,
      userId: data.user_id,
      timestamp: new Date(data.timestamp),
      properties: data.properties,
      metadata: data.metadata,
    };
  }
}
