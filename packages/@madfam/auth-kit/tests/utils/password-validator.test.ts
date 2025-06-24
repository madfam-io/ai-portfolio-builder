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

import { describe, it, expect } from '@jest/globals';
import { validatePassword } from '../../src/utils/password-validator';
import type { PasswordRequirements } from '../../src/core/types';

describe('validatePassword', () => {
  const defaultRequirements: PasswordRequirements = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    preventCommon: true,
    preventBreached: false, // Disabled for testing
  };

  describe('length validation', () => {
    it('should accept password meeting minimum length', async () => {
      const result = await validatePassword('Password123!', {
        minLength: 8,
      });

      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should reject password below minimum length', async () => {
      const result = await validatePassword('Pass1!', {
        minLength: 8,
      });

      expect(result.valid).toBe(false);
      expect(result.feedback).toContain(
        'Password must be at least 8 characters long'
      );
    });

    it('should reject password above maximum length', async () => {
      const longPassword = 'A'.repeat(130) + '1!';
      const result = await validatePassword(longPassword, {
        maxLength: 128,
      });

      expect(result.valid).toBe(false);
      expect(result.feedback).toContain(
        'Password must be no more than 128 characters long'
      );
    });
  });

  describe('character requirements', () => {
    it('should require uppercase letters', async () => {
      const result = await validatePassword('password123!', {
        requireUppercase: true,
      });

      expect(result.valid).toBe(false);
      expect(result.feedback).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should require lowercase letters', async () => {
      const result = await validatePassword('PASSWORD123!', {
        requireLowercase: true,
      });

      expect(result.valid).toBe(false);
      expect(result.feedback).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should require numbers', async () => {
      const result = await validatePassword('Password!', {
        requireNumbers: true,
      });

      expect(result.valid).toBe(false);
      expect(result.feedback).toContain(
        'Password must contain at least one number'
      );
    });

    it('should require symbols', async () => {
      const result = await validatePassword('Password123', {
        requireSymbols: true,
      });

      expect(result.valid).toBe(false);
      expect(result.feedback).toContain(
        'Password must contain at least one special character'
      );
    });

    it('should accept password meeting all character requirements', async () => {
      const result = await validatePassword('Password123!', {
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('common password prevention', () => {
    const commonPasswords = [
      'password',
      'Password',
      'password123',
      'Password123',
      '123456',
      'qwerty',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];

    commonPasswords.forEach(password => {
      it(`should reject common password: ${password}`, async () => {
        const result = await validatePassword(password, {
          preventCommon: true,
        });

        expect(result.valid).toBe(false);
        expect(result.feedback).toContain(
          'This password is too common. Please choose a more unique password'
        );
      });
    });

    it('should accept non-common password', async () => {
      const result = await validatePassword('MyUniquePassword123!', {
        preventCommon: true,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('password scoring', () => {
    it('should give higher scores to stronger passwords', async () => {
      const weakResult = await validatePassword('password', {});
      const strongResult = await validatePassword(
        'MyVeryStrong&ComplexPassword123!',
        {}
      );

      expect(strongResult.score).toBeGreaterThan(weakResult.score);
    });

    it('should score based on length', async () => {
      const shortResult = await validatePassword('Pass1!', {});
      const longResult = await validatePassword(
        'MyVeryLongPasswordWith123!',
        {}
      );

      expect(longResult.score).toBeGreaterThan(shortResult.score);
    });

    it('should score based on character variety', async () => {
      const simpleResult = await validatePassword('aaaaaaaa', {});
      const variedResult = await validatePassword('Aa1!Bb2@', {});

      expect(variedResult.score).toBeGreaterThan(simpleResult.score);
    });

    it('should penalize patterns', async () => {
      const patternResult = await validatePassword('12345678', {});
      const randomResult = await validatePassword('9X7m3K8p', {});

      expect(randomResult.score).toBeGreaterThan(patternResult.score);
    });
  });

  describe('custom validator', () => {
    it('should use custom validator when provided', async () => {
      const customValidator = (password: string): boolean | string => {
        if (password.includes('forbidden')) {
          return 'Password cannot contain the word "forbidden"';
        }
        return true;
      };

      const validResult = await validatePassword('GoodPassword123!', {
        customValidator,
      });

      const invalidResult = await validatePassword('forbiddenPassword123!', {
        customValidator,
      });

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.feedback).toContain(
        'Password cannot contain the word "forbidden"'
      );
    });

    it('should handle custom validator returning boolean', async () => {
      const customValidator = (password: string): boolean => {
        return !password.toLowerCase().includes('bad');
      };

      const validResult = await validatePassword('GoodPassword123!', {
        customValidator,
      });

      const invalidResult = await validatePassword('badPassword123!', {
        customValidator,
      });

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.feedback).toContain(
        'Password does not meet custom requirements'
      );
    });
  });

  describe('password reuse prevention', () => {
    it('should handle preventReuse requirement', async () => {
      // This would typically require integration with a password history store
      // For now, we'll test that the option is processed
      const result = await validatePassword('Password123!', {
        preventReuse: 5,
      });

      // Without a history store, this should still validate other requirements
      expect(result.valid).toBe(true);
    });
  });

  describe('breached password detection', () => {
    it('should handle preventBreached requirement', async () => {
      // This would typically require integration with HaveIBeenPwned API
      // For now, we'll test that the option is processed
      const result = await validatePassword('Password123!', {
        preventBreached: true,
      });

      // Without actual API integration, this should still validate other requirements
      expect(result.valid).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty password', async () => {
      const result = await validatePassword('', defaultRequirements);

      expect(result.valid).toBe(false);
      expect(result.feedback).toBeDefined();
      expect(result.feedback!.length).toBeGreaterThan(0);
    });

    it('should handle null/undefined requirements', async () => {
      const result = await validatePassword('Password123!', undefined);

      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle password with only whitespace', async () => {
      const result = await validatePassword('        ', {
        minLength: 8,
      });

      expect(result.valid).toBe(false);
      expect(result.score).toBe(0);
    });

    it('should handle unicode characters', async () => {
      const result = await validatePassword('PássWørd123!', {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
      });

      expect(result.valid).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const veryLongPassword = 'A'.repeat(10000) + '1!';
      const result = await validatePassword(veryLongPassword, {
        maxLength: 128,
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('feedback messages', () => {
    it('should provide helpful feedback for weak passwords', async () => {
      const result = await validatePassword('weak', defaultRequirements);

      expect(result.feedback).toBeDefined();
      expect(result.feedback!.length).toBeGreaterThan(0);
      expect(
        result.feedback!.some(
          msg => msg.includes('long') || msg.includes('short')
        )
      ).toBe(true);
    });

    it('should provide multiple feedback messages for multiple issues', async () => {
      const result = await validatePassword('abc', {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true,
      });

      expect(result.feedback).toBeDefined();
      expect(result.feedback!.length).toBeGreaterThan(1);
    });

    it('should provide warnings for borderline passwords', async () => {
      const result = await validatePassword('Password1', {
        requireSymbols: false,
      });

      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe('comprehensive validation', () => {
    it('should validate complex password against all requirements', async () => {
      const result = await validatePassword(
        'MySecurePassword123!@#',
        defaultRequirements
      );

      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(3);
      expect(result.feedback).toEqual([]);
    });

    it('should reject password failing multiple requirements', async () => {
      const result = await validatePassword('weak', defaultRequirements);

      expect(result.valid).toBe(false);
      expect(result.score).toBeLessThan(2);
      expect(result.feedback!.length).toBeGreaterThan(2);
    });
  });
});
