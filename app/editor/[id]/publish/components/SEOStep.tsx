'use client';

import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Portfolio } from '@/types/portfolio';

interface SEOStepProps {
  publishData: {
    subdomain: string;
    seo: {
      title: string;
      description: string;
      keywords: string;
    };
  };
  setPublishData: (data: typeof publishData) => void;
  currentPortfolio: Portfolio | null;
  onNext: () => void;
  onBack: () => void;
  t: Record<string, string | undefined>; // Translation object
}

export function SEOStep({
  publishData,
  setPublishData,
  currentPortfolio,
  onNext,
  onBack,
  t,
}: SEOStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.seoSettings || 'SEO Settings'}
        </h2>
        <p className="text-muted-foreground">
          {t.seoDescription ||
            'Help people find your portfolio on search engines'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="seoTitle">{t.pageTitle || 'Page Title'}</Label>
          <Input
            id="seoTitle"
            value={publishData.seo.title}
            onChange={e =>
              setPublishData({
                ...publishData,
                seo: { ...publishData.seo, title: e.target.value },
              })
            }
            placeholder={t.seoTitlePlaceholder || 'John Doe - Senior Developer'}
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {publishData.seo.title.length}/60 {t.characters || 'characters'}
          </p>
        </div>

        <div>
          <Label htmlFor="seoDescription">
            {t.metaDescription || 'Meta Description'}
          </Label>
          <Textarea
            id="seoDescription"
            value={publishData.seo.description}
            onChange={e =>
              setPublishData({
                ...publishData,
                seo: { ...publishData.seo, description: e.target.value },
              })
            }
            placeholder={
              t.seoDescriptionPlaceholder ||
              'A brief description of your professional background and expertise...'
            }
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {publishData.seo.description.length}/160{' '}
            {t.characters || 'characters'}
          </p>
        </div>

        <div>
          <Label htmlFor="seoKeywords">{t.keywords || 'Keywords'}</Label>
          <Input
            id="seoKeywords"
            value={publishData.seo.keywords}
            onChange={e =>
              setPublishData({
                ...publishData,
                seo: { ...publishData.seo, keywords: e.target.value },
              })
            }
            placeholder={
              t.keywordsPlaceholder || 'web developer, react, portfolio'
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t.keywordsHint || 'Separate keywords with commas'}
          </p>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t.searchPreview || 'Search Preview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
              {publishData.seo.title || currentPortfolio?.name}
            </p>
            <p className="text-sm text-green-600">
              https://{publishData.subdomain}.prisma.madfam.io
            </p>
            <p className="text-sm text-muted-foreground">
              {publishData.seo.description ||
                currentPortfolio?.bio ||
                t.noDescription ||
                'No description provided'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.back || 'Back'}
        </Button>
        <Button onClick={onNext}>{t.continue || 'Continue'}</Button>
      </div>
    </div>
  );
}
