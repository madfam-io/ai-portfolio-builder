import { Layers, Percent, Plus, Trash2 } from 'lucide-react';
import React from 'react';

import type { ComponentConfig } from '@/types/experiments';

export interface VariantConfig {
  name: string;
  isControl: boolean;
  trafficPercentage: number;
  components: ComponentConfig[];
  themeOverrides: Record<string, string | number | boolean>;
}

interface VariantConfigurationProps {
  variants: VariantConfig[];
  selectedVariantIndex: number;
  setSelectedVariantIndex: (index: number) => void;
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateVariant: (index: number, updates: Partial<VariantConfig>) => void;
  errors: {
    variants?: string;
    traffic?: string;
    control?: string;
    [key: string]: string | undefined;
  };
  remainingTrafficPercentage: number;
}

export function VariantConfiguration({
  variants,
  selectedVariantIndex,
  setSelectedVariantIndex,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  errors,
  remainingTrafficPercentage,
}: VariantConfigurationProps): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Variants Configuration
        </h2>
        <button
          onClick={onAddVariant}
          className="btn-secondary text-sm inline-flex items-center"
        >
          <Plus className="mr-1" />
          Add Variant
        </button>
      </div>

      {errors.variants && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {errors.variants}
        </p>
      )}
      {errors.traffic && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {errors.traffic}
        </p>
      )}
      {errors.control && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {errors.control}
        </p>
      )}

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedVariantIndex === index
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setSelectedVariantIndex(index)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={e =>
                      onUpdateVariant(index, { name: e.target.value })
                    }
                    onClick={e => e.stopPropagation()}
                    className="font-medium bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-purple-500 px-1 py-0.5"
                  />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={variant.isControl}
                      onChange={e =>
                        onUpdateVariant(index, {
                          isControl: e.target.checked,
                        })
                      }
                      onClick={e => e.stopPropagation()}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Control
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={variant.trafficPercentage}
                      onChange={e =>
                        onUpdateVariant(index, {
                          trafficPercentage: Number(e.target.value),
                        })
                      }
                      onClick={e => e.stopPropagation()}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-gray-500 dark:text-gray-400">%</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Layers className="w-4 h-4" />
                    <span>{variant.components.length} components</span>
                  </div>
                </div>
              </div>

              {variants.length > 2 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveVariant(index);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {remainingTrafficPercentage !== 0 && (
        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
          Remaining traffic to allocate: {remainingTrafficPercentage}%
        </p>
      )}
    </div>
  );
}