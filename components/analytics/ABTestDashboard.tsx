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

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Users,
  TrendingUp,
  FlaskConical,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  AB_TESTS,
  FEATURE_FLAGS,
  useEnhancedPostHog,
  ABTestWrapper,
} from '@/lib/analytics/posthog/enhanced-client';
import { logger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';

interface TestMetrics {
  testKey: string;
  name: string;
  status: 'active' | 'completed' | 'paused';
  totalUsers: number;
  variants: {
    name: string;
    users: number;
    conversions: number;
    conversionRate: number;
  }[];
  winner?: string;
  confidence?: number;
}

export function ABTestDashboard() {
  const { isFeatureEnabled, getABTestVariant } = useEnhancedPostHog();
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [testMetrics, setTestMetrics] = useState<TestMetrics[]>([]);
  const [featureFlagStates, setFeatureFlagStates] = useState<
    Record<string, boolean>
  >({});

  // Check feature flags
  useEffect(() => {
    const states: Record<string, boolean> = {};
    Object.entries(FEATURE_FLAGS).forEach(([key, flag]) => {
      states[key] = isFeatureEnabled(flag);
    });
    setFeatureFlagStates(states);
  }, [isFeatureEnabled]);

  // Fetch test metrics (placeholder data for now)
  useEffect(() => {
    const mockMetrics: TestMetrics[] = Object.entries(AB_TESTS).map(
      ([key, config]) => ({
        testKey: key,
        name: config.description,
        status: config.enabled ? 'active' : 'paused',
        totalUsers: Math.floor(Math.random() * 10000) + 1000,
        variants: config.variants.map(variant => ({
          name: variant,
          users: Math.floor(Math.random() * 5000) + 500,
          conversions: Math.floor(Math.random() * 500) + 50,
          conversionRate: Math.random() * 20 + 5,
        })),
        winner:
          Math.random() > 0.7
            ? config.variants[
                Math.floor(Math.random() * config.variants.length)
              ]
            : undefined,
        confidence: Math.random() * 30 + 70,
      })
    );
    setTestMetrics(mockMetrics);
    setSelectedTest(Object.keys(AB_TESTS)[0] || '');
  }, []);

  const selectedMetrics = testMetrics.find(m => m.testKey === selectedTest);

  const handleToggleTest = (testKey: string) => {
    logger.info('Toggling A/B test', { testKey });
    // Implementation would update test configuration
  };

  const _getStatusColor = (status: TestMetrics['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'completed':
        return 'text-blue-500';
      case 'paused':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">
            <FlaskConical className="h-4 w-4 mr-2" />
            A/B Tests
          </TabsTrigger>
          <TabsTrigger value="flags">
            <CheckCircle className="h-4 w-4 mr-2" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="preview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Test Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          {/* Test Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Active Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testMetrics.filter(t => t.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Running experiments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testMetrics
                    .reduce((sum, t) => sum + t.totalUsers, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all tests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Tests with Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testMetrics.filter(t => t.winner).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to implement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Details</CardTitle>
                <Select value={selectedTest} onValueChange={setSelectedTest}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {testMetrics.map(test => (
                      <SelectItem key={test.testKey} value={test.testKey}>
                        <div className="flex items-center gap-2">
                          <span>{test.name}</span>
                          <Badge
                            variant={
                              test.status === 'active' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {test.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedMetrics && (
                <div className="space-y-6">
                  {/* Test Info */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Testing since{' '}
                        {AB_TESTS[selectedTest]?.startDate.toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedMetrics.totalUsers.toLocaleString()} users
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleTest(selectedTest)}
                    >
                      {selectedMetrics.status === 'active' ? 'Pause' : 'Resume'}
                    </Button>
                  </div>

                  {/* Variant Performance */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Variant Performance</h4>
                    {selectedMetrics.variants.map(variant => (
                      <div key={variant.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                              {variant.name}
                            </span>
                            {selectedMetrics.winner === variant.name && (
                              <Badge variant="default" className="text-xs">
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {variant.conversionRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {variant.conversions} / {variant.users}
                            </p>
                          </div>
                        </div>
                        <Progress
                          value={variant.conversionRate * 5} // Scale for visibility
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Statistical Significance */}
                  {selectedMetrics.winner && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium">
                            Statistical Significance
                          </span>
                        </div>
                        <Badge variant="outline">
                          {selectedMetrics.confidence?.toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {`The "${selectedMetrics.winner}" variant is performing better with high confidence. Consider implementing this variant for all users.`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(FEATURE_FLAGS).map(([key, flag]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{flag}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          featureFlagStates[key] ? 'default' : 'secondary'
                        }
                      >
                        {featureFlagStates[key] ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {featureFlagStates[key] ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Preview how different variants appear to users. Select a test
                  to see the variations.
                </p>

                {/* Pricing Display Test Example */}
                <div className="space-y-4">
                  <h4 className="font-medium">Pricing Display Test</h4>
                  <ABTestWrapper testKey="pricing_display">
                    {variant => (
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card
                          className={cn(
                            'p-4',
                            variant === 'annual_emphasis' && 'border-primary'
                          )}
                        >
                          <h5 className="font-medium mb-2">Starter</h5>
                          <p className="text-2xl font-bold">
                            $9
                            <span className="text-sm font-normal">/month</span>
                          </p>
                          {variant === 'savings_highlight' && (
                            <Badge variant="secondary" className="mt-2">
                              Save 20% annually
                            </Badge>
                          )}
                        </Card>
                        <Card
                          className={cn(
                            'p-4',
                            variant === 'original' && 'border-primary'
                          )}
                        >
                          <h5 className="font-medium mb-2">Professional</h5>
                          <p className="text-2xl font-bold">
                            $29
                            <span className="text-sm font-normal">/month</span>
                          </p>
                          {variant === 'annual_emphasis' && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Or $290/year (save $58)
                            </p>
                          )}
                        </Card>
                        <Card className="p-4">
                          <h5 className="font-medium mb-2">Business</h5>
                          <p className="text-2xl font-bold">
                            $99
                            <span className="text-sm font-normal">/month</span>
                          </p>
                        </Card>
                      </div>
                    )}
                  </ABTestWrapper>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong>{' '}
                    {`Your current variant for "Pricing Display Test" is: `}
                    <Badge variant="outline">
                      {getABTestVariant('pricing_display') || 'Not assigned'}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
