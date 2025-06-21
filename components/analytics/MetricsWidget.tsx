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
 * @fileoverview Compact Metrics Widget for Business Excellence
 *
 * Lightweight component for displaying key performance indicators:
 * - Real-time 3-minute success rate
 * - Revenue metrics snapshot
 * - User tier conversion indicators
 * - Quick upgrade opportunities
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
import { Button } from '@/components/ui/button';
import {
  Target,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  // TrendingDown,
  ArrowUp,
  ArrowDown,
  Zap,
  Crown,
  BarChart3,
} from 'lucide-react';

interface MetricsWidgetProps {
  variant?: 'compact' | 'detailed';
  showUpgradeButton?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

interface QuickMetrics {
  threeMinuteSuccessRate: number;
  averageCompletionTime: number;
  totalActiveUsers: number;
  conversionRate: number;
  mrr: number;
  trend: {
    successRate: 'up' | 'down';
    users: 'up' | 'down';
    revenue: 'up' | 'down';
  };
  competitiveAdvantage: number;
}

export function MetricsWidget({
  variant = 'compact',
  showUpgradeButton = false,
  onUpgradeClick,
  className = '',
}: MetricsWidgetProps) {
  const [metrics, setMetrics] = useState<QuickMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - in real implementation, fetch from analytics
    const mockMetrics: QuickMetrics = {
      threeMinuteSuccessRate: 0.92,
      averageCompletionTime: 165000, // 2m 45s
      totalActiveUsers: 12847,
      conversionRate: 0.23,
      mrr: 187420,
      trend: {
        successRate: 'up',
        users: 'up',
        revenue: 'up',
      },
      competitiveAdvantage: 85,
    };

    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' }) => {
    const isUp = trend === 'up';
    const Icon = isUp ? ArrowUp : ArrowDown;
    return (
      <Icon className={`h-3 w-3 ${isUp ? 'text-green-500' : 'text-red-500'}`} />
    );
  };

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Primary Metric */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">3-Min Success</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {(metrics.threeMinuteSuccessRate * 100).toFixed(1)}%
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <TrendIcon trend={metrics.trend.successRate} />
                <span>vs last week</span>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {formatTime(metrics.averageCompletionTime)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Time</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(metrics.mrr)}
                </div>
                <div className="text-xs text-muted-foreground">MRR</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Performance</span>
                <span>{metrics.competitiveAdvantage}%</span>
              </div>
              <Progress value={metrics.competitiveAdvantage} className="h-2" />
            </div>

            {/* Upgrade Button */}
            {showUpgradeButton && onUpgradeClick && (
              <Button size="sm" className="w-full" onClick={onUpgradeClick}>
                <Crown className="h-3 w-3 mr-1" />
                View Full Analytics
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          Business Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <TrendIcon trend={metrics.trend.successRate} />
            </div>
            <div className="text-xl font-bold text-green-700">
              {(metrics.threeMinuteSuccessRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-green-600">3-Min Success Rate</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <TrendIcon trend={metrics.trend.revenue} />
            </div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(metrics.mrr)}
            </div>
            <div className="text-xs text-blue-600">Monthly Revenue</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-50 border border-purple-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <TrendIcon trend={metrics.trend.users} />
            </div>
            <div className="text-xl font-bold text-purple-700">
              {metrics.totalActiveUsers.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600">Active Users</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <Badge variant="outline" className="text-xs">
                Target: 3m
              </Badge>
            </div>
            <div className="text-xl font-bold text-orange-700">
              {formatTime(metrics.averageCompletionTime)}
            </div>
            <div className="text-xs text-orange-600">Avg Time</div>
          </motion.div>
        </div>

        {/* Competitive Advantage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Competitive Advantage</span>
            <Badge variant="default" className="bg-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Market Leader
            </Badge>
          </div>
          <Progress value={metrics.competitiveAdvantage} className="h-3" />
          <div className="text-xs text-muted-foreground">
            {metrics.competitiveAdvantage}% advantage over competitors
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <div className="font-medium">Conversion Rate</div>
            <div className="text-sm text-muted-foreground">Free to Paid</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {(metrics.conversionRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-green-600 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              +2.3%
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {showUpgradeButton && onUpgradeClick && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onUpgradeClick}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Dashboard
            </Button>
          )}
          <Button variant="outline" className="flex-1">
            <Zap className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Real-time metrics badge for minimal space usage
 */
export function MetricsBadge({
  metric = 'success_rate',
  className = '',
}: {
  metric?: 'success_rate' | 'revenue' | 'users' | 'time';
  className?: string;
}) {
  const [value, setValue] = useState<string>('...');

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      switch (metric) {
        case 'success_rate':
          setValue(`${(92 + Math.random() * 6).toFixed(1)}%`);
          break;
        case 'revenue':
          setValue(`$${(187 + Math.random() * 20).toFixed(0)}K`);
          break;
        case 'users':
          setValue(
            `${(12847 + Math.floor(Math.random() * 100)).toLocaleString()}`
          );
          break;
        case 'time':
          setValue(`${Math.floor(160 + Math.random() * 20)}s`);
          break;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [metric]);

  const getIcon = () => {
    switch (metric) {
      case 'success_rate':
        return <Target className="h-3 w-3" />;
      case 'revenue':
        return <DollarSign className="h-3 w-3" />;
      case 'users':
        return <Users className="h-3 w-3" />;
      case 'time':
        return <Clock className="h-3 w-3" />;
    }
  };

  const getColor = () => {
    switch (metric) {
      case 'success_rate':
        return 'bg-green-600';
      case 'revenue':
        return 'bg-blue-600';
      case 'users':
        return 'bg-purple-600';
      case 'time':
        return 'bg-orange-600';
    }
  };

  return (
    <Badge variant="default" className={`${getColor()} ${className}`}>
      {getIcon()}
      <span className="ml-1">{value}</span>
    </Badge>
  );
}
