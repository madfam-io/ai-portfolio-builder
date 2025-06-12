/**
 * @fileoverview Error Boundaries Index
 *
 * Central export point for all error boundary components.
 */

export { RootErrorBoundary } from './RootErrorBoundary';
export {
  RouteErrorBoundary,
  withRouteErrorBoundary,
} from './RouteErrorBoundary';
export {
  WidgetErrorBoundary,
  withWidgetErrorBoundary,
  useWidgetError,
} from './WidgetErrorBoundary';

// Re-export from original ErrorBoundary for backward compatibility
export {
  GlobalErrorBoundary,
  RouteErrorBoundary as LegacyRouteErrorBoundary,
  useErrorBoundary,
  withErrorBoundary,
} from '../ErrorBoundary';
