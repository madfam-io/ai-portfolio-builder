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

// Mock TOTP class
class TOTP {
  constructor(config) {
    this.secret = config?.secret || { base32: 'TESTSECRET' };
    this.algorithm = config?.algorithm || 'SHA1';
    this.digits = config?.digits || 6;
    this.period = config?.period || 30;
    this.issuer = config?.issuer || 'Test';
    this.label = config?.label || 'user@example.com';
    
    // Bind methods
    this.generate = this.generate.bind(this);
    this.validate = this.validate.bind(this);
    this.toString = this.toString.bind(this);
  }
  
  generate() {
    return '123456';
  }
  
  validate({ token }) {
    // Return null for invalid tokens, non-null for valid
    return token === '123456' ? 0 : null;
  }
  
  toString() {
    return `otpauth://totp/${this.issuer}:${this.label}?secret=${this.secret?.base32 || 'TESTSECRET'}&issuer=${this.issuer}`;
  }
}

// Mock Secret class
class Secret {
  constructor(options = {}) {
    // Generate unique secret for each instance
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.base32 = 'TESTSECRETBASE32' + suffix;
    this.hex = 'testsecrethex' + suffix;
    this.latin1 = 'testsecretlen1' + suffix;
    this.buffer = Buffer.from(this.hex, 'hex');
  }

  static generate() {
    const secret = new Secret();
    // Generate random base32 string for testing
    secret.base32 = 'TEST' + Math.random().toString(36).substring(2, 15).toUpperCase();
    return secret;
  }

  static fromBase32(base32) {
    const secret = new Secret();
    secret.base32 = base32;
    return secret;
  }
}

// Create the module exports
const OTPAuth = {
  TOTP,
  Secret,
};

// Support both CommonJS and ES module syntax
module.exports = OTPAuth;
module.exports.TOTP = TOTP;
module.exports.Secret = Secret;
module.exports.default = OTPAuth;
module.exports.__esModule = true;