'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Search, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

function PublishContent({ params }: PageProps) {
  const { id: portfolioId } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { loadPortfolio, updatePortfolio, currentPortfolio } = usePortfolioStore();

  const [step, setStep] = useState<'subdomain' | 'seo' | 'review'>('subdomain');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  
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
      loadPortfolio(portfolioId).then(() => {
        if (currentPortfolio) {
          setPublishData({
            subdomain: currentPortfolio.subdomain || generateSubdomain(currentPortfolio.name),
            seo: {
              title: `${currentPortfolio.title} - ${currentPortfolio.name}`,
              description: currentPortfolio.bio || '',
              keywords: '',
            },
          });
        }
      }).catch(console.error);
    }
  }, [portfolioId, loadPortfolio, currentPortfolio?.id]);

  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const checkSubdomainAvailability = async () => {
    if (!publishData.subdomain || publishData.subdomain.length < 3) {
      setSubdomainAvailable(false);
      return;
    }

    setIsCheckingSubdomain(true);
    try {
      const response = await fetch('/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: publishData.subdomain,
          currentPortfolioId: currentPortfolio?.id,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubdomainAvailable(data.data.available);
      } else {
        setSubdomainAvailable(false);
      }
    } catch (error) {
      
      setSubdomainAvailable(false);
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+/, '');
    
    setPublishData({ ...publishData, subdomain: cleaned });
    setSubdomainAvailable(null);
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
          seo: publishData.seo,
        },
      });

      toast({
        title: t.success || 'Success',
        description: t.portfolioPublished || 'Your portfolio has been published successfully!',
      });

      // Redirect to the public portfolio
      window.open(`${window.location.origin}/p/${publishData.subdomain}`, '_blank');
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToPublish || 'Failed to publish portfolio. Please try again.',
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
            <h2 className="text-2xl font-bold mb-4">{t.portfolioNotFound || 'Portfolio not found'}</h2>
            <Button onClick={() => router.push('/dashboard')}>
              {t.backToDashboard || 'Back to Dashboard'}
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const isReadyToPublish = () => {
    // Check if portfolio has minimum required content
    const hasBasicInfo = currentPortfolio.title && currentPortfolio.bio;
    const hasContent = (currentPortfolio.experience?.length || 0) > 0 || 
                      (currentPortfolio.projects?.length || 0) > 0 ||
                      (currentPortfolio.education?.length || 0) > 0;
    return hasBasicInfo && hasContent;
  };

  const renderStep = () => {
    switch (step) {
      case 'subdomain':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t.chooseYourWebAddress || 'Choose your web address'}
              </h2>
              <p className="text-muted-foreground">
                {t.subdomainDescription || 'This will be your portfolio\'s public URL'}
              </p>
            </div>

            <div>
              <Label htmlFor="subdomain">{t.subdomain || 'Subdomain'}</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 relative">
                  <Input
                    id="subdomain"
                    value={publishData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    onBlur={checkSubdomainAvailability}
                    placeholder="yourname"
                    className={cn(
                      "pr-10",
                      subdomainAvailable === true && "border-green-500",
                      subdomainAvailable === false && "border-red-500"
                    )}
                  />
                  {isCheckingSubdomain && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                  {!isCheckingSubdomain && subdomainAvailable === true && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {!isCheckingSubdomain && subdomainAvailable === false && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                <span className="text-muted-foreground">.prisma.madfam.io</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t.subdomainHint || 'Use letters, numbers, and hyphens. At least 3 characters.'}
              </p>
              {subdomainAvailable === false && (
                <p className="text-sm text-red-500 mt-1">
                  {t.subdomainTaken || 'This subdomain is already taken or reserved'}
                </p>
              )}
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-1">{t.yourPortfolioUrl || 'Your portfolio URL will be:'}</p>
              <p className="text-lg font-mono">
                https://{publishData.subdomain || 'yourname'}.prisma.madfam.io
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/editor/${portfolioId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToEditor || 'Back to Editor'}
              </Button>
              <Button
                onClick={() => setStep('seo')}
                disabled={!publishData.subdomain || subdomainAvailable === false}
              >
                {t.continue || 'Continue'}
              </Button>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t.seoSettings || 'SEO Settings'}
              </h2>
              <p className="text-muted-foreground">
                {t.seoDescription || 'Help people find your portfolio on search engines'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">{t.pageTitle || 'Page Title'}</Label>
                <Input
                  id="seoTitle"
                  value={publishData.seo.title}
                  onChange={(e) => setPublishData({
                    ...publishData,
                    seo: { ...publishData.seo, title: e.target.value }
                  })}
                  placeholder={t.seoTitlePlaceholder || 'John Doe - Senior Developer'}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {publishData.seo.title.length}/60 {t.characters || 'characters'}
                </p>
              </div>

              <div>
                <Label htmlFor="seoDescription">{t.metaDescription || 'Meta Description'}</Label>
                <Textarea
                  id="seoDescription"
                  value={publishData.seo.description}
                  onChange={(e) => setPublishData({
                    ...publishData,
                    seo: { ...publishData.seo, description: e.target.value }
                  })}
                  placeholder={t.seoDescriptionPlaceholder || 'A brief description of your professional background and expertise...'}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {publishData.seo.description.length}/160 {t.characters || 'characters'}
                </p>
              </div>

              <div>
                <Label htmlFor="seoKeywords">{t.keywords || 'Keywords'}</Label>
                <Input
                  id="seoKeywords"
                  value={publishData.seo.keywords}
                  onChange={(e) => setPublishData({
                    ...publishData,
                    seo: { ...publishData.seo, keywords: e.target.value }
                  })}
                  placeholder={t.keywordsPlaceholder || 'web developer, react, portfolio'}
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
                    {publishData.seo.title || currentPortfolio.name}
                  </p>
                  <p className="text-sm text-green-600">
                    https://{publishData.subdomain}.prisma.madfam.io
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {publishData.seo.description || currentPortfolio.bio || t.noDescription || 'No description provided'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('subdomain')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back || 'Back'}
              </Button>
              <Button
                onClick={() => setStep('review')}
              >
                {t.continue || 'Continue'}
              </Button>
            </div>
          </div>
        );

      case 'review':
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
                    {t.incompleteMessage || 'Your portfolio needs more content before publishing:'}
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {!currentPortfolio.title && (
                      <li>• {t.missingTitle || 'Add a professional title'}</li>
                    )}
                    {!currentPortfolio.bio && (
                      <li>• {t.missingBio || 'Add a bio/description'}</li>
                    )}
                    {(!currentPortfolio.experience?.length && 
                      !currentPortfolio.projects?.length && 
                      !currentPortfolio.education?.length) && (
                      <li>• {t.missingContent || 'Add at least one experience, project, or education entry'}</li>
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
                    <p className="text-sm font-medium text-muted-foreground">{t.title || 'Title'}</p>
                    <p className="text-sm">{publishData.seo.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.description || 'Description'}</p>
                    <p className="text-sm">{publishData.seo.description}</p>
                  </div>
                  {publishData.seo.keywords && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.keywords || 'Keywords'}</p>
                      <p className="text-sm">{publishData.seo.keywords}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.whatHappensNext || 'What happens next?'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t.publishStep1 || 'Your portfolio will be live immediately'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t.publishStep2 || 'Search engines will start indexing your portfolio'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t.publishStep3 || 'You can update your portfolio anytime'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('seo')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back || 'Back'}
              </Button>
              <Button
                onClick={handlePublish}
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
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "flex items-center gap-2",
                step === 'subdomain' ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 'subdomain' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  1
                </div>
                <span className="text-sm">{t.webAddress || 'Web Address'}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2",
                step === 'seo' ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 'seo' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  2
                </div>
                <span className="text-sm">{t.seoSettings || 'SEO'}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2",
                step === 'review' ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 'review' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  3
                </div>
                <span className="text-sm">{t.review || 'Review'}</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: step === 'subdomain' ? '33%' : 
                         step === 'seo' ? '66%' : '100%'
                }}
              />
            </div>
          </div>

          {/* Main Content */}
          <Card>
            <CardContent className="pt-6">
              {renderStep()}
            </CardContent>
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