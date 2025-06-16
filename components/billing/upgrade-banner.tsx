/**
 * Upgrade Banner Component
 *
 * A banner that shows upgrade prompts based on usage limits.
 * Can be used inline in forms or as a notification banner.
 */

'use client';

import { useState } from 'react';
import { AlertCircle, Crown, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  createCheckoutSession,
  formatPrice,
  PLAN_CONFIG,
} from '@/lib/stripe/client';
import { useToast } from '@/hooks/use-toast';

interface UpgradeBannerProps {
  type: 'ai_limit' | 'portfolio_limit' | 'feature_locked';
  title?: string;
  description?: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UpgradeBanner({
  type,
  title,
  description,
  showDismiss = true,
  onDismiss,
  className = '',
  size = 'md',
}: UpgradeBannerProps) {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

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

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getContent = () => {
    switch (type) {
      case 'ai_limit':
        return {
          title: title || 'AI Limit Reached',
          description:
            description ||
            "You've used all your AI enhancements this month. Upgrade to continue.",
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          variant: 'warning' as const,
        };
      case 'portfolio_limit':
        return {
          title: title || 'Portfolio Limit Reached',
          description:
            description ||
            "You've reached your portfolio limit. Upgrade to create more.",
          icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
          variant: 'info' as const,
        };
      case 'feature_locked':
        return {
          title: title || 'Premium Feature',
          description:
            description || 'This feature is available on paid plans only.',
          icon: <Crown className="h-5 w-5 text-purple-500" />,
          variant: 'premium' as const,
        };
      default:
        return {
          title: title || 'Upgrade Your Plan',
          description:
            description || 'Unlock more features with a premium plan.',
          icon: <Crown className="h-5 w-5 text-purple-500" />,
          variant: 'default' as const,
        };
    }
  };

  if (isDismissed) return null;

  const content = getContent();
  const proPrice = formatPrice(PLAN_CONFIG.pro.price);

  const sizeClasses = {
    sm: 'text-sm p-3',
    md: 'text-sm p-4',
    lg: 'text-base p-6',
  };

  const buttonSizes = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'default' as const,
  };

  return (
    <Card className={`border-l-4 border-l-primary ${className}`}>
      <CardContent className={`${sizeClasses[size]} flex items-start gap-3`}>
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{content.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                {content.title}
                <Badge variant="outline" className="text-xs">
                  Pro Feature
                </Badge>
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {content.description}
              </p>
            </div>

            {/* Dismiss button */}
            {showDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-6 w-6"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size={buttonSizes[size]}
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="flex items-center gap-1"
            >
              {isUpgrading ? (
                'Processing...'
              ) : (
                <>
                  Upgrade to Pro {proPrice}/mo
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size={buttonSizes[size]}
              onClick={() => window.open('/pricing', '_blank')}
            >
              View all plans
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline upgrade prompt for form inputs
 */
export function InlineUpgradePrompt({
  feature,
  className = '',
}: {
  feature: string;
  className?: string;
}) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

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

  return (
    <div
      className={`flex items-center justify-between p-3 bg-muted rounded-lg border-2 border-dashed ${className}`}
    >
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-purple-500" />
        <span className="text-sm text-muted-foreground">
          {feature} is a Pro feature
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleUpgrade}
        disabled={isUpgrading}
      >
        {isUpgrading ? 'Processing...' : 'Upgrade'}
      </Button>
    </div>
  );
}
