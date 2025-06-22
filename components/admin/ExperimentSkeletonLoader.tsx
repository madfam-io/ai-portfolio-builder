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
 * @fileoverview Experiment Skeleton Loader Component
 *
 * Loading state placeholder for experiment cards while data is being fetched,
 * providing a smooth loading experience.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ExperimentSkeletonLoaderProps {
  count?: number;
}

export function ExperimentSkeletonLoader({
  count = 3,
}: ExperimentSkeletonLoaderProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-6 w-20 ml-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
