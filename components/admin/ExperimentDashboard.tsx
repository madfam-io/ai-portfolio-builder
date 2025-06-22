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

/**
 * @fileoverview Universal Experiment Management Dashboard
 *
 * Comprehensive admin interface for creating, managing, and analyzing experiments
 * across the entire PRISMA platform. Part of v0.4.0-beta universal experimentation
 * framework that enables A/B testing absolutely everywhere.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
// import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Recharts imports removed - using custom visualizations
import {
  Play,
  Pause,
  Eye,
  DollarSign,
  Plus,
  // Filter,
  Search,
  // Calendar,
  BarChart3,
  Target,
  Beaker,
  // Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  // AlertTriangle,
} from 'lucide-react';

import {
  universalExperimentEngine,
  UniversalExperimentConfig,
  // UniversalExperimentVariant,
  ExperimentContext,
  ExperimentType,
  ExperimentResult,
} from '@/lib/experimentation/universal-experiments';

interface ExperimentDashboardProps {
  initialExperiments?: UniversalExperimentConfig[];
}

export function ExperimentDashboard({
  initialExperiments = [],
}: ExperimentDashboardProps) {
  const [experiments] =
    useState<UniversalExperimentConfig[]>(initialExperiments);
  const [selectedExperiment, setSelectedExperiment] =
    useState<UniversalExperimentConfig | null>(null);
  const [results, setResults] = useState<
    Map<string, Map<string, ExperimentResult[]>>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contextFilter, setContextFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Refresh experiments data
  const refreshExperiments = useCallback(async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // For now, we'll simulate with the existing data
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (_error) {
      // console.error('Failed to refresh experiments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load experiment results
  const loadExperimentResults = useCallback(async (experimentId: string) => {
    try {
      const experimentResults =
        await universalExperimentEngine.getExperimentResults(experimentId);
      setResults(prev => new Map(prev).set(experimentId, experimentResults));
    } catch (_error) {
      // console.error('Failed to load experiment results:', error);
    }
  }, []);

  // Filter experiments
  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch =
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    const matchesContext =
      contextFilter === 'all' || exp.context === contextFilter;

    return matchesSearch && matchesStatus && matchesContext;
  });

  // Calculate summary statistics
  const summaryStats = {
    total: experiments.length,
    active: experiments.filter(e => e.status === 'active').length,
    completed: experiments.filter(e => e.status === 'completed').length,
    draft: experiments.filter(e => e.status === 'draft').length,
    totalVariants: experiments.reduce((sum, e) => sum + e.variants.length, 0),
    avgConversionRate: 0.125, // Mock data
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Universal Experiments
            </h1>
            <p className="text-gray-600 mt-2">
              Manage A/B tests across the entire PRISMA platform - v0.4.0-beta
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={refreshExperiments}
              disabled={loading}
            >
              {loading ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              Refresh
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Experiment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create Universal Experiment</DialogTitle>
                  <DialogDescription>
                    Set up a new A/B test for any part of the PRISMA platform
                  </DialogDescription>
                </DialogHeader>
                <ExperimentCreator onClose={() => setShowCreateDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Experiments
              </CardTitle>
              <Beaker className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.active} active, {summaryStats.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tests
              </CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summaryStats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.totalVariants} total variants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Conversion
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(summaryStats.avgConversionRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all active experiments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Impact
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">+$12.4K</div>
              <p className="text-xs text-muted-foreground">
                Estimated monthly lift
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search experiments..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={contextFilter} onValueChange={setContextFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contexts</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="ai_enhancement">AI Enhancement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Experiments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Experiments</CardTitle>
                <CardDescription>
                  {filteredExperiments.length} of {experiments.length}{' '}
                  experiments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredExperiments.map(experiment => (
                      <ExperimentCard
                        key={experiment.id}
                        experiment={experiment}
                        onSelect={() => setSelectedExperiment(experiment)}
                        onLoadResults={() =>
                          loadExperimentResults(experiment.id)
                        }
                        results={results.get(experiment.id)}
                        isSelected={selectedExperiment?.id === experiment.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Experiment Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Experiment Details</CardTitle>
                <CardDescription>
                  {selectedExperiment
                    ? selectedExperiment.name
                    : 'Select an experiment to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedExperiment ? (
                  <ExperimentDetails
                    experiment={selectedExperiment}
                    results={results.get(selectedExperiment.id)}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Beaker className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select an experiment to view detailed analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExperimentCardProps {
  experiment: UniversalExperimentConfig;
  onSelect: () => void;
  onLoadResults: () => void;
  results?: Map<string, ExperimentResult[]>;
  isSelected: boolean;
}

function ExperimentCard({
  experiment,
  onSelect,
  onLoadResults,
  results: _results,
  isSelected,
}: ExperimentCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    active: <Play className="w-3 h-3" />,
    draft: <Clock className="w-3 h-3" />,
    completed: <CheckCircle className="w-3 h-3" />,
    paused: <Pause className="w-3 h-3" />,
    archived: <XCircle className="w-3 h-3" />,
  };

  // Calculate progress
  const totalAssignments = experiment.variants.reduce(
    (sum, v) => sum + v.performance.assignments,
    0
  );
  const progress = Math.min(
    (totalAssignments / experiment.schedule.minSampleSize) * 100,
    100
  );

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{experiment.description}</p>
        </div>
        <Badge className={`ml-2 ${statusColors[experiment.status]}`}>
          {statusIcons[experiment.status]}
          <span className="ml-1 capitalize">{experiment.status}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Context</p>
          <p className="text-sm font-medium capitalize">
            {experiment.context.replace('_', ' ')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Type</p>
          <p className="text-sm font-medium capitalize">{experiment.type}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>
            {totalAssignments.toLocaleString()} /{' '}
            {experiment.schedule.minSampleSize.toLocaleString()}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-2">
          {experiment.variants.map((variant, _index) => (
            <div key={variant.id} className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  variant.isControl ? 'bg-gray-400' : 'bg-blue-500'
                }`}
              />
              <span className="text-xs text-gray-600">{variant.name}</span>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            onLoadResults();
          }}
        >
          <Eye className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

interface ExperimentDetailsProps {
  experiment: UniversalExperimentConfig;
  results?: Map<string, ExperimentResult[]>;
}

function ExperimentDetails({ experiment, results }: ExperimentDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h4 className="font-semibold mb-3">Key Metrics</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Assignments</div>
            <div className="text-lg font-semibold">
              {experiment.variants
                .reduce((sum, v) => sum + v.performance.assignments, 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Conversions</div>
            <div className="text-lg font-semibold">
              {experiment.variants
                .reduce((sum, v) => sum + v.performance.conversions, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Variants Performance */}
      <div>
        <h4 className="font-semibold mb-3">Variant Performance</h4>
        <div className="space-y-2">
          {experiment.variants.map(variant => {
            const conversionRate =
              variant.performance.assignments > 0
                ? (variant.performance.conversions /
                    variant.performance.assignments) *
                  100
                : 0;

            return (
              <div
                key={variant.id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      variant.isControl ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-sm font-medium">{variant.name}</span>
                  {variant.isControl && (
                    <Badge variant="outline" className="text-xs">
                      Control
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {variant.performance.assignments} users
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistical Significance */}
      {results && (
        <div>
          <h4 className="font-semibold mb-3">Statistical Analysis</h4>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-2">
              Primary Metric Results
            </div>
            {Array.from(results.entries()).map(
              ([variantId, variantResults]) => {
                const variant = experiment.variants.find(
                  v => v.id === variantId
                );
                const primaryResult = variantResults.find(
                  r => r.metricId === experiment.metrics.primary.id
                );

                if (!variant || !primaryResult) return null;

                return (
                  <div
                    key={variantId}
                    className="flex justify-between items-center py-1"
                  >
                    <span className="text-sm">{variant.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {(primaryResult.effect * 100).toFixed(1)}%
                      </span>
                      {primaryResult.statisticalSignificance ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Experiment Configuration */}
      <div>
        <h4 className="font-semibold mb-3">Configuration</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Priority:</span>
            <span className="capitalize">{experiment.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Traffic Allocation:</span>
            <span>
              {(experiment.targeting.trafficAllocation * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Confidence Level:</span>
            <span>
              {(experiment.statistics.confidenceLevel * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Min Sample Size:</span>
            <span>{experiment.schedule.minSampleSize.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExperimentCreatorProps {
  onClose: () => void;
}

function ExperimentCreator({ onClose }: ExperimentCreatorProps) {
  const [step, setStep] = useState(1);
  const [experimentData, setExperimentData] = useState({
    name: '',
    description: '',
    hypothesis: '',
    context: 'landing_page' as ExperimentContext,
    type: 'component' as ExperimentType,
    primary_metric: 'conversion_rate',
    traffic_allocation: 50,
    confidence_level: 95,
    min_sample_size: 1000,
  });

  const contexts: {
    value: ExperimentContext;
    label: string;
    description: string;
  }[] = [
    {
      value: 'landing_page',
      label: 'Landing Page',
      description: 'Homepage and marketing pages',
    },
    {
      value: 'editor',
      label: 'Portfolio Editor',
      description: 'Portfolio creation and editing',
    },
    {
      value: 'onboarding',
      label: 'Onboarding',
      description: 'User signup and initial setup',
    },
    {
      value: 'pricing',
      label: 'Pricing Page',
      description: 'Subscription and payment flow',
    },
    {
      value: 'ai_enhancement',
      label: 'AI Features',
      description: 'AI-powered content generation',
    },
    {
      value: 'dashboard',
      label: 'Dashboard',
      description: 'User dashboard and analytics',
    },
  ];

  const types: { value: ExperimentType; label: string; description: string }[] =
    [
      {
        value: 'component',
        label: 'Component Test',
        description: 'Individual UI component variations',
      },
      {
        value: 'flow',
        label: 'Flow Test',
        description: 'Complete user journey variations',
      },
      {
        value: 'content',
        label: 'Content Test',
        description: 'Text, messaging, and copy variations',
      },
      {
        value: 'pricing',
        label: 'Pricing Test',
        description: 'Pricing strategy and display variations',
      },
      {
        value: 'algorithm',
        label: 'Algorithm Test',
        description: 'AI model and logic variations',
      },
      {
        value: 'feature',
        label: 'Feature Flag',
        description: 'Feature enablement and behavior',
      },
    ];

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Tabs value={`step-${step}`} className="w-full">
        {/* Step Navigation */}
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step-1">Basic Info</TabsTrigger>
            <TabsTrigger value="step-2">Configuration</TabsTrigger>
            <TabsTrigger value="step-3">Review</TabsTrigger>
          </TabsList>
        </div>

        {/* Step 1: Basic Information */}
        <TabsContent value="step-1" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Experiment Name</Label>
              <Input
                id="name"
                value={experimentData.name}
                onChange={e =>
                  setExperimentData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Hero CTA Button Test"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={experimentData.description}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of what you're testing"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="hypothesis">Hypothesis</Label>
              <Textarea
                id="hypothesis"
                value={experimentData.hypothesis}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    hypothesis: e.target.value,
                  }))
                }
                placeholder="e.g., Changing the CTA button color from blue to green will increase conversions by 10%"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>Next</Button>
          </div>
        </TabsContent>

        {/* Step 2: Configuration */}
        <TabsContent value="step-2" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Context</Label>
              <Select
                value={experimentData.context}
                onValueChange={(value: ExperimentContext) =>
                  setExperimentData(prev => ({ ...prev, context: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contexts.map(context => (
                    <SelectItem key={context.value} value={context.value}>
                      <div>
                        <div className="font-medium">{context.label}</div>
                        <div className="text-sm text-gray-500">
                          {context.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Experiment Type</Label>
              <Select
                value={experimentData.type}
                onValueChange={(value: ExperimentType) =>
                  setExperimentData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Traffic Allocation (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={experimentData.traffic_allocation}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    traffic_allocation: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <Label>Confidence Level (%)</Label>
              <Select
                value={experimentData.confidence_level.toString()}
                onValueChange={value =>
                  setExperimentData(prev => ({
                    ...prev,
                    confidence_level: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Sample Size</Label>
              <Input
                type="number"
                min="100"
                value={experimentData.min_sample_size}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    min_sample_size: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        </TabsContent>

        {/* Step 3: Review */}
        <TabsContent value="step-3" className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Experiment Summary</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Name:</strong> {experimentData.name}
              </div>
              <div>
                <strong>Context:</strong>{' '}
                {contexts.find(c => c.value === experimentData.context)?.label}
              </div>
              <div>
                <strong>Type:</strong>{' '}
                {types.find(t => t.value === experimentData.type)?.label}
              </div>
              <div>
                <strong>Traffic:</strong> {experimentData.traffic_allocation}%
              </div>
              <div>
                <strong>Confidence:</strong> {experimentData.confidence_level}%
              </div>
              <div>
                <strong>Sample Size:</strong>{' '}
                {experimentData.min_sample_size.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose}>Create Experiment</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
