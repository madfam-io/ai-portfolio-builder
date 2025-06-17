/**
 * Application Performance Monitoring (APM) utilities
 * Provides comprehensive performance tracking and analysis
 */

import { NextRequest, NextResponse } from 'next/server';

export interface APMMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
  tags: Record<string, string>;
  category: 'performance' | 'business' | 'technical' | 'user';
}

export interface TransactionTrace {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'completed' | 'failed';
  spans: TransactionSpan[];
  metadata: Record<string, any>;
}

export interface TransactionSpan {
  id: string;
  parentId?: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * APM Service for comprehensive performance monitoring
 */
class APMService {
  private transactions = new Map<string, TransactionTrace>();
  private metrics: APMMetric[] = [];
  private isEnabled = process.env.APM_ENABLED !== 'false';
  private maxTransactions = 1000;
  private maxMetrics = 5000;

  /**
   * Start a new transaction
   */
  startTransaction(name: string, metadata: Record<string, any> = {}): string {
    if (!this.isEnabled) return '';

    const id = this.generateId();
    const transaction: TransactionTrace = {
      id,
      name,
      startTime: performance.now(),
      status: 'pending',
      spans: [],
      metadata,
    };

    this.transactions.set(id, transaction);
    this.cleanupOldTransactions();

    return id;
  }

  /**
   * End a transaction
   */
  endTransaction(id: string, status: 'completed' | 'failed' = 'completed'): void {
    if (!this.isEnabled || !id) return;

    const transaction = this.transactions.get(id);
    if (!transaction) return;

    transaction.endTime = performance.now();
    transaction.duration = transaction.endTime - transaction.startTime;
    transaction.status = status;

    // Record transaction metric
    this.recordMetric({
      name: 'transaction_duration',
      value: transaction.duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        transaction: transaction.name,
        status,
      },
      category: 'performance',
    });

    // Log slow transactions
    if (transaction.duration > 1000) {
      console.warn(`Slow transaction detected: ${transaction.name} took ${transaction.duration}ms`);
    }
  }

  /**
   * Start a span within a transaction
   */
  startSpan(
    transactionId: string,
    operation: string,
    parentSpanId?: string,
    tags: Record<string, string> = {}
  ): string {
    if (!this.isEnabled || !transactionId) return '';

    const transaction = this.transactions.get(transactionId);
    if (!transaction) return '';

    const spanId = this.generateId();
    const span: TransactionSpan = {
      id: spanId,
      parentId: parentSpanId,
      operation,
      startTime: performance.now(),
      status: 'pending',
      tags,
    };

    transaction.spans.push(span);
    return spanId;
  }

  /**
   * End a span
   */
  endSpan(
    transactionId: string,
    spanId: string,
    status: 'completed' | 'failed' = 'completed'
  ): void {
    if (!this.isEnabled || !transactionId || !spanId) return;

    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    const span = transaction.spans.find(s => s.id === spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    // Record span metric
    this.recordMetric({
      name: 'span_duration',
      value: span.duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        operation: span.operation,
        status,
        ...span.tags,
      },
      category: 'performance',
    });
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: APMMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);
    this.cleanupOldMetrics();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`APM Metric: ${metric.name} = ${metric.value}${metric.unit}`, metric.tags);
    }
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): TransactionTrace | undefined {
    return this.transactions.get(id);
  }

  /**
   * Get all active transactions
   */
  getActiveTransactions(): TransactionTrace[] {
    return Array.from(this.transactions.values()).filter(t => t.status === 'pending');
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalTransactions: number;
    activeTransactions: number;
    averageResponseTime: number;
    slowTransactions: number;
    errorRate: number;
  } {
    const transactions = Array.from(this.transactions.values());
    const completedTransactions = transactions.filter(t => t.status !== 'pending');
    
    const totalDuration = completedTransactions.reduce((sum, t) => sum + (t.duration || 0), 0);
    const averageResponseTime = completedTransactions.length > 0 
      ? totalDuration / completedTransactions.length 
      : 0;
    
    const slowTransactions = completedTransactions.filter(t => (t.duration || 0) > 1000).length;
    const failedTransactions = completedTransactions.filter(t => t.status === 'failed').length;
    const errorRate = completedTransactions.length > 0 
      ? (failedTransactions / completedTransactions.length) * 100 
      : 0;

    return {
      totalTransactions: transactions.length,
      activeTransactions: this.getActiveTransactions().length,
      averageResponseTime,
      slowTransactions,
      errorRate,
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): APMMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.transactions.clear();
    this.metrics.length = 0;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private cleanupOldTransactions(): void {
    if (this.transactions.size <= this.maxTransactions) return;

    const sortedTransactions = Array.from(this.transactions.entries())
      .sort(([, a], [, b]) => a.startTime - b.startTime);

    const toRemove = sortedTransactions.slice(0, sortedTransactions.length - this.maxTransactions);
    toRemove.forEach(([id]) => this.transactions.delete(id));
  }

  private cleanupOldMetrics(): void {
    if (this.metrics.length <= this.maxMetrics) return;

    this.metrics.sort((a, b) => a.timestamp - b.timestamp);
    this.metrics.splice(0, this.metrics.length - this.maxMetrics);
  }
}

