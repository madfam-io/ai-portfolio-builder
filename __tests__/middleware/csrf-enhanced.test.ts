import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import csrfMiddleware from '@/middleware/csrf-enhanced';

// Polyfill Blob for Node environment
global.Blob = class Blob {
  constructor(parts, options = {}) {
    this.parts = parts;
    this.type = options.type || '';
  }
};

// Polyfill FormData for Node environment
global.FormData = class FormData {
  private data: Map<string, any> = new Map();

  append(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string) {
    return this.data.get(key);
  }

  has(key: string) {
    return this.data.has(key);
  }

  delete(key: string) {
    this.data.delete(key);
  }

  *[Symbol.iterator]() {
    yield* this.data;
  }
};

/**
 * @jest-environment node
 */

// Create mock functions with proper types
const mockRandomBytes = jest.fn(() => Buffer.from('mock-random-bytes'));
const mockCreateHmac = jest.fn(() => ({
  update: jest.fn().mockReturnThis(),
  digest: jest.fn(() => 'mock-hmac-digest'),
}));
const mockTimingSafeEqual = jest.fn(() => true);

// Mock crypto module before importing the middleware
jest.mock('crypto', () => ({
  randomBytes: mockRandomBytes,
  createHmac: mockCreateHmac,
  timingSafeEqual: mockTimingSafeEqual,
}));

// Import the middleware after mocking crypto

// Create a mock crypto object for easier access
const mockCrypto = {
  randomBytes: mockRandomBytes,
  createHmac: mockCreateHmac,
  timingSafeEqual: mockTimingSafeEqual,
};

jest.setTimeout(30000);

describe('Enhanced CSRF Middleware', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
  });

  it('should generate CSRF token for GET requests', async () => {
    const request = new NextRequest('https://example.com/api/v1/csrf-token');
    const response = await csrfMiddleware(request);

    expect(response).toBeInstanceOf(NextResponse);
    const setCookieHeader = response?.headers.get('Set-Cookie');
    expect(setCookieHeader).toContain('prisma-csrf-token=');
  });
});