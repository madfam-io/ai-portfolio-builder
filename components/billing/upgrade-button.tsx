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

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/lib/services/checkout';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/refactored-context';

interface UpgradeButtonProps {
  planId: 'pro' | 'business' | 'enterprise';
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export function UpgradeButton({
  planId,
  variant = 'default',
  size = 'default',
  className = '',
  children,
  fullWidth = false,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { t } = useLanguage();

  const handleUpgrade = async () => {
    // If not authenticated, redirect to signup with plan
    if (!isAuthenticated) {
      router.push(`/auth/signup?plan=${planId}`);
      return;
    }

    setIsLoading(true);

    try {
      await createCheckoutSession({ planId });
    } catch (error) {
      toast({
        title: t.checkoutError || 'Checkout Error',
        description:
          error instanceof Error ? error.message : 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleUpgrade}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t.loading || 'Loading...'}
        </>
      ) : (
        children || t.upgrade || 'Upgrade'
      )}
    </Button>
  );
}
