'use client';

import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import ComponentGallery from '@/components/admin/experiments/ComponentGallery';
import { ComponentLayout } from '@/components/admin/experiments/create/ComponentLayout';
import { ExperimentForm } from '@/components/admin/experiments/create/ExperimentForm';
import {
  VariantConfig,
  VariantConfiguration,
} from '@/components/admin/experiments/create/VariantConfiguration';
import VariantPreview from '@/components/admin/experiments/VariantPreview';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  getRemainingTrafficPercentage,
  validateExperimentForm,
  type ExperimentValidationErrors,
} from '@/lib/utils/experiment-validation';
import { logger } from '@/lib/utils/logger';

import type {
  ComponentConfig,
  ComponentLibraryItem,
  CreateExperimentRequest,
  ExperimentTemplate,
} from '@/types/experiments';

/**
 * Create New Experiment Page
 *
 * Interface for creating new A/B testing experiments with visual
 * component selection and variant configuration.
 */
export default function CreateExperimentPage() {
  const { user, isAdmin, canAccess } = useAuth();
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
  const [errors, setErrors] = useState<ExperimentValidationErrors>({});

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

        if (componentsError) throw componentsError;
        if (components) {
          setComponentLibrary(components);
        }

        // Load experiment templates
        const { data: templateData, error: templatesError } = await supabase
          .from('experiment_templates')
          .select('*')
          .eq('is_active', true)
          .order('usage_count', { ascending: false });

        if (templatesError) throw templatesError;
        if (templateData) {
          setTemplates(templateData);
        }
      } catch (error) {
        logger.error(
          'Failed to load component library',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    };

    loadData();
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const validationErrors = validateExperimentForm(experimentName, variants);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Add new variant
  const addVariant = (): void => {
    const newVariant: VariantConfig = {
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      isControl: false,
      trafficPercentage: 0,
      components: [],
      themeOverrides: {},
    };
    setVariants([...variants, newVariant]);
  };

  // Remove variant
  const removeVariant = (index: number): void => {
    if (variants.length <= 2) return;
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    if (selectedVariantIndex >= newVariants.length) {
      setSelectedVariantIndex(newVariants.length - 1);
    }
  };

  // Update variant
  const updateVariant = (
    index: number,
    updates: Partial<VariantConfig>
  ): void => {
    const newVariants = [...variants];
    const currentVariant = newVariants[index];
    if (!currentVariant) return;

    newVariants[index] = { ...currentVariant, ...updates };

    // Ensure only one control
    if (updates.isControl === true) {
      newVariants.forEach((v, i) => {
        if (i !== index) v.isControl = false;
      });
    }
    setVariants(newVariants);
  };

  // Add component to variant
  const addComponent = (component: ComponentLibraryItem): void => {
    const selectedVariant = variants[selectedVariantIndex];
    if (!selectedVariant) return;

    const newComponent: ComponentConfig = {
      type: component.type,
      variant: component.variantName,
      order: selectedVariant.components.length + 1,
      visible: true,
      props: component.defaultProps ?? {},
    };

    const newVariants = [...variants];
    const updatedVariant = newVariants[selectedVariantIndex];
    if (!updatedVariant) return;

    updatedVariant.components.push(newComponent);
    setVariants(newVariants);
    setShowGallery(false);
  };

  // Remove component from variant
  const removeComponent = (componentIndex: number): void => {
    const newVariants = [...variants];
    const variant = newVariants[selectedVariantIndex];
    if (!variant) return;

    variant.components.splice(componentIndex, 1);
    // Reorder remaining components
    variant.components.forEach((c, i) => {
      c.order = i + 1;
    });
    setVariants(newVariants);
  };

  // Move component up/down
  const moveComponent = (
    componentIndex: number,
    direction: 'up' | 'down'
  ): void => {
    const newVariants = [...variants];
    const variant = newVariants[selectedVariantIndex];
    if (!variant) return;

    const components = variant.components;
    const newIndex =
      direction === 'up' ? componentIndex - 1 : componentIndex + 1;

    if (newIndex < 0 || newIndex >= components.length) return;

    const temp = components[componentIndex];
    const newComp = components[newIndex];
    if (!temp || !newComp) return;

    components[componentIndex] = newComp;
    components[newIndex] = temp;
    components.forEach((c, i) => {
      c.order = i + 1;
    });

    setVariants(newVariants);
  };

  // Toggle component visibility
  const toggleComponentVisibility = (componentIndex: number): void => {
    const newVariants = [...variants];
    const variant = newVariants[selectedVariantIndex];
    if (!variant) return;

    const component = variant.components[componentIndex];
    if (!component) return;

    component.visible = !component.visible;
    setVariants(newVariants);
  };

  // Apply template
  const applyTemplate = (template: ExperimentTemplate): void => {
    setExperimentName(template.name);
    setDescription(template.description || '');
    setHypothesis(template.hypothesisTemplate || '&apos;);
    setPrimaryMetric(template.primaryMetric);

    // Apply variant configurations
    if (template.variants && template.variants.length > 0) {
      const newVariants: VariantConfig[] = template.variants.map(
        (v, index) => ({
          name: v.name,
          isControl: index === 0,
          trafficPercentage: Math.floor(100 / template.variants.length),
          components: v.components || [],
          themeOverrides: v.themeOverrides
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

      if (error) throw error;

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
      logger.error(
        'Failed to create experiment',
        error instanceof Error ? error : new Error(String(error))
      );
      setErrors({ _submit: 'Failed to create experiment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = variants[selectedVariantIndex];

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
            <ExperimentForm
              experimentName={experimentName}
              setExperimentName={setExperimentName}
              description={description}
              setDescription={setDescription}
              hypothesis={hypothesis}
              setHypothesis={setHypothesis}
              primaryMetric={primaryMetric}
              setPrimaryMetric={setPrimaryMetric}
              trafficPercentage={trafficPercentage}
              setTrafficPercentage={setTrafficPercentage}
              errors={errors}
            />

            {/* Variants Configuration */}
            <VariantConfiguration
              variants={variants}
              selectedVariantIndex={selectedVariantIndex}
              setSelectedVariantIndex={setSelectedVariantIndex}
              onAddVariant={addVariant}
              onRemoveVariant={removeVariant}
              onUpdateVariant={updateVariant}
              errors={errors}
              remainingTrafficPercentage={getRemainingTrafficPercentage(
                variants
              )}
            />

            {/* Component Layout */}
            {selectedVariant && (
              <ComponentLayout
                components={selectedVariant.components}
                selectedComponentIndex={selectedComponentIndex}
                variantName={selectedVariant.name}
                onShowGallery={() => setShowGallery(true)}
                onMoveComponent={moveComponent}
                onToggleVisibility={toggleComponentVisibility}
                onRemoveComponent={removeComponent}
                onSelectComponent={setSelectedComponentIndex}
              />
            )}
          </div>

          {/* Right Column - Preview & Templates */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Live Preview
              </h3>
              {selectedVariant && (
                <VariantPreview
                  variant={{
                    name: selectedVariant.name,
                    components: selectedVariant.components,
                    themeOverrides: selectedVariant.themeOverrides,
                  }}
                />
              )}
            </div>

            {/* Templates */}
            {templates.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Start Templates
                </h3>
                <div className="space-y-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
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