// Global APM instance
export const apm = new APMService();

/**
 * Middleware wrapper for automatic transaction tracking
 */
export function withAPMTracking<T extends (...args: any[]) => any>(
  handler: T,
  operationName?: string
): T {
  return (async (...args: any[]) => {
    const request = args[0] as NextRequest;
    const transactionName = operationName || `${request?.method} ${request?.nextUrl?.pathname}`;
    
    const transactionId = apm.startTransaction(transactionName, {
      method: request?.method,
      url: request?.url,
      userAgent: request?.headers?.get('user-agent'),
    });

    try {
      const result = await handler(...args);
      apm.endTransaction(transactionId, 'completed');
      return result;
    } catch (error) {
      apm.endTransaction(transactionId, 'failed');
      throw error;
    }
  }) as T;
}

/**
 * Database operation tracking
 */
export function trackDatabaseOperation<T>(
  operation: string,
  query: string,
  executor: () => Promise<T> | T
): Promise<T> | T {
  const transactionId = apm.startTransaction(`db:${operation}`, { query });
  const spanId = apm.startSpan(transactionId, 'database', undefined, { operation, query });

  const finish = (result: T, status: 'completed' | 'failed' = 'completed') => {
    apm.endSpan(transactionId, spanId, status);
    apm.endTransaction(transactionId, status);
    return result;
  };

  try {
    const result = executor();
    
    if (result instanceof Promise) {
      return result
        .then(r => finish(r, 'completed'))
        .catch(error => {
          finish(error, 'failed');
          throw error;
        });
    }
    
    return finish(result, 'completed');
  } catch (error) {
    finish(error as T, 'failed');
    throw error;
  }
}

/**
 * AI operation tracking
 */
export function trackAIOperation<T>(
  model: string,
  operation: string,
  executor: () => Promise<T> | T
): Promise<T> | T {
  const transactionId = apm.startTransaction(`ai:${operation}`, { model, operation });
  const spanId = apm.startSpan(transactionId, 'ai-inference', undefined, { model, operation });

  const finish = (result: T, status: 'completed' | 'failed' = 'completed') => {
    apm.endSpan(transactionId, spanId, status);
    apm.endTransaction(transactionId, status);
    return result;
  };

  try {
    const result = executor();
    
    if (result instanceof Promise) {
      return result
        .then(r => finish(r, 'completed'))
        .catch(error => {
          finish(error, 'failed');
          throw error;
        });
    }
    
    return finish(result, 'completed');
  } catch (error) {
    finish(error as T, 'failed');
    throw error;
  }
}

/**
 * External API call tracking
 */
export function trackExternalAPI<T>(
  service: string,
  endpoint: string,
  executor: () => Promise<T> | T
): Promise<T> | T {
  const transactionId = apm.startTransaction(`external:${service}`, { service, endpoint });
  const spanId = apm.startSpan(transactionId, 'external-api', undefined, { service, endpoint });

  const finish = (result: T, status: 'completed' | 'failed' = 'completed') => {
    apm.endSpan(transactionId, spanId, status);
    apm.endTransaction(transactionId, status);
    return result;
  };

  try {
    const result = executor();
    
    if (result instanceof Promise) {
      return result
        .then(r => finish(r, 'completed'))
        .catch(error => {
          finish(error, 'failed');
          throw error;
        });
    }
    
    return finish(result, 'completed');
  } catch (error) {
    finish(error as T, 'failed');
    throw error;
  }
}

/**
 * Business metrics tracking
 */
export const businessMetrics = {
  trackUserAction: (action: string, userId?: string, metadata?: Record<string, any>) => {
    apm.recordMetric({
      name: 'user_action',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        action,
        userId: userId || 'anonymous',
        ...metadata,
      },
      category: 'business',
    });
  },

  trackConversion: (type: string, value: number, userId?: string) => {
    apm.recordMetric({
      name: 'conversion',
      value,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        type,
        userId: userId || 'anonymous',
      },
      category: 'business',
    });
  },

  trackRevenue: (amount: number, currency: string = 'USD', userId?: string) => {
    apm.recordMetric({
      name: 'revenue',
      value: amount,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        currency,
        userId: userId || 'anonymous',
      },
      category: 'business',
    });
  },

  trackFeatureUsage: (feature: string, userId?: string) => {
    apm.recordMetric({
      name: 'feature_usage',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        feature,
        userId: userId || 'anonymous',
      },
      category: 'business',
    });
  },
};

/**
 * React component performance tracking
 */
export function useAPMTracking(componentName: string) {
  const startRender = () => {
    return apm.startTransaction(`render:${componentName}`, { component: componentName });
  };

  const endRender = (transactionId: string) => {
    apm.endTransaction(transactionId, 'completed');
  };

  const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
    apm.recordMetric({
      name: 'component_event',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        component: componentName,
        event: eventName,
        ...metadata,
      },
      category: 'user',
    });
  };

  return { startRender, endRender, trackEvent };
}

/**
 * Performance monitoring dashboard data
 */
export function getAPMDashboardData() {
  return {
    summary: apm.getPerformanceSummary(),
    recentMetrics: apm.exportMetrics().slice(-100),
    activeTransactions: apm.getActiveTransactions(),
  };
}