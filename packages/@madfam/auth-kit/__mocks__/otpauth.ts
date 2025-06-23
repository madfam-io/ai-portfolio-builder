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

/**
 * Mock OTPAuth for testing
 */

export const TOTP = jest.fn().mockImplementation(config => ({
  generate: jest.fn().mockReturnValue('123456'),
  validate: jest.fn(({ token }) => {
    // Return null for invalid tokens, non-null for valid
    return token === '123456' ? 0 : null;
  }),
  toString: jest
    .fn()
    .mockReturnValue(
      `otpauth://totp/${config?.issuer || 'Test'}:${config?.label || 'user@example.com'}?secret=${config?.secret?.base32 || 'TESTSECRET'}&issuer=${config?.issuer || 'Test'}`
    ),
  secret: config?.secret || 'TESTSECRET',
  algorithm: config?.algorithm || 'SHA1',
  digits: config?.digits || 6,
  period: config?.period || 30,
  issuer: config?.issuer || 'Test',
  label: config?.label || 'user@example.com',
}));

export class Secret {
  base32: string;
  hex: string;
  latin1: string;
  buffer?: ArrayBuffer;

  constructor(_options?: { size?: number }) {
    // Generate unique secret for each instance
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.base32 = 'TESTSECRETBASE32' + suffix;
    this.hex = 'testsecrethex' + suffix;
    this.latin1 = 'testsecretlen1' + suffix;
  }

  static generate = jest.fn().mockImplementation(() => {
    const secret = new Secret();
    // Generate random base32 string for testing
    secret.base32 =
      'TEST' + Math.random().toString(36).substring(2, 15).toUpperCase();
    return secret;
  });

  static fromBase32 = jest.fn().mockImplementation((base32: string) => {
    const secret = new Secret();
    secret.base32 = base32;
    return secret;
  });
}

// Export both named and default exports to handle different import styles
export { TOTP, Secret };

// Also export everything as namespace for `import * as OTPAuth`
const otpauthMock = {
  TOTP,
  Secret,
};

export default otpauthMock;
