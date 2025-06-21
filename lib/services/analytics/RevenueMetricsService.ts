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

import { SupabaseClient } from '@supabase/supabase-js';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

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

export interface CustomerMetrics {
  totalCustomers: number;
  payingCustomers: number;
  trialCustomers: number;
  conversionRate: number;
}

export class RevenueMetricsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Calculate comprehensive revenue metrics
   */
  async calculateMetrics(date: Date = new Date()): Promise<RevenueMetrics> {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    const previousStartDate = startOfMonth(subMonths(date, 1));

    // Get current active subscriptions
    const { data: currentSubscriptions, error: currentError } =
      await this.supabase
        .from('subscriptions')
        .select('*')
        .in('status', ['active', 'trialing'])
        .lte('created_at', endDate.toISOString());

    if (currentError) throw currentError;

    // Get previous month subscriptions for comparison
    const { data: previousSubscriptions, error: previousError } =
      await this.supabase
        .from('subscriptions')
        .select('*')
        .in('status', ['active', 'trialing'])
        .lte('created_at', previousStartDate.toISOString());

    if (previousError) throw previousError;

    // Calculate MRR
    const currentMrr = this.calculateMrrFromSubscriptions(
      currentSubscriptions || []
    );
    const previousMrr = this.calculateMrrFromSubscriptions(
      previousSubscriptions || []
    );

    // Get new subscriptions this month
    const { data: newSubscriptions, error: newError } = await this.supabase
      .from('subscriptions')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('status', ['active', 'trialing']);

    if (newError) throw newError;

    // Get churned subscriptions this month
    const { data: churnedSubscriptions, error: churnError } =
      await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'canceled')
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString());

    if (churnError) throw churnError;

    // Calculate metrics
    const newMrr = this.calculateMrrFromSubscriptions(newSubscriptions || []);
    const churnedMrr = this.calculateMrrFromSubscriptions(
      churnedSubscriptions || []
    );
    const netNewMrr = currentMrr - previousMrr;
    const expansionMrr = Math.max(0, netNewMrr - newMrr + churnedMrr);
    const contractionMrr = Math.max(0, -netNewMrr + newMrr - churnedMrr);

    const customerCount =
      currentSubscriptions?.filter(s => s.status === 'active').length || 0;
    const newCustomers = newSubscriptions?.length || 0;
    const churnedCustomers = churnedSubscriptions?.length || 0;
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
    const { data: subscriptions, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'trialing']);

    if (error) throw error;

    const planMap = new Map<string, { count: number; mrr: number }>();
    let totalMrr = 0;

    subscriptions?.forEach(sub => {
      const mrr = this.getSubscriptionMrr(sub);
      totalMrr += mrr;

      const current = planMap.get(sub.plan) || { count: 0, mrr: 0 };
      planMap.set(sub.plan, {
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
    const { data: allUsers, error: usersError } = await this.supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    const { data: subscriptions, error: subsError } = await this.supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'trialing', 'past_due']);

    if (subsError) throw subsError;

    const totalCustomers = allUsers?.length || 0;
    const payingCustomers =
      subscriptions?.filter(s => s.status === 'active' && s.plan !== 'free')
        .length || 0;
    const trialCustomers =
      subscriptions?.filter(s => s.status === 'trialing').length || 0;
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
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select(
        `
        *,
        users!inner(
          id,
          email,
          full_name
        )
      `
      )
      .eq('status', 'active')
      .neq('plan', 'free')
      .order('amount', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(sub => ({
      userId: sub.user_id,
      email: sub.users.email,
      name: sub.users.full_name,
      plan: sub.plan,
      mrr: this.getSubscriptionMrr(sub),
      subscribedAt: sub.created_at,
    }));
  }

  /**
   * Calculate MRR from a list of subscriptions
   */
  private calculateMrrFromSubscriptions(subscriptions: any[]): number {
    return subscriptions.reduce((total, sub) => {
      return total + this.getSubscriptionMrr(sub);
    }, 0);
  }

  /**
   * Get MRR for a single subscription
   */
  private getSubscriptionMrr(subscription: any): number {
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
    const { error } = await this.supabase.from('revenue_events').insert({
      type: event.type,
      user_id: event.userId,
      old_plan: event.oldPlan,
      new_plan: event.newPlan,
      amount: event.amount,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to track revenue event:', error);
    }
  }
}
