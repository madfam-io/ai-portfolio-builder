/**
 * @madfam/auth-kit
 *
 * World-class authentication system with multi-provider support, MFA, and enterprise features
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

// Core exports
export * from './core';

// Utility exports
export * from './utils/password-validator';
export * from './utils/backup-codes';

// Adapter exports
export * from './adapters';

// Version
export const VERSION = '1.0.0';
