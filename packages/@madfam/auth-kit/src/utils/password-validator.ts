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
 * Password validation utilities
 */

import type {
  PasswordRequirements,
  PasswordValidationResult,
} from '../core/types';

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '1234567890',
  'password1',
  'qwerty123',
  'dragon',
  'baseball',
  'iloveyou',
  'trustno1',
  'sunshine',
  'master',
  'hello',
  'freedom',
  'whatever',
  'shadow',
  'superman',
  'michael',
  'football',
  'jesus',
  'ninja',
  'mustang',
  'password123',
];

/**
 * Check if password has been breached (simplified version)
 * In production, this would check against haveibeenpwned.com API
 */
function isPasswordBreached(password: string): Promise<boolean> {
  // For now, just check against common passwords
  return Promise.resolve(COMMON_PASSWORDS.includes(password.toLowerCase()));
}

/**
 * Calculate password strength score
 */
function calculateStrength(password: string): number {
  let score = 0;

  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety score
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Pattern checks (reduce score for bad patterns)
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/^[0-9]+$/.test(password)) score -= 1; // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 1; // Only letters

  // Reduce score if missing important elements
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  if (!hasSymbols && password.length < 12) score -= 1;

  // Normalize to 0-5 scale
  return Math.max(0, Math.min(5, score));
}

/**
 * Check character requirements
 */
function checkCharacterRequirements(
  password: string,
  reqs: PasswordRequirements,
  feedback: string[]
): boolean {
  let valid = true;

  if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
    valid = false;
  }

  if (reqs.requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
    valid = false;
  }

  if (reqs.requireNumbers && !/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number');
    valid = false;
  }

  if (reqs.requireSymbols && !/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Password must contain at least one special character');
    valid = false;
  }

  return valid;
}

/**
 * Check length requirements
 */
function checkLengthRequirements(
  password: string,
  reqs: PasswordRequirements,
  feedback: string[]
): boolean {
  let valid = true;

  if (reqs.minLength && password.length < reqs.minLength) {
    feedback.push(
      `Password must be at least ${reqs.minLength} characters in length`
    );
    valid = false;
  }

  if (reqs.maxLength && password.length > reqs.maxLength) {
    feedback.push(
      `Password must be no more than ${reqs.maxLength} characters long`
    );
    valid = false;
  }

  return valid;
}

/**
 * Validate password against requirements
 */
export async function validatePassword(
  password: string,
  requirements?: PasswordRequirements
): Promise<PasswordValidationResult> {
  // Handle edge case - password with only whitespace
  if (password.trim().length === 0) {
    return {
      valid: false,
      score: 0,
      feedback: ['Password cannot be empty or only whitespace'],
    };
  }

  const feedback: string[] = [];
  let valid = true;

  // Default requirements if not provided
  const reqs = requirements || {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  };

  // Length validation
  const lengthValid = checkLengthRequirements(password, reqs, feedback);
  valid = valid && lengthValid;

  // Character requirements
  const charValid = checkCharacterRequirements(password, reqs, feedback);
  valid = valid && charValid;

  // Common password check
  if (reqs.preventCommon && COMMON_PASSWORDS.includes(password.toLowerCase())) {
    feedback.push(
      'This password is too common. Please choose a more unique password'
    );
    valid = false;
  }

  // Breached password check
  if (reqs.preventBreached && (await isPasswordBreached(password))) {
    feedback.push(
      'This password has been found in data breaches. Please choose a different password'
    );
    valid = false;
  }

  // Custom validator
  if (reqs.customValidator) {
    const customResult = reqs.customValidator(password);
    if (typeof customResult === 'string') {
      feedback.push(customResult);
      valid = false;
    } else if (!customResult) {
      feedback.push('Password does not meet custom requirements');
      valid = false;
    }
  }

  // Calculate strength score
  const score = calculateStrength(password);

  // Provide suggestions
  if (score < 3 && !feedback.length) {
    feedback.push('Consider using a longer password with a mix of characters');
  }

  return {
    valid,
    score,
    feedback: feedback.length > 0 ? feedback : [],
    warning:
      score < 3 && valid
        ? 'This password is weak. Consider making it stronger.'
        : undefined,
  };
}

/**
 * Generate a strong password
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';

  // Ensure at least one of each required character type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
