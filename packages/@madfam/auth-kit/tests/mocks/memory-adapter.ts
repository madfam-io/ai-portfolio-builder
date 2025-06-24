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

import type {
  User,
  Session,
  MFAMethod,
  AuthProvider,
} from '../../src/core/types';
import { BaseAdapter } from '../../src/adapters/base-adapter';
import { generateId } from '../../src/utils/id-generator';

export class MockMemoryAdapter extends BaseAdapter {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private sessionsByToken: Map<string, Session> = new Map();
  private mfaSecrets: Map<string, Record<MFAMethod, string>> = new Map();
  private backupCodes: Map<string, string[]> = new Map();
  private accountLinks: Map<
    string,
    Array<{ provider: AuthProvider; providerId: string }>
  > = new Map();

  createUser(data: Partial<User>): User {
    const user: User = {
      id: data.id || generateId(),
      email: data.email as string,
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      metadata: data.metadata || {},
      profile: data.profile,
      mfa: data.mfa,
      roles: data.roles,
      permissions: data.permissions,
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  updateUser(id: string, data: Partial<User>): User {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    this.usersByEmail.set(updatedUser.email, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): void {
    const user = this.users.get(id);
    if (user) {
      this.users.delete(id);
      this.usersByEmail.delete(user.email);
    }
  }

  findUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  findUserByEmail(email: string): User | null {
    return this.usersByEmail.get(email) || null;
  }

  findUsers(filter: Record<string, unknown>): User[] {
    const users = Array.from(this.users.values());
    return users.filter(user => {
      return Object.entries(filter).every(([key, value]) => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          return (user as any)[parent]?.[child] === value;
        }
        return (user as any)[key] === value;
      });
    });
  }

  createSession(data: Partial<Session>): Session {
    const session: Session = {
      id: data.id || generateId(),
      userId: data.userId as string,
      token: data.token as string,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt as Date,
      createdAt: data.createdAt || new Date(),
      lastAccessedAt: data.lastAccessedAt || new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceId: data.deviceId,
    };

    this.sessions.set(session.id, session);
    this.sessionsByToken.set(session.token, session);
    return session;
  }

  updateSession(id: string, data: Partial<Session>): Session {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error('Session not found');
    }

    // If token is being updated, remove the old token mapping
    if (data.token && data.token !== session.token) {
      this.sessionsByToken.delete(session.token);
    }

    const updatedSession = {
      ...session,
      ...data,
    };

    this.sessions.set(id, updatedSession);
    this.sessionsByToken.set(updatedSession.token, updatedSession);
    return updatedSession;
  }

  deleteSession(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.delete(id);
      this.sessionsByToken.delete(session.token);
    }
  }

  findSessionById(id: string): Session | null {
    return this.sessions.get(id) || null;
  }

  findSessionByToken(token: string): Session | null {
    return this.sessionsByToken.get(token) || null;
  }

  findSessionByRefreshToken(refreshToken: string): Session | null {
    return (
      Array.from(this.sessions.values()).find(
        s => s.refreshToken === refreshToken
      ) || null
    );
  }

  findUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  deleteUserSessions(userId: string): void {
    const userSessions = this.findUserSessions(userId);
    for (const session of userSessions) {
      this.deleteSession(session.id);
    }
  }

  saveMFASecret(userId: string, method: MFAMethod, secret: string): void {
    const existing = this.mfaSecrets.get(userId) || {};
    if (secret) {
      existing[method] = secret;
    } else {
      delete existing[method];
    }
    this.mfaSecrets.set(userId, existing);
  }

  getMFASecret(userId: string, method: MFAMethod): string | null {
    const secrets = this.mfaSecrets.get(userId);
    const secret = secrets?.[method];
    return secret || null;
  }

  saveBackupCodes(userId: string, codes: string[]): void {
    this.backupCodes.set(userId, codes);
  }

  verifyBackupCode(userId: string, code: string): boolean {
    const codes = this.backupCodes.get(userId) || [];
    const index = codes.indexOf(code);
    if (index > -1) {
      codes.splice(index, 1);
      this.backupCodes.set(userId, codes);
      return true;
    }
    return false;
  }

  createAccountLink(
    userId: string,
    provider: AuthProvider,
    providerId: string
  ): void {
    const existing = this.accountLinks.get(userId) || [];
    existing.push({ provider, providerId });
    this.accountLinks.set(userId, existing);
  }

  findAccountLinks(
    userId: string
  ): Array<{ provider: AuthProvider; providerId: string }> {
    return this.accountLinks.get(userId) || [];
  }

  deleteAccountLink(userId: string, provider: AuthProvider): void {
    const existing = this.accountLinks.get(userId) || [];
    const filtered = existing.filter(link => link.provider !== provider);
    this.accountLinks.set(userId, filtered);
  }

  // Test helper methods
  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.usersByEmail.clear();
    this.sessionsByToken.clear();
    this.mfaSecrets.clear();
    this.backupCodes.clear();
    this.accountLinks.clear();
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }
}
