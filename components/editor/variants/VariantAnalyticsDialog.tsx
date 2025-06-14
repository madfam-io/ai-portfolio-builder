'use client';

import { useState, useEffect } from 'react';
import { BarChart, Eye, MousePointer, TrendingUp, Users, Globe, Smartphone } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioVariantsStore } from '@/lib/store/portfolio-variants-store';
import type { VariantAnalytics } from '@/types/portfolio-variants';

interface VariantAnalyticsDialogProps {
  variantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VariantAnalyticsDialog({
  variantId,
  open,
  onOpenChange,
}: VariantAnalyticsDialogProps) {
  const { t } = useLanguage();
  const { variants, getAnalytics } = usePortfolioVariantsStore();
  const [analytics, setAnalytics] = useState<VariantAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const variant = variants.find(v => v.id === variantId);

  useEffect(() => {
    if (open && variantId) {
      loadAnalytics();
    }
  }, [open, variantId, period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await getAnalytics(variantId, period);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getConversionIcon = (type: string) => {
    switch (type) {
      case 'contact_click': return '📧';
      case 'download_resume': return '📄';
      case 'social_click': return '🔗';
      case 'project_view': return '🔍';
      default: return '📊';
    }
  };

  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            {t.analyticsFor || 'Analytics for'} {variant.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">{t.day || 'Day'}</TabsTrigger>
            <TabsTrigger value="week">{t.week || 'Week'}</TabsTrigger>
            <TabsTrigger value="month">{t.month || 'Month'}</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : analytics ? (
            <TabsContent value={period} className="space-y-6 mt-6">
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {t.totalViews || 'Total Views'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatNumber(analytics.metrics.totalViews)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t.uniqueVisitors || 'Unique Visitors'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatNumber(analytics.metrics.uniqueVisitors)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MousePointer className="h-4 w-4" />
                      {t.avgTimeOnPage || 'Avg. Time'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {Math.floor(analytics.metrics.avgTimeOnPage / 60)}:{String(analytics.metrics.avgTimeOnPage % 60).padStart(2, '0')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t.conversionRate || 'Conversion'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {(analytics.metrics.clickThroughRate * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.conversionEvents || 'Conversion Events'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.metrics.conversionEvents.map((event) => (
                    <div key={event.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getConversionIcon(event.type)}</span>
                        <span className="text-sm">{event.type.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="font-medium">{event.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Visitor Insights */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Companies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.topCompanies || 'Top Companies'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.visitorInsights.topCompanies.slice(0, 5).map((company, index) => (
                      <div key={company.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                          <span className="text-sm font-medium">{company.name}</span>
                        </div>
                        <span className="text-sm">{company.count} visits</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Top Locations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t.topLocations || 'Top Locations'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.visitorInsights.topLocations.slice(0, 5).map((location, index) => (
                      <div key={location.location} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                          <span className="text-sm font-medium">{location.location}</span>
                        </div>
                        <span className="text-sm">{location.count} visits</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Traffic Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.trafficSources || 'Traffic Sources'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.visitorInsights.topReferrers.slice(0, 5).map((referrer) => (
                      <div key={referrer.source} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{referrer.source}</span>
                          <span>{referrer.count}</span>
                        </div>
                        <Progress 
                          value={(referrer.count / analytics.metrics.totalViews) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Device Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      {t.deviceTypes || 'Device Types'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analytics.visitorInsights.deviceTypes).map(([device, count]) => {
                      const percentage = (count / analytics.metrics.totalViews) * 100;
                      return (
                        <div key={device} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{device}</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.engagementMetrics || 'Engagement Metrics'}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.bounceRate || 'Bounce Rate'}</p>
                    <p className="text-2xl font-bold">{(analytics.metrics.bounceRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.scrollDepth || 'Avg. Scroll Depth'}</p>
                    <p className="text-2xl font-bold">{(analytics.metrics.scrollDepth * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.clickThrough || 'Click-through Rate'}</p>
                    <p className="text-2xl font-bold">{(analytics.metrics.clickThroughRate * 100).toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.noAnalyticsData || 'No analytics data available'}</p>
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}