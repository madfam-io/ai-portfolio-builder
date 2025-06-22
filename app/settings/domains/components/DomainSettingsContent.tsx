/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/layouts/BaseLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Plus,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Trash,
  Info,
  RefreshCw,
  // Settings,
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { DomainService } from '@/lib/services/domain-service';
import { logger } from '@/lib/utils/logger';
import { AddDomainModal } from './AddDomainModal';
import { DomainSetupInstructions } from './DomainSetupInstructions';
import type { CustomDomain } from '@/types/domains';

export function DomainSettingsContent() {
  const _router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { portfolios } = usePortfolioStore();

  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [_selectedDomain, _setSelectedDomain] = useState<CustomDomain | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  const loadDomains = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) throw new Error('User not authenticated');
      const userDomains = await DomainService.getUserDomains(user.id);
      setDomains(userDomains);
    } catch (error) {
      logger.error('Failed to load domains', error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load your domains. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadDomains();
    }
  }, [user, loadDomains]);

  const handleAddDomain = async (portfolioId: string, domain: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const newDomain = await DomainService.addCustomDomain(
        user.id,
        portfolioId,
        domain
      );

      setDomains([...domains, newDomain]);
      setShowAddModal(false);
      _setSelectedDomain(newDomain);

      toast({
        title: 'Domain Added',
        description:
          'Your domain has been added. Please follow the setup instructions to verify ownership.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to add domain. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyDomain = async (domain: CustomDomain) => {
    setVerifying(domain.id);
    try {
      const result = await DomainService.verifyDomain(domain.id);

      if (result.verified) {
        // Update domain in state
        setDomains(
          domains.map(d =>
            d.id === domain.id
              ? { ...d, verificationStatus: 'verified', dnsConfigured: true }
              : d
          )
        );

        toast({
          title: 'Domain Verified',
          description: 'Your domain ownership has been verified successfully!',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description:
            "DNS records not found. Please ensure you've added the required records and wait for DNS propagation.",
          variant: 'destructive',
        });
      }
    } catch (_error) {
      logger.error('Failed to verify domain', _error as Error);
      toast({
        title: 'Error',
        description: 'Failed to verify domain. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(null);
    }
  };

  const handleActivateDomain = async (domain: CustomDomain) => {
    setActivating(domain.id);
    try {
      const activatedDomain = await DomainService.activateDomain(domain.id);

      // Update domain in state
      setDomains(domains.map(d => (d.id === domain.id ? activatedDomain : d)));

      toast({
        title: 'Domain Activated',
        description: 'Your domain is now active and serving your portfolio!',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to activate domain. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActivating(null);
    }
  };

  const handleSetPrimary = async (domain: CustomDomain) => {
    try {
      await DomainService.setPrimaryDomain(domain.id, domain.portfolioId);

      // Update domains in state
      setDomains(
        domains.map(d => ({
          ...d,
          isPrimary:
            d.id === domain.id
              ? true
              : d.portfolioId === domain.portfolioId
                ? false
                : d.isPrimary,
        }))
      );

      toast({
        title: 'Primary Domain Set',
        description: `${domain.domain} is now your primary domain.`,
      });
    } catch (_error) {
      logger.error('Failed to set primary domain', _error as Error);
      toast({
        title: 'Error',
        description: 'Failed to set primary domain. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveDomain = async (domain: CustomDomain) => {
    // eslint-disable-next-line no-alert
    if (
      !window.confirm(
        `Are you sure you want to remove ${domain.domain}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await DomainService.removeDomain(domain.id);
      setDomains(domains.filter(d => d.id !== domain.id));

      toast({
        title: 'Domain Removed',
        description: 'Your domain has been removed successfully.',
      });
    } catch (_error) {
      logger.error('Failed to remove domain', _error as Error);
      toast({
        title: 'Error',
        description: 'Failed to remove domain. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Value copied to clipboard.',
    });
  };

  const getStatusBadge = (domain: CustomDomain) => {
    if (domain.status === 'active') {
      return (
        <Badge variant="default">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (domain.verificationStatus === 'verified') {
      return (
        <Badge variant="secondary">
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (domain.verificationStatus === 'failed') {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Info className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getSSLBadge = (domain: CustomDomain) => {
    if (domain.sslStatus === 'active') {
      return (
        <Badge variant="default">
          <Shield className="w-3 h-3 mr-1" />
          SSL Active
        </Badge>
      );
    }
    if (domain.sslStatus === 'provisioning') {
      return (
        <Badge variant="secondary">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          SSL Provisioning
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Custom Domains</h1>
            <p className="text-muted-foreground">
              Connect your own domain to make your portfolio truly yours
            </p>
          </div>

          {/* Add Domain Button */}
          <div className="mb-6">
            <Button onClick={() => setShowAddModal(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Custom Domain
            </Button>
          </div>

          {/* Domain List */}
          {domains.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No custom domains yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add a custom domain to give your portfolio a professional web
                  address like yourname.com
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Domain
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {domains.map(domain => (
                <Card key={domain.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">
                            {domain.domain}
                          </CardTitle>
                          {getStatusBadge(domain)}
                          {getSSLBadge(domain)}
                          {domain.isPrimary && (
                            <Badge variant="outline">
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          Connected to:{' '}
                          {portfolios.find(p => p.id === domain.portfolioId)
                            ?.name || 'Unknown Portfolio'}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDomain(domain)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="status" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="status">Status</TabsTrigger>
                        <TabsTrigger value="setup">Setup</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="status" className="space-y-4">
                        {/* Verification Status */}
                        {domain.verificationStatus !== 'verified' && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-center justify-between">
                                <span>
                                  Domain verification pending. Add the required
                                  DNS records.
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyDomain(domain)}
                                  disabled={verifying === domain.id}
                                >
                                  {verifying === domain.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      Verify Now
                                    </>
                                  )}
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Activation */}
                        {domain.verificationStatus === 'verified' &&
                          domain.status !== 'active' && (
                            <Alert>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <AlertDescription>
                                <div className="flex items-center justify-between">
                                  <span>
                                    Domain verified! Activate it to start using
                                    it.
                                  </span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleActivateDomain(domain)}
                                    disabled={activating === domain.id}
                                  >
                                    {activating === domain.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      'Activate Domain'
                                    )}
                                  </Button>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                        {/* Active Status */}
                        {domain.status === 'active' && (
                          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 dark:text-green-200">
                              Your domain is active and serving your portfolio!
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      `https://${domain.domain}`,
                                      '_blank'
                                    )
                                  }
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Visit Site
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* DNS Status */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">
                              DNS Configuration
                            </Label>
                            <p className="font-medium">
                              {domain.dnsConfigured
                                ? 'Configured'
                                : 'Not Configured'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Last Checked
                            </Label>
                            <p className="font-medium">
                              {domain.dnsLastCheckedAt
                                ? new Date(
                                    domain.dnsLastCheckedAt
                                  ).toLocaleString()
                                : 'Never'}
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="setup" className="space-y-4">
                        <DomainSetupInstructions
                          domain={domain.domain}
                          verificationToken={domain.verificationToken}
                          provider="generic"
                        />
                      </TabsContent>

                      <TabsContent value="settings" className="space-y-4">
                        <div className="space-y-4">
                          {/* Primary Domain */}
                          {domain.status === 'active' && !domain.isPrimary && (
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">
                                  Set as Primary Domain
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Make this your main portfolio URL
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => handleSetPrimary(domain)}
                              >
                                Set as Primary
                              </Button>
                            </div>
                          )}

                          {/* Force SSL */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Force SSL</h4>
                              <p className="text-sm text-muted-foreground">
                                Always redirect to HTTPS
                              </p>
                            </div>
                            <Badge
                              variant={domain.forceSsl ? 'default' : 'outline'}
                            >
                              {domain.forceSsl ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>

                          {/* Domain Details */}
                          <div className="space-y-2">
                            <Label>Verification Token</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={`prisma-verify=${domain.verificationToken}`}
                                readOnly
                                className="font-mono text-sm"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  copyToClipboard(
                                    `prisma-verify=${domain.verificationToken}`
                                  )
                                }
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Domain Modal */}
          {showAddModal && (
            <AddDomainModal
              portfolios={portfolios}
              onAdd={handleAddDomain}
              onClose={() => setShowAddModal(false)}
            />
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
