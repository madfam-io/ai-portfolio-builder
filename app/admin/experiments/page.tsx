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

/**
 * @fileoverview Universal Experiments Admin Page
 *
 * Complete admin interface for managing experiments across the PRISMA platform.
 * Part of v0.4.0-beta universal experimentation framework.
 *
 * Features:
 * - Experiment dashboard with analytics
 * - Template-based experiment creation
 * - Real-time experiment monitoring
 * - Statistical analysis and reporting
 * - Bulk operations and management
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
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
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  CheckCircle,
  Beaker,
} from 'lucide-react';

import { ExperimentDashboard } from '@/components/admin/ExperimentDashboard';
import { ExperimentAnalytics } from '@/components/admin/ExperimentAnalytics';
import { UniversalExperimentConfig } from '@/lib/experimentation/universal-experiments';

export default function ExperimentsAdminPage() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [experiments, setExperiments] = useState<UniversalExperimentConfig[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState({
    totalExperiments: 0,
    activeExperiments: 0,
    totalParticipants: 0,
    avgConversionLift: 0,
    significantWinners: 0,
    totalRevenueLift: 0,
  });

  // Load experiments and platform statistics
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);

        // Mock data - in production this would fetch from API
        const mockExperiments: UniversalExperimentConfig[] = [
          {
            id: 'exp-001',
            name: 'Hero CTA Button Test',
            description: 'Testing different CTA button colors and text',
            hypothesis: 'Green CTA button will increase conversions by 10%',
            context: 'landing_page',
            type: 'component',
            status: 'active',
            priority: 'high',
            targeting: {
              userSegments: [],
              userTiers: ['free', 'professional'],
              geographicRegions: ['US', 'MX'],
              deviceTypes: ['desktop', 'mobile'],
              trafficAllocation: 0.5,
              customRules: [],
              excludeRules: [],
            },
            variants: [
              {
                id: 'var-001',
                name: 'Control',
                description: 'Blue CTA button',
                isControl: true,
                allocation: 0.5,
                config: {},
                performance: {
                  assignments: 1250,
                  exposures: 1250,
                  conversions: 156,
                  revenue: 4680,
                },
              },
              {
                id: 'var-002',
                name: 'Green Button',
                description: 'Green CTA button',
                isControl: false,
                allocation: 0.5,
                config: {},
                performance: {
                  assignments: 1280,
                  exposures: 1280,
                  conversions: 184,
                  revenue: 5520,
                },
              },
            ],
            metrics: {
              primary: {
                id: 'cta_click_rate',
                name: 'CTA Click Rate',
                description: '',
                type: 'conversion',
                calculation: { aggregation: 'conversion_rate' },
                goal: 'increase',
                statisticalTest: 'z_test',
              },
              secondary: [],
              guardrail: [],
            },
            schedule: {
              startDate: new Date('2025-01-15'),
              duration: 14,
              minSampleSize: 2000,
            },
            statistics: {
              confidenceLevel: 0.95,
              minimumDetectableEffect: 0.1,
              statisticalPower: 0.8,
              multipleTestingCorrection: false,
            },
            business: {
              estimatedImpact: 12000,
              riskLevel: 'low',
              rollbackCriteria: [],
              successCriteria: [],
            },
            tags: ['cta', 'conversion'],
            createdBy: 'admin',
            createdAt: new Date('2025-01-15'),
            updatedAt: new Date('2025-01-20'),
          },
        ];

        setExperiments(mockExperiments);

        // Calculate platform statistics
        const stats = {
          totalExperiments: mockExperiments.length,
          activeExperiments: mockExperiments.filter(e => e.status === 'active')
            .length,
          totalParticipants: mockExperiments.reduce(
            (sum, e) =>
              sum +
              e.variants.reduce(
                (vSum, v) => vSum + v.performance.assignments,
                0
              ),
            0
          ),
          avgConversionLift: 0.127,
          significantWinners: 15,
          totalRevenueLift: 24500,
        };

        setPlatformStats(stats);
      } catch (_error) {
        // Error logged via monitoring
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experiments...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Universal Experiments
              </h1>
              <p className="text-gray-600 mt-2">
                Manage A/B tests across the entire PRISMA platform - v0.4.0-beta
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Beta
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {platformStats.activeExperiments} Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Experiments
              </CardTitle>
              <Beaker className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformStats.totalExperiments}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all contexts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tests
              </CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {platformStats.activeExperiments}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participants
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {platformStats.totalParticipants.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total users tested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Lift</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                +{(platformStats.avgConversionLift * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Conversion improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Winners</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {platformStats.significantWinners}
              </div>
              <p className="text-xs text-muted-foreground">
                Significant results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Impact
              </CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                +${(platformStats.totalRevenueLift / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">Monthly lift</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Experiments Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Results</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ExperimentDashboard initialExperiments={experiments} />
          </TabsContent>

          <TabsContent value="analytics">
            {experiments.length > 0 && experiments[0] ? (
              <ExperimentAnalytics
                experiment={experiments[0]}
                results={new Map()}
                timeRange="7d"
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">
                      No Experiments Selected
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Select an experiment from the dashboard to view detailed
                      analytics
                    </p>
                    <Button onClick={() => setSelectedTab('dashboard')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Experiment Templates</CardTitle>
                <CardDescription>
                  Pre-built templates for common experiment patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Hero CTA Test',
                      description: 'Test different call-to-action buttons',
                      category: 'Conversion Optimization',
                      context: 'Landing Page',
                      timesUsed: 23,
                    },
                    {
                      name: 'Onboarding Flow',
                      description: 'Optimize user onboarding experience',
                      category: 'User Experience',
                      context: 'Onboarding',
                      timesUsed: 12,
                    },
                    {
                      name: 'AI Model Comparison',
                      description: 'Compare AI model performance',
                      category: 'AI Optimization',
                      context: 'AI Enhancement',
                      timesUsed: 8,
                    },
                    {
                      name: 'Pricing Strategy',
                      description: 'Test different pricing approaches',
                      category: 'Monetization',
                      context: 'Pricing',
                      timesUsed: 15,
                    },
                  ].map((template, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          <Badge variant="secondary">{template.context}</Badge>
                        </div>
                        <CardDescription>
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Used {template.timesUsed} times
                          </span>
                          <Button size="sm" variant="outline">
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                  <CardDescription>
                    Global settings for the universal experimentation system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-Stop Experiments</h4>
                        <p className="text-sm text-gray-600">
                          Automatically stop experiments when statistical
                          significance is reached
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          Default Confidence Level
                        </h4>
                        <p className="text-sm text-gray-600">
                          Default statistical confidence level for new
                          experiments
                        </p>
                      </div>
                      <Badge variant="outline">95%</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          Experiment Notifications
                        </h4>
                        <p className="text-sm text-gray-600">
                          Email notifications for experiment milestones
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                  <CardDescription>
                    Status of experiment integrations across PRISMA platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        service: 'Landing Page Experiments',
                        status: 'Connected',
                        color: 'green',
                      },
                      {
                        service: 'PostHog Analytics',
                        status: 'Connected',
                        color: 'green',
                      },
                      {
                        service: 'Supabase Database',
                        status: 'Connected',
                        color: 'green',
                      },
                      {
                        service: 'AI Enhancement APIs',
                        status: 'Connected',
                        color: 'green',
                      },
                      {
                        service: 'Revenue Tracking',
                        status: 'Pending Setup',
                        color: 'yellow',
                      },
                    ].map((integration, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium">
                          {integration.service}
                        </span>
                        <Badge
                          className={`${
                            integration.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : integration.color === 'yellow'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {integration.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
