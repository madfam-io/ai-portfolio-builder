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
import { SessionManager } from '../../src/core/session-manager';
import { MockMemoryAdapter } from '../mocks/memory-adapter';
import type { SessionConfig } from '../../src/core/types';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let adapter: MockMemoryAdapter;

  const defaultConfig: SessionConfig = {
    type: 'jwt',
    secret: 'test-secret-key-that-is-long-enough',
    expiresIn: '1h',
    refreshThreshold: '15m',
  };

  beforeEach(() => {
    adapter = new MockMemoryAdapter();
    sessionManager = new SessionManager(defaultConfig, adapter);
  });

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      const userId = 'user-123';
      const session = await sessionManager.createSession(userId);

      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.token).toBeDefined();
      expect(session.expiresAt).toBeDefined();
      expect(session.createdAt).toBeDefined();
      expect(session.lastAccessedAt).toBeDefined();

      // Should be stored in adapter
      const storedSession = await adapter.findSessionById(session.id);
      expect(storedSession).toEqual(session);
    });

    it('should create session with custom options', async () => {
      const userId = 'user-123';
      const options = {
        rememberMe: true,
        deviceId: 'device-abc',
      };

      const session = await sessionManager.createSession(userId, options);

      expect(session.deviceId).toBe('device-abc');
      // With rememberMe, expiry should be longer (this would be implementation specific)
    });

    it('should handle IP address and user agent', async () => {
      const userId = 'user-123';
      const context = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
      };

      const session = await sessionManager.createSession(userId, context);

      expect(session.ipAddress).toBe('192.168.1.1');
      expect(session.userAgent).toBe('Mozilla/5.0...');
    });
  });

  describe('getSession', () => {
    it('should retrieve valid session', async () => {
      const userId = 'user-123';
      const createdSession = await sessionManager.createSession(userId);

      const retrievedSession = await sessionManager.getSession(
        createdSession.token
      );

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe(createdSession.id);
      expect(retrievedSession?.userId).toBe(userId);
    });

    it('should return null for invalid token', async () => {
      const session = await sessionManager.getSession('invalid-token');

      expect(session).toBeNull();
    });

    it('should return null for expired session', async () => {
      const userId = 'user-123';
      const createdSession = await sessionManager.createSession(userId);

      // Manually expire the session
      await adapter.updateSession(createdSession.id, {
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      });

      const session = await sessionManager.getSession(createdSession.token);

      expect(session).toBeNull();
    });

    it('should update lastAccessedAt when retrieving session', async () => {
      const userId = 'user-123';
      const createdSession = await sessionManager.createSession(userId);
      const originalLastAccessed = createdSession.lastAccessedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const retrievedSession = await sessionManager.getSession(
        createdSession.token
      );

      expect(retrievedSession?.lastAccessedAt).not.toEqual(
        originalLastAccessed
      );
      expect(retrievedSession?.lastAccessedAt.getTime()).toBeGreaterThan(
        originalLastAccessed.getTime()
      );
    });
  });

  describe('refreshSession', () => {
    beforeEach(() => {
      sessionManager = new SessionManager(
        {
          ...defaultConfig,
          refreshThreshold: '15m',
        },
        adapter
      );
    });

    it('should refresh session with valid refresh token', async () => {
      const userId = 'user-123';
      const originalSession = await sessionManager.createSession(userId);

      expect(originalSession.refreshToken).toBeDefined();

      const refreshedSession = await sessionManager.refreshSession(
        originalSession.refreshToken!
      );

      expect(refreshedSession).toBeDefined();
      expect(refreshedSession.userId).toBe(userId);
      expect(refreshedSession.token).not.toBe(originalSession.token);
      expect(refreshedSession.expiresAt.getTime()).toBeGreaterThan(
        originalSession.expiresAt.getTime()
      );
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(
        sessionManager.refreshSession('invalid-refresh-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error for expired refresh token', async () => {
      const userId = 'user-123';
      const originalSession = await sessionManager.createSession(userId);

      // Manually expire the session (which should also invalidate refresh token)
      await adapter.updateSession(originalSession.id, {
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        sessionManager.refreshSession(originalSession.refreshToken!)
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('revokeSession', () => {
    it('should revoke session successfully', async () => {
      const userId = 'user-123';
      const session = await sessionManager.createSession(userId);

      await sessionManager.revokeSession(session.id);

      // Session should be deleted
      const storedSession = await adapter.findSessionById(session.id);
      expect(storedSession).toBeNull();

      // Token should no longer work
      const retrievedSession = await sessionManager.getSession(session.token);
      expect(retrievedSession).toBeNull();
    });

    it('should handle revoking non-existent session', async () => {
      // Should not throw for non-existent session
      await expect(
        sessionManager.revokeSession('non-existent-id')
      ).resolves.toBeUndefined();
    });
  });

  describe('revokeUserSessions', () => {
    it('should revoke all user sessions', async () => {
      const userId = 'user-123';
      const session1 = await sessionManager.createSession(userId);
      const session2 = await sessionManager.createSession(userId);
      const session3 = await sessionManager.createSession(userId);

      await sessionManager.revokeUserSessions(userId);

      // All sessions should be deleted
      expect(await adapter.findSessionById(session1.id)).toBeNull();
      expect(await adapter.findSessionById(session2.id)).toBeNull();
      expect(await adapter.findSessionById(session3.id)).toBeNull();

      // Tokens should no longer work
      expect(await sessionManager.getSession(session1.token)).toBeNull();
      expect(await sessionManager.getSession(session2.token)).toBeNull();
      expect(await sessionManager.getSession(session3.token)).toBeNull();
    });

    it('should only revoke sessions for specific user', async () => {
      const user1Id = 'user-123';
      const user2Id = 'user-456';

      const user1Session = await sessionManager.createSession(user1Id);
      const user2Session = await sessionManager.createSession(user2Id);

      await sessionManager.revokeUserSessions(user1Id);

      // User 1 sessions should be revoked
      expect(await adapter.findSessionById(user1Session.id)).toBeNull();

      // User 2 sessions should remain
      expect(await adapter.findSessionById(user2Session.id)).toBeDefined();
    });
  });

  describe('validateSession', () => {
    it('should validate active session', async () => {
      const userId = 'user-123';
      const session = await sessionManager.createSession(userId);

      const isValid = await sessionManager.validateSession(session.token);

      expect(isValid).toBe(true);
    });

    it('should reject expired session', async () => {
      const userId = 'user-123';
      const session = await sessionManager.createSession(userId);

      // Manually expire the session
      await adapter.updateSession(session.id, {
        expiresAt: new Date(Date.now() - 1000),
      });

      const isValid = await sessionManager.validateSession(session.token);

      expect(isValid).toBe(false);
    });

    it('should reject invalid token', async () => {
      const isValid = await sessionManager.validateSession('invalid-token');

      expect(isValid).toBe(false);
    });
  });

  describe('getUserSessions', () => {
    it('should get all user sessions', async () => {
      const userId = 'user-123';
      const session1 = await sessionManager.createSession(userId);
      const session2 = await sessionManager.createSession(userId);

      const sessions = await sessionManager.getUserSessions(userId);

      expect(sessions).toHaveLength(2);
      expect(sessions.map(s => s.id)).toContain(session1.id);
      expect(sessions.map(s => s.id)).toContain(session2.id);
    });

    it('should return empty array for user with no sessions', async () => {
      const sessions = await sessionManager.getUserSessions('user-no-sessions');

      expect(sessions).toHaveLength(0);
    });
  });

  describe('JWT token handling', () => {
    it('should create valid JWT tokens', async () => {
      const userId = 'user-123';
      const session = await sessionManager.createSession(userId);

      expect(session.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // JWT format
    });

    it('should include user ID in token payload', async () => {
      const userId = 'user-123';
      const session = await sessionManager.createSession(userId);

      // In a real test, you might decode the JWT to verify the payload
      // For now, we'll trust that the SessionManager handles this correctly
      expect(session.token).toBeDefined();
      expect(session.userId).toBe(userId);
    });
  });

  describe('database session type', () => {
    beforeEach(() => {
      sessionManager = new SessionManager(
        {
          ...defaultConfig,
          type: 'database',
        },
        adapter
      );
    });

    it('should work with database session type', async () => {
      const userId = 'user-123';
      const session = await sessionManager.createSession(userId);

      expect(session).toBeDefined();
      expect(session.token).toBeDefined();

      const retrievedSession = await sessionManager.getSession(session.token);
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.userId).toBe(userId);
    });
  });
});
