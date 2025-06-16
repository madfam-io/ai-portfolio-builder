'use client';

import {
  ArrowLeft,
  Globe,
  Search,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Portfolio } from '@/types/portfolio';

interface ReviewStepProps {
  publishData: {
    subdomain: string;
    seo: {
      title: string;
      description: string;
      keywords: string;
    };
  };
  currentPortfolio: Portfolio | null;
  isPublishing: boolean;
  onPublish: () => void;
  onBack: () => void;
  t: any; // Translation object
}

export function ReviewStep({
  publishData,
  currentPortfolio,
  isPublishing,
  onPublish,
  onBack,
  t,
}: ReviewStepProps) {
  const isReadyToPublish = () => {
    if (!currentPortfolio) return false;

    // Check if portfolio has minimum required content
    const hasBasicInfo = currentPortfolio.title && currentPortfolio.bio;
    const hasContent =
      (currentPortfolio.experience?.length || 0) > 0 ||
      (currentPortfolio.projects?.length || 0) > 0 ||
      (currentPortfolio.education?.length || 0) > 0;
    return hasBasicInfo && hasContent;
  };

  const ready = isReadyToPublish();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.reviewAndPublish || 'Review and Publish'}
        </h2>
        <p className="text-muted-foreground">
          {t.reviewDescription || 'Review your settings before publishing'}
        </p>
      </div>

      {!ready && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              {t.incompletePortfolio || 'Incomplete Portfolio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-2">
              {t.incompleteMessage ||
                'Your portfolio needs more content before publishing:'}
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              {!currentPortfolio?.title && (
                <li>• {t.missingTitle || 'Add a professional title'}</li>
              )}
              {!currentPortfolio?.bio && (
                <li>• {t.missingBio || 'Add a bio/description'}</li>
              )}
              {!currentPortfolio?.experience?.length &&
                !currentPortfolio?.projects?.length &&
                !currentPortfolio?.education?.length && (
                  <li>
                    •{' '}
                    {t.missingContent ||
                      'Add at least one experience, project, or education entry'}
                  </li>
                )}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.webAddress || 'Web Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">
              https://{publishData.subdomain}.prisma.madfam.io
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              {t.seoSettings || 'SEO Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.title || 'Title'}
              </p>
              <p className="text-sm">{publishData.seo.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.description || 'Description'}
              </p>
              <p className="text-sm">{publishData.seo.description}</p>
            </div>
            {publishData.seo.keywords && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.keywords || 'Keywords'}
                </p>
                <p className="text-sm">{publishData.seo.keywords}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t.whatHappensNext || 'What happens next?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>
                  {t.publishStep1 || 'Your portfolio will be live immediately'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>
                  {t.publishStep2 ||
                    'Search engines will start indexing your portfolio'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>
                  {t.publishStep3 || 'You can update your portfolio anytime'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.back || 'Back'}
        </Button>
        <Button
          onClick={onPublish}
          disabled={!ready || isPublishing}
          className="min-w-[120px]"
        >
          {isPublishing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
              {t.publishing || 'Publishing...'}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t.publishPortfolio || 'Publish Portfolio'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
