import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';


// Test providers wrapper
export function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Mock data generators
export function createMockPortfolio(overrides = {}) {
  return {
    id: 'test-id',
    userId: 'test-user',
    name: 'Test Portfolio',
    title: 'Test Title',
    bio: 'Test Bio',
    template: 'developer',
    status: 'draft',
    subdomain: 'test',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides
  };
}
