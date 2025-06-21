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

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { EditorContent } from '@/components/editor/EditorContent';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Button } from '@/components/ui/button';

function EditorPageContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const portfolioId = params.id as string;

  const { currentPortfolio, isLoading, error, loadPortfolio } =
    usePortfolioStore();

  useEffect(() => {
    if (portfolioId) {
      loadPortfolio(portfolioId).catch(() => {
        // Error is already handled by the store
      });
    }
  }, [portfolioId, loadPortfolio]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t.loadingPortfolio || 'Loading your portfolio...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t.error || 'Error'}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            {t.backToDashboard || 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  if (!currentPortfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t.portfolioNotFound || 'Portfolio not found'}
          </h2>
          <Button onClick={() => router.push('/dashboard')}>
            {t.backToDashboard || 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  return <EditorContent />;
}

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorPageContent />
    </ProtectedRoute>
  );
}
