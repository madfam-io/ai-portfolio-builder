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
 * Backup code generation utilities
 */

/**
 * Generate secure backup codes
 */
export function generateBackupCodes(
  count: number = 10,
  length: number = 8
): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters

  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < length; j++) {
      // Add hyphen in the middle for readability
      if (j === length / 2) {
        code += '-';
      }
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(code);
  }

  return codes;
}

/**
 * Format backup codes for display
 */
export function formatBackupCodes(codes: string[]): string {
  return codes
    .map((code, index) => `${(index + 1).toString().padStart(2, '0')}. ${code}`)
    .join('\n');
}
