
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

import { jest, describe, test, expect, beforeEach, it } from '@jest/globals';
import { mfaService, MFAService } from '@/lib/services/auth/mfa-service';
import { AppError } from '@/types/errors';
import { createClient } from '@/lib/supabase/client';


// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
};

jest.mock('@/lib/auth/supabase-client', () => ({ 
  createClient: jest.fn(() => mockSupabaseClient),
  supabase: mockSupabaseClient,
 }));

/**
 * Test suite for MFA Service
 */

// Mock dependencies first
jest.mock('@/lib/supabase/client', () => ({ 
  createClient: jest.fn().mockReturnValue(void 0),
 }));

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn().mockReturnValue(void 0),
    mfa: {
      listFactors: jest.fn().mockReturnValue(void 0),
      enroll: jest.fn().mockReturnValue(void 0),
      verify: jest.fn().mockReturnValue(void 0),
      challenge: jest.fn().mockReturnValue(void 0),
      unenroll: jest.fn().mockReturnValue(void 0),
    },
  },
};

// Mock QRCode library
jest.mock('qrcode', () => ({ 
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqrcode'),
 }));

// Mock OTPAuth
jest.mock('otpauth', () => ({
  TOTP: jest.fn().mockImplementation(() => ({
    toString: () => 'otpauth://totp/test',
  })),
}));

