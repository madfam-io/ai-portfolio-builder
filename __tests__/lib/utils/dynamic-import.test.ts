import {
  createDynamicComponent,
  preloadComponent,
  createRouteComponent,
  optimizationStrategies,
} from '@/lib/utils/dynamic-import';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: jest.fn((importFn, options) => {
    // Create a function component
    const MockComponent = function DynamicMockComponent() {
      return null;
    };
    // Attach options for testing
    (MockComponent as any).__dynamicOptions = options;
    (MockComponent as any).__importFn = importFn;
    return MockComponent;
  }),
}));

describe('Dynamic Import Utilities', () => {
  const mockDynamic = dynamic as jest.MockedFunction<typeof dynamic>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDynamicComponent', () => {
    it('should create a dynamic component with default options', () => {
      const mockImportFn = () =>
        Promise.resolve({ default: (() => null) as ComponentType });

      const _DynamicComponent = createDynamicComponent(mockImportFn);

      expect(mockDynamic).toHaveBeenCalledWith(mockImportFn, {
        loading: expect.any(Function),
        ssr: true,
      });

      // Verify the dynamic function was called with correct options
      const callArgs = mockDynamic.mock.calls[0];
      expect(callArgs[0]).toBe(mockImportFn);
      expect(callArgs[1]).toMatchObject({
        loading: expect.any(Function),
        ssr: true,
      });
      // Test the loading function
      expect(callArgs[1].loading()).toBeNull();
    });

    it('should use custom loading component', () => {
      const mockImportFn = () =>
        Promise.resolve({ default: (() => null) as ComponentType });
      const customLoading = () => 'Loading...';

      const _DynamicComponent = createDynamicComponent(mockImportFn, {
        loading: customLoading,
      });

      expect(mockDynamic).toHaveBeenCalledWith(mockImportFn, {
        loading: customLoading,
        ssr: true,
      });
    });

    it('should disable SSR when specified', () => {
      const mockImportFn = () =>
        Promise.resolve({ default: (() => null) as ComponentType });

      createDynamicComponent(mockImportFn, {
        ssr: false,
      });

      expect(mockDynamic).toHaveBeenCalledWith(mockImportFn, {
        loading: expect.any(Function),
        ssr: false,
      });
    });

    it('should handle typed components', () => {
      interface TestProps {
        name: string;
        age: number;
      }

      const mockImportFn = () =>
        Promise.resolve({
          default: ((props: TestProps) => null) as ComponentType<TestProps>,
        });

      createDynamicComponent<TestProps>(mockImportFn);

      expect(mockDynamic).toHaveBeenCalled();
      expect(mockDynamic).toHaveBeenCalledWith(mockImportFn, {
        loading: expect.any(Function),
        ssr: true,
      });
    });
  });

  describe('preloadComponent', () => {
    it('should call the import function to trigger download', async () => {
      const mockImportFn = jest.fn().mockResolvedValue({
        default: (() => null) as ComponentType,
      });

      preloadComponent(mockImportFn);

      expect(mockImportFn).toHaveBeenCalled();
    });

    it('should silently handle import failures', async () => {
      const mockImportFn = jest
        .fn()
        .mockRejectedValue(new Error('Import failed'));

      // Should not throw
      expect(() => preloadComponent(mockImportFn)).not.toThrow();

      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockImportFn).toHaveBeenCalled();
    });

    it('should work with multiple preloads', () => {
      const mockImportFn1 = jest
        .fn()
        .mockResolvedValue({ default: () => null });
      const mockImportFn2 = jest
        .fn()
        .mockResolvedValue({ default: () => null });
      const mockImportFn3 = jest
        .fn()
        .mockResolvedValue({ default: () => null });

      preloadComponent(mockImportFn1);
      preloadComponent(mockImportFn2);
      preloadComponent(mockImportFn3);

      expect(mockImportFn1).toHaveBeenCalled();
      expect(mockImportFn2).toHaveBeenCalled();
      expect(mockImportFn3).toHaveBeenCalled();
    });
  });

  describe('createRouteComponent', () => {
    it('should create a route component with default options', () => {
      const mockImportFn = () =>
        Promise.resolve({ default: (() => null) as ComponentType });

      const _RouteComponent = createRouteComponent(mockImportFn);

      expect(mockDynamic).toHaveBeenCalledWith(mockImportFn, {
        loading: expect.any(Function),
        ssr: true,
      });

      // Verify the dynamic function was called with correct options
      const callArgs = mockDynamic.mock.calls[0];
      expect(callArgs[1].loading()).toBeNull();
    });

    it('should use custom fallback component', () => {
      const mockImportFn = () =>
        Promise.resolve({ default: (() => null) as ComponentType });
      const customFallback = () => 'Route Loading...';

      const _RouteComponent = createRouteComponent(mockImportFn, {
        fallback: customFallback,
      });

      expect(mockDynamic).toHaveBeenCalledWith(mockImportFn, {
        loading: customFallback,
        ssr: true,
      });
    });

    it('should always enable SSR for route components', () => {
      const mockImportFn = () =>
        Promise.resolve({ default: (() => null) as ComponentType });

      createRouteComponent(mockImportFn);

      const callArgs = mockDynamic.mock.calls[0][1];
      expect(callArgs).toMatchObject({ ssr: true });
    });
  });

  describe('optimizationStrategies', () => {
    it('should have vendor chunk splitting configuration', () => {
      expect(optimizationStrategies.splitVendorChunks).toBeDefined();
      expect(optimizationStrategies.splitVendorChunks.react).toContain('react');
      expect(optimizationStrategies.splitVendorChunks.react).toContain(
        'react-dom'
      );
      expect(optimizationStrategies.splitVendorChunks.ui).toContain(
        '@mui/material'
      );
      expect(optimizationStrategies.splitVendorChunks.charts).toContain(
        'recharts'
      );
      expect(optimizationStrategies.splitVendorChunks.utils).toContain(
        'lodash'
      );
    });

    it('should have list of components to lazy load', () => {
      expect(optimizationStrategies.alwaysLazy).toBeDefined();
      expect(Array.isArray(optimizationStrategies.alwaysLazy)).toBe(true);
      expect(optimizationStrategies.alwaysLazy).toContain('charts');
      expect(optimizationStrategies.alwaysLazy).toContain('editors');
      expect(optimizationStrategies.alwaysLazy).toContain('analytics');
      expect(optimizationStrategies.alwaysLazy).toContain('admin');
      expect(optimizationStrategies.alwaysLazy).toContain('pdf-generators');
      expect(optimizationStrategies.alwaysLazy).toContain('data-tables');
    });

    it('should have routes for prefetching', () => {
      expect(optimizationStrategies.prefetchRoutes).toBeDefined();
      expect(Array.isArray(optimizationStrategies.prefetchRoutes)).toBe(true);
      expect(optimizationStrategies.prefetchRoutes).toContain('/dashboard');
      expect(optimizationStrategies.prefetchRoutes).toContain('/editor');
      expect(optimizationStrategies.prefetchRoutes).toContain('/analytics');
    });

    it('should have complete structure', () => {
      const keys = Object.keys(optimizationStrategies);
      expect(keys).toContain('splitVendorChunks');
      expect(keys).toContain('alwaysLazy');
      expect(keys).toContain('prefetchRoutes');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle component with props correctly', () => {
      interface ButtonProps {
        onClick: () => void;
        children: React.ReactNode;
      }

      const mockImportFn = () =>
        Promise.resolve({
          default: ((props: ButtonProps) => null) as ComponentType<ButtonProps>,
        });

      const _DynamicButton = createDynamicComponent<ButtonProps>(mockImportFn, {
        loading: () => 'Loading button...',
        ssr: false,
      });

      expect(mockDynamic).toHaveBeenCalledWith(mockImportFn, {
        loading: expect.any(Function),
        ssr: false,
      });

      const callArgs = mockDynamic.mock.calls[0];
      expect(callArgs[1].loading()).toBe('Loading button...');
    });

    it('should handle route component with error boundary pattern', () => {
      const mockImportFn = () =>
        Promise.resolve({ default: (() => null) as ComponentType });

      const errorFallback = () => 'Error loading route';

      const _RouteComponent = createRouteComponent(mockImportFn, {
        fallback: errorFallback,
      });

      const callArgs = mockDynamic.mock.calls[0];
      expect(callArgs[1].loading()).toBe('Error loading route');
      expect(callArgs[1].ssr).toBe(true);
    });
  });
});
