/**
 * Billing Dashboard Page
 *
 * Shows current subscription status, usage, and billing management options.
 * Integrates with Stripe for subscription management.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Separator } from '@/components/ui/separator';
import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { useSubscription } from '@/lib/hooks/use-subscription';
import {
  createCheckoutSession,
  redirectToPortal,
  PLAN_CONFIG,
  formatPrice,
} from '@/lib/stripe/client';
import { useLanguage } from '@/lib/i18n/refactored-context';
import {
  CreditCard,
  Package,
  TrendingUp,
  Users,
  Zap,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AICreditPacks from '@/components/dashboard/ai-credit-packs';
import { type AICreditPack } from '@/lib/services/stripe/stripe-enhanced';

function BillingContent() {
  const { t: _t } = useLanguage();
  const { toast } = useToast();
  const {
    limits,
    loading,
    error,
    refresh,
    isPaidTier,
    isFreeTier,
    planName,
    portfolioUsagePercentage,
    aiUsagePercentage,
  } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);
  const [aiCredits, setAiCredits] = useState(0);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  // Auto-refresh limits when coming back from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // User completed checkout successfully
      const type = urlParams.get('type');
      if (type === 'credits') {
        toast({
          title: 'Credits Purchased!',
          description: 'Your AI credits have been added to your account.',
        });
        // TODO: Refresh AI credits balance
      } else {
        toast({
          title: 'Subscription Updated!',
          description: 'Your subscription has been successfully updated.',
        });
      }
      refresh();
    }
    if (urlParams.get('canceled') === 'true') {
      toast({
        title: 'Checkout Canceled',
        description: 'Your purchase was not completed.',
        variant: 'default',
      });
    }
  }, [refresh, toast]);

  // TODO: Fetch actual AI credits balance
  useEffect(() => {
    // This would be fetched from the API
    setAiCredits(limits?.current_usage?.ai_requests || 0);
  }, [limits]);

  const handleUpgrade = async (planId: 'pro' | 'business' | 'enterprise') => {
    setIsUpgrading(planId);

    try {
      const result = await createCheckoutSession({
        planId,
        billingInterval,
      });

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
      setIsUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    setIsRedirectingToPortal(true);

    try {
      const result = await redirectToPortal();

      if (!result.success) {
        toast({
          title: 'Access Failed',
          description: result.error || 'Failed to access billing portal',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Access Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRedirectingToPortal(false);
    }
  };

  const handlePurchaseCreditPack = async (packId: AICreditPack) => {
    try {
      const response = await fetch('/api/v1/stripe/checkout-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: 'Failed to start credit purchase. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Error Loading Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = limits?.subscription_tier || 'free';
  const planConfig = PLAN_CONFIG[currentPlan as keyof typeof PLAN_CONFIG];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
          <p className="text-muted-foreground">
            Manage your subscription and view your usage statistics
          </p>
        </div>
        {isPaidTier && (
          <Button
            onClick={handleManageBilling}
            disabled={isRedirectingToPortal}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {isRedirectingToPortal ? 'Redirecting...' : 'Manage Billing'}
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant={currentPlan === 'free' ? 'secondary' : 'default'}
                className="text-sm"
              >
                {isFreeTier && <Crown className="h-3 w-3 mr-1" />}
                {planName}
              </Badge>
              <span className="text-2xl font-bold">
                {formatPrice(planConfig?.price || 0)}/month
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Active
            </div>
          </div>

          {/* Plan Features */}
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {planConfig?.features.portfolios === -1
                  ? 'Unlimited portfolios'
                  : `${planConfig?.features.portfolios} portfolios`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>
                {planConfig?.features.aiRequests === -1
                  ? 'Unlimited AI requests'
                  : `${planConfig?.features.aiRequests} AI requests/month`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>
                {planConfig?.features.analytics
                  ? 'Advanced analytics'
                  : 'Basic analytics'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span>
                {planConfig?.features.customDomain
                  ? 'Custom domain'
                  : 'Subdomain only'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Portfolio Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Portfolio Usage
            </CardTitle>
            <CardDescription>
              {limits?.current_usage.portfolios} of{' '}
              {limits?.limits.max_portfolios === -1
                ? 'unlimited'
                : limits?.limits.max_portfolios}{' '}
              used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={portfolioUsagePercentage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{limits?.current_usage.portfolios} portfolios</span>
                <span>
                  {limits?.limits.max_portfolios === -1
                    ? '∞'
                    : limits?.limits.max_portfolios}{' '}
                  limit
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Usage This Month
            </CardTitle>
            <CardDescription>
              {limits?.current_usage.ai_requests} of{' '}
              {limits?.limits.max_ai_requests === -1
                ? 'unlimited'
                : limits?.limits.max_ai_requests}{' '}
              used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={aiUsagePercentage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{limits?.current_usage.ai_requests} requests</span>
                <span>
                  {limits?.limits.max_ai_requests === -1
                    ? '∞'
                    : limits?.limits.max_ai_requests}{' '}
                  limit
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Options */}
      {isFreeTier && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Upgrade Your Plan
                </h2>
                <p className="text-muted-foreground">
                  Unlock more features and higher limits with a paid plan
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={
                    billingInterval === 'monthly' ? 'default' : 'outline'
                  }
                  onClick={() => setBillingInterval('monthly')}
                  size="sm"
                >
                  Monthly
                </Button>
                <Button
                  variant={billingInterval === 'yearly' ? 'default' : 'outline'}
                  onClick={() => setBillingInterval('yearly')}
                  size="sm"
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2">
                    Save 20%
                  </Badge>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {(['pro', 'business', 'enterprise'] as const).map(planId => {
                const plan = PLAN_CONFIG[planId];
                return (
                  <Card key={planId} className="relative">
                    {planId === 'pro' && (
                      <Badge className="absolute -top-2 left-4">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold">
                        {billingInterval === 'yearly' ? (
                          <>
                            {formatPrice(plan.price * 12 * 0.8)}/year
                            <div className="text-sm font-normal text-muted-foreground">
                              {formatPrice(plan.price * 0.8)}/month billed
                              yearly
                            </div>
                          </>
                        ) : (
                          <>{formatPrice(plan.price)}/month</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {plan.features.portfolios === -1
                            ? 'Unlimited portfolios'
                            : `${plan.features.portfolios} portfolios`}
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {plan.features.aiRequests === -1
                            ? 'Unlimited AI requests'
                            : `${plan.features.aiRequests} AI requests`}
                        </li>
                        {plan.features.customDomain && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Custom domain
                          </li>
                        )}
                        {plan.features.analytics && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Advanced analytics
                          </li>
                        )}
                        {plan.features.prioritySupport && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Priority support
                          </li>
                        )}
                      </ul>
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(planId)}
                        disabled={isUpgrading === planId}
                      >
                        {isUpgrading === planId
                          ? 'Processing...'
                          : `Upgrade to ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* AI Credit Packs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">AI Enhancement Credits</h2>
        </div>
        <AICreditPacks
          currentCredits={aiCredits}
          onPurchase={handlePurchaseCreditPack}
        />
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Have questions about billing or need assistance?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            href="/support"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Contact Support
          </Link>
          <Link
            href="/docs/billing"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Billing Documentation
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BaseLayout>
        <div className="pt-24">
          <BillingContent />
        </div>
      </BaseLayout>
    </ProtectedRoute>
  );
}
