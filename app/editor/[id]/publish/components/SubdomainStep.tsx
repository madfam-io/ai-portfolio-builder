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
  setPublishData: (data: SubdomainStepProps['publishData']) => void;
  currentPortfolio: Portfolio | null;
  onNext: () => void;
  onBack: () => void;
  t: Record<string, string | undefined>; // Translation object
}

// Component for subdomain input field
function SubdomainInput({
  subdomain,
  isChecking,
  isAvailable,
  onSubdomainChange,
  onBlur,
}: {
  subdomain: string;
  isChecking: boolean;
  isAvailable: boolean | null;
  onSubdomainChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div className="flex-1 relative">
      <Input
        id="subdomain"
        value={subdomain}
        onChange={e => onSubdomainChange(e.target.value)}
        onBlur={onBlur}
        placeholder="yourname"
        className={cn(
          'pr-10',
          isAvailable === true && 'border-green-500',
          isAvailable === false && 'border-red-500'
        )}
      />
      {isChecking && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      {!isChecking && isAvailable === true && (
        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
      )}
      {!isChecking && isAvailable === false && (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
      )}
    </div>
  );
}

// Component for subdomain suggestions
function SubdomainSuggestions({
  suggestions,
  onSelectSuggestion,
  t,
}: {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  t: Record<string, string | undefined>;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-sm text-muted-foreground mb-2">
        {t.suggestedAlternatives || 'Try these alternatives:'}
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(suggestion => (
          <button
            key={suggestion}
            onClick={() => onSelectSuggestion(suggestion)}
            className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SubdomainStep({
  publishData,
  setPublishData,
  currentPortfolio: _currentPortfolio,
  onNext,
  onBack,
  t,
}: SubdomainStepProps) {
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const checkSubdomainAvailability = async () => {
    if (!publishData.subdomain || publishData.subdomain.length < 3) {
      setSubdomainAvailable(false);
      setErrorMessage('Subdomain must be at least 3 characters long');
      return;
    }

    setIsCheckingSubdomain(true);
    setErrorMessage('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: publishData.subdomain,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubdomainAvailable(data.available);
        if (!data.available) {
          setErrorMessage(data.error || 'This subdomain is not available');
          setSuggestions(data.suggestions || []);
        }
      } else {
        setSubdomainAvailable(false);
        setErrorMessage(data.error || 'Failed to check subdomain availability');
      }
    } catch (_error) {
      setSubdomainAvailable(false);
      setErrorMessage('Failed to check subdomain availability');
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

  const handleSelectSuggestion = (suggestion: string) => {
    setPublishData({
      ...publishData,
      subdomain: suggestion,
    });
    setSubdomainAvailable(null);
    setSuggestions([]);
    setErrorMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.chooseYourWebAddress || 'Choose your web address'}
        </h2>
        <p className="text-muted-foreground">
          {t.subdomainDescription || "This will be your portfolio's public URL"}
        </p>
      </div>

      <div>
        <Label htmlFor="subdomain">{t.subdomain || 'Subdomain'}</Label>
        <div className="flex items-center gap-2 mt-2">
          <SubdomainInput
            subdomain={publishData.subdomain}
            isChecking={isCheckingSubdomain}
            isAvailable={subdomainAvailable}
            onSubdomainChange={handleSubdomainChange}
            onBlur={checkSubdomainAvailability}
          />
          <span className="text-muted-foreground">.prisma.madfam.io</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t.subdomainHint ||
            'Use letters, numbers, and hyphens. At least 3 characters.'}
        </p>
        {subdomainAvailable === false && (
          <div className="mt-2">
            <p className="text-sm text-red-500">
              {errorMessage ||
                t.subdomainTaken ||
                'This subdomain is already taken or reserved'}
            </p>
            <SubdomainSuggestions
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
              t={t}
            />
          </div>
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
