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

/**
 * @fileoverview Performance Monitoring Dashboard for Business Excellence
 *
 * Comprehensive dashboard displaying real-time business metrics:
 * - 3-minute portfolio completion funnel
 * - User tier distribution and revenue metrics
 * - Competitive intelligence indicators
 * - Conversion optimization opportunities
 * - Thought leadership data insights
 *
 * @author PRISMA Business Team
 * @version 1.0.0 - Business Excellence Foundation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  Target,
  Zap,
  Crown,
  Star,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  Trophy,
} from 'lucide-react';

interface PerformanceMetrics {
  // 3-minute funnel metrics
  funnelMetrics: {
    totalUsers: number;
    completionRate: number;
    averageTime: number;
    under3MinuteRate: number;
    conversionByStep: Array<{
      step: string;
      users: number;
      completionRate: number;
      averageTime: number;
    }>;
  };

  // User tier distribution
  userTiers: {
    free: number;
    professional: number;
    business: number;
    enterprise: number;
  };

  // Revenue metrics
  revenueMetrics: {
    mrr: number;
    arr: number;
    averageRevenuePer: number;
    churnRate: number;
    conversionRate: number;
  };

  // Competitive intelligence
  competitiveMetrics: {
    speedAdvantage: number;
    marketPosition: string;
    featureAdoption: Array<{
      feature: string;
      adoptionRate: number;
      revenueImpact: number;
    }>;
  };

  // Thought leadership
  thoughtLeadership: {
    dataPoints: number;
    industryInsights: number;
    researchValue: number;
    contentOpportunities: string[];
  };
}

interface DashboardProps {
  userId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

export function PerformanceDashboard({
  userId: _userId,
  timeRange = '7d',
}: DashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    // In a real implementation, this would fetch from PostHog or analytics API
    const mockMetrics: PerformanceMetrics = {
      funnelMetrics: {
        totalUsers: 12847,
        completionRate: 0.87,
        averageTime: 165000, // 2 minutes 45 seconds
        under3MinuteRate: 0.92,
        conversionByStep: [
          {
            step: 'Signup',
            users: 12847,
            completionRate: 1.0,
            averageTime: 30000,
          },
          {
            step: 'Profile Import',
            users: 11840,
            completionRate: 0.92,
            averageTime: 45000,
          },
          {
            step: 'AI Enhancement',
            users: 10918,
            completionRate: 0.85,
            averageTime: 60000,
          },
          {
            step: 'Template Selection',
            users: 10264,
            completionRate: 0.8,
            averageTime: 90000,
          },
          {
            step: 'Customization',
            users: 9742,
            completionRate: 0.76,
            averageTime: 130000,
          },
          {
            step: 'Publish',
            users: 11176,
            completionRate: 0.87,
            averageTime: 165000,
          },
        ],
      },
      userTiers: {
        free: 9258,
        professional: 2847,
        business: 642,
        enterprise: 100,
      },
      revenueMetrics: {
        mrr: 187420,
        arr: 2249040,
        averageRevenuePer: 52.75,
        churnRate: 0.045,
        conversionRate: 0.23,
      },
      competitiveMetrics: {
        speedAdvantage: 85,
        marketPosition: 'industry_leader',
        featureAdoption: [
          { feature: 'AI Enhancement', adoptionRate: 0.68, revenueImpact: 1.8 },
          { feature: 'Integrations', adoptionRate: 0.45, revenueImpact: 1.4 },
          { feature: 'Analytics', adoptionRate: 0.32, revenueImpact: 1.2 },
          { feature: 'Export', adoptionRate: 0.56, revenueImpact: 1.1 },
        ],
      },
      thoughtLeadership: {
        dataPoints: 45782,
        industryInsights: 127,
        researchValue: 8.7,
        contentOpportunities: [
          '3-minute portfolio success analysis',
          'AI adoption in professional development',
          'Speed vs quality in portfolio creation',
          'Industry benchmarks for career tools',
        ],
      },
    };

    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1500);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tierColors = {
    free: '#94a3b8',
    professional: '#3b82f6',
    business: '#8b5cf6',
    enterprise: '#f59e0b',
  };

  const userTierData = Object.entries(metrics.userTiers).map(
    ([tier, count]) => ({
      name: tier.charAt(0).toUpperCase() + tier.slice(1),
      value: count,
      color: tierColors[tier as keyof typeof tierColors],
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Performance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time business excellence metrics and insights
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                3-Min Success Rate
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(metrics.funnelMetrics.under3MinuteRate * 100).toFixed(1)}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +5.2% from last week
              </div>
              <Progress
                value={metrics.funnelMetrics.under3MinuteRate * 100}
                className="mt-3"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.revenueMetrics.mrr)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +12.3% from last month
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ARR: {formatCurrency(metrics.revenueMetrics.arr)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.funnelMetrics.totalUsers.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +8.7% from last week
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(metrics.funnelMetrics.completionRate * 100).toFixed(1)}%
                completion rate
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Creation Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(metrics.funnelMetrics.averageTime)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                -15s from last week
              </div>
              <div className="text-xs text-green-600 mt-1">
                Well under 3-minute target!
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs
        value={selectedMetric}
        onValueChange={setSelectedMetric}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">3-Min Funnel</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  User Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={userTierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userTierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        'Users',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {userTierData.map(tier => (
                    <div key={tier.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="text-sm">
                        {tier.name}: {tier.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Adoption Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Feature Adoption vs Revenue Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.competitiveMetrics.featureAdoption}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'adoptionRate'
                          ? `${(value * 100).toFixed(1)}%`
                          : `${value}x`,
                        name === 'adoptionRate'
                          ? 'Adoption Rate'
                          : 'Revenue Impact',
                      ]}
                    />
                    <Bar dataKey="adoptionRate" fill="#3b82f6" />
                    <Bar dataKey="revenueImpact" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                3-Minute Portfolio Creation Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.funnelMetrics.conversionByStep.map((step, index) => (
                  <div key={step.step} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{step.step}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{step.users.toLocaleString()} users</span>
                        <span className="text-muted-foreground">
                          {formatTime(step.averageTime)}
                        </span>
                        <Badge
                          variant={
                            step.completionRate > 0.8 ? 'default' : 'secondary'
                          }
                        >
                          {(step.completionRate * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={step.completionRate * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Monthly Recurring Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(metrics.revenueMetrics.mrr)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {formatCurrency(metrics.revenueMetrics.averageRevenuePer)} per
                  user
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(metrics.revenueMetrics.conversionRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Free to Paid conversion
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Churn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {(metrics.revenueMetrics.churnRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-600 mt-2">
                  ↓ Below 5% target
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Market Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Speed Advantage</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metrics.competitiveMetrics.speedAdvantage}
                      className="w-20"
                    />
                    <span className="text-sm font-medium">
                      {metrics.competitiveMetrics.speedAdvantage}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Market Position</span>
                  <Badge variant="default" className="bg-green-600">
                    <Crown className="w-3 h-3 mr-1" />
                    {metrics.competitiveMetrics.marketPosition.replace(
                      '_',
                      ' '
                    )}
                  </Badge>
                </div>
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-2">Competitive Advantages</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 10x faster than traditional methods</li>
                    <li>• 2x faster than closest competitors</li>
                    <li>• Superior AI integration</li>
                    <li>• Best-in-class user experience</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Speed vs Industry</span>
                      <span>20x faster</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI Adoption Rate</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Satisfaction</span>
                      <span>4.9/5.0</span>
                    </div>
                    <Progress value={98} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Thought Leadership Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.thoughtLeadership.dataPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Data Points
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.thoughtLeadership.industryInsights}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Insights
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.thoughtLeadership.researchValue}/10
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Research Value
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Content Opportunities</h4>
                  {metrics.thoughtLeadership.contentOpportunities.map(
                    (opportunity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Star className="w-4 h-4 text-yellow-500" />
                        {opportunity}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Business Excellence Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    95/100
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    <Trophy className="w-3 h-3 mr-1" />
                    Excellent
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance</span>
                      <span>98/100</span>
                    </div>
                    <Progress value={98} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Experience</span>
                      <span>96/100</span>
                    </div>
                    <Progress value={96} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Revenue Growth</span>
                      <span>92/100</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Market Position</span>
                      <span>94/100</span>
                    </div>
                    <Progress value={94} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
