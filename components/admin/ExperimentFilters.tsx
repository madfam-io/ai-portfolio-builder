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
 * @fileoverview Experiment Filters Component
 *
 * Filter controls for the experiment dashboard, allowing users to search
 * and filter experiments by status and context.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ExperimentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  contextFilter: string;
  onContextChange: (value: string) => void;
}

export function ExperimentFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  contextFilter,
  onContextChange,
}: ExperimentFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={onStatusChange}>
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
          <Select value={contextFilter} onValueChange={onContextChange}>
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
  );
}
