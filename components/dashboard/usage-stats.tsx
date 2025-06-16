/**
 * Usage Statistics Component
 *
 * Displays current usage statistics for portfolios, AI requests, and other metrics.
 * Shows progress bars and upgrade prompts when limits are approaching.
 */

'use client';

import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/hooks/use-subscription';
import { Users, Zap, Calendar, Crown, AlertTriangle } from 'lucide-react';
import {
  createCheckoutSession,
  formatPrice,
  PLAN_CONFIG,
} from '@/lib/stripe/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface UsageStatsProps {
  showUpgradePrompts?: boolean;
  className?: string;
}

export function UsageStats({
  showUpgradePrompts = true,
  className = '',
}: UsageStatsProps) {
  const {
    limits,
    loading,
    error,
    portfolioUsagePercentage,
    aiUsagePercentage,
    isFreeTier,
  } = useSubscription();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);

    try {
      const result = await createCheckoutSession({ planId: 'pro' });

      if (!result.success) {
        toast({
          title: 'Upgrade Failed',
          description: result.error || 'Failed to start upgrade process',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Upgrade Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-2 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !limits) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Unable to load usage statistics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {/* Portfolio Usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Portfolios
          </CardTitle>
          <CardDescription>
            {limits.current_usage.portfolios} of{' '}
            {limits.limits.max_portfolios === -1
              ? '∞'
              : limits.limits.max_portfolios}{' '}
            used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {limits.current_usage.portfolios}
              </span>
              {limits.limits.max_portfolios !== -1 && (
                <span
                  className={`text-sm font-medium ${getUsageColor(portfolioUsagePercentage)}`}
                >
                  {portfolioUsagePercentage}%
                </span>
              )}
            </div>

            {limits.limits.max_portfolios !== -1 && (
              <div className="space-y-1">
                <Progress value={portfolioUsagePercentage} className="h-2" />
                {portfolioUsagePercentage >= 80 &&
                  showUpgradePrompts &&
                  isFreeTier && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Almost at limit
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUpgrade}
                      >
                        Upgrade
                      </Button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            AI Requests
          </CardTitle>
          <CardDescription>
            {limits.current_usage.ai_requests} of{' '}
            {limits.limits.max_ai_requests === -1
              ? '∞'
              : limits.limits.max_ai_requests}{' '}
            this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {limits.current_usage.ai_requests}
              </span>
              {limits.limits.max_ai_requests !== -1 && (
                <span
                  className={`text-sm font-medium ${getUsageColor(aiUsagePercentage)}`}
                >
                  {aiUsagePercentage}%
                </span>
              )}
            </div>

            {limits.limits.max_ai_requests !== -1 && (
              <div className="space-y-1">
                <Progress value={aiUsagePercentage} className="h-2" />
                {aiUsagePercentage >= 80 &&
                  showUpgradePrompts &&
                  isFreeTier && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Almost at limit
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUpgrade}
                      >
                        Upgrade
                      </Button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-500" />
            Current Plan
          </CardTitle>
          <CardDescription>Your subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={isFreeTier ? 'secondary' : 'default'}>
                {limits?.subscription_tier || 'free'}
              </Badge>
              {isFreeTier && (
                <span className="text-sm text-muted-foreground">Free</span>
              )}
            </div>

            {isFreeTier && showUpgradePrompts && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Upgrade for unlimited features
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading
                    ? 'Processing...'
                    : `Upgrade - ${formatPrice(PLAN_CONFIG.pro.price)}/mo`}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Billing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            {isFreeTier ? 'AI Resets' : 'Next Billing'}
          </CardTitle>
          <CardDescription>
            {isFreeTier ? 'AI requests reset monthly' : 'Next billing cycle'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              {isFreeTier ? (
                <>
                  <span className="text-lg font-bold block">
                    {new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      1
                    ).toLocaleDateString('en', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    AI requests reset
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold block">Active</span>
                  <span className="text-xs text-muted-foreground">
                    Subscription active
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact usage summary for smaller spaces
 */
export function UsageSummary({ className = '' }: { className?: string }) {
  const { limits, loading, isFreeTier } = useSubscription();

  if (loading || !limits) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}
    >
      <span className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {limits.current_usage.portfolios}/
        {limits.limits.max_portfolios === -1
          ? '∞'
          : limits.limits.max_portfolios}
      </span>
      <span className="flex items-center gap-1">
        <Zap className="h-3 w-3" />
        {limits.current_usage.ai_requests}/
        {limits.limits.max_ai_requests === -1
          ? '∞'
          : limits.limits.max_ai_requests}
      </span>
      <Badge variant={isFreeTier ? 'secondary' : 'default'} className="text-xs">
        {limits?.subscription_tier || 'free'}
      </Badge>
    </div>
  );
}
