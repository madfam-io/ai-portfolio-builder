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

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  AlertCircle,
  Home,
  Mail,
  Settings,
  CheckCircle,
} from 'lucide-react';

export default function DomainNotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
              <Globe className="w-16 h-16 text-destructive" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-background border-2 border-destructive flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Domain Not Found</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            {`The domain you're trying to access is not configured or is currently
            inactive.`}
          </p>
        </div>

        {/* Possible Reasons */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Possible Reasons
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                <span>
                  {`The domain is still being set up and DNS changes haven't
                  propagated yet (this can take up to 48 hours)`}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                <span>
                  The domain configuration is incomplete or missing required DNS
                  records
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                <span>
                  The portfolio associated with this domain has been deleted or
                  unpublished
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                <span>
                  The domain subscription has expired or been cancelled
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* What to Do */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              What You Can Do
            </h2>
            <div className="space-y-4">
              {/* For Domain Owners */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  If you own this domain:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>
                      Log in to your PRISMA account and check your domain
                      settings
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>
                      Verify that your DNS records are correctly configured
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Ensure your portfolio is published and active</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>
                      Wait for DNS propagation if you recently made changes
                    </span>
                  </li>
                </ul>
              </div>

              {/* For Visitors */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {`If you're looking for a portfolio:`}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                    <span>Double-check the URL for any typos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                    <span>
                      Try accessing the portfolio through the PRISMA subdomain
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                    <span>
                      Contact the portfolio owner for the correct link
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to PRISMA Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <Alert>
          <AlertDescription className="text-center">
            {`If you believe this is an error, please contact our support team
            with the domain name and we'll help resolve the issue.`}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
