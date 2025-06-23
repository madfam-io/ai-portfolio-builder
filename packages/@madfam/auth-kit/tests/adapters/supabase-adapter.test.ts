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

// Setup method chaining
const createChainableMock = () => {
  const methods = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };

  // Make each method return the methods object for chaining
  Object.values(methods).forEach(method => {
    method.mockReturnValue(methods);
  });

  // Set up resolved values for terminal methods
  methods.single.mockResolvedValue({ data: null, error: null });
  methods.maybeSingle.mockResolvedValue({ data: null, error: null });

  return methods;
};

// Create a fresh chainable mock for each from() call
mockSupabaseClient.from.mockImplementation(() => createChainableMock());

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SupabaseAdapter', () => {
  let adapter: SupabaseAdapter;
  let mockMethods: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup fresh mocks for each test
    mockMethods = createChainableMock();
    mockSupabaseClient.from.mockImplementation(() => mockMethods);

    adapter = new SupabaseAdapter({
      url: 'https://test.supabase.co',
      key: 'test-key',
      client: mockSupabaseClient as any,
    });
  });

  describe('user operations', () => {
    const _mockUser: User = {
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

        mockMethods.single.mockResolvedValueOnce({
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

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('auth_users');
        expect(mockMethods.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            email_verified: false,
            metadata: { fullName: 'Test User' },
          })
        );
        expect(user.email).toBe('test@example.com');
        expect(user.emailVerified).toBe(false);
      });

      it('should handle Supabase error', async () => {
        mockMethods.single.mockResolvedValueOnce({
          data: null,
          error: { message: 'Email already exists' },
        });

        await expect(
          adapter.createUser({ email: 'test@example.com' })
        ).rejects.toThrow('Email already exists');
      });
    });

    describe('updateUser', () => {
      it('should update user successfully', async () => {
        const updates = { emailVerified: true };

        mockMethods.single.mockResolvedValueOnce({
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

        expect(mockMethods.update).toHaveBeenCalledWith({
          email_verified: true,
          updated_at: expect.any(Date),
        });
        expect(mockMethods.eq).toHaveBeenCalledWith('id', 'user-123');
        expect(user.emailVerified).toBe(true);
      });
    });

    describe('findUserByEmail', () => {
      it('should find user by email', async () => {
        mockMethods.single.mockResolvedValueOnce({
          data: {
            id: 'user-123',
            email: 'test@example.com',
            email_verified: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            metadata: {},
            profile: {},
            mfa: null,
          },
          error: null,
        });

        const user = await adapter.findUserByEmail('test@example.com');

        expect(mockMethods.eq).toHaveBeenCalledWith(
          'email',
          'test@example.com'
        );
        expect(user?.email).toBe('test@example.com');
      });

      it('should return null when user not found', async () => {
        mockMethods.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        });

        const user = await adapter.findUserByEmail('nonexistent@example.com');

        expect(user).toBeNull();
      });
    });

    describe('deleteUser', () => {
      it('should delete user successfully', async () => {
        // Mock for deleteUserSessions
        const deleteSessionsMock = createChainableMock();
        mockSupabaseClient.from.mockImplementationOnce(() => deleteSessionsMock);
        
        // Mock for deleteUser
        const deleteUserMock = createChainableMock();
        mockSupabaseClient.from.mockImplementationOnce(() => deleteUserMock);

        await adapter.deleteUser('user-123');

        expect(deleteSessionsMock.delete).toHaveBeenCalled();
        expect(deleteSessionsMock.eq).toHaveBeenCalledWith('user_id', 'user-123');
        expect(deleteUserMock.delete).toHaveBeenCalled();
        expect(deleteUserMock.eq).toHaveBeenCalledWith('id', 'user-123');
      });

      it('should handle deletion error', async () => {
        // Mock for deleteUserSessions
        const deleteSessionsMock = createChainableMock();
        mockSupabaseClient.from.mockImplementationOnce(() => deleteSessionsMock);
        
        // Mock for deleteUser with error
        const deleteUserMock = createChainableMock();
        deleteUserMock.delete.mockReturnValue(deleteUserMock);
        deleteUserMock.eq.mockReturnValue({
          data: null,
          error: { message: 'User not found' }
        });
        mockSupabaseClient.from.mockImplementationOnce(() => deleteUserMock);

        await expect(adapter.deleteUser('user-123')).rejects.toThrow(
          'Failed to delete user: User not found'
        );
      });
    });
  });

  describe('session operations', () => {
    const _mockSession: Session = {
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

        mockMethods.single.mockResolvedValueOnce({
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
        expect(mockMethods.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: 'user-123',
            token: 'token-abc',
            expires_at: sessionData.expiresAt,
          })
        );
        expect(session.userId).toBe('user-123');
        expect(session.token).toBe('token-abc');
      });
    });

    describe('findSessionByToken', () => {
      it('should find session by token', async () => {
        mockMethods.single.mockResolvedValueOnce({
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

        expect(mockMethods.eq).toHaveBeenCalledWith('token', 'token-abc');
        expect(session?.token).toBe('token-abc');
        expect(session?.userId).toBe('user-123');
      });

      it('should return null when session not found', async () => {
        mockMethods.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        });

        const session = await adapter.findSessionByToken('nonexistent-token');

        expect(session).toBeNull();
      });
    });

    describe('deleteSession', () => {
      it('should delete session successfully', async () => {
        await adapter.deleteSession('session-123');

        expect(mockMethods.delete).toHaveBeenCalled();
        expect(mockMethods.eq).toHaveBeenCalledWith('id', 'session-123');
      });
    });

    describe('deleteUserSessions', () => {
      it('should delete all user sessions', async () => {
        await adapter.deleteUserSessions('user-123');

        expect(mockMethods.delete).toHaveBeenCalled();
        expect(mockMethods.eq).toHaveBeenCalledWith('user_id', 'user-123');
      });
    });
  });

  describe('MFA operations', () => {
    describe('saveMFASecret', () => {
      it('should save MFA secret successfully', async () => {
        await adapter.saveMFASecret('user-123', 'totp', 'secret-abc');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'auth_mfa_secrets'
        );
        expect(mockMethods.upsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          method: 'totp',
          secret: 'secret-abc',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        });
      });

      it('should update existing MFA secret', async () => {
        await adapter.saveMFASecret('user-123', 'totp', 'new-secret');

        expect(mockMethods.upsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          method: 'totp',
          secret: 'new-secret',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        });
      });
    });

    describe('getMFASecret', () => {
      it('should retrieve MFA secret', async () => {
        mockMethods.single.mockResolvedValueOnce({
          data: { secret: 'secret-abc' },
          error: null,
        });

        const secret = await adapter.getMFASecret('user-123', 'totp');

        expect(mockMethods.select).toHaveBeenCalledWith('secret');
        expect(mockMethods.eq).toHaveBeenCalledWith('user_id', 'user-123');
        expect(mockMethods.eq).toHaveBeenCalledWith('method', 'totp');
        expect(secret).toBe('secret-abc');
      });

      it('should return null when secret not found', async () => {
        mockMethods.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
        });

        const secret = await adapter.getMFASecret('user-123', 'totp');

        expect(secret).toBeNull();
      });
    });

    describe('backup codes', () => {
      it('should save backup codes', async () => {
        const codes = ['CODE1', 'CODE2'];

        await adapter.saveBackupCodes('user-123', codes);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'auth_backup_codes'
        );
        expect(mockMethods.upsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          codes,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        });
      });

      it('should verify and consume backup code', async () => {
        // First mock for select
        const selectMock = createChainableMock();
        selectMock.single.mockResolvedValueOnce({
          data: { codes: ['CODE1', 'CODE2'] },
          error: null,
        });
        mockSupabaseClient.from.mockImplementationOnce(() => selectMock);
        
        // Second mock for update
        const updateMock = createChainableMock();
        mockSupabaseClient.from.mockImplementationOnce(() => updateMock);

        const isValid = await adapter.verifyBackupCode('user-123', 'CODE1');

        expect(isValid).toBe(true);
        expect(updateMock.update).toHaveBeenCalledWith({
          codes: ['CODE2'],
          updated_at: expect.any(Date)
        });
      });

      it('should return false for invalid backup code', async () => {
        mockMethods.single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' },
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

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'auth_account_links'
        );
        expect(mockMethods.insert).toHaveBeenCalledWith({
          user_id: 'user-123',
          provider: 'google',
          provider_id: 'google-456',
          created_at: expect.any(Date),
        });
      });
    });

    describe('findAccountLinks', () => {
      it('should find user account links', async () => {
        // Make select return the eq method for chaining
        mockMethods.select.mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [
              { provider: 'google', provider_id: 'google-456' },
              { provider: 'github', provider_id: 'github-789' },
            ],
            error: null,
          })
        });

        const links = await adapter.findAccountLinks('user-123');

        expect(links).toHaveLength(2);
        expect(links[0]).toEqual({
          provider: 'google',
          providerId: 'google-456',
        });
        expect(links[1]).toEqual({
          provider: 'github',
          providerId: 'github-789',
        });
      });
    });

    describe('deleteAccountLink', () => {
      it('should delete account link', async () => {
        await adapter.deleteAccountLink('user-123', 'google');

        expect(mockMethods.delete).toHaveBeenCalled();
        expect(mockMethods.eq).toHaveBeenCalledWith('user_id', 'user-123');
      });
    });
  });

  describe('error handling', () => {
    it('should handle Supabase connection errors', async () => {
      mockMethods.single.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(
        adapter.createUser({ email: 'test@example.com' })
      ).rejects.toThrow('Connection failed');
    });

    it('should handle malformed data gracefully', async () => {
      mockMethods.single.mockResolvedValueOnce({
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
        metadata: { fullName: 'Test User' },
        profile: { bio: 'Test bio' },
        mfa: null,
      };

      mockMethods.single.mockResolvedValueOnce({
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
        mfa: null,
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

      mockMethods.single.mockResolvedValueOnce({
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
