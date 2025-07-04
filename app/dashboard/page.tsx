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

import {
  Edit,
  Eye,
  Globe,
  Loader,
  Plus,
  Trash,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UpgradeBanner } from '@/components/billing/upgrade-banner';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import { UsageStats } from '@/components/dashboard/usage-stats';
import { SuccessMetrics } from '@/components/dashboard/SuccessMetrics';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast, type ToastOptions } from '@/hooks/use-toast';
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
import { useLanguage } from '@/lib/i18n/refactored-context';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useSubscription } from '@/lib/hooks/use-subscription';
import { useUpgradePrompts } from '@/lib/hooks/use-upgrade-prompts';
import { logger } from '@/lib/utils/logger';
import { Portfolio } from '@/types/portfolio';
import { CompletionBadge } from '@/components/portfolio/CompletionBadge';

// Helper function to load portfolios with error handling
const usePortfolioLoader = (
  loadPortfolios: () => Promise<Portfolio[]>,
  t: Record<string, string | undefined>,
  toast: (options: ToastOptions) => void
) => {
  useEffect(() => {
    const loadPortfoliosAsync = async () => {
      try {
        await loadPortfolios();
      } catch (err) {
        logger.error(
          'Failed to load portfolios:',
          err instanceof Error ? err : new Error(String(err))
        );
        toast({
          title: t.error || 'Error',
          description:
            t.failedToLoadPortfolios ||
            'Failed to load portfolios. Please try again.',
          variant: 'destructive',
        });
      }
    };
    void loadPortfoliosAsync();
  }, [loadPortfolios, t, toast]);
};

// Helper function for portfolio deletion with error handling
const usePortfolioDeletion = (
  deletePortfolio: (id: string) => Promise<void>,
  t: Record<string, string | undefined>,
  toast: (options: ToastOptions) => void
) => {
  const [deletePortfolioId, setDeletePortfolioId] = useState<string | null>(
    null
  );

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      await deletePortfolio(portfolioId);
      toast({
        title: t.success || 'Success',
        description: t.portfolioDeleted || 'Portfolio deleted successfully',
      });
      setDeletePortfolioId(null);
    } catch (err) {
      logger.error(
        'Failed to delete portfolio:',
        err instanceof Error ? err : new Error(String(err))
      );
      toast({
        title: t.error || 'Error',
        description: t.failedToDelete || 'Failed to delete portfolio',
        variant: 'destructive',
      });
    }
  };

  return { deletePortfolioId, setDeletePortfolioId, handleDeletePortfolio };
};

// Helper function for portfolio creation with limit checks
const usePortfolioCreation = (
  canCreatePortfolio: boolean,
  checkAndShowPrompt: (type: 'ai_limit' | 'portfolio_limit') => boolean,
  toast: (options: ToastOptions) => void,
  router: ReturnType<typeof useRouter>
) => {
  const handleCreatePortfolio = () => {
    if (!canCreatePortfolio) {
      const shown = checkAndShowPrompt('portfolio_limit');
      if (!shown) {
        toast({
          title: 'Portfolio Limit Reached',
          description: 'Please upgrade your plan to create more portfolios.',
          variant: 'destructive',
        });
      }
      return;
    }
    router.push('/editor/new');
  };

  return { handleCreatePortfolio };
};

