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
 * @fileoverview Experiment Empty State Component
 *
 * Displayed when no experiments exist or match the current filters,
 * providing clear guidance on next steps.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

'use client';

import React from 'react';
import { Beaker } from 'lucide-react';

interface ExperimentEmptyStateProps {
  hasFilters?: boolean;
}

export function ExperimentEmptyState({
  hasFilters = false,
}: ExperimentEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Beaker className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasFilters ? 'No experiments found' : 'No experiments yet'}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        {hasFilters
          ? 'Try adjusting your filters or search query to find experiments.'
          : 'Create your first experiment to start optimizing your platform with data-driven decisions.'}
      </p>
    </div>
  );
}
