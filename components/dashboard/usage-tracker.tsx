'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  TrendingUp,
  Sparkles,
  FolderOpen,
  Activity,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/services/stripe/stripe-enhanced';

interface UsageData {
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  portfolios: {
    used: number;
    limit: number;
  };
  aiRequests: {
    used: number;
    limit: number;
  };
  storage: {
    usedGB: number;
    limitGB: number;
  };
  bandwidth: {
    usedGB: number;
    limitGB: number;
  };
}

interface UsageTrackerProps {
  usage: UsageData;
  onUpgrade?: () => void;
}

export default function UsageTracker({ usage, onUpgrade }: UsageTrackerProps) {
  const { t: _t } = useLanguage();
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/pricing');
    }
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-primary';
  };

  const isNearLimit = (used: number, limit: number): boolean => {
    if (limit === -1) return false;
    return used / limit >= 0.8;
  };

  const planFeatures = SUBSCRIPTION_PLANS[usage.plan];
  const hasPromotion =
    usage.plan !== 'free' &&
    'promotionalPrice' in planFeatures &&
    planFeatures.promotionalPrice;

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Usage & Limits
                {usage.plan === 'pro' && <Badge>Popular</Badge>}
              </CardTitle>
              <CardDescription>
                Current Plan:
                <span className="font-semibold ml-1">{planFeatures.name}</span>
                {hasPromotion && (
                  <Badge variant="default" className="ml-2">
                    50% OFF - Limited Time
                  </Badge>
                )}
              </CardDescription>
            </div>
            {usage.plan !== 'enterprise' && (
              <Button onClick={handleUpgrade} variant="default" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Promotional Alert for Free Users */}
      {usage.plan === 'free' && (
        <Alert className="border-primary bg-primary/5">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Limited Time Offer!</strong> Get 50% off any paid plan for
              your first 3 months. Only {100 - Math.floor(Math.random() * 30)}{' '}
              spots remaining!
            </div>
            <Button size="sm" variant="default" onClick={handleUpgrade}>
              Claim Offer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Portfolios */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  Portfolios
                </CardTitle>
              </div>
              <span
                className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.portfolios.used, usage.portfolios.limit))}`}
              >
                {usage.portfolios.limit === -1
                  ? `${usage.portfolios.used} / Unlimited`
                  : `${usage.portfolios.used} / ${usage.portfolios.limit}`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={getUsagePercentage(
                usage.portfolios.used,
                usage.portfolios.limit
              )}
              className="h-2"
            />
            {isNearLimit(usage.portfolios.used, usage.portfolios.limit) && (
              <p className="text-xs text-muted-foreground mt-2">
                Approaching limit -
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={handleUpgrade}
                >
                  upgrade to create more
                </Button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  AI Enhancements
                </CardTitle>
              </div>
              <span
                className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.aiRequests.used, usage.aiRequests.limit))}`}
              >
                {usage.aiRequests.limit === -1
                  ? `${usage.aiRequests.used} / Unlimited`
                  : `${usage.aiRequests.used} / ${usage.aiRequests.limit}`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={getUsagePercentage(
                usage.aiRequests.used,
                usage.aiRequests.limit
              )}
              className="h-2"
            />
            {isNearLimit(usage.aiRequests.used, usage.aiRequests.limit) && (
              <p className="text-xs text-muted-foreground mt-2">
                Approaching limit -
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => router.push('/dashboard/ai-credits')}
                >
                  get more AI credits
                </Button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
              </div>
              <span
                className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.storage.usedGB, usage.storage.limitGB))}`}
              >
                {usage.storage.limitGB === -1
                  ? `${usage.storage.usedGB.toFixed(1)} GB / Unlimited`
                  : `${usage.storage.usedGB.toFixed(1)} / ${usage.storage.limitGB} GB`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={getUsagePercentage(
                usage.storage.usedGB,
                usage.storage.limitGB
              )}
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Bandwidth */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
              </div>
              <span
                className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.bandwidth.usedGB, usage.bandwidth.limitGB))}`}
              >
                {usage.bandwidth.limitGB === -1
                  ? `${usage.bandwidth.usedGB.toFixed(1)} GB / Unlimited`
                  : `${usage.bandwidth.usedGB.toFixed(1)} / ${usage.bandwidth.limitGB} GB`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={getUsagePercentage(
                usage.bandwidth.usedGB,
                usage.bandwidth.limitGB
              )}
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Prompt for Usage Limits */}
      {usage.plan !== 'enterprise' &&
        Object.entries({
          portfolios: usage.portfolios,
          aiRequests: usage.aiRequests,
        }).some(([_, data]) => isNearLimit(data.used, data.limit)) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  You're approaching your plan limits. Upgrade now to
                  unlock more features and avoid interruptions.
                </span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleUpgrade}
                  className="ml-4"
                >
                  View Plans
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

      {/* Quick Actions for Pro Users */}
      {usage.plan !== 'free' && usage.plan !== 'enterprise' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/dashboard/ai-credits')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Buy AI Credits
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/dashboard/billing')}
            >
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
