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