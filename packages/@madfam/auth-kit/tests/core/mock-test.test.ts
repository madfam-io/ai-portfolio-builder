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

import * as OTPAuth from 'otpauth';

describe('Mock Test', () => {
  it('should load OTPAuth mock', () => {
    const secret = new OTPAuth.Secret({ size: 32 });

    expect(secret).toBeDefined();
    expect(secret.base32).toBeDefined();
    expect(secret.base32).toMatch(/^TESTSECRETBASE32/);
  });

  it('should generate secret with static method', () => {
    const secret = OTPAuth.Secret.generate();

    expect(secret).toBeDefined();
    expect(secret.base32).toBeDefined();
    expect(secret.base32).toMatch(/^TEST/);
  });

  it('should create TOTP instance', () => {
    const secret = new OTPAuth.Secret({ size: 32 });
    const totp = new OTPAuth.TOTP({
      secret,
      label: 'test@example.com',
      issuer: 'TestApp',
    });

    expect(totp).toBeDefined();
    expect(totp.generate()).toBe('123456');
    expect(totp.validate({ token: '123456' })).toBe(0);
    expect(totp.validate({ token: 'wrong' })).toBe(null);
  });
});
