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

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  Download,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { useToast } from '@/hooks/use-toast';

// Types for revenue data
interface RevenueMetrics {
  mrr: number;
  arr: number;
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  netNewMrr: number;
  customerCount: number;
  newCustomers: number;
  churnedCustomers: number;
  churnRate: number;
  arpu: number;
  ltv: number;
}

interface RevenueByPlan {
  plan: string;
  customerCount: number;
  mrr: number;
  percentage: number;
}

interface RevenueTrend {
  month: string;
  mrr: number;
  customerCount: number;
  churnRate: number;
  growth?: number;
}

interface RevenueData {
  metrics: RevenueMetrics;
  revenueByPlan: RevenueByPlan[];
  customerMetrics: {
    totalCustomers: number;
    payingCustomers: number;
    trialCustomers: number;
    conversionRate: number;
  };
  topCustomers: Array<{
    userId: string;
    email: string;
    name: string;
    plan: string;
    mrr: number;
    subscribedAt: string;
  }>;
  trends: RevenueTrend[] | null;
  growth: {
    mrr: number;
    customers: number;
  };
}

export function RevenueAnalytics() {
  const { t: _t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<RevenueData | null>(null);
  const [selectedPeriod, _setSelectedPeriod] = useState('12'); // months

  const fetchRevenueData = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) setRefreshing(true);

        const response = await fetch(
          `/api/v1/admin/revenue/metrics?months=${selectedPeriod}`
        );
        if (!response.ok) throw new Error('Failed to fetch revenue data');

        const result = await response.json();
        setData(result.data);

        if (showRefreshToast) {
          toast({
            title: 'Data refreshed',
            description: 'Revenue metrics have been updated',
          });
        }
      } catch (_error) {
        toast({
          title: 'Error',
          description: 'Failed to load revenue data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedPeriod, toast]
  );

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatPercentage = (value: number | string, showSign = false) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const formatted = `${numValue.toFixed(1)}%`;
    if (!showSign) return formatted;
    return numValue > 0 ? `+${formatted}` : formatted;
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    format: formatFn = (v: number | string) => v.toString(),
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    format?: (value: number | string) => string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatFn(value)}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
              {change > 0 ? (
                <ArrowUpRight className="inline h-3 w-3" />
              ) : (
                <ArrowDownRight className="inline h-3 w-3" />
              )}
              {formatPercentage(Math.abs(change))}
            </span>
            {' from last month'}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Revenue Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your business performance and growth metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRevenueData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={data.metrics.mrr}
          change={data.growth.mrr}
          icon={DollarSign}
          format={formatCurrency}
        />
        <MetricCard
          title="Active Customers"
          value={data.metrics.customerCount}
          change={data.growth.customers}
          icon={Users}
          format={v => v.toLocaleString()}
        />
        <MetricCard
          title="Average Revenue Per User"
          value={data.metrics.arpu}
          icon={CreditCard}
          format={formatCurrency}
        />
        <MetricCard
          title="Churn Rate"
          value={data.metrics.churnRate}
          icon={TrendingUp}
          format={v => formatPercentage(v)}
        />
      </div>

      {/* Revenue Breakdown */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Plan Breakdown</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* MRR Movement */}
            <Card>
              <CardHeader>
                <CardTitle>MRR Movement</CardTitle>
                <CardDescription>
                  Monthly recurring revenue changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New MRR</span>
                    <span className="text-sm font-medium text-green-600">
                      +{formatCurrency(data.metrics.newMrr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expansion MRR</span>
                    <span className="text-sm font-medium text-blue-600">
                      +{formatCurrency(data.metrics.expansionMrr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contraction MRR</span>
                    <span className="text-sm font-medium text-orange-600">
                      -{formatCurrency(data.metrics.contractionMrr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Churned MRR</span>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(data.metrics.churnedMrr)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Net New MRR</span>
                    <span
                      className={`text-sm font-bold ${data.metrics.netNewMrr >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {data.metrics.netNewMrr >= 0 ? '+' : ''}
                      {formatCurrency(data.metrics.netNewMrr)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>
                  User acquisition and retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Customers</span>
                    <span className="text-sm font-medium">
                      {data.customerMetrics.totalCustomers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paying Customers</span>
                    <span className="text-sm font-medium">
                      {data.customerMetrics.payingCustomers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trial Customers</span>
                    <span className="text-sm font-medium">
                      {data.customerMetrics.trialCustomers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="text-sm font-medium">
                      {formatPercentage(data.customerMetrics.conversionRate)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Customer LTV</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(data.metrics.ltv)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>
                MRR distribution across subscription tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.revenueByPlan.map(plan => (
                  <div key={plan.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            plan.plan === 'enterprise' ? 'default' : 'secondary'
                          }
                        >
                          {plan.plan.charAt(0).toUpperCase() +
                            plan.plan.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {plan.customerCount} customers
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(plan.mrr)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${plan.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Paying Customers</CardTitle>
              <CardDescription>Your highest value customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topCustomers.map((customer, index) => (
                  <div
                    key={customer.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm bg-secondary rounded px-2 py-1">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {customer.name || customer.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.plan} • Joined{' '}
                          {format(
                            new Date(customer.subscribedAt),
                            'MMM d, yyyy'
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(customer.mrr)}/mo
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {data.trends && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Simple text-based chart for trends */}
                  <div className="space-y-2">
                    {data.trends.map(trend => (
                      <div
                        key={trend.month}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="w-20">{trend.month}</span>
                        <div className="flex-1 mx-4">
                          <div className="h-6 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${(trend.mrr / Math.max(...(data.trends?.map(t => t.mrr) || [1]))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="w-24 text-right font-medium">
                          {formatCurrency(trend.mrr)}
                        </span>
                        {trend.growth !== undefined && (
                          <span
                            className={`w-16 text-right ${trend.growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {formatPercentage(trend.growth, true)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
