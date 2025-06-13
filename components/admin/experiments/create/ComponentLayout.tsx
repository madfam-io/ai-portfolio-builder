import {
  ChevronDown,
  ChevronUp,
  Eye,
  Grid,
  Layers,
  Settings,
  Trash2,
} from 'lucide-react';
import React from 'react';

import type { ComponentConfig } from '@/types/experiments';

interface ComponentLayoutProps {
  components: ComponentConfig[];
  selectedComponentIndex: number | null;
  variantName: string;
  onShowGallery: () => void;
  onMoveComponent: (index: number, direction: 'up' | 'down') => void;
  onToggleVisibility: (index: number) => void;
  onRemoveComponent: (index: number) => void;
  onSelectComponent: (index: number | null) => void;
}

export function ComponentLayout({
  components,
  selectedComponentIndex,
  variantName,
  onShowGallery,
  onMoveComponent,
  onToggleVisibility,
  onRemoveComponent,
  onSelectComponent,
}: ComponentLayoutProps): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Component Layout - {variantName || 'Select a variant'}
        </h2>
        <button
          onClick={onShowGallery}
          className="btn-secondary text-sm inline-flex items-center"
        >
          <Grid className="mr-1" />
          Add Component
        </button>
      </div>

      <div className="space-y-3">
        {components.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Layers className="mx-auto w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              No components added yet
            </p>
            <button
              onClick={onShowGallery}
              className="btn-primary text-sm"
            >
              Add First Component
            </button>
          </div>
        ) : (
          components.map((component, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                !component.visible ? 'opacity-50' : ''
              } ${
                selectedComponentIndex === index
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onMoveComponent(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onMoveComponent(index, 'down')}
                      disabled={index === components.length - 1}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {component.type.charAt(0).toUpperCase() +
                        component.type.slice(1).replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Variant: {component.variant}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleVisibility(index)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title={component.visible ? 'Hide' : 'Show'}
                  >
                    <Eye
                      className={`w-4 h-4 ${!component.visible ? 'text-gray-400' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() =>
                      onSelectComponent(
                        selectedComponentIndex === index ? null : index
                      )
                    }
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Configure"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveComponent(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedComponentIndex === index && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Component Properties
                  </p>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto">
                    {JSON.stringify(component.props, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}