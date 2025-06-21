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

import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Eye,
  FileText,
  Globe,
  TrendingUp,
  Calendar,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import { useToast } from '@/hooks/use-toast';

interface UsageMetric {
  id: string;
  name: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

interface UsageStats {
  portfoliosCreated: number;
  portfoliosPublished: number;
  totalViews: number;
  aiEnhancements: number;
  customDomains: number;
  storageUsed: number;
  lastUpdated: Date;
}

const PLAN_LIMITS = {
  free: {
    portfolios: 3,
    publishedPortfolios: 1,
    monthlyViews: 1000,
    aiEnhancements: 10,
    customDomains: 0,
    storage: 100, // MB
  },
  starter: {
    portfolios: 10,
    publishedPortfolios: 5,
    monthlyViews: 10000,
    aiEnhancements: 100,
    customDomains: 1,
    storage: 1000, // MB
  },
  professional: {
    portfolios: 50,
    publishedPortfolios: 25,
    monthlyViews: 50000,
    aiEnhancements: 500,
    customDomains: 5,
    storage: 5000, // MB
  },
  business: {
    portfolios: -1, // unlimited
    publishedPortfolios: -1,
    monthlyViews: -1,
    aiEnhancements: -1,
    customDomains: -1,
    storage: -1,
  },
};

export function UsageTracker() {
  const { user } = useAuthStore();
  const { portfolios } = usePortfolioStore();
  const router = useRouter();
  const { toast } = useToast();

  // Get user's plan (default to free)
  const userPlan = (user?.user_metadata?.plan as string) || 'free';
  const limits =
    PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  // Calculate usage stats with memoization
  const stats: UsageStats = useMemo(
    () => ({
      portfoliosCreated: portfolios.length,
      portfoliosPublished: portfolios.filter(p => p.status === 'published')
        .length,
      totalViews: portfolios.reduce((sum, p) => sum + (p.views || 0), 0),
      aiEnhancements: portfolios.reduce(
        (sum, p) => sum + 0, // AI enhancements count - needs implementation
        0
      ),
      customDomains: portfolios.filter(p => p.customDomain).length,
      storageUsed: portfolios.reduce(
        (sum, p) => sum + 10, // Estimated storage per portfolio
        0
      ), // MB
      lastUpdated: new Date(),
    }),
    [portfolios]
  );

  // Track usage periodically
  useEffect(() => {
    if (!user) return;

    const trackUsage = async () => {
      try {
        await fetch('/api/v1/usage/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify(stats),
        });

        logger.info('Usage tracked', {
          userId: user.id,
          stats,
          feature: 'usage_tracking',
        });
      } catch (error) {
        logger.error('Failed to track usage', error as Error, {
          userId: user.id,
          feature: 'usage_tracking',
        });
      }
    };

    // Track on mount and every 5 minutes
    trackUsage();
    const interval = setInterval(trackUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, stats]);

  const metrics: UsageMetric[] = [
    {
      id: 'portfolios',
      name: 'Portfolios Created',
      current: stats.portfoliosCreated,
      limit: limits.portfolios,
      unit: 'portfolios',
      icon: FileText,
      color: 'text-blue-500',
      description: 'Total portfolios in your account',
    },
    {
      id: 'published',
      name: 'Published Portfolios',
      current: stats.portfoliosPublished,
      limit: limits.publishedPortfolios,
      unit: 'live sites',
      icon: Globe,
      color: 'text-green-500',
      description: 'Portfolios accessible via public URL',
    },
    {
      id: 'views',
      name: 'Monthly Views',
      current: stats.totalViews,
      limit: limits.monthlyViews,
      unit: 'views',
      icon: Eye,
      color: 'text-purple-500',
      description: 'Total portfolio views this month',
    },
    {
      id: 'ai',
      name: 'AI Enhancements',
      current: stats.aiEnhancements,
      limit: limits.aiEnhancements,
      unit: 'uses',
      icon: Zap,
      color: 'text-yellow-500',
      description: 'AI content generation uses this month',
    },
    {
      id: 'domains',
      name: 'Custom Domains',
      current: stats.customDomains,
      limit: limits.customDomains,
      unit: 'domains',
      icon: Globe,
      color: 'text-indigo-500',
      description: 'Custom domain connections',
    },
    {
      id: 'storage',
      name: 'Storage Used',
      current: stats.storageUsed,
      limit: limits.storage,
      unit: 'MB',
      icon: Activity,
      color: 'text-red-500',
      description: 'Total storage for images and files',
    },
  ];

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const handleUpgrade = () => {
    toast({
      title: 'Upgrade Your Plan',
      description: 'Unlock more features and higher limits',
    });
    router.push('/pricing');
  };

  const needsUpgrade = metrics.some(
    metric => metric.limit !== -1 && metric.current >= metric.limit
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Usage & Limits</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {userPlan} Plan
              </Badge>
              {needsUpgrade && (
                <Button size="sm" onClick={handleUpgrade}>
                  Upgrade
                  <TrendingUp className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {needsUpgrade && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Usage Limit Reached</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {
                    "You've reached the limit for one or more features. Upgrade to continue using PRISMA without restrictions."
                  }
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {metrics.map(metric => {
              const percentage = getUsagePercentage(
                metric.current,
                metric.limit
              );
              const status = getUsageStatus(percentage);
              const isUnlimited = metric.limit === -1;
              const Icon = metric.icon;

              return (
                <div key={metric.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4', metric.color)} />
                      <div>
                        <p className="font-medium text-sm">{metric.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium">
                        {metric.current}
                        {!isUnlimited && (
                          <span className="text-muted-foreground">
                            /{metric.limit}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isUnlimited ? 'Unlimited' : metric.unit}
                      </p>
                    </div>
                  </div>

                  {!isUnlimited && (
                    <div className="space-y-1">
                      <Progress
                        value={percentage}
                        className={cn(
                          'h-2',
                          status === 'critical' && 'bg-destructive/20',
                          status === 'warning' && 'bg-yellow-500/20'
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(0)}% used</span>
                        {status === 'critical' && (
                          <span className="text-destructive">
                            Limit reached
                          </span>
                        )}
                        {status === 'warning' && (
                          <span className="text-yellow-600">
                            {100 - percentage}% remaining
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Usage resets monthly</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/usage')}
              >
                View Detailed Usage →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
