'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Eye,
  Globe,
  Clock,
  Target,
  Award,
  BarChart3,
  Calendar,
  Activity,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  format?: 'number' | 'percentage' | 'time' | 'currency';
}

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  deadline?: Date;
  status: 'on-track' | 'at-risk' | 'completed' | 'behind';
}

export function SuccessMetrics() {
  const { t } = useLanguage();
  const { portfolios } = usePortfolioStore();
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - in production, this would come from analytics API
  const [metrics, setMetrics] = useState<{
    overview: Metric[];
    engagement: Metric[];
    conversion: Metric[];
  }>({
    overview: [],
    engagement: [],
    conversion: [],
  });

  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    // Simulate loading metrics
    setTimeout(() => {
      // Calculate real metrics from portfolio data
      const publishedPortfolios = portfolios.filter(
        p => p.status === 'published'
      );
      const totalViews = publishedPortfolios.reduce(
        (sum, p) => sum + (p.views || 0),
        0
      );
      const avgCompletionRate =
        portfolios.length > 0
          ? portfolios.reduce((sum, p) => {
              const sections = [
                'experience',
                'projects',
                'skills',
                'education',
              ];
              const completedSections = sections.filter(s => {
                const sectionData = p[s as keyof typeof p];
                return Array.isArray(sectionData)
                  ? sectionData.length > 0
                  : !!sectionData;
              }).length;
              return sum + (completedSections / sections.length) * 100;
            }, 0) / portfolios.length
          : 0;

      setMetrics({
        overview: [
          {
            label: t.totalPortfolios || 'Total Portfolios',
            value: portfolios.length,
            change: 12,
            trend: 'up',
            icon: <FileText className="w-4 h-4" />,
            format: 'number',
          },
          {
            label: t.publishedPortfolios || 'Published',
            value: publishedPortfolios.length,
            change: 8,
            trend: 'up',
            icon: <Globe className="w-4 h-4" />,
            format: 'number',
          },
          {
            label: t.totalViews || 'Total Views',
            value: totalViews,
            change: 24,
            trend: 'up',
            icon: <Eye className="w-4 h-4" />,
            format: 'number',
          },
          {
            label: t.avgCompletion || 'Avg Completion',
            value: `${Math.round(avgCompletionRate)}%`,
            change: 5,
            trend: 'up',
            icon: <Target className="w-4 h-4" />,
            format: 'percentage',
          },
        ],
        engagement: [
          {
            label: t.avgTimeOnPage || 'Avg Time on Page',
            value: '3m 24s',
            change: 15,
            trend: 'up',
            icon: <Clock className="w-4 h-4" />,
            format: 'time',
          },
          {
            label: t.bounceRate || 'Bounce Rate',
            value: '42%',
            change: -5,
            trend: 'down',
            icon: <Activity className="w-4 h-4" />,
            format: 'percentage',
          },
          {
            label: t.returningVisitors || 'Returning Visitors',
            value: '28%',
            change: 12,
            trend: 'up',
            icon: <Users className="w-4 h-4" />,
            format: 'percentage',
          },
          {
            label: t.shareRate || 'Share Rate',
            value: '8.5%',
            change: 3,
            trend: 'up',
            icon: <BarChart3 className="w-4 h-4" />,
            format: 'percentage',
          },
        ],
        conversion: [
          {
            label: t.contactFormSubmissions || 'Contact Submissions',
            value: 47,
            change: 18,
            trend: 'up',
            icon: <Award className="w-4 h-4" />,
            format: 'number',
          },
          {
            label: t.cvDownloads || 'CV Downloads',
            value: 156,
            change: 22,
            trend: 'up',
            icon: <FileText className="w-4 h-4" />,
            format: 'number',
          },
          {
            label: t.socialClicks || 'Social Media Clicks',
            value: 342,
            change: 31,
            trend: 'up',
            icon: <Users className="w-4 h-4" />,
            format: 'number',
          },
          {
            label: t.projectViews || 'Project Views',
            value: 892,
            change: 45,
            trend: 'up',
            icon: <Eye className="w-4 h-4" />,
            format: 'number',
          },
        ],
      });

      setGoals([
        {
          id: '1',
          title: t.completeAllSections || 'Complete All Portfolio Sections',
          current: Math.round(avgCompletionRate),
          target: 100,
          unit: '%',
          status:
            avgCompletionRate >= 80
              ? 'on-track'
              : avgCompletionRate >= 60
                ? 'at-risk'
                : 'behind',
        },
        {
          id: '2',
          title: t.reach1000Views || 'Reach 1,000 Portfolio Views',
          current: totalViews,
          target: 1000,
          unit: 'views',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status:
            totalViews >= 800
              ? 'on-track'
              : totalViews >= 500
                ? 'at-risk'
                : 'behind',
        },
        {
          id: '3',
          title: t.publishPortfolio || 'Publish Your Portfolio',
          current: publishedPortfolios.length,
          target: 1,
          unit: 'portfolio',
          status: publishedPortfolios.length >= 1 ? 'completed' : 'behind',
        },
        {
          id: '4',
          title: t.getContactSubmissions || 'Get 10 Contact Submissions',
          current: 7,
          target: 10,
          unit: 'contacts',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'on-track',
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, [portfolios, t]);

  const formatMetricValue = (metric: Metric) => {
    if (metric.format === 'currency') {
      return `$${metric.value.toLocaleString()}`;
    }
    if (metric.format === 'percentage' || metric.format === 'time') {
      return metric.value;
    }
    return metric.value.toLocaleString();
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'on-track':
        return 'text-blue-600 bg-blue-50';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-50';
      case 'behind':
        return 'text-red-600 bg-red-50';
    }
  };

  const renderMetricCard = (metric: Metric) => (
    <Card key={metric.label}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {metric.icon}
          </div>
          {metric.change !== undefined && (
            <div
              className={cn(
                'flex items-center text-sm font-medium',
                metric.trend === 'up'
                  ? 'text-green-600'
                  : metric.trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
              )}
            >
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : metric.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 mr-1" />
              ) : null}
              {Math.abs(metric.change)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold">{formatMetricValue(metric)}</p>
          <p className="text-sm text-muted-foreground">{metric.label}</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderGoalCard = (goal: Goal) => {
    const progress = (goal.current / goal.target) * 100;

    return (
      <Card key={goal.id}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-medium">{goal.title}</h4>
            <Badge className={cn('ml-2', getStatusColor(goal.status))}>
              {goal.status.replace('-', ' ')}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {goal.current} / {goal.target} {goal.unit}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {goal.deadline && (
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(goal.deadline).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            {t.successMetrics || 'Success Metrics'}
          </h3>
          <p className="text-muted-foreground">
            {t.trackYourProgress ||
              'Track your portfolio performance and growth'}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d'
                ? t.last7Days || 'Last 7 days'
                : range === '30d'
                  ? t.last30Days || 'Last 30 days'
                  : t.last90Days || 'Last 90 days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t.overview || 'Overview'}</TabsTrigger>
          <TabsTrigger value="engagement">
            {t.engagement || 'Engagement'}
          </TabsTrigger>
          <TabsTrigger value="conversion">
            {t.conversion || 'Conversion'}
          </TabsTrigger>
          <TabsTrigger value="goals">{t.goals || 'Goals'}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.overview.map(renderMetricCard)}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.engagement.map(renderMetricCard)}
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.conversion.map(renderMetricCard)}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map(renderGoalCard)}
          </div>

          {/* Tips Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {t.improvementTips || 'Tips to Improve'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-sm">
                    {t.tip1 ||
                      'Add more projects with detailed descriptions to showcase your work'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-sm">
                    {t.tip2 ||
                      'Include testimonials to build trust with visitors'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-sm">
                    {t.tip3 ||
                      'Share your portfolio on social media to increase visibility'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-sm">
                    {t.tip4 ||
                      'Keep your portfolio updated with recent work and achievements'}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
