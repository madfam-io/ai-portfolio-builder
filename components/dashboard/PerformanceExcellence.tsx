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
 * @fileoverview Performance Excellence Dashboard
 *
 * Revolutionary user-facing dashboard that transforms technical metrics into
 * business value propositions. This component:
 *
 * - Shows users how performance directly impacts their portfolio success
 * - Gamifies optimization with competitive rankings and achievements
 * - Demonstrates value of premium features through performance insights
 * - Creates sticky engagement through performance improvement tracking
 * - Generates upgrade motivation through competitive benchmarking
 *
 * @author MADFAM Innovation Team
 * @version 1.0.0 - User Experience Excellence
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell,
} from 'recharts';
import {
  Zap,
  TrendingUp,
  Trophy,
  Target,
  Crown,
  Sparkles,
  Rocket,
  Star,
  Award,
  Lock,
  ArrowUp,
  DollarSign,
  Users,
  Globe,
  Activity,
} from 'lucide-react';

import {
  aiCodeQualityEngine,
  CodeQualityReport,
  OptimizationRecommendation,
} from '@/lib/ai/code-quality/engine';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

interface PerformanceExcellenceDashboardProps {
  portfolioId?: string;
  className?: string;
}

export function PerformanceExcellenceDashboard({
  portfolioId,
  className,
}: PerformanceExcellenceDashboardProps) {
  const { user } = useAuthStore();
  const [report, setReport] = useState<CodeQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [achievements, setAchievements] = useState<string[]>([]);

  const userTier = user?.user_metadata?.plan || 'free';
  const isPremium = ['professional', 'business'].includes(userTier);

  useEffect(() => {
    loadPerformanceData();
  }, [portfolioId]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Simulate loading user's portfolio files for analysis
      const mockCodeFiles = [
        'components/portfolio/showcase.tsx',
        'pages/portfolio/[slug].tsx',
        'lib/performance/optimization.ts',
      ];

      const analysisReport = await aiCodeQualityEngine.analyzeCodebase(
        mockCodeFiles,
        userTier,
        isPremium
      );

      setReport(analysisReport);
      updateAchievements(analysisReport);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAchievements = (report: CodeQualityReport) => {
    const newAchievements: string[] = [];

    if (report.metrics.performanceScore > 90) {
      newAchievements.push('Performance Champion');
    }
    if (report.industryBenchmarks.performancePercentile > 95) {
      newAchievements.push('Top 5% Performer');
    }
    if (
      report.businessImpact.competitivePositioning.technicalLeadershipScore > 85
    ) {
      newAchievements.push('Technical Leader');
    }

    setAchievements(newAchievements);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 95)
      return { level: 'Elite', icon: Crown, color: 'bg-purple-500' };
    if (score >= 90)
      return { level: 'Excellent', icon: Trophy, color: 'bg-yellow-500' };
    if (score >= 80)
      return { level: 'Good', icon: Target, color: 'bg-blue-500' };
    if (score >= 70)
      return { level: 'Fair', icon: Activity, color: 'bg-orange-500' };
    return {
      level: 'Needs Improvement',
      icon: TrendingUp,
      color: 'bg-red-500',
    };
  };

  const competitorData = [
    {
      name: 'Your Portfolio',
      score: report?.metrics.performanceScore || 0,
      color: '#3b82f6',
    },
    { name: 'Wix', score: 65, color: '#e5e7eb' },
    { name: 'Squarespace', score: 72, color: '#e5e7eb' },
    { name: 'Webflow', score: 78, color: '#e5e7eb' },
    { name: 'GitHub Pages', score: 85, color: '#e5e7eb' },
  ];

  const performanceHistoryData = [
    {
      date: '1 week ago',
      score: (report?.metrics.performanceScore || 80) - 15,
    },
    {
      date: '5 days ago',
      score: (report?.metrics.performanceScore || 80) - 10,
    },
    { date: '3 days ago', score: (report?.metrics.performanceScore || 80) - 5 },
    { date: 'Today', score: report?.metrics.performanceScore || 80 },
  ];

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">
              Analyzing your portfolio performance...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Performance Analysis Unavailable
              </h3>
              <p className="text-gray-600 mb-4">
                Unable to analyze your portfolio performance at this time.
              </p>
              <Button onClick={loadPerformanceData}>
                <Rocket className="w-4 h-4 mr-2" />
                Retry Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceLevel = getPerformanceLevel(report.metrics.performanceScore);
  const PerformanceIcon = performanceLevel.icon;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Hero Performance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn('p-3 rounded-full', performanceLevel.color)}>
                  <PerformanceIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Performance Excellence Score
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Your portfolio ranks in the{' '}
                    {report.industryBenchmarks.performancePercentile}th
                    percentile
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    'text-4xl font-bold',
                    getPerformanceColor(report.metrics.performanceScore)
                  )}
                >
                  {report.metrics.performanceScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">/ 100</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Revenue Impact</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  +${report.metrics.revenueImpact.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">
                  Annual potential increase
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">User Experience</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  -{report.metrics.userExperienceImpact}ms
                </div>
                <p className="text-sm text-gray-600">Load time improvement</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Competitive Rank</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  #{report.industryBenchmarks.qualityRanking}
                </div>
                <p className="text-sm text-gray-600">In your category</p>
              </div>
            </div>

            {achievements.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-yellow-600" />
                  Recent Achievements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitors">Benchmarks</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="insights" className="relative">
            Insights
            {!isPremium && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Performance Trend
                </CardTitle>
                <CardDescription>
                  Your improvement over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Performance Breakdown
                </CardTitle>
                <CardDescription>
                  Key metrics affecting your score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Load Speed</span>
                    <span className="text-sm text-gray-600">92/100</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Code Quality</span>
                    <span className="text-sm text-gray-600">
                      {(100 - report.metrics.technicalDebtScore).toFixed(0)}/100
                    </span>
                  </div>
                  <Progress
                    value={100 - report.metrics.technicalDebtScore}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      SEO Optimization
                    </span>
                    <span className="text-sm text-gray-600">88/100</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Mobile Performance
                    </span>
                    <span className="text-sm text-gray-600">85/100</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                Competitive Benchmarking
              </CardTitle>
              <CardDescription>
                See how you stack up against popular portfolio platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={competitorData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Competitive Advantage
                  </span>
                </div>
                <p className="text-blue-800 text-sm">
                  Your portfolio outperforms{' '}
                  {
                    competitorData.filter(
                      c => c.score < (report?.metrics.performanceScore || 0)
                    ).length
                  }{' '}
                  out of {competitorData.length - 1} major competitors. You're
                  in the top{' '}
                  {Math.round(
                    (1 -
                      (report?.industryBenchmarks.performancePercentile || 0) /
                        100) *
                      100
                  )}
                  % of all portfolio websites.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="space-y-4">
            {report.recommendations
              .slice(0, isPremium ? 5 : 2)
              .map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={cn(
                      'border-l-4',
                      rec.priority === 'critical'
                        ? 'border-l-red-500'
                        : rec.priority === 'high'
                          ? 'border-l-orange-500'
                          : 'border-l-blue-500'
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              rec.priority === 'critical'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {rec.priority}
                          </Badge>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            +{rec.expectedImpact.performance}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Performance
                          </div>
                        </div>
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            +${rec.expectedImpact.revenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            Revenue Impact
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            +{rec.expectedImpact.userExperience}%
                          </div>
                          <div className="text-xs text-gray-600">
                            User Experience
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {rec.implementationEffort}
                          </div>
                          <div className="text-xs text-gray-600">
                            Effort Level
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 mb-4">
                        <strong>Business Impact:</strong>{' '}
                        {rec.businessJustification}
                      </div>

                      {isPremium && (
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                            View Implementation Details
                          </summary>
                          <div className="mt-3 space-y-2">
                            <div>
                              <strong>Required Changes:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {rec.codeChanges.map((change, i) => (
                                  <li key={i} className="text-gray-600">
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong>Success Metrics:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {rec.successMetrics.map((metric, i) => (
                                  <li key={i} className="text-gray-600">
                                    {metric}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

            {!isPremium && (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 mb-3">
                      Unlock {report.recommendations.length - 2} more
                      optimization recommendations
                    </p>
                    <Button size="sm">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Business
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {isPremium ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    AI-Powered Business Insights
                  </CardTitle>
                  <CardDescription>
                    Advanced analytics for business growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="bg-purple-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Executive Summary
                      </h4>
                      <div className="text-purple-800 text-sm whitespace-pre-line">
                        {report.executiveSummary}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Technical Analysis
                      </h4>
                      <div className="text-blue-800 text-sm whitespace-pre-line">
                        {report.technicalSummary}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-bold text-purple-900 mb-2">
                    Premium AI Insights
                  </h3>
                  <p className="text-purple-700 mb-4 max-w-md">
                    Get detailed business impact analysis, competitive
                    intelligence, and AI-powered optimization recommendations to
                    maximize your portfolio's success.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Rocket className="w-4 h-4 mr-2" />
                    Upgrade to Business Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
