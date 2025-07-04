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
 * Session management module
 */

import jwt from 'jsonwebtoken';
import type { Session, SessionConfig, AuthAdapter } from './types';
import { generateId } from '../utils/id-generator';
import { Logger } from '../utils/logger';
import { parseTimeToMs } from '../utils/time-parser';

export class SessionManager {
  private config: SessionConfig;
  private adapter?: AuthAdapter;
  private logger: Logger;

  constructor(config: SessionConfig, adapter?: AuthAdapter) {
    this.config = config;
    this.adapter = adapter;
    this.logger = new Logger('SessionManager');
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    options?: {
      rememberMe?: boolean;
      deviceId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<Session> {
    const sessionId = generateId();
    const now = new Date();

    // Calculate expiry
    const expiresIn =
      options?.rememberMe && this.config.absoluteTimeout
        ? parseTimeToMs(this.config.absoluteTimeout)
        : parseTimeToMs(this.config.expiresIn);

    const expiresAt = new Date(now.getTime() + expiresIn);

    // Create tokens based on session type
    let token: string;
    let refreshToken: string | undefined;

    if (this.config.type === 'jwt') {
      token = this.createJWT(userId, sessionId, expiresIn);

      if (this.config.refreshThreshold) {
        const refreshExpiresIn = this.config.absoluteTimeout
          ? parseTimeToMs(this.config.absoluteTimeout)
          : expiresIn * 2;
        refreshToken = this.createJWT(
          userId,
          sessionId,
          refreshExpiresIn,
          true
        );
      }
    } else {
      // Database sessions use random tokens
      token = generateId();
      refreshToken = this.config.refreshThreshold ? generateId() : undefined;
    }

    const session: Session = {
      id: sessionId,
      userId,
      token,
      refreshToken,
      expiresAt,
      createdAt: now,
      lastAccessedAt: now,
      deviceId: options?.deviceId,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    };

    // Store session
    if (this.adapter) {
      await this.adapter.createSession(session);
    } else if (this.config.type === 'database') {
      throw new Error('Database sessions require an adapter');
    }

    this.logger.debug('Session created', { sessionId, userId });

    return session;
  }

  /**
   * Get session by token
   */
  async getSession(token: string): Promise<Session | null> {
    try {
      if (this.config.type === 'jwt') {
        // Verify and decode JWT
        const payload = this.verifyJWT(token);
        if (!payload) return null;

        // Check if session exists in database
        if (!this.adapter) {
          return null;
        }

        const session = await this.adapter.findSessionById(payload.sessionId);
        if (!session) return null;

        // Check expiry
        if (new Date() > session.expiresAt) {
          await this.adapter.deleteSession(session.id);
          return null;
        }

        // Update last accessed
        const updatedSession = await this.adapter.updateSession(session.id, {
          lastAccessedAt: new Date(),
        });

        return updatedSession;
      } else {
        // Database session
        if (!this.adapter) {
          throw new Error('Database sessions require an adapter');
        }

        const session = await this.adapter.findSessionByToken(token);
        if (!session) return null;

        // Check expiry
        if (new Date() > session.expiresAt) {
          await this.adapter.deleteSession(session.id);
          return null;
        }

        // Update last accessed
        const updatedSession = await this.adapter.updateSession(session.id, {
          lastAccessedAt: new Date(),
        });

        return updatedSession;
      }
    } catch (error) {
      this.logger.error('Failed to get session', error as Error);
      return null;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(refreshToken: string): Promise<Session> {
    if (!this.config.refreshThreshold) {
      throw new Error('Session refresh not enabled');
    }

    let session: Session | null = null;

    if (this.config.type === 'jwt') {
      const payload = this.verifyJWT(refreshToken, true);
      if (!payload) {
        throw new Error('Invalid or expired refresh token');
      }

      if (this.adapter) {
        session = await this.adapter.findSessionById(payload.sessionId);
      }
    } else {
      if (!this.adapter) {
        throw new Error('Database sessions require an adapter');
      }

      // Find session by refresh token
      // We need to search through all sessions since we don't have the user ID
      const allSessions = await (this.adapter as any).getAllSessions?.();
      if (allSessions) {
        session =
          allSessions.find((s: Session) => s.refreshToken === refreshToken) ||
          null;
      } else if ((this.adapter as any).findSessionByRefreshToken) {
        session = await (this.adapter as any).findSessionByRefreshToken(
          refreshToken
        );
      } else {
        throw new Error('Adapter does not support refresh token lookup');
      }
    }

    if (!session || new Date() > session.expiresAt) {
      throw new Error('Invalid or expired refresh token');
    }

    // Always refresh when called - don't check threshold
    // The threshold is for client-side logic to determine when to call refresh

    // Create new tokens
    const expiresIn = parseTimeToMs(this.config.expiresIn);
    // Add 1ms to ensure the timestamp is different when refreshing immediately
    const newExpiresAt = new Date(Date.now() + expiresIn + 1);

    let newToken: string;
    let newRefreshToken: string | undefined;

    if (this.config.type === 'jwt') {
      newToken = this.createJWT(session.userId, session.id, expiresIn);

      const refreshExpiresIn = this.config.absoluteTimeout
        ? parseTimeToMs(this.config.absoluteTimeout)
        : expiresIn * 2;
      newRefreshToken = this.createJWT(
        session.userId,
        session.id,
        refreshExpiresIn,
        true
      );
    } else {
      newToken = generateId();
      newRefreshToken = generateId();
    }

    // Update session
    const updatedSession: Session = {
      ...session,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
      lastAccessedAt: new Date(),
    };

    if (this.adapter) {
      const refreshedSession = await this.adapter.updateSession(session.id, {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        lastAccessedAt: new Date(),
      });

      this.logger.debug('Session refreshed', { sessionId: session.id });
      return refreshedSession;
    }

    this.logger.debug('Session refreshed', { sessionId: session.id });
    return updatedSession;
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    if (this.adapter) {
      await this.adapter.deleteSession(sessionId);
    }

    this.logger.debug('Session revoked', { sessionId });
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    if (this.adapter) {
      await this.adapter.deleteUserSessions(userId);
    }

    this.logger.debug('All user sessions revoked', { userId });
  }

  /**
   * Revoke all sessions for a user (alias for revokeAllUserSessions)
   */
  revokeUserSessions(userId: string): Promise<void> {
    return this.revokeAllUserSessions(userId);
  }

  /**
   * Validate if a session token is valid
   */
  async validateSession(token: string): Promise<boolean> {
    const session = await this.getSession(token);
    return session !== null;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    if (!this.adapter) {
      return [];
    }

    const sessions = await this.adapter.findUserSessions(userId);

    // Filter out expired sessions
    const now = new Date();
    const validSessions = sessions.filter(session => session.expiresAt > now);

    // Clean up expired sessions
    const expiredSessions = sessions.filter(
      session => session.expiresAt <= now
    );
    for (const session of expiredSessions) {
      await this.adapter.deleteSession(session.id);
    }

    return validSessions;
  }

  /**
   * Create JWT token
   */
  private createJWT(
    userId: string,
    sessionId: string,
    expiresIn: number,
    isRefreshToken = false
  ): string {
    if (!this.config.secret) {
      throw new Error('JWT secret not configured');
    }

    const payload = {
      userId,
      sessionId,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return jwt.sign(payload, this.config.secret, {
      expiresIn: Math.floor(expiresIn / 1000), // JWT uses seconds
      issuer: 'auth-kit',
      audience: 'auth-kit',
      jwtid: generateId(), // Make each token unique
    });
  }

  /**
   * Verify JWT token
   */
  private verifyJWT(token: string, isRefreshToken = false): any {
    if (!this.config.secret) {
      throw new Error('JWT secret not configured');
    }

    try {
      const payload = jwt.verify(token, this.config.secret, {
        issuer: 'auth-kit',
        audience: 'auth-kit',
      }) as any;

      if (payload.type !== (isRefreshToken ? 'refresh' : 'access')) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}
