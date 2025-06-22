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
 * @fileoverview Experiment Card Component
 *
 * Individual experiment card displaying key metrics, status, and progress
 * for a single experiment in the dashboard.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  UniversalExperimentConfig,
  ExperimentResult,
} from '@/lib/experimentation/universal-experiments';

interface ExperimentCardProps {
  experiment: UniversalExperimentConfig;
  onSelect: () => void;
  onLoadResults: () => void;
  results?: Map<string, ExperimentResult[]>;
  isSelected: boolean;
}

export function ExperimentCard({
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
