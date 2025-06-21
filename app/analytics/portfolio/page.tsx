'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { ABTestDashboard } from '@/components/analytics/ABTestDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useEnhancedPostHog,
  FEATURE_FLAGS,
} from '@/lib/analytics/posthog/enhanced-client';
import { BarChart3, Activity, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { Badge } from '@/components/ui/badge';

function PortfolioAnalyticsContent() {
  const { user } = useAuthStore();
  const { portfolios } = usePortfolioStore();
  const { isFeatureEnabled } = useEnhancedPostHog();

  const hasAdvancedAnalytics = isFeatureEnabled(
    FEATURE_FLAGS.ADVANCED_ANALYTICS
  );
  const isAdmin = user?.email?.includes('@madfam.io') || false;

  // Calculate some basic metrics
  const totalViews = portfolios.reduce((sum, p) => sum + (p.views || 0), 0);
  const publishedCount = portfolios.filter(p => p.isPublished).length;
  const avgCompletionRate =
    portfolios.reduce((sum, p) => {
      const sections = [
        p.personalInfo?.name,
        p.experience?.length,
        p.education?.length,
        p.skills?.length,
        p.projects?.length,
      ];
      const completed = sections.filter(Boolean).length;
      return sum + (completed / 5) * 100;
    }, 0) / Math.max(portfolios.length, 1);

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Portfolio Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your portfolio performance and user engagement
              </p>
            </div>
            {hasAdvancedAnalytics && (
              <Badge variant="default">Advanced Analytics</Badge>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Total Portfolios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{portfolios.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedCount} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalViews.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Across all portfolios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Avg Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {avgCompletionRate.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Portfolio sections filled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-yellow-500" />
                Engagement Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {publishedCount > 0
                  ? (totalViews / publishedCount).toFixed(1)
                  : '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg views per portfolio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* A/B Testing Dashboard - Only for admins or with advanced analytics */}
        {(isAdmin || hasAdvancedAnalytics) && (
          <div className="mt-8">
            <ABTestDashboard />
          </div>
        )}

        {/* Basic Analytics for all users */}
        {!hasAdvancedAnalytics && !isAdmin && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Advanced Analytics Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upgrade to Professional or Business plan to unlock detailed
                analytics, A/B testing insights, and conversion tracking.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  );
}

export default function PortfolioAnalyticsPage() {
  return (
    <ProtectedRoute>
      <PortfolioAnalyticsContent />
    </ProtectedRoute>
  );
}
