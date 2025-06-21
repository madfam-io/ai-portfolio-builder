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
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/lib/i18n/refactored-context';
import type { User } from '@supabase/supabase-js';

interface QuickStartHeaderProps {
  user: User | null;
}

export function QuickStartHeader({ user }: QuickStartHeaderProps) {
  const router = useRouter();
  const { t: _t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col gap-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {!user && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign In
                </Button>
                <Button size="sm" onClick={() => router.push('/auth/signup')}>
                  Create Account
                </Button>
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Quick Start Templates
              </h1>
            </div>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our professionally designed templates and create your
              portfolio in minutes. Each template includes sample content
              tailored to your industry.
            </p>
          </div>

          {/* Info Alert */}
          {!user && (
            <Alert className="max-w-3xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>No account needed!</strong> You can try any template
                without signing up. Create an account later to save your
                portfolio and unlock all features.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