// eslint-disable-next-line complexity
function DashboardContent(): React.ReactElement {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  const { portfolios, isLoading, error, loadPortfolios, deletePortfolio } =
    usePortfolioStore();
  const { limits, canCreatePortfolio, isFreeTier } = useSubscription();
  const {
    showModal,
    modalReason,
    hideUpgradeModal,
    checkAndShowPrompt,
    shouldShowPrompt,
  } = useUpgradePrompts();

  // Use custom hooks to reduce complexity
  usePortfolioLoader(loadPortfolios, t, toast);
  const { deletePortfolioId, setDeletePortfolioId, handleDeletePortfolio } =
    usePortfolioDeletion(deletePortfolio, t, toast);
  const { handleCreatePortfolio } = usePortfolioCreation(
    canCreatePortfolio,
    checkAndShowPrompt,
    toast,
    router
  );

  // Additional handlers for navigation
  const handleEditPortfolio = (portfolioId: string) => {
    router.push(`/editor/${portfolioId}`);
  };

  const handleViewPortfolio = (portfolio: Portfolio) => {
    if (portfolio.status === 'published' && portfolio.subdomain) {
      window.open(
        `${window.location.origin}/p/${portfolio.subdomain}`,
        '_blank'
      );
    } else {
      router.push(`/editor/${portfolio.id}/preview`);
    }
  };

  const getStatusBadge = (status: Portfolio['status']) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diffInDays = Math.floor(
      (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return t.today || 'Today';
    if (diffInDays === 1) return t.yesterday || 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} ${t.daysAgo || 'days ago'}`;
    if (diffInDays < 30)
      return `${Math.floor(diffInDays / 7)} ${t.weeksAgo || 'weeks ago'}`;

    return dateObj.toLocaleDateString();
  };

  // Helper function to render portfolio stats
  const renderPortfolioStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t.totalPortfolios || 'Total Portfolios'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{portfolios.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t.published || 'Published'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {portfolios.filter(p => p.status === 'published').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t.totalViews || 'Total Views'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {portfolios.reduce((sum, p) => sum + (p.views || 0), 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Helper function to render upgrade banners
  const renderUpgradeBanners = () => (
    <>
      {isFreeTier && shouldShowPrompt('portfolio_limit') && (
        <div className="mb-6">
          <UpgradeBanner
            type="portfolio_limit"
            title="Portfolio Limit Reached"
            description={`You've created ${limits?.current_usage.portfolios || 0} of ${limits?.limits.max_portfolios || 0} portfolios. Upgrade to create more professional portfolios.`}
          />
        </div>
      )}

      {isFreeTier && shouldShowPrompt('ai_limit') && (
        <div className="mb-6">
          <UpgradeBanner
            type="ai_limit"
            title="AI Enhancements Used Up"
            description={`You've used ${limits?.current_usage.ai_requests || 0} of ${limits?.limits.max_ai_requests || 0} AI enhancements this month. Upgrade for unlimited AI features.`}
          />
        </div>
      )}
    </>
  );

  // Show loading spinner while loading data
  if (isLoading && portfolios.length === 0) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t.loadingDashboard || 'Loading your dashboard...'}
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t.hello || 'Hello'}, {user?.email?.split('@')[0] || 'User'}!
            </h1>
            <h2 className="text-2xl font-semibold text-muted-foreground mt-2">
              {t.myPortfolios || 'My Portfolios'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t.managePortfolios ||
                'Manage and track your professional portfolios'}
            </p>
          </div>
          <Button onClick={handleCreatePortfolio} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            {t.createNewPortfolio || 'Create Portfolio'}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Upgrade Banners */}
        {renderUpgradeBanners()}

        {/* Dashboard Tabs */}
        <Tabs defaultValue="portfolios" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="portfolios">
              {t.portfolios || 'Portfolios'}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t.analytics || 'Analytics'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolios" className="space-y-6">
            {/* Usage Stats */}
            <div className="mb-8">
              <UsageStats />
            </div>

            {/* Portfolio Stats */}
            {renderPortfolioStats()}

            {/* Portfolio Grid */}
            {portfolios.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {portfolios.map(portfolio => (
                  <Card
                    key={portfolio.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">
                            {portfolio.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getStatusBadge(portfolio.status)}>
                              {portfolio.status}
                            </Badge>
                            <CompletionBadge portfolio={portfolio} />
                          </div>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {portfolio.title ||
                          portfolio.bio ||
                          t.noDescription ||
                          'No description'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="capitalize">
                            {portfolio.template} template
                          </span>
                        </div>
                        {portfolio.updatedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(portfolio.updatedAt)}</span>
                          </div>
                        )}
                        {portfolio.views && portfolio.views > 0 && (
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            <span>
                              {portfolio.views} {t.views || 'views'}
                            </span>
                          </div>
                        )}
                        {portfolio.subdomain &&
                          portfolio.status === 'published' && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              <span className="text-xs">
                                {portfolio.subdomain}.prisma.madfam.io
                              </span>
                            </div>
                          )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPortfolio(portfolio.id)}
                          title={t.edit || 'Edit'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPortfolio(portfolio)}
                          title={t.preview || 'Preview'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {portfolio.status === 'published' &&
                          portfolio.subdomain && (
                            <Button variant="ghost" size="icon" asChild>
                              <a
                                href={`https://${portfolio.subdomain}.prisma.madfam.io`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t.viewLive || 'View live'}
                              >
                                <Globe className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletePortfolioId(portfolio.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title={t.delete || 'Delete'}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-24 h-24 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Plus className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {t.noPortfoliosYet || 'No portfolios yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {t.createFirstPortfolio ||
                      'Create your first portfolio to showcase your professional work'}
                  </p>
                  <Button onClick={handleCreatePortfolio} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    {t.createPortfolio || 'Create Portfolio'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    {t.orTryQuickStart || 'Or try our'}{' '}
                    <Link
                      href="/quick-start"
                      className="text-primary hover:underline"
                    >
                      {t.quickStartTemplates || 'Quick Start Templates'}
                    </Link>
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SuccessMetrics />
          </TabsContent>
        </Tabs>

        {/* Upgrade Modal */}
        {showModal && modalReason && (
          <UpgradeModal
            isOpen={showModal}
            onClose={hideUpgradeModal}
            reason={modalReason}
            currentPlan={limits?.subscription_tier || 'free'}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deletePortfolioId !== null}
          onOpenChange={(open: boolean) => !open && setDeletePortfolioId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t.confirmDeleteTitle || 'Delete Portfolio'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.confirmDeleteDescription ||
                  'Are you sure you want to delete this portfolio? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deletePortfolioId && handleDeletePortfolio(deletePortfolioId)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t.delete || 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </BaseLayout>
  );
}

export default function Dashboard(): React.ReactElement {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
