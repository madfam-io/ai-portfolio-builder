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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Plus,
  BarChart3,
  Target,
  Beaker,
  Clock,
  Play,
} from 'lucide-react';

import {
  universalExperimentEngine,
  UniversalExperimentConfig,
  ExperimentResult,
} from '@/lib/experimentation/universal-experiments';

// Import extracted components
import { ExperimentFilters } from './ExperimentFilters';
import { ExperimentCard } from './ExperimentCard';
import { ExperimentCreator } from './ExperimentCreateModal';
import { ExperimentDetails } from './ExperimentDetails';
import { ExperimentEmptyState } from './ExperimentEmptyState';
import { ExperimentSkeletonLoader } from './ExperimentSkeletonLoader';

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
        <ExperimentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          contextFilter={contextFilter}
          onContextChange={setContextFilter}
        />

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
                  {loading ? (
                    <ExperimentSkeletonLoader count={5} />
                  ) : filteredExperiments.length > 0 ? (
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
                  ) : (
                    <ExperimentEmptyState
                      hasFilters={
                        searchQuery !== '' ||
                        statusFilter !== 'all' ||
                        contextFilter !== 'all'
                      }
                    />
                  )}
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
