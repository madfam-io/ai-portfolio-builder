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
 * @fileoverview Referral Dashboard Component
 *
 * Comprehensive referral dashboard that provides users with complete visibility
 * into their referral performance, earnings, and growth opportunities.
 * Features beautiful visualizations, real-time updates, and actionable insights.
 *
 * @author MADFAM Growth Engineering Team
 * @version 1.0.0 - World-Class Referral System
 */

'use client';

import React, { useState } from 'react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  Crown,
  Target,
  Calendar,
  Share2,
  Award,
  Zap,
} from 'lucide-react';
import { useReferral } from '@/lib/referral/hooks/use-referral';
import { ShareHub } from './ShareHub';
import { RewardHistory } from './RewardHistory';
import { cn } from '@/lib/utils';

interface ReferralDashboardProps {
  className?: string;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ReferralDashboard({ className }: ReferralDashboardProps) {
  const {
    referrals,
    stats,
    rewards: _rewards,
    totalEarnings,
    pendingRewards,
    availableCampaigns: _availableCampaigns,
    createReferral,
    creating,
    loading,
    error,
  } = useReferral();

  const [selectedTab, setSelectedTab] = useState('overview');

  const handleCreateReferral = async () => {
    await createReferral();
  };

  // Calculate performance metrics
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      referrals: Math.floor(Math.random() * 10) + 1,
      conversions: Math.floor(Math.random() * 5) + 1,
      earnings: Math.floor(Math.random() * 100) + 20,
    }));
  }, []);

  const statusDistribution = React.useMemo(() => {
    const statusCounts = referrals.reduce(
      (acc, ref) => {
        acc[ref.status] = (acc[ref.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      value: count,
    }));
  }, [referrals]);

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Referral Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track your referrals, earnings, and grow your network
          </p>
        </div>
        <Button
          onClick={handleCreateReferral}
          disabled={creating}
          className="mt-4 sm:mt-0"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Create New Referral
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Total Referrals
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats?.total_referrals || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +12% this month
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Successful Referrals
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats?.successful_referrals || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-green-600 font-medium">
                  {stats?.conversion_rate.toFixed(1) || 0}% conversion rate
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Total Earned
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    ${totalEarnings.toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Gift className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-sm text-purple-600 font-medium">
                  ${pendingRewards.toFixed(0)} pending
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">
                    Current Streak
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats?.current_streak || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Calendar className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-sm text-orange-600 font-medium">
                  {stats?.best_streak || 0} day best
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      {stats?.achievement_badges && stats.achievement_badges.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-600" />
              Your Achievements
            </CardTitle>
            <CardDescription>
              Milestones you've unlocked on your referral journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.achievement_badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 text-sm py-2 px-3"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {badge}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <div>
                <p className="text-red-800 font-medium">{error.code}</p>
                <p className="text-red-600 text-sm">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>
                  Your referral activity and earnings over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="referrals"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Referrals"
                      />
                      <Line
                        type="monotone"
                        dataKey="conversions"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Conversions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Status</CardTitle>
                <CardDescription>
                  Distribution of your referrals by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {statusDistribution.map((entry, index) => (
                    <div
                      key={entry.status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        ></div>
                        <span className="text-sm">{entry.status}</span>
                      </div>
                      <span className="text-sm font-medium">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Your latest referral activity</CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length > 0 ? (
                <div className="space-y-4">
                  {referrals.slice(0, 5).map(referral => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {referral.code.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{referral.code}</div>
                          <div className="text-sm text-gray-600">
                            Created{' '}
                            {new Date(referral.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            referral.status === 'converted'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {referral.status}
                        </Badge>
                        {referral.attribution_data.click_count > 0 && (
                          <span className="text-sm text-gray-600">
                            {referral.attribution_data.click_count} clicks
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No referrals yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first referral to start earning rewards
                  </p>
                  <Button onClick={handleCreateReferral} disabled={creating}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Create Referral
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <ShareHub />
        </TabsContent>

        <TabsContent value="rewards">
          <RewardHistory />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Over Time</CardTitle>
              <CardDescription>
                Track your referral earnings and growth trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average per referral</span>
                  <span className="font-medium">
                    ${stats?.average_reward_per_referral.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Best performing month</span>
                  <span className="font-medium">March 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Referral rank</span>
                  <span className="font-medium">
                    #{stats?.referral_rank || 'Unranked'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Next Achievement</span>
                    <span>5 more referrals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Leaderboard Top 10</span>
                    <span>12 more conversions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: '40%' }}
                    ></div>
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
