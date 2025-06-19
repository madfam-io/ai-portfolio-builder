'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, HelpCircle, MessageCircle } from 'lucide-react';

import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function PaymentCancel() {
  const router = useRouter();
  const { t } = useLanguage();

  const reasons = [
    {
      icon: '💰',
      title: t.tooExpensive || 'Too expensive?',
      description: t.contactForDiscount || 'Contact us for special discounts or custom pricing',
      action: () => window.location.href = 'mailto:support@prisma.madfam.io?subject=Pricing Inquiry',
    },
    {
      icon: '🤔',
      title: t.notSureYet || 'Not sure yet?',
      description: t.tryFreeFeatures || 'Continue using our free features and upgrade anytime',
      action: () => router.push('/dashboard'),
    },
    {
      icon: '🛠️',
      title: t.technicalIssues || 'Technical issues?',
      description: t.helpWithPayment || 'Our support team can help you complete your purchase',
      action: () => window.location.href = '/support',
    },
    {
      icon: '📊',
      title: t.needMoreInfo || 'Need more information?',
      description: t.comparePlans || 'Compare all features across our pricing plans',
      action: () => router.push('/pricing'),
    },
  ];

  return (
    <BaseLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <XCircle className="h-20 w-20 text-yellow-500" />
              </div>
              <CardTitle className="text-3xl">
                {t.paymentCanceled || 'Payment Canceled'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {t.noCharges || "Don't worry, you haven't been charged"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Reasons Section */}
              <div>
                <h3 className="font-semibold mb-4 text-center">
                  {t.canWeHelp || 'Can we help?'}
                </h3>
                <div className="grid gap-4">
                  {reasons.map((reason, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={reason.action}
                    >
                      <span className="text-3xl mr-4 mt-1">{reason.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{reason.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {reason.description}
                        </p>
                      </div>
                      <ArrowLeft className="h-5 w-5 text-muted-foreground transform rotate-180 mt-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* What You're Missing */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">
                  {t.whatYoureMissing || "What you're missing out on"}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="text-primary mr-2">✓</span>
                    {t.unlimitedPortfolios || 'Unlimited portfolio creation'}
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-primary mr-2">✓</span>
                    {t.aiPoweredFeatures || 'AI-powered content enhancement'}
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-primary mr-2">✓</span>
                    {t.customDomainSupport || 'Custom domain support'}
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-primary mr-2">✓</span>
                    {t.advancedAnalytics || 'Advanced analytics and insights'}
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="text-primary mr-2">✓</span>
                    {t.prioritySupport || 'Priority customer support'}
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => router.push('/pricing')}
                  className="flex-1"
                  size="lg"
                >
                  {t.tryAgain || 'Try Again'}
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.backToDashboard || 'Back to Dashboard'}
                </Button>
              </div>

              {/* Contact Support */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  {t.questionsOrConcerns || 'Have questions or concerns?'}
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/support'}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    {t.visitSupport || 'Visit Support'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = 'mailto:support@prisma.madfam.io'}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t.emailUs || 'Email Us'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Offer */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <span className="text-4xl mb-3 block">🎁</span>
                <h4 className="font-semibold mb-2">
                  {t.specialOffer || 'Special Offer'}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.getDiscount || 'Get 20% off your first month with code COMEBACK20'}
                </p>
                <Button
                  onClick={() => {
                    // Store the promo code and redirect to pricing
                    localStorage.setItem('promoCode', 'COMEBACK20');
                    router.push('/pricing');
                  }}
                  variant="secondary"
                  size="sm"
                >
                  {t.claimOffer || 'Claim Offer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}