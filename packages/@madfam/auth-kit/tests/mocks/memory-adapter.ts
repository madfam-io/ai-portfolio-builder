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
  private accountLinks: Map<string, Array<{ provider: AuthProvider; providerId: string }>> = new Map();

  async createUser(data: Partial<User>): Promise<User> {
    const user: User = {
      id: data.id || generateId(),
      email: data.email!,
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

  async updateUser(id: string, data: Partial<User>): Promise<User> {
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

  async deleteUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.delete(id);
      this.usersByEmail.delete(user.email);
    }
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async findUsers(filter: Record<string, any>): Promise<User[]> {
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

  async createSession(data: Partial<Session>): Promise<Session> {
    const session: Session = {
      id: data.id || generateId(),
      userId: data.userId!,
      token: data.token!,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt!,
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

  async updateSession(id: string, data: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...session,
      ...data,
    };

    this.sessions.set(id, updatedSession);
    this.sessionsByToken.set(updatedSession.token, updatedSession);
    return updatedSession;
  }

  async deleteSession(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.delete(id);
      this.sessionsByToken.delete(session.token);
    }
  }

  async findSessionById(id: string): Promise<Session | null> {
    return this.sessions.get(id) || null;
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    return this.sessionsByToken.get(token) || null;
  }

  async findUserSessions(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const userSessions = await this.findUserSessions(userId);
    for (const session of userSessions) {
      await this.deleteSession(session.id);
    }
  }

  async saveMFASecret(userId: string, method: MFAMethod, secret: string): Promise<void> {
    const existing = this.mfaSecrets.get(userId) || {};
    existing[method] = secret;
    this.mfaSecrets.set(userId, existing);
  }

  async getMFASecret(userId: string, method: MFAMethod): Promise<string | null> {
    const secrets = this.mfaSecrets.get(userId);
    return secrets?.[method] || null;
  }

  async saveBackupCodes(userId: string, codes: string[]): Promise<void> {
    this.backupCodes.set(userId, codes);
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const codes = this.backupCodes.get(userId) || [];
    const index = codes.indexOf(code);
    if (index > -1) {
      codes.splice(index, 1);
      this.backupCodes.set(userId, codes);
      return true;
    }
    return false;
  }

  async createAccountLink(userId: string, provider: AuthProvider, providerId: string): Promise<void> {
    const existing = this.accountLinks.get(userId) || [];
    existing.push({ provider, providerId });
    this.accountLinks.set(userId, existing);
  }

  async findAccountLinks(userId: string): Promise<Array<{ provider: AuthProvider; providerId: string }>> {
    return this.accountLinks.get(userId) || [];
  }

  async deleteAccountLink(userId: string, provider: AuthProvider): Promise<void> {
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