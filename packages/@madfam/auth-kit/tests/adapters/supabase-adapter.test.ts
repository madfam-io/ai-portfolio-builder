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

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { SupabaseAdapter } from '../../src/adapters/supabase-adapter';
import type { User, Session } from '../../src/core/types';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    admin: {
      createUser: jest.fn(),
      updateUserById: jest.fn(),
      deleteUser: jest.fn(),
      getUserById: jest.fn(),
      listUsers: jest.fn(),
    },
  },
  rpc: jest.fn(),
};

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();

// Chain mock methods
mockSelect.mockReturnValue({ eq: mockEq });
mockInsert.mockReturnValue({ select: mockSelect });
mockUpdate.mockReturnValue({ eq: mockEq });
mockDelete.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ 
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  select: mockSelect,
});
mockSingle.mockResolvedValue({ data: null, error: null });
mockMaybeSingle.mockResolvedValue({ data: null, error: null });

mockSupabaseClient.from.mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SupabaseAdapter', () => {
  let adapter: SupabaseAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new SupabaseAdapter({
      url: 'https://test.supabase.co',
      key: 'test-key',
    });
  });

  describe('user operations', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      metadata: { fullName: 'Test User' },
    };

    describe('createUser', () => {
      it('should create user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          emailVerified: false,
          metadata: { fullName: 'Test User' },
        };

        mockSingle.mockResolvedValueOnce({
          data: {
            id: 'user-123',
            email: 'test@example.com',
            email_verified: false,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            raw_user_meta_data: { fullName: 'Test User' },
          },
          error: null,
        });

        const user = await adapter.createUser(userData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('auth.users');
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          email: 'test@example.com',
          email_verified: false,
          raw_user_meta_data: { fullName: 'Test User' },
        }));
        expect(user.email).toBe('test@example.com');
        expect(user.emailVerified).toBe(false);
      });

      it('should handle Supabase error', async () => {
        mockSingle.mockResolvedValueOnce({
          data: null,
          error: { message: 'Email already exists' },
        });

        await expect(adapter.createUser({ email: 'test@example.com' }))
          .rejects.toThrow('Email already exists');
      });
    });

    describe('updateUser', () => {
      it('should update user successfully', async () => {
        const updates = { emailVerified: true };

        mockSingle.mockResolvedValueOnce({
          data: {
            id: 'user-123',
            email: 'test@example.com',
            email_verified: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
          error: null,
        });

        const user = await adapter.updateUser('user-123', updates);

        expect(mockUpdate).toHaveBeenCalledWith({
          email_verified: true,
          updated_at: expect.any(String),
        });
        expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
        expect(user.emailVerified).toBe(true);
      });
    });

    describe('findUserByEmail', () => {
      it('should find user by email', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: {
            id: 'user-123',
            email: 'test@example.com',
            email_verified: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        });

        const user = await adapter.findUserByEmail('test@example.com');

        expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
        expect(user?.email).toBe('test@example.com');
      });

      it('should return null when user not found', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: null,
          error: null,
        });

        const user = await adapter.findUserByEmail('nonexistent@example.com');

        expect(user).toBeNull();
      });
    });

    describe('deleteUser', () => {
      it('should delete user successfully', async () => {
        mockSupabaseClient.auth.admin.deleteUser.mockResolvedValueOnce({
          data: { user: null },
          error: null,
        });

        await adapter.deleteUser('user-123');

        expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
      });

      it('should handle deletion error', async () => {
        mockSupabaseClient.auth.admin.deleteUser.mockResolvedValueOnce({
          data: null,
          error: { message: 'User not found' },
        });

        await expect(adapter.deleteUser('user-123'))
          .rejects.toThrow('User not found');
      });
    });
  });

  describe('session operations', () => {
    const mockSession: Session = {
      id: 'session-123',
      userId: 'user-123',
      token: 'token-abc',
      expiresAt: new Date('2024-12-31'),
      createdAt: new Date('2024-01-01'),
      lastAccessedAt: new Date('2024-01-01'),
    };

    describe('createSession', () => {
      it('should create session successfully', async () => {
        const sessionData = {
          userId: 'user-123',
          token: 'token-abc',
          expiresAt: new Date('2024-12-31'),
        };

        mockSingle.mockResolvedValueOnce({
          data: {
            id: 'session-123',
            user_id: 'user-123',
            token: 'token-abc',
            expires_at: '2024-12-31T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            last_accessed_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        });

        const session = await adapter.createSession(sessionData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('auth_sessions');
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          user_id: 'user-123',
          token: 'token-abc',
          expires_at: '2024-12-31T00:00:00.000Z',
        }));
        expect(session.userId).toBe('user-123');
        expect(session.token).toBe('token-abc');
      });
    });

    describe('findSessionByToken', () => {
      it('should find session by token', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: {
            id: 'session-123',
            user_id: 'user-123',
            token: 'token-abc',
            expires_at: '2024-12-31T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            last_accessed_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        });

        const session = await adapter.findSessionByToken('token-abc');

        expect(mockEq).toHaveBeenCalledWith('token', 'token-abc');
        expect(session?.token).toBe('token-abc');
        expect(session?.userId).toBe('user-123');
      });

      it('should return null when session not found', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: null,
          error: null,
        });

        const session = await adapter.findSessionByToken('nonexistent-token');

        expect(session).toBeNull();
      });
    });

    describe('deleteSession', () => {
      it('should delete session successfully', async () => {
        await adapter.deleteSession('session-123');

        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith('id', 'session-123');
      });
    });

    describe('deleteUserSessions', () => {
      it('should delete all user sessions', async () => {
        await adapter.deleteUserSessions('user-123');

        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      });
    });
  });

  describe('MFA operations', () => {
    describe('saveMFASecret', () => {
      it('should save MFA secret successfully', async () => {
        await adapter.saveMFASecret('user-123', 'totp', 'secret-abc');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_mfa_secrets');
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          method: 'totp',
          secret: 'secret-abc',
          created_at: expect.any(String),
        });
      });

      it('should update existing MFA secret', async () => {
        // First call returns existing secret (for upsert logic)
        mockMaybeSingle.mockResolvedValueOnce({
          data: { id: 'secret-123' },
          error: null,
        });

        await adapter.saveMFASecret('user-123', 'totp', 'new-secret');

        expect(mockUpdate).toHaveBeenCalledWith({
          secret: 'new-secret',
          updated_at: expect.any(String),
        });
      });
    });

    describe('getMFASecret', () => {
      it('should retrieve MFA secret', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: { secret: 'secret-abc' },
          error: null,
        });

        const secret = await adapter.getMFASecret('user-123', 'totp');

        expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
        expect(secret).toBe('secret-abc');
      });

      it('should return null when secret not found', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: null,
          error: null,
        });

        const secret = await adapter.getMFASecret('user-123', 'totp');

        expect(secret).toBeNull();
      });
    });

    describe('backup codes', () => {
      it('should save backup codes', async () => {
        const codes = ['CODE1', 'CODE2'];

        await adapter.saveBackupCodes('user-123', codes);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_backup_codes');
        expect(mockInsert).toHaveBeenCalledWith(
          codes.map(code => ({
            user_id: 'user-123',
            code,
            created_at: expect.any(String),
          }))
        );
      });

      it('should verify and consume backup code', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: { id: 'code-123', code: 'CODE1' },
          error: null,
        });

        const isValid = await adapter.verifyBackupCode('user-123', 'CODE1');

        expect(isValid).toBe(true);
        expect(mockDelete).toHaveBeenCalled();
      });

      it('should return false for invalid backup code', async () => {
        mockMaybeSingle.mockResolvedValueOnce({
          data: null,
          error: null,
        });

        const isValid = await adapter.verifyBackupCode('user-123', 'INVALID');

        expect(isValid).toBe(false);
      });
    });
  });

  describe('account linking', () => {
    describe('createAccountLink', () => {
      it('should create account link successfully', async () => {
        await adapter.createAccountLink('user-123', 'google', 'google-456');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_account_links');
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          provider: 'google',
          provider_id: 'google-456',
          created_at: expect.any(String),
        });
      });
    });

    describe('findAccountLinks', () => {
      it('should find user account links', async () => {
        mockSelect.mockResolvedValueOnce({
          data: [
            { provider: 'google', provider_id: 'google-456' },
            { provider: 'github', provider_id: 'github-789' },
          ],
          error: null,
        });

        const links = await adapter.findAccountLinks('user-123');

        expect(links).toHaveLength(2);
        expect(links[0]).toEqual({ provider: 'google', providerId: 'google-456' });
        expect(links[1]).toEqual({ provider: 'github', providerId: 'github-789' });
      });
    });

    describe('deleteAccountLink', () => {
      it('should delete account link', async () => {
        await adapter.deleteAccountLink('user-123', 'google');

        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      });
    });
  });

  describe('error handling', () => {
    it('should handle Supabase connection errors', async () => {
      mockSingle.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(adapter.createUser({ email: 'test@example.com' }))
        .rejects.toThrow('Connection failed');
    });

    it('should handle malformed data gracefully', async () => {
      mockMaybeSingle.mockResolvedValueOnce({
        data: { invalid: 'data' },
        error: null,
      });

      const user = await adapter.findUserByEmail('test@example.com');

      // Should handle missing fields gracefully
      expect(user).toBeDefined();
    });
  });

  describe('data transformation', () => {
    it('should correctly transform Supabase user to User type', async () => {
      const supabaseUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        raw_user_meta_data: { fullName: 'Test User' },
        user_metadata: { bio: 'Test bio' },
        app_metadata: { roles: ['admin'] },
      };

      mockMaybeSingle.mockResolvedValueOnce({
        data: supabaseUser,
        error: null,
      });

      const user = await adapter.findUserByEmail('test@example.com');

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        metadata: { fullName: 'Test User' },
        profile: { bio: 'Test bio' },
        roles: ['admin'],
      });
    });

    it('should correctly transform Supabase session to Session type', async () => {
      const supabaseSession = {
        id: 'session-123',
        user_id: 'user-123',
        token: 'token-abc',
        refresh_token: 'refresh-abc',
        expires_at: '2024-12-31T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        last_accessed_at: '2024-01-02T00:00:00Z',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        device_id: 'device-123',
      };

      mockMaybeSingle.mockResolvedValueOnce({
        data: supabaseSession,
        error: null,
      });

      const session = await adapter.findSessionByToken('token-abc');

      expect(session).toEqual({
        id: 'session-123',
        userId: 'user-123',
        token: 'token-abc',
        refreshToken: 'refresh-abc',
        expiresAt: new Date('2024-12-31T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        lastAccessedAt: new Date('2024-01-02T00:00:00Z'),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        deviceId: 'device-123',
      });
    });
  });
});