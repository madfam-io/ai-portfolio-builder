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

import { jest } from '@jest/globals';

// Mock crypto module for Node.js compatibility
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock localStorage for React tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Mock window object for browser-specific code
Object.defineProperty(globalThis, 'window', {
  value: {
    location: {
      origin: 'http://localhost:3000',
      href: 'http://localhost:3000',
    },
  },
});

// Mock process.env
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';