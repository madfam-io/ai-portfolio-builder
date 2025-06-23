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
  validate: jest.fn().mockReturnValue(true),
  toString: jest
    .fn()
    .mockReturnValue(
      'otpauth://totp/Test:user@example.com?secret=TESTSECRET&issuer=Test'
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

  constructor() {
    this.base32 = 'TESTSECRETBASE32';
    this.hex = 'testsecrethex';
    this.latin1 = 'testsecretlen1';
  }

  static generate = jest.fn().mockImplementation(() => new Secret());

  static fromBase32 = jest.fn().mockImplementation((base32: string) => {
    const secret = new Secret();
    secret.base32 = base32;
    return secret;
  });
}

const otpauthMock = {
  TOTP,
  Secret,
};

export default otpauthMock;
