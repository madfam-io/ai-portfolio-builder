/**
 * Jest setup file
 * Runs before all tests
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import './__tests__/setup/test-environment';
import './__tests__/setup/global-mocks';

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => require('./__tests__/setup/global-mocks').mockUseRouter(),
  usePathname: () => require('./__tests__/setup/global-mocks').mockUsePathname(),
  useSearchParams: () => require('./__tests__/setup/global-mocks').mockUseSearchParams(),
  useParams: jest.fn(() => ({})),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock i18n
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => require('./__tests__/setup/global-mocks').mockUseLanguage(),
  LanguageProvider: ({ children }) => children,
}));

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => require('./__tests__/setup/global-mocks').createSupabaseMock(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => require('./__tests__/setup/global-mocks').createSupabaseMock(),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
