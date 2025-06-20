/**
 * Upgrade Modal Component
 *
 * A modal that appears when users hit plan limits, encouraging them to upgrade.
 * Shows plan comparison and provides quick upgrade options.
 */

'use client';

import { useState } from 'react';
import { X, Check, Crown, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createCheckoutSession,
  PLAN_CONFIG,
  formatPrice,
} from '@/lib/stripe/client';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'ai_limit' | 'portfolio_limit';
  currentPlan: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason,
  currentPlan,
}: UpgradeModalProps) {
  const { t: _t } = useLanguage();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: 'pro' | 'business' | 'enterprise') => {
    setIsUpgrading(planId);

    try {
      const result = await createCheckoutSession({ planId });

      if (!result.success) {
        toast({
          title: 'Upgrade Failed',
          description: result.error || 'Failed to start upgrade process',
          variant: 'destructive',
        });
      }
      // If successful, user will be redirected to Stripe
    } catch (_error) {
      toast({
        title: 'Upgrade Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(null);
    }
  };

  const getModalContent = () => {
    switch (reason) {
      case 'ai_limit':
        return {
          title: 'AI Usage Limit Reached',
          description:
            "You've reached your monthly AI enhancement limit. Upgrade to continue using AI features.",
          icon: <Zap className="h-8 w-8 text-yellow-500" />,
          benefit: 'Get more AI enhancements per month',
        };
      case 'portfolio_limit':
        return {
          title: 'Portfolio Limit Reached',
          description:
            "You've reached your portfolio creation limit. Upgrade to create more portfolios.",
          icon: <Users className="h-8 w-8 text-blue-500" />,
          benefit: 'Create more professional portfolios',
        };
      default:
        return {
          title: 'Upgrade Your Plan',
          description: 'Unlock more features with a paid plan.',
          icon: <Crown className="h-8 w-8 text-purple-500" />,
          benefit: 'Access premium features',
        };
    }
  };

  const content = getModalContent();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">{content.icon}</div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
            <p className="text-muted-foreground">{content.description}</p>
          </CardHeader>

          <CardContent>
            {/* Current Plan */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Current Plan:{' '}
                    {PLAN_CONFIG[currentPlan as keyof typeof PLAN_CONFIG]
                      ?.name || 'Free'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {content.benefit}
                  </p>
                </div>
                <Badge variant="secondary">Current</Badge>
              </div>
            </div>

            {/* Upgrade Options */}
            <div className="grid gap-4 md:grid-cols-3">
              {(['pro', 'business', 'enterprise'] as const).map(planId => {
                const plan = PLAN_CONFIG[planId];
                const isRecommended = planId === 'pro';

                return (
                  <Card
                    key={planId}
                    className={`relative ${isRecommended ? 'ring-2 ring-primary' : ''}`}
                  >
                    {isRecommended && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Recommended
                      </Badge>
                    )}

                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="text-2xl font-bold">
                        {formatPrice(plan.price)}/month
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {plan.features.portfolios === -1
                            ? 'Unlimited portfolios'
                            : `${plan.features.portfolios} portfolios`}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {plan.features.aiRequests === -1
                            ? 'Unlimited AI requests'
                            : `${plan.features.aiRequests} AI requests/month`}
                        </li>
                        {plan.features.customDomain && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Custom domain
                          </li>
                        )}
                        {plan.features.analytics && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Advanced analytics
                          </li>
                        )}
                        {plan.features.prioritySupport && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Priority support
                          </li>
                        )}
                      </ul>

                      <Button
                        className="w-full"
                        variant={isRecommended ? 'default' : 'outline'}
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

            {/* Benefits section */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-semibold mb-2">Why upgrade?</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  Immediate access to all features
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  7-day free trial on all plans
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  Cancel anytime, no questions asked
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  30-day money-back guarantee
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={onClose}>
                Maybe later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
