import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';

/**
 * Mock implementation of useLanguage hook for testing
 * Provides a consistent way to mock i18n functionality across all tests
 */
export const createMockUseLanguage = () => {
  const mockT = {
    // Common translations used across tests
    success: 'Success',
    error: 'Error',
    loading: 'Loading',
    saved: 'Saved',
    changesSaved: 'Your changes have been saved',
    portfolioSaved: 'Portfolio saved successfully',
    failedToSave: 'Failed to save portfolio',

    // Dashboard translations
    dashboardTitle: 'Dashboard',
    billingTitle: 'Billing',
    portfolios: 'Portfolios',
    analytics: 'Analytics',
    settings: 'Settings',

    // Editor translations
    editorTitle: 'Portfolio Editor',
    preview: 'Preview',
    publish: 'Publish',
    save: 'Save',
    saving: 'Saving...',

    // Landing page translations
    hero: {
      title: 'Build Your Portfolio',
      subtitle: 'Create a professional portfolio in minutes',
    },
    features: {
      title: 'Features',
      subtitle: 'Everything you need to showcase your work',
    },
    pricing: {
      title: 'Pricing',
      subtitle: 'Choose the plan that works for you',
    },
    cta: {
      title: 'Ready to get started?',
      subtitle: 'Join thousands of professionals',
    },

    // Billing translations
    billing: {
      title: 'Billing Dashboard',
      currentPlan: 'Current Plan',
      usage: 'Usage',
      upgrade: 'Upgrade',
      manageBilling: 'Manage Billing',
      aiCredits: 'AI Credits',
    },

    // Add any other translations as needed
  };

  const mockLanguage = 'en';
  const mockSetLanguage = jest.fn();
  const mockIsLoading = false;

  const mockUseLanguage = jest.fn(() => ({
    t: mockT,
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    isLoading: mockIsLoading,
  }));

  return {
    mockUseLanguage,
    mockT,
    mockLanguage,
    mockSetLanguage,
    mockIsLoading,
  };
};

/**
 * Creates a properly typed mock for useLanguage that works with Jest
 */
export const setupUseLanguageMock = () => {
  const { mockT, mockLanguage, mockSetLanguage, mockIsLoading } =
    createMockUseLanguage();

  // Create the base mock return value
  const mockReturnValue = {
    t: mockT,
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    isLoading: mockIsLoading,
  };

  // Create a mock function with all Jest methods
  const mockUseLanguage = Object.assign(
    jest.fn(() => mockReturnValue),
    {
      mockReturnValue: jest.fn((value: unknown) => {
        mockUseLanguage.mockImplementation(() => value);
        return mockUseLanguage;
      }),
      mockImplementation: jest.fn((fn: (...args: unknown[]) => unknown) => {
        Object.setPrototypeOf(mockUseLanguage, jest.fn(fn));
        return mockUseLanguage;
      }),
      mockClear: jest.fn(() => {
        jest.clearAllMocks();
        return mockUseLanguage;
      }),
      mockReset: jest.fn(() => {
        jest.resetAllMocks();
        return mockUseLanguage;
      }),
      mockResolvedValue: jest.fn(),
      mockRejectedValue: jest.fn(),
      mockReturnValueOnce: jest.fn(),
      mockResolvedValueOnce: jest.fn(),
      mockRejectedValueOnce: jest.fn(),
      mockImplementationOnce: jest.fn(),
    }
  ) as MockedFunction<any>;

  return {
    mockUseLanguage,
    mockT,
    mockLanguage,
    mockSetLanguage,
    mockIsLoading,
    mockReturnValue,
  };
};
