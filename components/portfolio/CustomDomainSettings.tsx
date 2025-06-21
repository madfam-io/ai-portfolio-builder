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

import { useState } from 'react';
import {
  Globe,
  Plus,
  Trash,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Portfolio } from '@/types/portfolio';

interface CustomDomainSettingsProps {
  portfolio: Portfolio;
  onUpdate: (updates: Partial<Portfolio>) => void;
  isPro?: boolean;
}

interface DomainStatus {
  status: 'pending' | 'active' | 'error';
  message?: string;
  ssl?: boolean;
}

// eslint-disable-next-line complexity
export function CustomDomainSettings({
  portfolio,
  onUpdate,
  isPro = false,
}: CustomDomainSettingsProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [domain, setDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [domainStatus, setDomainStatus] = useState<DomainStatus | null>(null);

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t.copied || 'Copied!',
      description: t.copiedToClipboard || 'Copied to clipboard',
    });
  };

  const handleAddDomain = async () => {
    if (!validateDomain(domain)) {
      toast({
        title: t.invalidDomain || 'Invalid Domain',
        description: t.enterValidDomain || 'Please enter a valid domain name',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Call API to add custom domain
      const response = await fetch(
        `/api/v1/portfolios/${portfolio.id}/custom-domain`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        }
      );

      if (response.ok) {
        await response.json();
        onUpdate({ customDomain: domain });
        setDomainStatus({
          status: 'pending',
          message: t.verifyingDomain || 'Verifying domain configuration...',
        });

        toast({
          title: t.domainAdded || 'Domain Added',
          description:
            t.followDnsInstructions ||
            'Please follow the DNS configuration instructions',
        });

        // Start verification polling
        verifyDomainStatus(domain);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add domain');
      }
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add domain',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
      setDomain('');
    }
  };

  const handleRemoveDomain = async () => {
    setIsRemoving(true);
    try {
      const response = await fetch(
        `/api/v1/portfolios/${portfolio.id}/custom-domain`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        onUpdate({ customDomain: undefined });
        setDomainStatus(null);
        toast({
          title: t.domainRemoved || 'Domain Removed',
          description: t.domainRemovedDesc || 'Custom domain has been removed',
        });
      }
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToRemoveDomain || 'Failed to remove domain',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
      setShowRemoveDialog(false);
    }
  };

  const verifyDomainStatus = (_domain: string) => {
    let attempts = 0;
    const maxAttempts = 10;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/v1/portfolios/${portfolio.id}/custom-domain/status`
        );
        if (response.ok) {
          const status = await response.json();
          setDomainStatus(status);

          if (status.status === 'active') {
            toast({
              title: t.domainActive || 'Domain Active!',
              description:
                t.domainActiveDesc || 'Your custom domain is now active',
            });
          } else if (status.status === 'pending' && attempts < maxAttempts) {
            attempts++;
            setTimeout(checkStatus, 5000); // Check again in 5 seconds
          }
        }
      } catch (_error) {
        // Failed to check domain status
      }
    };

    checkStatus();
  };

  const getDnsRecords = () => {
    const subdomain = portfolio.subdomain || 'portfolio';
    return [
      {
        type: 'CNAME',
        name: '@',
        value: `${subdomain}.prisma.madfam.io`,
        ttl: '300',
      },
      {
        type: 'CNAME',
        name: 'www',
        value: `${subdomain}.prisma.madfam.io`,
        ttl: '300',
      },
    ];
  };

  if (!isPro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t.customDomain || 'Custom Domain'}
          </CardTitle>
          <CardDescription>
            {t.customDomainDesc ||
              'Use your own domain name for your portfolio'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t.proFeatureOnly ||
                'Custom domains are available for Pro subscribers.'}{' '}
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="/pricing">{t.upgradeToPro || 'Upgrade to Pro'}</a>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t.customDomain || 'Custom Domain'}
        </CardTitle>
        <CardDescription>
          {t.customDomainDesc || 'Use your own domain name for your portfolio'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {portfolio.customDomain ? (
          <>
            {/* Current Domain */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Globe className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-lg">
                      {portfolio.customDomain}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {domainStatus?.status === 'active' ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.active || 'Active'}
                        </Badge>
                      ) : domainStatus?.status === 'error' ? (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t.error || 'Error'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {t.pending || 'Pending'}
                        </Badge>
                      )}
                      {domainStatus?.ssl && (
                        <Badge variant="outline">
                          🔒 {t.sslActive || 'SSL Active'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={`https://${portfolio.customDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowRemoveDialog(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {domainStatus?.message && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{domainStatus.message}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* DNS Configuration */}
            {domainStatus?.status !== 'active' && (
              <div className="space-y-4">
                <h4 className="font-medium">
                  {t.dnsConfiguration || 'DNS Configuration'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t.addDnsRecords ||
                    'Add these DNS records to your domain provider:'}
                </p>
                <div className="space-y-2">
                  {getDnsRecords().map((record, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-muted font-mono text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div>
                            <span className="text-muted-foreground">Type:</span>{' '}
                            {record.type}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Name:</span>{' '}
                            {record.name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Value:
                            </span>{' '}
                            {record.value}
                          </div>
                          <div>
                            <span className="text-muted-foreground">TTL:</span>{' '}
                            {record.ttl}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(record.value)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Add Domain Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">{t.domainName || 'Domain Name'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="domain"
                    type="text"
                    placeholder="example.com"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    disabled={isVerifying}
                  />
                  <Button
                    onClick={handleAddDomain}
                    disabled={!domain || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        {t.add || 'Add'}
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.enterDomainWithoutProtocol ||
                    "Enter your domain without 'https://'"}
                </p>
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">
                    {t.beforeYouStart || 'Before you start:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>{t.ownDomain || 'Make sure you own the domain'}</li>
                    <li>
                      {t.accessDnsSettings ||
                        'Have access to your domain DNS settings'}
                    </li>
                    <li>
                      {t.sslIncluded ||
                        'SSL certificate will be automatically provisioned'}
                    </li>
                    <li>
                      {t.propagationTime ||
                        'DNS changes may take up to 48 hours to propagate'}
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}

        {/* Remove Domain Dialog */}
        <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t.removeDomain || 'Remove Custom Domain'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.removeDomainWarning ||
                  'Are you sure you want to remove this custom domain? Your portfolio will be accessible via the default subdomain.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveDomain}
                disabled={isRemoving}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isRemoving && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t.remove || 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
