/**
 * @madfam/auth-kit
 *
 * In-memory adapter for development and testing
 */

import { BaseAdapter } from './base-adapter';
import type { User, Session, MFAMethod, AuthProvider } from '../core/types';

interface AccountLink {
  userId: string;
  provider: AuthProvider;
  providerId: string;
}

interface MFASecret {
  userId: string;
  method: MFAMethod;
  secret: string;
}

interface BackupCode {
  userId: string;
  code: string;
  used: boolean;
}

/**
 * In-memory storage adapter
 * WARNING: Data is lost when the process restarts
 */
export class MemoryAdapter extends BaseAdapter {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private accountLinks: AccountLink[] = [];
  private mfaSecrets: MFASecret[] = [];
  private backupCodes: BackupCode[] = [];

  // User operations
  createUser(data: Partial<User>): Promise<User> {
    if (!data.id || !data.email) {
      throw new Error('User id and email are required');
    }

    const user = {
      ...data,
      id: data.id,
      email: data.email,
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    } as User;

    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  updateUser(id: string, data: Partial<User>): Promise<User> {
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
    return Promise.resolve(updatedUser);
  }

  deleteUser(id: string): Promise<void> {
    this.users.delete(id);
    // Clean up related data
    this.sessions.forEach((session, sessionId) => {
      if (session.userId === id) {
        this.sessions.delete(sessionId);
      }
    });
    this.accountLinks = this.accountLinks.filter(link => link.userId !== id);
    this.mfaSecrets = this.mfaSecrets.filter(secret => secret.userId !== id);
    this.backupCodes = this.backupCodes.filter(code => code.userId !== id);
    return Promise.resolve();
  }

  findUserById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) || null);
  }

  findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  // Session operations
  createSession(data: Partial<Session>): Promise<Session> {
    if (!data.id || !data.userId || !data.token || !data.expiresAt) {
      throw new Error('Session id, userId, token, and expiresAt are required');
    }

    const session = {
      ...data,
      id: data.id,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt || new Date(),
      lastAccessedAt: data.lastAccessedAt || new Date(),
    } as Session;

    this.sessions.set(session.id, session);
    return Promise.resolve(session);
  }

  updateSession(id: string, data: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...session,
      ...data,
    };

    this.sessions.set(id, updatedSession);
    return Promise.resolve(updatedSession);
  }

  deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
    return Promise.resolve();
  }

  findSessionById(id: string): Promise<Session | null> {
    return Promise.resolve(this.sessions.get(id) || null);
  }

  findSessionByToken(token: string): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (session.token === token) {
        return Promise.resolve(session);
      }
    }
    return Promise.resolve(null);
  }

  findUserSessions(userId: string): Promise<Session[]> {
    const userSessions: Session[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        userSessions.push(session);
      }
    }
    return Promise.resolve(userSessions);
  }

  deleteUserSessions(userId: string): Promise<void> {
    const sessionIds: string[] = [];
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        sessionIds.push(id);
      }
    }
    sessionIds.forEach(id => this.sessions.delete(id));
    return Promise.resolve();
  }

  // MFA operations
  saveMFASecret(
    userId: string,
    method: MFAMethod,
    secret: string
  ): Promise<void> {
    // Remove existing secret for this method
    this.mfaSecrets = this.mfaSecrets.filter(
      s => !(s.userId === userId && s.method === method)
    );

    if (secret) {
      this.mfaSecrets.push({ userId, method, secret });
    }
    return Promise.resolve();
  }

  getMFASecret(
    userId: string,
    method: MFAMethod
  ): Promise<string | null> {
    const secret = this.mfaSecrets.find(
      s => s.userId === userId && s.method === method
    );
    return Promise.resolve(secret?.secret || null);
  }

  saveBackupCodes(userId: string, codes: string[]): Promise<void> {
    // Remove existing codes
    this.backupCodes = this.backupCodes.filter(c => c.userId !== userId);

    // Add new codes
    codes.forEach(code => {
      this.backupCodes.push({ userId, code, used: false });
    });
    return Promise.resolve();
  }

  verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const backupCode = this.backupCodes.find(
      c => c.userId === userId && c.code === code && !c.used
    );

    if (backupCode) {
      backupCode.used = true;
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  // Account operations
  createAccountLink(
    userId: string,
    provider: AuthProvider,
    providerId: string
  ): Promise<void> {
    // Remove existing link for this provider
    this.accountLinks = this.accountLinks.filter(
      link => !(link.userId === userId && link.provider === provider)
    );

    this.accountLinks.push({ userId, provider, providerId });
    return Promise.resolve();
  }

  findAccountLinks(
    userId: string
  ): Promise<Array<{ provider: AuthProvider; providerId: string }>> {
    const links = this.accountLinks
      .filter(link => link.userId === userId)
      .map(({ provider, providerId }) => ({ provider, providerId }));
    return Promise.resolve(links);
  }

  deleteAccountLink(
    userId: string,
    provider: AuthProvider
  ): Promise<void> {
    this.accountLinks = this.accountLinks.filter(
      link => !(link.userId === userId && link.provider === provider)
    );
    return Promise.resolve();
  }

  // Utility methods for testing
  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.accountLinks = [];
    this.mfaSecrets = [];
    this.backupCodes = [];
  }

  getUserCount(): number {
    return this.users.size;
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}
