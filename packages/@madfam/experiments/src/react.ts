/**
 * @madfam/experiments
 *
 * React components and hooks
 */

// Provider
export { ExperimentsProvider } from './react/ExperimentsProvider';
export type { ExperimentsProviderProps } from './react/ExperimentsProvider';

// Hooks
export {
  useExperiment,
  useFeatureFlag,
  useExperimentResults,
  useFeatureFlags,
} from './react/hooks';

// Components
export {
  Experiment,
  FeatureFlag,
  FeatureSwitch,
  Variant,
  When,
  Unless,
} from './react/components';

export type {
  ExperimentProps,
  FeatureFlagProps,
  FeatureSwitchProps,
  VariantProps,
  WhenProps,
  UnlessProps,
} from './react/components';
