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
  StorageAdapter,
} from '../../core/types';

/**
 * Base Storage Adapter
 *
 * Abstract base class for all storage implementations
 */
export abstract class BaseStorageAdapter implements StorageAdapter {
  protected config: Record<string, unknown>;

  constructor(config: Record<string, unknown> = {}) {
    this.config = config;
  }

  // Feedback operations
  abstract createFeedback(
    feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>
  ): Promise<FeedbackEntry>;

  abstract getFeedback(id: string): Promise<FeedbackEntry | null>;

  abstract listFeedback(
    filter?: FeedbackFilter
  ): Promise<PaginatedResponse<FeedbackEntry>>;

  abstract updateFeedback(
    id: string,
    updates: Partial<FeedbackEntry>
  ): Promise<FeedbackEntry>;

  abstract deleteFeedback(id: string): Promise<boolean>;

  // Survey operations
  abstract createSurvey(
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp'>
  ): Promise<SatisfactionSurvey>;

  abstract getSurvey(id: string): Promise<SatisfactionSurvey | null>;

  abstract listSurveys(
    filter?: Partial<FeedbackFilter>
  ): Promise<PaginatedResponse<SatisfactionSurvey>>;

  // Event operations
  abstract trackEvent(
    event: Omit<FeedbackEvent, 'id' | 'timestamp'>
  ): Promise<void>;

  abstract getEvents(
    filter?: Partial<FeedbackFilter>
  ): Promise<FeedbackEvent[]>;

  // Metrics
  abstract getMetrics(): Promise<BetaMetrics>;
  abstract getFeedbackTrends(days: number): Promise<FeedbackTrend[]>;

  // Utility
  abstract health(): Promise<boolean>;
  abstract migrate(): Promise<void>;

  /**
   * Helper method to generate unique IDs
   */
  protected generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper method to apply filters
   */
  protected applyFilter<T extends { timestamp: Date }>(
    items: T[],
    filter?: FeedbackFilter
  ): T[] {
    if (!filter) return items;

    let filtered = [...items];

    // Date range filter
    if (filter.dateRange) {
      filtered = filtered.filter(item => {
        const timestamp = new Date(item.timestamp);
        return (
          filter.dateRange &&
          timestamp >= filter.dateRange.start &&
          timestamp <= filter.dateRange.end
        );
      });
    }

    // Sort
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        if (!filter.sortBy) return 0;
        const aValue = this.getSortValue(a, filter.sortBy);
        const bValue = this.getSortValue(b, filter.sortBy);

        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        return filter.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }

  /**
   * Helper method to paginate results
   */
  protected paginate<T>(
    items: T[],
    filter?: FeedbackFilter
  ): PaginatedResponse<T> {
    const limit = filter?.limit || 20;
    const offset = filter?.offset || 0;

    const paginatedItems = items.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedItems,
      pagination: {
        total: items.length,
        limit,
        offset,
        hasMore: offset + limit < items.length,
      },
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        requestId: this.generateId('req'),
      },
    };
  }

  /**
   * Get sort value for an item
   */
  private getSortValue(item: any, sortBy: string): any {
    switch (sortBy) {
      case 'date':
        return new Date(item.timestamp).getTime();
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[item.severity as keyof typeof severityOrder] || 0;
      case 'rating':
        return item.rating || 0;
      default:
        return item[sortBy];
    }
  }
}
