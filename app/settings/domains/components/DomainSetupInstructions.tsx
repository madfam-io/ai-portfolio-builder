'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Copy,
  CheckCircle,
  Info,
  ChevronRight,
  Globe,
  Shield,
  Server,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DomainService } from '@/lib/services/domain-service';

interface DomainSetupInstructionsProps {
  domain: string;
  verificationToken: string;
  provider?: string;
}

export function DomainSetupInstructions({
  domain,
  verificationToken,
  provider = 'generic',
}: DomainSetupInstructionsProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copied',
      description: `${field} copied to clipboard.`,
    });
  };

  const instructions = DomainService.getSetupInstructions(
    domain,
    verificationToken,
    provider as any
  );

  const dnsProviders = [
    { id: 'generic', name: 'Generic Instructions' },
    { id: 'cloudflare', name: 'Cloudflare' },
    { id: 'namecheap', name: 'Namecheap' },
    { id: 'godaddy', name: 'GoDaddy' },
    { id: 'route53', name: 'AWS Route 53' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          DNS changes can take up to 48 hours to propagate worldwide, but
          usually complete within a few hours.
        </AlertDescription>
      </Alert>

      {/* Provider Selection */}
      <Tabs defaultValue={provider} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          {dnsProviders.map(p => (
            <TabsTrigger key={p.id} value={p.id} className="text-xs">
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {dnsProviders.map(p => (
          <TabsContent key={p.id} value={p.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Setup Instructions for {p.name}
                </CardTitle>
                <CardDescription>
                  Follow these steps to configure your domain with {p.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: TXT Record */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <h4 className="font-semibold">
                      Add TXT Record for Verification
                    </h4>
                  </div>

                  <div className="ml-10 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Add a TXT record to verify you own this domain
                    </p>

                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-mono font-medium">TXT</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard('TXT', 'Record Type')}
                        >
                          {copiedField === 'Record Type' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Name/Host
                          </p>
                          <p className="font-mono font-medium">@</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard('@', 'Record Name')}
                        >
                          {copiedField === 'Record Name' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="space-y-1 flex-1 mr-2">
                          <p className="text-xs text-muted-foreground">
                            Value/Content
                          </p>
                          <p className="font-mono text-sm break-all">
                            prisma-verify={verificationToken}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(
                              `prisma-verify=${verificationToken}`,
                              'TXT Value'
                            )
                          }
                        >
                          {copiedField === 'TXT Value' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: CNAME Record */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <h4 className="font-semibold">Add CNAME Record</h4>
                  </div>

                  <div className="ml-10 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Point your domain to PRISMA's servers
                    </p>

                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-mono font-medium">CNAME</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard('CNAME', 'CNAME Type')}
                        >
                          {copiedField === 'CNAME Type' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Name/Host
                          </p>
                          <p className="font-mono font-medium">@</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard('@', 'CNAME Name')}
                        >
                          {copiedField === 'CNAME Name' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Value/Target
                          </p>
                          <p className="font-mono font-medium">
                            portfolios.prisma.madfam.io
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(
                              'portfolios.prisma.madfam.io',
                              'CNAME Value'
                            )
                          }
                        >
                          {copiedField === 'CNAME Value' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {p.id === 'cloudflare' && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Important:</strong> Set the proxy status to
                          "DNS only" (gray cloud) for the CNAME record.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {/* Step 3: Wait and Verify */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <h4 className="font-semibold">Wait for DNS Propagation</h4>
                  </div>

                  <div className="ml-10 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      After adding the records, wait for DNS changes to
                      propagate (usually 5-30 minutes)
                    </p>

                    <div className="flex gap-4">
                      <Card className="flex-1">
                        <CardContent className="pt-6">
                          <Globe className="w-8 h-8 text-primary mb-2" />
                          <h5 className="font-medium mb-1">DNS Propagation</h5>
                          <p className="text-xs text-muted-foreground">
                            Changes typically take 5-30 minutes but can take up
                            to 48 hours
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="flex-1">
                        <CardContent className="pt-6">
                          <Shield className="w-8 h-8 text-primary mb-2" />
                          <h5 className="font-medium mb-1">SSL Certificate</h5>
                          <p className="text-xs text-muted-foreground">
                            We'll automatically provision an SSL certificate
                            once verified
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Additional Help */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="w-4 w-4" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you're having trouble setting up your domain:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Make sure you're editing DNS records for the root domain (@ or
                blank)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Remove any existing A or AAAA records that might conflict
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Contact your domain registrar's support for DNS help</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Check our documentation for provider-specific guides</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
