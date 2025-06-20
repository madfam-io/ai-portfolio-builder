'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Monitor, Tablet, Smartphone } from 'lucide-react';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { useLanguage } from '@/lib/i18n/refactored-context';
import { useAuthStore } from '@/lib/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { DeveloperTemplate } from '@/components/templates/DeveloperTemplate';
import { DesignerTemplate } from '@/components/templates/DesignerTemplate';
import { ConsultantTemplate } from '@/components/templates/ConsultantTemplate';
import { generateSamplePortfolio } from '@/lib/utils/sampleData';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ templateId: string }>;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

// Premium template mock data - would come from API/database
const PREMIUM_TEMPLATE_DATA = {
  'executive-suite': {
    name: 'Executive Suite',
    price: 2900,
    category: 'business',
    templateType: 'consultant', // Uses consultant template as base
    customData: {
      headline: 'Chief Executive Officer',
      tagline: 'Transforming Industries Through Strategic Leadership',
      sections: {
        achievements: [
          'Led $500M acquisition resulting in 40% market share increase',
          'Transformed company culture, improving employee satisfaction by 60%',
          'Launched innovative product line generating $200M in first year',
        ],
        boardPositions: [
          {
            company: 'Tech Innovations Inc.',
            role: 'Board Member',
            years: '2020-Present',
          },
          {
            company: 'Global Finance Corp.',
            role: 'Advisory Board',
            years: '2019-Present',
          },
        ],
      },
    },
  },
  'startup-founder': {
    name: 'Startup Founder',
    price: 1900,
    category: 'business',
    templateType: 'developer',
    customData: {
      headline: 'Serial Entrepreneur & Tech Visionary',
      tagline: 'Building the Future, One Startup at a Time',
    },
  },
  'creative-director': {
    name: 'Creative Director',
    price: 2400,
    category: 'creative',
    templateType: 'designer',
    customData: {
      headline: 'Award-Winning Creative Director',
      tagline: 'Crafting Visual Stories That Inspire',
    },
  },
};

export default function TemplatePreviewPage({ params }: PageProps) {
  const { templateId } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const templateData =
    PREMIUM_TEMPLATE_DATA[templateId as keyof typeof PREMIUM_TEMPLATE_DATA];

  if (!templateData) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Template not found</h2>
            <Button onClick={() => router.push('/templates')}>
              Back to Templates
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Generate sample portfolio with premium template customizations
  const samplePortfolio = {
    ...generateSamplePortfolio(
      templateData.templateType as 'developer' | 'designer' | 'consultant'
    ),
    ...templateData.customData,
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase this template',
        variant: 'default',
      });
      router.push('/auth/login?redirect=/templates/preview/' + templateId);
      return;
    }

    setIsPurchasing(true);
    try {
      // TODO: Implement Stripe checkout for template purchase
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Purchase initiated',
        description: 'Redirecting to checkout...',
      });
    } catch (_error) {
      toast({
        title: 'Purchase failed',
        description: 'Unable to process purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderTemplate = () => {
    switch (templateData.templateType) {
      case 'developer':
        return <DeveloperTemplate portfolio={samplePortfolio} />;
      case 'designer':
        return <DesignerTemplate portfolio={samplePortfolio} />;
      case 'consultant':
      default:
        return <ConsultantTemplate portfolio={samplePortfolio} />;
    }
  };

  const getPreviewClasses = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-[375px] mx-auto';
      case 'tablet':
        return 'max-w-[768px] mx-auto';
      default:
        return 'w-full';
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/templates">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-lg font-semibold">{templateData.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{templateData.category}</Badge>
                    <span>•</span>
                    <span>Premium Template</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Preview Mode Selector */}
                <div className="hidden md:flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('desktop')}
                    className="h-8 px-2"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('tablet')}
                    className="h-8 px-2"
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('mobile')}
                    className="h-8 px-2"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>

                {/* Purchase Button */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatPrice(templateData.price)}
                    </div>
                  </div>
                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    size="lg"
                  >
                    {isPurchasing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Purchase Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-100 dark:bg-gray-900 min-h-[600px] overflow-y-auto">
                  <div
                    className={cn(
                      'bg-white dark:bg-gray-800 min-h-full shadow-xl transition-all duration-300',
                      getPreviewClasses()
                    )}
                  >
                    {renderTemplate()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Info */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{`What's Included`}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>&bull; Full template source code</li>
                    <li>&bull; Lifetime updates</li>
                    <li>&bull; Premium support</li>
                    <li>&bull; Commercial license</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Perfect For</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>&bull; Senior executives</li>
                    <li>&bull; Industry leaders</li>
                    <li>&bull; Established professionals</li>
                    <li>&bull; Premium personal branding</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Features</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>&bull; Responsive design</li>
                    <li>&bull; SEO optimized</li>
                    <li>&bull; Fast loading</li>
                    <li>&bull; Accessibility compliant</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
