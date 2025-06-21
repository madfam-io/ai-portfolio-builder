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

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { useAuthStore } from '@/lib/store/auth-store';
import { useSubscription } from '@/lib/hooks/use-subscription';

// eslint-disable-next-line complexity
export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user: _user } = useAuthStore();
  const { refresh: refetch } = useSubscription();

  const [isVerifying, setIsVerifying] = useState(true);

  const [planName, setPlanName] = useState<string>('');

  useEffect(() => {
    // Get session_id from URL
    const session = searchParams.get('session_id');

    // Trigger confetti animation
    const triggerConfetti = () => {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(
        particleRatio: number,
        opts: Record<string, number | boolean>
      ) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    };

    // Verify payment and update subscription status
    const verifyPayment = async () => {
      if (!session) {
        setIsVerifying(false);
        return;
      }

      try {
        // Call API to verify the session
        const response = await fetch(`/api/v1/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session }),
        });

        if (response.ok) {
          const data = await response.json();
          setPlanName(data.planName || 'Pro');

          // Refresh subscription limits
          await refetch();

          // Trigger celebration
          setTimeout(triggerConfetti, 500);

          toast({
            title: t.paymentSuccessful || 'Payment Successful!',
            description:
              t.subscriptionActivated ||
              'Your subscription has been activated.',
          });
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (_error) {
        // Payment verification error
        toast({
          title: t.verificationFailed || 'Verification Failed',
          description:
            t.contactSupport || 'Please contact support if you were charged.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, refetch, t, toast]);

  const features = {
    pro: [
      { icon: '🚀', text: t.unlimitedPortfolios || 'Unlimited portfolios' },
      { icon: '✨', text: t.aiEnhancements || 'AI-powered enhancements' },
      { icon: '🎨', text: t.premiumTemplates || 'Premium templates' },
      { icon: '📊', text: t.advancedAnalytics || 'Advanced analytics' },
      { icon: '🌐', text: t.customDomains || 'Custom domain support' },
      { icon: '💬', text: t.prioritySupport || 'Priority support' },
    ],
    business: [
      { icon: '🚀', text: t.everythingInPro || 'Everything in Pro' },
      { icon: '👥', text: t.teamCollaboration || 'Team collaboration' },
      { icon: '🔒', text: t.advancedSecurity || 'Advanced security' },
      { icon: '📈', text: t.businessAnalytics || 'Business analytics' },
      { icon: '🎯', text: t.whiteLabel || 'White-label options' },
      { icon: '🛡️', text: t.sla || 'SLA guarantee' },
    ],
  };

  if (isVerifying) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t.verifyingPayment || 'Verifying your payment...'}
                </h3>
                <p className="text-muted-foreground">
                  {t.pleaseWait ||
                    'Please wait while we confirm your subscription.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="h-20 w-20 text-green-500" />
                  <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-3xl">
                {t.welcomeToPro || `Welcome to ${planName || 'Pro'}!`}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {t.thankYouForUpgrading ||
                  'Thank you for upgrading your account'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* What's Next Section */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t.whatsNext || "What's next?"}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-primary mr-3">1.</span>
                    <div>
                      <p className="font-medium">
                        {t.exploreFeatures || 'Explore your new features'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.checkOutPremium ||
                          'Check out all the premium features now available to you'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary mr-3">2.</span>
                    <div>
                      <p className="font-medium">
                        {t.createMorePortfolios ||
                          'Create unlimited portfolios'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.noMoreLimits ||
                          'No more limits on the number of portfolios you can create'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary mr-3">3.</span>
                    <div>
                      <p className="font-medium">
                        {t.setupCustomDomain || 'Set up a custom domain'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.connectYourDomain ||
                          'Connect your own domain for a professional look'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div>
                <h3 className="font-semibold mb-4">
                  {t.yourNewFeatures || 'Your new features'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(
                    features[planName.toLowerCase() as keyof typeof features] ||
                    features.pro
                  ).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-2xl mr-3">{feature.icon}</span>
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                  size="lg"
                >
                  {t.goToDashboard || 'Go to Dashboard'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push('/editor/new')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  {t.createNewPortfolio || 'Create New Portfolio'}
                </Button>
              </div>

              {/* Support Info */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>
                  {t.needHelp || 'Need help?'}{' '}
                  <a href="/support" className="text-primary hover:underline">
                    {t.contactSupport || 'Contact support'}
                  </a>{' '}
                  {t.or || 'or'}{' '}
                  <a href="/docs" className="text-primary hover:underline">
                    {t.viewDocs || 'view documentation'}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}
