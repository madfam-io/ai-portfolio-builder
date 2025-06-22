/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Test providers wrapper
export function AllTheProviders({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
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
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides,
  };
}
