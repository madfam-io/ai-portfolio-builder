/**
 * @madfam/smart-payments
 * 
 * World-class payment gateway detection and routing system with AI-powered optimization
 * 
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 * 
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 * 
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Test setup and global mocks
 */

// Mock external dependencies
jest.mock('node-ipinfo', () => ({
  IPinfoWrapper: jest.fn().mockImplementation(() => ({
    lookupIp: jest.fn().mockResolvedValue({
      countryCode: 'US',
      region: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      loc: '37.7749,-122.4194',
      org: 'AS13335 Cloudflare',
    }),
  })),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});