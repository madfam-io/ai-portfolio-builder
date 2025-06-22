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
 * @fileoverview Reward History Component
 *
 * Comprehensive reward tracking interface that shows users their complete
 * earnings history, pending rewards, and payout status. Features beautiful
 * visualizations and clear status indicators.
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { useReferral } from '@/lib/referral/hooks/use-referral';
import type {
  ReferralReward,
  RewardStatus,
  RewardType,
} from '@/lib/referral/types';
import { cn } from '@/lib/utils';

interface RewardHistoryProps {
  className?: string;
}

const REWARD_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending Review',
    description: 'Reward is being processed',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Approved',
    description: 'Ready for payout',
  },
  paid: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Paid',
    description: 'Successfully paid out',
  },
  expired: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Expired',
    description: 'Reward has expired',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Cancelled',
    description: 'Reward was cancelled',
  },
};

const REWARD_TYPE_CONFIG = {
  cash: { label: 'Cash', icon: '💵' },
  credit: { label: 'Account Credit', icon: '💳' },
  discount: { label: 'Discount', icon: '🏷️' },
  subscription_credit: { label: 'Subscription Credit', icon: '⭐' },
  feature_unlock: { label: 'Feature Unlock', icon: '🔓' },
};

export function RewardHistory({ className }: RewardHistoryProps) {
  const { rewards, totalEarnings, pendingRewards, loading } = useReferral();

  const [statusFilter, setStatusFilter] = useState<RewardStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RewardType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Filter and sort rewards
  const filteredRewards = React.useMemo(() => {
    let filtered = rewards;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reward => reward.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(reward => reward.type === typeFilter);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'amount') {
        return b.amount - a.amount;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [rewards, statusFilter, typeFilter, sortBy]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const stats = {
      total_rewards: rewards.length,
      total_earned: totalEarnings,
      pending_amount: pendingRewards,
      by_status: {} as Record<string, { count: number; amount: number }>,
      by_type: {} as Record<string, { count: number; amount: number }>,
      this_month: 0,
      last_month: 0,
    };

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    rewards.forEach(reward => {
      // By status
      if (!stats.by_status[reward.status]) {
        stats.by_status[reward.status] = { count: 0, amount: 0 };
      }
      stats.by_status[reward.status]!.count++;
      stats.by_status[reward.status]!.amount += reward.amount;

      // By type
      if (!stats.by_type[reward.type]) {
        stats.by_type[reward.type] = { count: 0, amount: 0 };
      }
      stats.by_type[reward.type]!.count++;
      stats.by_type[reward.type]!.amount += reward.amount;

      // Monthly comparison
      const rewardDate = new Date(reward.created_at);
      if (rewardDate >= thisMonth) {
        stats.this_month += reward.amount;
      } else if (rewardDate >= lastMonth && rewardDate < thisMonth) {
        stats.last_month += reward.amount;
      }
    });

    return stats;
  }, [rewards, totalEarnings, pendingRewards]);

  const monthlyGrowth =
    summaryStats.last_month > 0
      ? ((summaryStats.this_month - summaryStats.last_month) /
          summaryStats.last_month) *
        100
      : 0;

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Total Earned
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  {monthlyGrowth >= 0 ? '+' : ''}
                  {monthlyGrowth.toFixed(1)}% this month
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Pending Rewards
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    ${pendingRewards.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-blue-600 font-medium">
                  {summaryStats.by_status.pending?.count || 0} pending rewards
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
                    Total Rewards
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {summaryStats.total_rewards}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Gift className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-purple-600 font-medium">
                  $
                  {(
                    totalEarnings / Math.max(summaryStats.total_rewards, 1)
                  ).toFixed(2)}{' '}
                  average
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-600" />
                Reward History
              </CardTitle>
              <CardDescription>
                Track all your earnings and payout status
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={statusFilter}
                onValueChange={value =>
                  setStatusFilter(value as RewardStatus | 'all')
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={value =>
                  setTypeFilter(value as RewardType | 'all')
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="subscription_credit">
                    Subscription
                  </SelectItem>
                  <SelectItem value="feature_unlock">Feature Unlock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select
              value={sortBy}
              onValueChange={value => setSortBy(value as 'date' | 'amount')}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rewards List */}
          {filteredRewards.length > 0 ? (
            <div className="space-y-4">
              {filteredRewards.map((reward, index) => {
                const statusConfig = REWARD_STATUS_CONFIG[reward.status];
                const typeConfig = REWARD_TYPE_CONFIG[reward.type];
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-4 rounded-lg border',
                      statusConfig.bgColor,
                      statusConfig.borderColor
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={cn(
                            'p-2 rounded-full',
                            statusConfig.bgColor
                          )}
                        >
                          <StatusIcon
                            className={cn('w-5 h-5', statusConfig.color)}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {typeConfig.icon} {typeConfig.label}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {reward.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(reward.created_at).toLocaleDateString()}
                            </span>
                            {reward.redeemed_at && (
                              <span>
                                Redeemed:{' '}
                                {new Date(
                                  reward.redeemed_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                            {reward.expires_at && (
                              <span>
                                Expires:{' '}
                                {new Date(
                                  reward.expires_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${reward.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {reward.currency}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for pending rewards */}
                    {reward.status === 'pending' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Processing...</span>
                          <span>Usually takes 3-5 business days</span>
                        </div>
                        <Progress value={60} className="h-1" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No rewards found
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more rewards.'
                  : 'Start referring friends to earn your first rewards!'}
              </p>
              {statusFilter !== 'all' || typeFilter !== 'all' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown by Type */}
      {Object.keys(summaryStats.by_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
            <CardDescription>
              Your earnings distributed by reward type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summaryStats.by_type).map(([type, data]) => {
                const typeConfig = REWARD_TYPE_CONFIG[type as RewardType];
                const percentage = (data.amount / totalEarnings) * 100;

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{typeConfig?.icon || '💰'}</span>
                        <span className="font-medium">
                          {typeConfig?.label || type}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {data.count}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${data.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
