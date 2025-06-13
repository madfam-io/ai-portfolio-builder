'use client';

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Grid,
  Layers,
  Percent,
  Plus,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import ComponentGallery from '@/components/admin/experiments/ComponentGallery';
import VariantPreview from '@/components/admin/experiments/VariantPreview';
import { useAuth } from '@/lib/contexts/AuthContext';
// import { useLanguage } from '@/lib/i18n/refactored-context'; // _TODO: Add translations
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

import type {
  CreateExperimentRequest,
  ComponentConfig,
  ComponentLibraryItem,
  ExperimentTemplate,
} from '@/types/experiments';

/**
 * Create New Experiment Page
 *
 * Interface for creating new A/B testing experiments with visual
 * component selection and variant configuration.
 */

interface VariantConfig {
  name: string;
  isControl: boolean;
  trafficPercentage: number;
  components: ComponentConfig[];
  themeOverrides: Record<string, string | number | boolean>;
}
export default function CreateExperimentPage(): JSX.Element {
  const { user, isAdmin, canAccess } = useAuth();
  // const { t } = useLanguage(); // _TODO: Add translations
  const router = useRouter();

  // Form state
  const [experimentName, setExperimentName] = useState('');
  const [description, setDescription] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [primaryMetric, setPrimaryMetric] = useState('signup_rate');
  const [trafficPercentage, setTrafficPercentage] = useState(100);
  const [variants, setVariants] = useState<VariantConfig[]>([
    {
      name: 'Control',
      isControl: true,
      trafficPercentage: 50,
      components: [],
      themeOverrides: {},
    },
    {
      name: 'Variant A',
      isControl: false,
      trafficPercentage: 50,
      components: [],
      themeOverrides: {},
    },
  ]);

  // UI state
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<
    number | null
  >(null);
  const [showGallery, setShowGallery] = useState(false);
  const [componentLibrary, setComponentLibrary] = useState<
    ComponentLibraryItem[]
  >([]);
  const [templates, setTemplates] = useState<ExperimentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check admin access
  useEffect(() => {
    if (!isAdmin || !canAccess('experiments:manage')) {
      router.push('/dashboard');
    }
  }, [isAdmin, canAccess, router]);

  // Load component library and templates
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const supabase = createClient();
        if (!supabase) {
          logger.error(
            'Database connection not available',
            new Error('Supabase client is null')
          );
          return;
        }
        // Load component library
        const { data: components, error: componentsError } = await supabase
          .from('landing_component_library')
          .select('*')
          .eq('is_active', true)
          .order('type, variant_name');

        if (componentsError !== null && componentsError !== undefined)
          throw componentsError;
        if (components != null) {
          setComponentLibrary(components);
        }
        // Load experiment templates
        const { data: templateData, error: templatesError } = await supabase
          .from('experiment_templates')
          .select('*')
          .eq('is_active', true)
          .order('usage_count', { ascending: false });

        if (templatesError !== null && templatesError !== undefined)
          throw templatesError;
        if (templateData != null) {
          setTemplates(templateData);
        }
      } catch (error) {
        logger.error('Failed to load component library', error as Error);
      }
    };

    loadData();
  }, []);

  // Calculate remaining traffic percentage
  const getRemainingTrafficPercentage = (): number => {
    const total = variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    return 100 - total;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!experimentName.trim()) {
      newErrors.name = 'Experiment name is required';
    }
    if (variants.length < 2) {
      newErrors.variants = 'At least 2 variants are required';
    }
    const totalTraffic = variants.reduce(
      (sum, v) => sum + v.trafficPercentage,
      0
    );
    if (totalTraffic !== 100) {
      newErrors.traffic = `Traffic allocation must equal 100% (currently ${totalTraffic}%)`;
    }
    const hasControl = variants.some(v => v.isControl);
    if (!hasControl) {
      newErrors.control = 'One variant must be marked as control';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new variant
  const addVariant = (): void => {
    const _newVariant: VariantConfig = {
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      isControl: false,
      trafficPercentage: 0,
      components: [],
      themeOverrides: {},
    };
    setVariants([...variants, _newVariant]);
  };

  // Remove variant
  const removeVariant = (index: number): void => {
    if (variants.length <= 2) return; // Keep at least 2 variants
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    if (selectedVariantIndex >= newVariants.length) {
      setSelectedVariantIndex(newVariants.length - 1);
    }
  };

  // Update variant
  const updateVariant = (
    _index: number,
    updates: Partial<VariantConfig>
  ): void => {
    const newVariants = [...variants];
    const currentVariant = newVariants[_index];
    if (!currentVariant) return;

    newVariants[_index] = { ...currentVariant, ...updates };

    // Ensure only one control
    if (updates.isControl === true) {
      newVariants.forEach((v, i) => {
        if (i !== _index) v.isControl = false;
      });
    }
    setVariants(newVariants);
  };

  // Add component to variant
  const addComponent = (component: ComponentLibraryItem): void => {
    const selectedVariant = variants[selectedVariantIndex];
    if (!selectedVariant) return;

    const _newComponent: ComponentConfig = {
      type: component.type,
      variant: component.variantName,
      order: selectedVariant.components.length + 1,
      visible: true,
      props: component.defaultProps != null ? component.defaultProps : {},
    };

    const newVariants = [...variants];
    const updatedVariant = newVariants[selectedVariantIndex];
    if (!updatedVariant) return;

    updatedVariant.components.push(_newComponent);
    setVariants(newVariants);
    setShowGallery(false);
  };

  // Remove component from variant
  const removeComponent = (
    _variantIndex: number,
    _componentIndex: number
  ): void => {
    const newVariants = [...variants];
    const variant = newVariants[_variantIndex];
    if (!variant) return;

    variant.components.splice(_componentIndex, 1);
    // Reorder remaining components
    variant.components.forEach((c, i) => {
      c.order = i + 1;
    });
    setVariants(newVariants);
  };

  // Move component up/down
  const moveComponent = (
    _variantIndex: number,
    _componentIndex: number,
    _direction: 'up' | 'down'
  ): void => {
    const newVariants = [...variants];
    const variant = newVariants[_variantIndex];
    if (!variant) return;

    const components = variant.components;
    const newIndex =
      _direction === 'up' ? _componentIndex - 1 : _componentIndex + 1;

    if (newIndex < 0 || newIndex >= components.length) return;

    const temp = components[_componentIndex];
    const newComp = components[newIndex];
    if (!temp || !newComp) return;

    components[_componentIndex] = newComp;
    components[newIndex] = temp;
    components.forEach((c, i) => {
      c.order = i + 1;
    });

    setVariants(newVariants);
  };

  // Toggle component visibility
  const toggleComponentVisibility = (
    _variantIndex: number,
    _componentIndex: number
  ): void => {
    const newVariants = [...variants];
    const variant = newVariants[_variantIndex];
    if (!variant) return;

    const component = variant.components[_componentIndex];
    if (!component) return;

    component.visible = !component.visible;
    setVariants(newVariants);
  };

  // Update component props - removed as unused

  // Apply template
  const applyTemplate = (template: ExperimentTemplate): void => {
    setExperimentName(template.name);
    setDescription(template.description || '');
    setHypothesis(template.hypothesisTemplate || '');
    setPrimaryMetric(template.primaryMetric);

    // Apply variant configurations
    if (template.variants != null && template.variants.length > 0) {
      const newVariants: VariantConfig[] = template.variants.map(
        (v, index) => ({
          name: v.name,
          isControl: index === 0,
          trafficPercentage: Math.floor(100 / template.variants.length),
          components: v.components || [],
          themeOverrides:
            v.themeOverrides != null
              ? ({ ...v.themeOverrides } as Record<
                  string,
                  string | number | boolean
                >)
              : {},
        })
      );
      setVariants(newVariants);
    }
  };

  // Create experiment
  const handleCreateExperiment = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        logger.error(
          'Database connection not available',
          new Error('Supabase client is null')
        );
        setLoading(false);
        return;
      }
      const experimentData: CreateExperimentRequest = {
        name: experimentName,
        description,
        hypothesis,
        primaryMetric,
        trafficPercentage,
        variants: variants.map(v => ({
          name: v.name,
          isControl: v.isControl,
          trafficPercentage: v.trafficPercentage,
          components: v.components,
          themeOverrides: v.themeOverrides,
        })),
      };

      const { data, error } = await supabase
        .from('landing_page_experiments')
        .insert({
          name: experimentData.name,
          description: experimentData.description,
          hypothesis: experimentData.hypothesis,
          primary_metric: experimentData.primaryMetric,
          traffic_percentage: experimentData.trafficPercentage,
          status: 'draft',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error !== null && error !== undefined) throw error;

      // Create variants
      const variantPromises = experimentData.variants.map(v =>
        supabase.from('landing_page_variants').insert({
          experiment_id: data.id,
          name: v.name,
          is_control: v.isControl,
          traffic_percentage: v.trafficPercentage,
          components: v.components,
          theme_overrides: v.themeOverrides,
        })
      );

      await Promise.all(variantPromises);

      router.push('/admin/experiments');
    } catch (error) {
      logger.error('Failed to create experiment', error as Error);
      setErrors({ _submit: 'Failed to create experiment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/experiments')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Create New Experiment
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up A/B test for landing page variations
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateExperiment}
              disabled={loading}
              className="btn-primary inline-flex items-center"
            >
              <Save className="mr-2" />
              {loading ? 'Creating...' : 'Create Experiment'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experiment Name *
                  </label>
                  <input
                    type="text"
                    value={experimentName}
                    onChange={e => setExperimentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 _dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Hero Message Test"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 _dark:text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 _dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 _dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brief description of what you're testing..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hypothesis
                  </label>
                  <textarea
                    value={hypothesis}
                    onChange={e => setHypothesis(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 _dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Changing the CTA button color to green will increase click-through rates by 15%"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 _dark:text-gray-300 mb-1">
                      Primary Metric
                    </label>
                    <select
                      value={primaryMetric}
                      onChange={e => setPrimaryMetric(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 _dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="signup_rate">Signup Rate</option>
                      <option value="demo_click_rate">Demo Click Rate</option>
                      <option value="cta_click_rate">CTA Click Rate</option>
                      <option value="pricing_view_rate">
                        Pricing View Rate
                      </option>
                      <option value="time_on_page">Time on Page</option>
                      <option value="bounce_rate">Bounce Rate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Traffic Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={trafficPercentage}
                        onChange={e =>
                          setTrafficPercentage(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-8 border border-gray-300 _dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Variants Configuration
                </h2>
                <button
                  onClick={addVariant}
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
                <p className="mb-4 text-sm text-red-600 _dark:text-red-400">
                  {errors.traffic}
                </p>
              )}
              {errors.control && (
                <p className="mb-4 text-sm text-red-600 _dark:text-red-400">
                  {errors.control}
                </p>
              )}
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedVariantIndex === index
                        ? 'border-purple-500 bg-purple-50 _dark:bg-purple-900/20'
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
                              updateVariant(index, { name: e.target.value })
                            }
                            className="font-medium bg-transparent border-b border-transparent _hover:border-gray-300 dark:hover:border-gray-600 focus:border-purple-500 px-1 py-0.5"
                          />
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={variant.isControl}
                              onChange={e =>
                                updateVariant(index, {
                                  isControl: e.target.checked,
                                })
                              }
                              className="rounded border-gray-300 text-purple-600 _focus:ring-purple-500"
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
                                updateVariant(index, {
                                  trafficPercentage: Number(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1 border border-gray-300 _dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            />
                            <span className="text-gray-500 dark:text-gray-400">
                              %
                            </span>
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
                            removeVariant(index);
                          }}
                          className="p-1 text-red-600 _hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {getRemainingTrafficPercentage() !== 0 && (
                <p className="mt-2 text-sm text-yellow-600 _dark:text-yellow-400">
                  Remaining traffic to allocate:{' '}
                  {getRemainingTrafficPercentage()}%
                </p>
              )}
            </div>

            {/* Component Layout */}
            <div className="bg-white _dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Component Layout -{' '}
                  {variants[selectedVariantIndex]?.name || 'Select a variant'}
                </h2>
                <button
                  onClick={() => setShowGallery(true)}
                  className="btn-secondary text-sm inline-flex items-center"
                >
                  <Grid className="mr-1" />
                  Add Component
                </button>
              </div>

              <div className="space-y-3">
                {variants[selectedVariantIndex]?.components.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 _dark:border-gray-600 rounded-lg">
                    <Layers className="mx-auto w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-3">
                      No components added yet
                    </p>
                    <button
                      onClick={() => setShowGallery(true)}
                      className="btn-primary text-sm"
                    >
                      Add First Component
                    </button>
                  </div>
                ) : (
                  variants[selectedVariantIndex]?.components.map(
                    (component, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          !component.visible ? 'opacity-50' : ''
                        } ${
                          selectedComponentIndex === index
                            ? 'border-purple-500 bg-purple-50 _dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() =>
                                  moveComponent(
                                    selectedVariantIndex,
                                    index,
                                    'up'
                                  )
                                }
                                disabled={index === 0}
                                className="p-1 _hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  moveComponent(
                                    selectedVariantIndex,
                                    index,
                                    'down'
                                  )
                                }
                                disabled={
                                  index ===
                                  (variants[selectedVariantIndex]?.components
                                    .length ?? 0) -
                                    1
                                }
                                className="p-1 _hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {component.type.charAt(0).toUpperCase() +
                                  component.type.slice(1).replace('_', ' ')}
                              </h4>
                              <p className="text-sm text-gray-500 _dark:text-gray-400">
                                Variant: {component.variant}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                toggleComponentVisibility(
                                  selectedVariantIndex,
                                  index
                                )
                              }
                              className="p-2 _hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title={component.visible ? 'Hide' : 'Show'}
                            >
                              <Eye
                                className={`w-4 h-4 ${!component.visible ? 'text-gray-400' : ''}`}
                              />
                            </button>
                            <button
                              onClick={() =>
                                setSelectedComponentIndex(
                                  selectedComponentIndex === index
                                    ? null
                                    : index
                                )
                              }
                              className="p-2 _hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Configure"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                removeComponent(selectedVariantIndex, index)
                              }
                              className="p-2 text-red-600 _hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
                    )
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Templates */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-white _dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Live Preview
              </h3>
              {variants[selectedVariantIndex] && (
                <VariantPreview
                  variant={{
                    name: variants[selectedVariantIndex].name,
                    components: variants[selectedVariantIndex].components,
                    themeOverrides:
                      variants[selectedVariantIndex].themeOverrides,
                  }}
                />
              )}
            </div>

            {/* Templates */}
            {templates.length > 0 && (
              <div className="bg-white _dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Start Templates
                </h3>
                <div className="space-y-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-3 border border-gray-200 _dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                      {template.successRate && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          {template.successRate}% success rate
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Component Gallery Modal */}
      {showGallery && (
        <ComponentGallery
          components={componentLibrary}
          onSelect={addComponent}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}
