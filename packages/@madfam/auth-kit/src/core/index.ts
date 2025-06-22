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
 * @madfam/auth-kit
 *
 * Core module exports
 */

export * from './types';
export * from './auth-kit';
export * from './session-manager';
export * from './mfa-manager';
export * from './provider-manager';
export * from './security-manager';
export * from './email-manager';

// Main factory function
import { AuthKit } from './auth-kit';
import type { AuthKitConfig } from './types';

export function createAuthKit(config: AuthKitConfig): AuthKit {
  return new AuthKit(config);
}
