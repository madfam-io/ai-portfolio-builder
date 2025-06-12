/**
 * @fileoverview Dynamic Landing Page Renderer
 *
 * Renders landing page components based on experiment configuration,
 * supporting A/B testing with different component variants and orders.
 */

'use client';

import React, { Suspense, lazy } from 'react';

import {
  useExperiment,
  useExperimentTheme,
  sortComponentsByOrder,
} from '@/lib/services/feature-flags/use-experiment';

// Import all landing components and their variants
import BackToTopButton from '../BackToTopButton';

import Footer from './Footer';
import Header from './Header';
import { getHeroVariant } from './variants/HeroVariants';

import type { ComponentConfig } from '@/types/experiments';

// Lazy load other components for better performance
const SocialProof = lazy(() => import('./SocialProof'));
const Features = lazy(() => import('./Features'));
const HowItWorks = lazy(() => import('./HowItWorks'));
const Templates = lazy(() => import('./Templates'));
const Pricing = lazy(() => import('./Pricing'));
const CTA = lazy(() => import('./CTA'));

/**
 * Component registry mapping component types to their implementations
 */
const componentRegistry: Record<
  string,
  {
    default: React.ComponentType<any>;
    variants?: Record<string, React.ComponentType<any>>;
  }
> = {
  hero: {
    default: getHeroVariant('default'),
    variants: {
      default: getHeroVariant('default'),
      minimal: getHeroVariant('minimal'),
      video: getHeroVariant('video'),
      split: getHeroVariant('split'),
    },
  },
  social_proof: {
    default: SocialProof,
  },
  features: {
    default: Features,
  },
  how_it_works: {
    default: HowItWorks,
  },
  templates: {
    default: Templates,
  },
  pricing: {
    default: Pricing,
  },
  cta: {
    default: CTA,
  },
};

/**
 * Default component configuration if no experiment is active
 */
const defaultComponents: ComponentConfig[] = [
  { type: 'hero', order: 1, visible: true, variant: 'default', props: {} },
  {
    type: 'social_proof',
    order: 2,
    visible: true,
    variant: 'default',
    props: {},
  },
  { type: 'features', order: 3, visible: true, variant: 'default', props: {} },
  {
    type: 'how_it_works',
    order: 4,
    visible: true,
    variant: 'default',
    props: {},
  },
  { type: 'templates', order: 5, visible: true, variant: 'default', props: {} },
  { type: 'pricing', order: 6, visible: true, variant: 'default', props: {} },
  { type: 'cta', order: 7, visible: true, variant: 'default', props: {} },
];

/**
 * Component wrapper for error boundaries
 */
function ComponentWrapper({
  children,
  componentType,
}: {
  children: React.ReactNode;
  componentType: string;
}) {
  return (
    <div className="landing-component" data-component={componentType}>
      {children}
    </div>
  );
}

/**
 * Loading fallback for lazy loaded components
 */
function ComponentLoading() {
  return (
    <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-96 w-full" />
  );
}

/**
 * Dynamic Landing Page Component
 */
export default function DynamicLandingPage(): React.ReactElement {
  const {
    components: experimentComponents,
    isLoading,
    error,
  } = useExperiment();
  useExperimentTheme(); // Apply theme overrides

  // Use experiment components if available, otherwise use defaults
  const components =
    experimentComponents.length > 0 ? experimentComponents : defaultComponents;

  // Sort components by order and filter visible ones
  const visibleComponents = sortComponentsByOrder(components).filter(
    c => c.visible
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('Failed to load experiment configuration:', error);
    // Fall back to default components on error
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {visibleComponents.map(component => {
          const Component = getComponentForConfig(component);

          if (!Component) {
            console.warn(
              `Component not found for type: ${component.type}, variant: ${component.variant}`
            );
            return null;
          }

          return (
            <Suspense
              key={`${component.type}-${component.order}`}
              fallback={<ComponentLoading />}
            >
              <ComponentWrapper componentType={component.type}>
                <Component {...component.props} />
              </ComponentWrapper>
            </Suspense>
          );
        })}
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}

/**
 * Get the appropriate component based on configuration
 */
function getComponentForConfig(
  config: ComponentConfig
): React.ComponentType<any> | null {
  const componentEntry = componentRegistry[config.type];

  if (!componentEntry) {
    return null;
  }

  // Check if variant exists
  if (config.variant && componentEntry.variants?.[config.variant]) {
    return componentEntry.variants[config.variant] ?? null;
  }

  // Return default component
  return componentEntry.default ?? null;
}
