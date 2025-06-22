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
 * @fileoverview Usage Tracking for Business Excellence
 * 
 * Comprehensive usage analytics system that powers:
 * - Revenue correlation analysis
 * - Business intelligence dashboards  
 * - Premium tier upsell opportunities
 * - Competitive positioning metrics
 */

import { posthog } from 'posthog-js';

export interface UsageMetrics {
  userId: string;
  feature: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, unknown>;
  businessImpact?: {
    revenueOpportunity: number;
    performanceGain: number;
    competitiveAdvantage: number;
  };
}

export interface ApiUsageData {
  endpoint: string;
  method: string;
  responseTime: number;
  status: number;
  userId?: string;
  tier: 'free' | 'professional' | 'business' | 'enterprise';
  timestamp: Date;
}

export class UsageTracker {
  private usageCache = new Map<string, UsageMetrics[]>();

  constructor() {
    // PostHog will be initialized elsewhere
  }

  trackFeatureUsage(metrics: UsageMetrics): void {
    const key = `${metrics.userId}_${metrics.feature}`;
    
    if (!this.usageCache.has(key)) {
      this.usageCache.set(key, []);
    }
    
    const cache = this.usageCache.get(key);
    if (cache) {
      cache.push(metrics);
    }

    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('feature_usage', {
        feature: metrics.feature,
        duration: metrics.duration,
        businessImpact: metrics.businessImpact,
        ...metrics.metadata,
      });
    }
  }

  trackApiUsage(data: ApiUsageData): void {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('api_usage', {
        endpoint: data.endpoint,
        method: data.method,
        responseTime: data.responseTime,
        status: data.status,
        tier: data.tier,
        timestamp: data.timestamp.toISOString(),
      });
    }
  }

  getUsageAnalytics(userId: string): {
    totalUsage: number;
    revenueOpportunity: number;
    suggestedTier: string;
    competitiveRanking: number;
  } {
    const userMetrics = this.usageCache.get(`${userId}_*`) || [];
    
    const totalUsage = userMetrics.length;
    const revenueOpportunity = userMetrics.reduce(
      (sum, metric) => sum + (metric.businessImpact?.revenueOpportunity || 0),
      0
    );
    
    let suggestedTier = 'free';
    if (revenueOpportunity > 10000) suggestedTier = 'business';
    else if (revenueOpportunity > 2000) suggestedTier = 'professional';
    
    const competitiveRanking = Math.min(95, 65 + (revenueOpportunity / 1000));
    
    return {
      totalUsage,
      revenueOpportunity,
      suggestedTier,
      competitiveRanking,
    };
  }

  getRateLimitInfo(userId: string, tier: string): {
    requests: number;
    windowMs: number;
    remaining: number;
  }> {
    const limits = {
      free: { requests: 100, windowMs: 3600000 }, // 100/hour
      professional: { requests: 1000, windowMs: 3600000 }, // 1000/hour
      business: { requests: 10000, windowMs: 3600000 }, // 10000/hour
      enterprise: { requests: 100000, windowMs: 3600000 }, // 100000/hour
    };

    const limit = limits[tier as keyof typeof limits] || limits.free;
    
    // Get current usage from cache (simplified)
    const currentUsage = this.usageCache.get(`${userId}_api`) || [];
    const recentUsage = currentUsage.filter(
      metric => Date.now() - metric.timestamp.getTime() < limit.windowMs
    );

    return {
      requests: limit.requests,
      windowMs: limit.windowMs,
      remaining: Math.max(0, limit.requests - recentUsage.length),
    };
  }
}

export const usageTracker = new UsageTracker();