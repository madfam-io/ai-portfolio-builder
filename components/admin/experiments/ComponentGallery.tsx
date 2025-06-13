import React, { useState } from 'react';
import { FiEye, FiFilter, FiPlus, FiSearch, FiStar, FiX } from 'react-icons/fi';
import type {
  ComponentLibraryItem,
  LandingComponentType,
} from '@/types/experiments';

/**
 * Component Gallery Modal
 *
 * Visual gallery for browsing and selecting landing page components
 * to add to experiment variants.
 */

interface ComponentGalleryProps {
  components: ComponentLibraryItem[];
  onSelect: (component: ComponentLibraryItem) => void;
  onClose: () => void;
}

export default function ComponentGallery({
  components,
  onSelect,
  onClose,
}: ComponentGalleryProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<
    LandingComponentType | 'all'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewComponent, setPreviewComponent] =
    useState<ComponentLibraryItem | null>(null);

  // Get unique component types
  const componentTypes = Array.from(new Set(components.map(c => c.type)));

  // Get unique categories
  const categories = Array.from(
    new Set(components.map(c => c.category).filter(Boolean))
  ) as string[];

  // Filter components
  const filteredComponents = components.filter(component => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === 'all' || component.type === selectedType;
    const matchesCategory =
      selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Group components by type
  const groupedComponents = filteredComponents.reduce(
    (acc, component) => {
      if (!acc[component.type]) {
        acc[component.type] = [];
      }
      acc[component.type]!.push(component);
      return acc;
    },
    {} as Record<string, ComponentLibraryItem[]>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Component Gallery
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select components to add to your variant
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={selectedType}
                onChange={e =>
                  setSelectedType(
                    e.target.value as LandingComponentType | 'all'
                  )
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {componentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() +
                      type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Component Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(groupedComponents).map(([type, typeComponents]) => (
            <div key={type} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeComponents.map(component => (
                  <div
                    key={component.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                  >
                    {/* Component Preview */}
                    <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative">
                      {component.thumbnailUrl ? (
                        <img
                          src={component.thumbnailUrl}
                          alt={component.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-4xl text-gray-400 mb-2">
                              {type === 'hero' && '🏠'}
                              {type === 'features' && '✨'}
                              {type === 'pricing' && '💰'}
                              {type === 'cta' && '🎯'}
                              {type === 'testimonials' && '💬'}
                              {type === 'faq' && '❓'}
                              {type === 'social_proof' && '👥'}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {component.variantName}
                            </p>
                          </div>
                        </div>
                      )}

                      {component.isPremium && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                          Premium
                        </div>
                      )}
                    </div>

                    {/* Component Info */}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {component.name}
                      </h4>
                      {component.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {component.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {component.usageCount && component.usageCount > 0 && (
                            <span>Used {component.usageCount}x</span>
                          )}
                          {component.averageConversionRate && (
                            <span className="flex items-center gap-1">
                              <FiStar className="w-3 h-3" />
                              {component.averageConversionRate}% CR
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewComponent(component)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 inline-flex items-center justify-center"
                        >
                          <FiEye className="mr-1.5" />
                          Preview
                        </button>
                        <button
                          onClick={() => onSelect(component)}
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium inline-flex items-center justify-center"
                        >
                          <FiPlus className="mr-1.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No components found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Component Preview Modal */}
      {previewComponent && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {previewComponent.name} Preview
              </h3>
              <button
                onClick={() => setPreviewComponent(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Preview would be rendered here */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Component preview would be rendered here
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Default Props:
                  </h4>
                  <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto">
                    {JSON.stringify(previewComponent.defaultProps, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setPreviewComponent(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSelect(previewComponent);
                    setPreviewComponent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Add Component
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
