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

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, DollarSign, Activity, Zap } from 'lucide-react';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    returning: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
    churn: number;
  };
  engagement: {
    portfoliosCreated: number;
    portfoliosPublished: number;
    avgTimeOnSite: number;
    bounceRate: number;
  };
  conversion: {
    signupRate: number;
    trialToPayRate: number;
    referralRate: number;
    viralCoefficient: number;
  };
  trends: Array<{
    date: string;
    users: number;
    revenue: number;
    conversions: number;
  }>;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `/api/v1/analytics/dashboard?range=${timeRange}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-gray-200 dark:bg-gray-800" />
            <CardContent className="h-32 bg-gray-100 dark:bg-gray-900" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      title: 'Total Users',
      value: data.users.total.toLocaleString(),
      change: `+${data.users.new} new`,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(data.revenue.mrr / 100).toLocaleString()}`,
      change: `${data.revenue.growth > 0 ? '+' : ''}${data.revenue.growth}%`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Users',
      value: data.users.active.toLocaleString(),
      change: `${((data.users.active / data.users.total) * 100).toFixed(1)}%`,
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Viral Coefficient',
      value: data.conversion.viralCoefficient.toFixed(2),
      change: data.conversion.viralCoefficient > 1.5 ? 'Excellent' : 'Good',
      icon: Zap,
      color: 'text-orange-600',
    },
  ];

  const conversionFunnel = [
    { name: 'Visitors', value: 10000, percentage: 100 },
    {
      name: 'Signups',
      value: data.conversion.signupRate * 100,
      percentage: data.conversion.signupRate * 100,
    },
    {
      name: 'Trial Users',
      value: data.conversion.signupRate * 80,
      percentage: data.conversion.signupRate * 80,
    },
    {
      name: 'Paid Users',
      value: data.conversion.trialToPayRate * 100,
      percentage: data.conversion.trialToPayRate * 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map(metric => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="percentage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Segments */}
        <Card>
          <CardHeader>
            <CardTitle>User Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'New Users', value: data.users.new },
                    {
                      name: 'Active Users',
                      value: data.users.active - data.users.new,
                    },
                    {
                      name: 'Inactive',
                      value: data.users.total - data.users.active,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Portfolios Created</span>
              <span className="font-medium">
                {data.engagement.portfoliosCreated}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Portfolios Published</span>
              <span className="font-medium">
                {data.engagement.portfoliosPublished}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg. Time on Site</span>
              <span className="font-medium">
                {data.engagement.avgTimeOnSite}min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Bounce Rate</span>
              <span className="font-medium">{data.engagement.bounceRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">MRR</span>
              <span className="font-medium">
                ${(data.revenue.mrr / 100).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ARR</span>
              <span className="font-medium">
                ${(data.revenue.arr / 100).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Growth Rate</span>
              <span className="font-medium text-green-600">
                +{data.revenue.growth}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Churn Rate</span>
              <span className="font-medium text-red-600">
                {data.revenue.churn}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Signup Rate</span>
              <span className="font-medium">
                {(data.conversion.signupRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Trial to Paid</span>
              <span className="font-medium">
                {(data.conversion.trialToPayRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Referral Rate</span>
              <span className="font-medium">
                {(data.conversion.referralRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Viral Coefficient</span>
              <span className="font-medium text-purple-600">
                {data.conversion.viralCoefficient.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
