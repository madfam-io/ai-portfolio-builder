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

import { type PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { logger } from '@/lib/utils/logger';

// Revenue metrics types
export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  newMrr: number; // New MRR this month
  expansionMrr: number; // Expansion MRR (upgrades)
  contractionMrr: number; // Contraction MRR (downgrades)
  churnedMrr: number; // Churned MRR
  netNewMrr: number; // Net new MRR
  customerCount: number;
  newCustomers: number;
  churnedCustomers: number;
  churnRate: number; // Monthly churn rate percentage
  arpu: number; // Average Revenue Per User
  ltv: number; // Customer Lifetime Value
}

export interface RevenueByPlan {
  plan: string;
  customerCount: number;
  mrr: number;
  percentage: number;
}

export interface RevenueTrend {
  month: string;
  mrr: number;
  customerCount: number;
  churnRate: number;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
  canceledAt?: Date;
}

export interface CustomerMetrics {
  totalCustomers: number;
  payingCustomers: number;
  trialCustomers: number;
  conversionRate: number;
}

export class RevenueMetricsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate comprehensive revenue metrics
   */
  async calculateMetrics(date: Date = new Date()): Promise<RevenueMetrics> {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    const previousStartDate = startOfMonth(subMonths(date, 1));

    // Get current active subscriptions
    const currentSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing'] },
        createdAt: { lte: endDate },
      },
    });

    // Get previous month subscriptions for comparison
    const previousSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing'] },
        createdAt: { lte: previousStartDate },
      },
    });

    // Calculate MRR
    const currentMrr = this.calculateMrrFromSubscriptions(currentSubscriptions.map(s => ({ ...s, plan: s.tier })) as any);
    const previousMrr = this.calculateMrrFromSubscriptions(previousSubscriptions.map(s => ({ ...s, plan: s.tier })) as any);

    // Get new subscriptions this month
    const newSubscriptions = await this.prisma.subscription.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['active', 'trialing'] },
      },
    });

    // Get churned subscriptions this month
    const churnedSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'canceled',
        updatedAt: { gte: startDate, lte: endDate },
      },
    });

    // Calculate metrics
    const newMrr = this.calculateMrrFromSubscriptions(newSubscriptions.map(s => ({ ...s, plan: s.tier })) as any);
    const churnedMrr = this.calculateMrrFromSubscriptions(churnedSubscriptions.map(s => ({ ...s, plan: s.tier })) as any);
    const netNewMrr = currentMrr - previousMrr;
    const expansionMrr = Math.max(0, netNewMrr - newMrr + churnedMrr);
    const contractionMrr = Math.max(0, -netNewMrr + newMrr - churnedMrr);

    const customerCount = currentSubscriptions.filter(s => s.status === 'active').length;
    const newCustomers = newSubscriptions.length;
    const churnedCustomers = churnedSubscriptions.length;
    const churnRate =
      customerCount > 0 ? (churnedCustomers / customerCount) * 100 : 0;
    const arpu = customerCount > 0 ? currentMrr / customerCount : 0;
    const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 24; // 24 months if no churn

    return {
      mrr: currentMrr,
      arr: currentMrr * 12,
      newMrr,
      expansionMrr,
      contractionMrr,
      churnedMrr,
      netNewMrr,
      customerCount,
      newCustomers,
      churnedCustomers,
      churnRate: Math.round(churnRate * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
    };
  }

  /**
   * Get revenue breakdown by plan
   */
  async getRevenueByPlan(): Promise<RevenueByPlan[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing'] },
      },
    });

    const planMap = new Map<string, { count: number; mrr: number }>();
    let totalMrr = 0;

    subscriptions.forEach((sub: any) => {
      const subscription = { ...sub, plan: sub.tier || sub.plan };
      const mrr = this.getSubscriptionMrr(subscription as SubscriptionRecord);
      totalMrr += mrr;

      const current = planMap.get(subscription.plan) || { count: 0, mrr: 0 };
      planMap.set(subscription.plan, {
        count: current.count + 1,
        mrr: current.mrr + mrr,
      });
    });

    return Array.from(planMap.entries())
      .map(([plan, data]) => ({
        plan,
        customerCount: data.count,
        mrr: data.mrr,
        percentage:
          totalMrr > 0 ? Math.round((data.mrr / totalMrr) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.mrr - a.mrr);
  }

  /**
   * Get revenue trends for the last N months
   */
  async getRevenueTrends(months: number = 12): Promise<RevenueTrend[]> {
    const trends: RevenueTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const metrics = await this.calculateMetrics(date);

      trends.push({
        month: format(date, 'MMM yyyy'),
        mrr: metrics.mrr,
        customerCount: metrics.customerCount,
        churnRate: metrics.churnRate,
      });
    }

    return trends;
  }

  /**
   * Get customer metrics
   */
  async getCustomerMetrics(): Promise<CustomerMetrics> {
    const allUsers = await this.prisma.user.findMany({
      select: { id: true },
    });

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing', 'past_due'] },
      },
    });

    const totalCustomers = allUsers.length;
    const payingCustomers = subscriptions.filter(s => s.status === 'active' && (s as any).tier !== 'free').length;
    const trialCustomers = subscriptions.filter(s => s.status === 'trialing').length;
    const conversionRate =
      totalCustomers > 0 ? (payingCustomers / totalCustomers) * 100 : 0;

    return {
      totalCustomers,
      payingCustomers,
      trialCustomers,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  /**
   * Get top paying customers
   */
  async getTopCustomers(limit: number = 10) {
    const data = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        tier: { not: 'FREE' },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Get user data separately
    const userIds = data.map(sub => sub.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return data.map(sub => {
      const user = userMap.get(sub.userId);
      return {
        userId: sub.userId,
        email: user?.email || '',
        name: user?.name || '',
        plan: (sub as any).tier,
        mrr: this.getSubscriptionMrr({ ...sub, plan: (sub as any).tier } as any),
        subscribedAt: sub.createdAt,
      };
    });
  }

  /**
   * Calculate MRR from a list of subscriptions
   */
  private calculateMrrFromSubscriptions(
    subscriptions: SubscriptionRecord[]
  ): number {
    return subscriptions.reduce((total, sub) => {
      return total + this.getSubscriptionMrr(sub);
    }, 0);
  }

  /**
   * Get MRR for a single subscription
   */
  private getSubscriptionMrr(subscription: SubscriptionRecord): number {
    // Skip free plans
    if (subscription.plan === 'free') return 0;

    // Use amount from subscription if available
    if (subscription.amount) {
      return subscription.amount;
    }

    // Otherwise use default pricing
    const pricing: Record<string, number> = {
      pro: 24,
      business: 39,
      enterprise: 79,
    };

    return pricing[subscription.plan] || 0;
  }

  /**
   * Track revenue event (for real-time updates)
   */
  async trackRevenueEvent(event: {
    type:
      | 'new_subscription'
      | 'upgrade'
      | 'downgrade'
      | 'churn'
      | 'reactivation';
    userId: string;
    oldPlan?: string;
    newPlan?: string;
    amount?: number;
  }) {
    // Revenue event tracking disabled - table doesn't exist yet
    logger.info('Revenue event tracking disabled', { event });
    // TODO: Implement when revenueEvent table is added to schema
  }
}
