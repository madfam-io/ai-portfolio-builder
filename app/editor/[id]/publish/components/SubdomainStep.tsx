'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Portfolio } from '@/types/portfolio';

interface SubdomainStepProps {
  publishData: {
    subdomain: string;
    seo: {
      title: string;
      description: string;
      keywords: string;
    };
  };
  setPublishData: (data: any) => void;
  currentPortfolio: Portfolio | null;
  onNext: () => void;
  onBack: () => void;
  t: any; // Translation object
}

export function SubdomainStep({
  publishData,
  setPublishData,
  currentPortfolio,
  onNext,
  onBack,
  t,
}: SubdomainStepProps) {
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(
    null
  );

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.chooseYourWebAddress || 'Choose your web address'}
        </h2>
        <p className="text-muted-foreground">
          {t.subdomainDescription ||
            "This will be your portfolio's public URL"}
        </p>
      </div>

      <div>
        <Label htmlFor="subdomain">{t.subdomain || 'Subdomain'}</Label>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 relative">
            <Input
              id="subdomain"
              value={publishData.subdomain}
              onChange={e => handleSubdomainChange(e.target.value)}
              onBlur={checkSubdomainAvailability}
              placeholder="yourname"
              className={cn(
                'pr-10',
                subdomainAvailable === true && 'border-green-500',
                subdomainAvailable === false && 'border-red-500'
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
          {t.subdomainHint ||
            'Use letters, numbers, and hyphens. At least 3 characters.'}
        </p>
        {subdomainAvailable === false && (
          <p className="text-sm text-red-500 mt-1">
            {t.subdomainTaken ||
              'This subdomain is already taken or reserved'}
          </p>
        )}
      </div>

      <div className="rounded-lg border p-4 bg-muted/50">
        <p className="text-sm font-medium mb-1">
          {t.yourPortfolioUrl || 'Your portfolio URL will be:'}
        </p>
        <p className="text-lg font-mono">
          https://{publishData.subdomain || 'yourname'}.prisma.madfam.io
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToEditor || 'Back to Editor'}
        </Button>
        <Button
          onClick={onNext}
          disabled={!publishData.subdomain || subdomainAvailable === false}
        >
          {t.continue || 'Continue'}
        </Button>
      </div>
    </div>
  );
}