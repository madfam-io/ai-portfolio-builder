'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioStore } from '@/lib/store/portfolio-store';

// Import step components
import { SubdomainStep } from './components/SubdomainStep';
import { SEOStep } from './components/SEOStep';
import { ReviewStep } from './components/ReviewStep';
import { ProgressIndicator } from './components/ProgressIndicator';

// Import utilities
import { generateSubdomain } from './utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

function PublishContent({ params }: PageProps) {
  const { id: portfolioId } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { loadPortfolio, updatePortfolio, currentPortfolio } =
    usePortfolioStore();

  const [step, setStep] = useState<'subdomain' | 'seo' | 'review'>('subdomain');
  const [isPublishing, setIsPublishing] = useState(false);

  const [publishData, setPublishData] = useState({
    subdomain: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
    },
  });

  useEffect(() => {
    if (portfolioId) {
      loadPortfolio(portfolioId)
        .then(() => {
          if (currentPortfolio) {
            setPublishData({
              subdomain:
                currentPortfolio.subdomain ||
                generateSubdomain(currentPortfolio.name),
              seo: {
                title: `${currentPortfolio.title} - ${currentPortfolio.name}`,
                description: currentPortfolio.bio || '',
                keywords: '',
              },
            });
          }
        })
        .catch(_error => {
          toast({
            title: t.error || 'Error',
            description: t.failedToLoadPortfolio || 'Failed to load portfolio',
            variant: 'destructive',
          });
        });
    }
  }, [portfolioId, loadPortfolio, currentPortfolio?.id]);

  const handleStepChange = (newStep: 'subdomain' | 'seo' | 'review') => {
    setStep(newStep);
  };

  const handlePublish = async () => {
    if (!currentPortfolio) return;

    setIsPublishing(true);
    try {
      await updatePortfolio(currentPortfolio.id, {
        subdomain: publishData.subdomain,
        status: 'published',
        publishedAt: new Date(),
        data: {
          ...currentPortfolio.data,
          seoTitle: publishData.seo.title,
          seoDescription: publishData.seo.description,
          seoKeywords: publishData.seo.keywords,
        },
      });

      toast({
        title: t.success || 'Success',
        description:
          t.portfolioPublished ||
          'Your portfolio has been published successfully!',
      });

      // Redirect to the public portfolio
      window.open(
        `${window.location.origin}/p/${publishData.subdomain}`,
        '_blank'
      );
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description:
          t.failedToPublish || 'Failed to publish portfolio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentPortfolio) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t.portfolioNotFound || 'Portfolio not found'}
            </h2>
            <Button onClick={() => router.push('/dashboard')}>
              {t.backToDashboard || 'Back to Dashboard'}
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }


  const renderStep = () => {
    switch (step) {
      case 'subdomain':
        return (
          <SubdomainStep
            publishData={publishData}
            setPublishData={setPublishData}
            currentPortfolio={currentPortfolio}
            onNext={() => handleStepChange('seo')}
            onBack={() => router.push(`/editor/${portfolioId}`)}
            t={t}
          />
        );

      case 'seo':
        return (
          <SEOStep
            publishData={publishData}
            setPublishData={setPublishData}
            currentPortfolio={currentPortfolio}
            onNext={() => handleStepChange('review')}
            onBack={() => handleStepChange('subdomain')}
            t={t}
          />
        );

      case 'review':
        return (
          <ReviewStep
            publishData={publishData}
            currentPortfolio={currentPortfolio}
            isPublishing={isPublishing}
            onPublish={handlePublish}
            onBack={() => handleStepChange('seo')}
            t={t}
          />
        );
    }
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
          {/* Progress Indicator */}
          <ProgressIndicator currentStep={step} t={t} />

          {/* Main Content */}
          <Card>
            <CardContent className="pt-6">{renderStep()}</CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}

export default function PublishPage(props: PageProps) {
  return (
    <ProtectedRoute>
      <PublishContent {...props} />
    </ProtectedRoute>
  );
}