// Mock the createClient import

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe('MFA Service', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  describe('MFA Status', () => {
    test('should return enabled status when TOTP factor is verified', async () => {
      mockSupabase.auth.mfa.listFactors.mockResolvedValue({
        data: {
          totp: [
            {
              id: 'factor_123',
              status: 'verified',
              updated_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
        error: null,
      });

      const status = await mfaService.getMFAStatus();

      expect(status).toEqual({
        enabled: true,
        factorId: 'factor_123',
        backupCodesGenerated: true,
        lastUsed: new Date('2025-01-01T00:00:00Z'),
      });
    });

    test('should return disabled status when no verified factors', async () => {
      mockSupabase.auth.mfa.listFactors.mockResolvedValue({
        data: {
          totp: [
            {
              id: 'factor_123',
              status: 'unverified',
              updated_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
        error: null,
      });

      const status = await mfaService.getMFAStatus();

      expect(status).toEqual({
        enabled: false,
        factorId: undefined,
        backupCodesGenerated: true,
        lastUsed: undefined,
      });
    });

    test('should throw error when MFA check fails', async () => {
      mockSupabase.auth.mfa.listFactors.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(mfaService.getMFAStatus()).rejects.toThrow(AppError);
    });
  });

  describe('MFA Setup', () => {
    test('should setup MFA successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.auth.mfa.enroll.mockResolvedValue({
        data: {
          id: 'factor_123',
          totp: {
            secret: 'ABCDEFGHIJKLMNOP',
          },
        },
        error: null,
      });

      const setup = await mfaService.setupMFA();

      expect(setup).toMatchObject({
        secret: 'ABCDEFGHIJKLMNOP',
        qrCodeUrl: 'data:image/png;base64,mockqrcode',
        backupCodes: expect.arrayContaining([
          expect.stringMatching(/^[A-Z0-9]{8}$/),
        ]),
      });

      expect(setup.backupCodes).toHaveLength(10);
    });

    test('should throw error when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      await expect(mfaService.setupMFA()).rejects.toThrow(AppError);
    });

    test('should throw error when enrollment fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.auth.mfa.enroll.mockResolvedValue({
        data: null,
        error: { message: 'Enrollment failed' },
      });

      await expect(mfaService.setupMFA()).rejects.toThrow(AppError);
    });
  });

  describe('MFA Verification', () => {
    test('should verify MFA setup successfully', async () => {
      mockSupabase.auth.mfa.verify.mockResolvedValue({
        data: { access_token: 'token_123' },
        error: null,
      });

      const result = await mfaService.verifyMFASetup('123456', 'factor_123');

      expect(result).toBe(true);
      expect(mockSupabase.auth.mfa.verify).toHaveBeenCalledWith(
      {
        factorId: 'factor_123',
        challengeId: '',
        code: '123456',
    });
  });
    });

    test('should return false when verification fails', async () => {
      mockSupabase.auth.mfa.verify.mockResolvedValue({
        data: null,
        error: { message: 'Invalid code' },
      });

      const result = await mfaService.verifyMFASetup('123456', 'factor_123');

      expect(result).toBe(false);
    });
  });

  describe('MFA Challenge', () => {
    test('should create MFA challenge successfully', async () => {
      mockSupabase.auth.mfa.challenge.mockResolvedValue({
        data: { id: 'challenge_123' },
        error: null,
      });

      const challengeId = await mfaService.challengeMFA('factor_123');

      expect(challengeId).toBe('challenge_123');
      expect(mockSupabase.auth.mfa.challenge).toHaveBeenCalledWith(
      {
        factorId: 'factor_123',
    });
  });
    });

    test('should throw error when challenge fails', async () => {
      mockSupabase.auth.mfa.challenge.mockResolvedValue({
        data: null,
        error: { message: 'Challenge failed' },
      });

      await expect(mfaService.challengeMFA('factor_123')).rejects.toThrow(
        AppError

    });
  });

  describe('MFA Login Verification', () => {
    test('should verify MFA during login successfully', async () => {
      mockSupabase.auth.mfa.verify.mockResolvedValue({
        data: { access_token: 'token_123' },
        error: null,
      });

      const result = await mfaService.verifyMFA('challenge_123', '123456');

      expect(result).toBe(true);
      expect(mockSupabase.auth.mfa.verify).toHaveBeenCalledWith(
      {
        factorId: '',
        challengeId: 'challenge_123',
        code: '123456',
    });
  });
    });

    test('should return false for invalid code', async () => {
      mockSupabase.auth.mfa.verify.mockResolvedValue({
        data: null,
        error: { message: 'Invalid code' },
      });

      const result = await mfaService.verifyMFA('challenge_123', '123456');

      expect(result).toBe(false);
    });
  });

  describe('MFA Disable', () => {
    test('should disable MFA successfully', async () => {
      mockSupabase.auth.mfa.unenroll.mockResolvedValue({
        error: null,
      });

      await expect(
        mfaService.disableMFA('factor_123')
      ).resolves.toBeUndefined();
      expect(mockSupabase.auth.mfa.unenroll).toHaveBeenCalledWith(
      {
        factorId: 'factor_123',
    });
  });
    });

    test('should throw error when disable fails', async () => {
      mockSupabase.auth.mfa.unenroll.mockResolvedValue({
        error: { message: 'Disable failed' },
      });

      await expect(mfaService.disableMFA('factor_123')).rejects.toThrow(
        AppError

    });
  });

  describe('Code Validation', () => {
    test('should validate TOTP code format', async () => {
      expect(mfaService.isValidTOTPCode('123456')).toBe(true);
      expect(mfaService.isValidTOTPCode('12345')).toBe(false);
      expect(mfaService.isValidTOTPCode('1234567')).toBe(false);
      expect(mfaService.isValidTOTPCode('abcdef')).toBe(false);
      expect(mfaService.isValidTOTPCode('123abc')).toBe(false);
    });

    test('should validate backup code format', async () => {
      expect(mfaService.isValidBackupCode('ABCD1234')).toBe(true);
      expect(mfaService.isValidBackupCode('abcd1234')).toBe(false);
      expect(mfaService.isValidBackupCode('ABCD123')).toBe(false);
      expect(mfaService.isValidBackupCode('ABCD12345')).toBe(false);
      expect(mfaService.isValidBackupCode('ABCD123!')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle service unavailable error', async () => {
      // Mock service as unavailable
      const service = new MFAService();
      (service as any).supabase = null;

      await expect(service.getMFAStatus()).rejects.toThrow(
        'MFA service not available'

    });

    test('should handle network errors gracefully', async () => {
      mockSupabase.auth.mfa.listFactors.mockRejectedValue(
        new Error('Network error')

      await expect(mfaService.getMFAStatus()).rejects.toThrow(
        'Failed to get MFA status'

    });
  });
});

// Integration tests
describe('MFA Service Integration', () => {
  test('should handle complete MFA setup flow', async () => {
    // Mock user authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    // Mock MFA enrollment
    mockSupabase.auth.mfa.enroll.mockResolvedValue({
      data: {
        id: 'factor_123',
        totp: {
          secret: 'ABCDEFGHIJKLMNOP',
        },
      },
      error: null,
    });

    // Mock verification
    mockSupabase.auth.mfa.verify.mockResolvedValue({
      data: { access_token: 'token_123' },
      error: null,
    });

    // Setup MFA
    const setup = await mfaService.setupMFA();
    expect(setup.secret).toBe('ABCDEFGHIJKLMNOP');

    // Verify setup
    const verified = await mfaService.verifyMFASetup('123456', 'factor_123');
    expect(verified).toBe(true);
  });

  test('should handle complete MFA login flow', async () => {
    // Mock challenge creation
    mockSupabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: 'challenge_123' },
      error: null,
    });

    // Mock verification
    mockSupabase.auth.mfa.verify.mockResolvedValue({
      data: { access_token: 'token_123' },
      error: null,
    });

    // Create challenge
    const challengeId = await mfaService.challengeMFA('factor_123');
    expect(challengeId).toBe('challenge_123');

    // Verify challenge
    const verified = await mfaService.verifyMFA(challengeId, '123456');
    expect(verified).toBe(true);
  });
});
