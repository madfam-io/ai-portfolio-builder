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

import { Portfolio } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CompletionBadgeProps {
  portfolio: Portfolio;
  className?: string;
  showIcon?: boolean;
}

export function CompletionBadge({
  portfolio,
  className,
  showIcon = true,
}: CompletionBadgeProps) {
  // Calculate completion
  const requiredFieldsComplete = !!(
    portfolio.name &&
    portfolio.title &&
    portfolio.bio &&
    portfolio.contact?.email
  );

  if (!requiredFieldsComplete) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium text-red-600',
          className
        )}
      >
        {showIcon && <AlertCircle className="h-3 w-3" />}
        <span>Incomplete</span>
      </div>
    );
  }

  // Count optional sections
  const sections = [
    portfolio.experience?.length || 0,
    portfolio.projects?.length || 0,
    portfolio.skills?.length || 0,
    portfolio.education?.length || 0,
    portfolio.certifications?.length || 0,
  ];

  const completedSections = sections.filter(count => count > 0).length;
  const totalSections = sections.length;
  const completionPercentage = Math.round(
    ((completedSections + 2) / (totalSections + 2)) * 100
  ); // +2 for required sections

  const getColor = () => {
    if (completionPercentage === 100) return 'text-green-600';
    if (completionPercentage >= 80) return 'text-blue-600';
    if (completionPercentage >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        getColor(),
        className
      )}
    >
      {showIcon && completionPercentage === 100 && (
        <CheckCircle2 className="h-3 w-3" />
      )}
      <span>{completionPercentage}% Complete</span>
    </div>
  );
}
