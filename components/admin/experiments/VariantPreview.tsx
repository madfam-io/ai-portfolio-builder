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

import { Monitor, Smartphone, Tablet } from 'lucide-react';
import React from 'react';

import type { ComponentConfig } from '@/types/experiments';

/**
 * Variant Preview Component
 *
 * Shows a miniature preview of how the variant will look
 * with the configured components and theme.
 */

interface VariantPreviewProps {
  variant: {
    name: string;
    components: ComponentConfig[];
    themeOverrides: Record<string, string | number | boolean>;
  };
  device?: 'desktop' | 'tablet' | 'mobile';
}

export default function VariantPreview({
  variant,
  device = 'desktop',
}: VariantPreviewProps): React.ReactElement {
  const [selectedDevice, setSelectedDevice] = React.useState(device);

  // Calculate preview dimensions
  const getPreviewDimensions = (): string => {
    switch (selectedDevice) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  // Generate component preview
  const renderComponentPreview = (component: ComponentConfig) => {
    const baseClasses = 'relative overflow-hidden';

    switch (component.type) {
      case 'hero':
        return (
          <div
            className={`${baseClasses} bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-6 text-center`}
          >
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
            <div className="flex gap-2 justify-center">
              <div className="h-8 bg-purple-500 rounded w-24"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className={`${baseClasses} bg-white dark:bg-gray-800 p-4`}>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <div className="h-8 w-8 bg-purple-200 dark:bg-purple-800 rounded-full mx-auto mb-2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className={`${baseClasses} bg-gray-50 dark:bg-gray-900 p-4`}>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`border rounded p-3 ${i === 2 ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-1/2 mx-auto mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-6 bg-purple-500 rounded mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className={`${baseClasses} bg-purple-600 p-4 text-center`}>
            <div className="h-3 bg-white/30 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-2 bg-white/20 rounded w-1/2 mx-auto mb-3"></div>
            <div className="h-8 bg-white rounded w-32 mx-auto"></div>
          </div>
        );

      case 'testimonials':
        return (
          <div className={`${baseClasses} bg-white dark:bg-gray-800 p-4`}>
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'social_proof':
        return (
          <div className={`${baseClasses} bg-gray-100 dark:bg-gray-800 p-3`}>
            <div className="flex justify-center gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div
            className={`${baseClasses} bg-gray-100 dark:bg-gray-700 p-4 text-center`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {component.type} ({component.variant})
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Selector */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setSelectedDevice('desktop')}
          className={`p-2 rounded transition-colors ${
            selectedDevice === 'desktop'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Desktop"
        >
          <Monitor className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSelectedDevice('tablet')}
          className={`p-2 rounded transition-colors ${
            selectedDevice === 'tablet'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Tablet"
        >
          <Tablet className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSelectedDevice('mobile')}
          className={`p-2 rounded transition-colors ${
            selectedDevice === 'mobile'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Mobile"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div
          className={`${getPreviewDimensions()} transition-all duration-300`}
        >
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
            {/* Browser Chrome */}
            <div className="bg-gray-200 dark:bg-gray-700 p-2 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded text-xs px-2 py-1 text-gray-500 dark:text-gray-400">
                prisma.madfam.io
              </div>
            </div>

            {/* Page Content */}
            <div
              className="max-h-96 overflow-y-auto"
              style={
                {
                  // Apply theme overrides
                  ...(variant.themeOverrides.primaryColor && {
                    '--color-primary': variant.themeOverrides.primaryColor,
                  }),
                  ...(variant.themeOverrides.fontFamily && {
                    fontFamily: variant.themeOverrides.fontFamily,
                  }),
                } as React.CSSProperties
              }
            >
              {variant.components.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No components added yet</p>
                  <p className="text-xs mt-2">Add components to see preview</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {variant.components
                    .filter(c => c.visible)
                    .sort((a, b) => a.order - b.order)
                    .map((component, index) => (
                      <div key={index}>{renderComponentPreview(component)}</div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Variant Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium">{variant.name}</p>
        <p>
          {variant.components.filter(c => c.visible).length} visible components
        </p>
      </div>
    </div>
  );
}
