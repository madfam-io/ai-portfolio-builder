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

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Zap, TrendingUp, Check, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/refactored-context';
import {
  AI_CREDIT_PACKS,
  type AICreditPack,
} from '@/lib/services/stripe/stripe-enhanced';
import { toast } from '@/lib/ui/toast';

interface AICreditPacksProps {
  currentCredits: number;
  onPurchase: (packId: AICreditPack) => Promise<void>;
}

export default function AICreditPacks({
  currentCredits,
  onPurchase,
}: AICreditPacksProps) {
  const { t } = useLanguage();
  const [purchasingPack, setPurchasingPack] = useState<AICreditPack | null>(
    null
  );

  const handlePurchase = async (packId: AICreditPack) => {
    setPurchasingPack(packId);
    try {
      await onPurchase(packId);
      toast({
        title: 'Purchase initiated',
        description: 'You will be redirected to complete your purchase.',
      });
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: 'Failed to initiate purchase',
        variant: 'destructive',
      });
    } finally {
      setPurchasingPack(null);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const calculatePricePerCredit = (price: number, credits: number) => {
    return formatPrice(price / credits);
  };

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Enhancement Credits
          </CardTitle>
          <CardDescription>
            {
              'Purchase additional credits to enhance your portfolio content with AI'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{currentCredits} credits</p>
            </div>
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How credits work:</strong> Each AI enhancement (bio, project
          description, or template recommendation) uses 1 credit. Credits never
          expire and are added to your account immediately after purchase.
        </AlertDescription>
      </Alert>

      {/* Credit Packs */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(AI_CREDIT_PACKS).map(([key, pack]) => {
          const packId = key as AICreditPack;
          const isPopular = 'popularBadge' in pack && pack.popularBadge;
          const pricePerCredit = calculatePricePerCredit(
            pack.price,
            pack.credits
          );

          return (
            <Card
              key={packId}
              className={isPopular ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pack.name}</CardTitle>
                  {isPopular && <Badge variant="default">Most Popular</Badge>}
                </div>
                <CardDescription>
                  {pack.credits} AI enhancement credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {formatPrice(pack.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pricePerCredit} per credit
                  </p>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Instant delivery
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Never expire
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    Use across all portfolios
                  </li>
                </ul>

                {/* Savings Badge */}
                {packId === 'large' && (
                  <Badge variant="default" className="w-full justify-center">
                    Save 33% vs small pack
                  </Badge>
                )}
                {packId === 'medium' && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Save 20% vs small pack
                  </Badge>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(packId)}
                  disabled={purchasingPack !== null}
                >
                  {purchasingPack === packId ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Buy {pack.credits} Credits
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pro Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Use AI enhancement on your most important projects for maximum
            impact
          </p>
          <p>
            • Try different AI models to find the tone that best matches your
            style
          </p>
          <p>• Save credits by writing a good first draft before enhancing</p>
        </CardContent>
      </Card>
    </div>
  );
}
