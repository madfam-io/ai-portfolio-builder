'use client';

import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

import type { VariantResult, DetailedVariant } from '@/types/experiments';

interface VariantTableRowProps {
  result: VariantResult;
  variant: DetailedVariant;
  isWinner: boolean;
}

function VariantBadges({
  variant,
  isWinner,
}: {
  variant: DetailedVariant;
  isWinner: boolean;
}): React.ReactElement {
  return (
    <>
      {variant.isControl && (
        <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          Control
        </span>
      )}
      {isWinner && (
        <span className="px-2 py-0.5 text-xs bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 rounded">
          Winner
        </span>
      )}
    </>
  );
}

function UpliftCell({ uplift }: { uplift?: number }): React.ReactElement {
  if (uplift === undefined || uplift === 0) {
    return <span className="text-gray-400">—</span>;
  }

  const className = `font-medium ${
    uplift > 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }`;

  return (
    <span className={className}>
      {uplift > 0 ? '+' : ''}
      {uplift.toFixed(2)}%
    </span>
  );
}

function SignificanceCell({ pValue }: { pValue?: number }): React.ReactElement {
  if (!pValue) {
    return <span className="text-sm text-gray-500 dark:text-gray-400">—</span>;
  }

  if (pValue < 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
        <FiCheckCircle className="w-4 h-4" />
        <span className="text-sm">p={pValue.toFixed(3)}</span>
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-500 dark:text-gray-400">
      p={pValue.toFixed(3)}
    </span>
  );
}

export function VariantTableRow({
  result,
  variant,
  isWinner,
}: VariantTableRowProps): React.ReactElement {
  return (
    <tr className={isWinner ? 'bg-green-50 dark:bg-green-900/20' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {result.variantName}
          </span>
          <VariantBadges variant={variant} isWinner={isWinner} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {result.visitors.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {result.conversions.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {result.conversionRate.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            [{result.confidenceInterval[0].toFixed(2)}% -{' '}
            {result.confidenceInterval[1].toFixed(2)}%]
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UpliftCell uplift={result.uplift} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <SignificanceCell pValue={result.pValue} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {Math.round(variant.analytics.averageTimeOnPage)}s
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {variant.analytics.bounceRate.toFixed(1)}%
      </td>
    </tr>
  );
}