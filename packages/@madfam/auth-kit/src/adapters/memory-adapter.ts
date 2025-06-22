/**
 * @madfam/auth-kit
 * 
 * In-memory adapter for development and testing
 */

import { BaseAdapter } from './base-adapter';
import type {
  User,
  Session,
  MFAMethod,
  AuthProvider,
} from '../core/types';

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
  async createUser(data: Partial<User>): Promise<User> {
    const user = {
      ...data,
      id: data.id!,
      email: data.email!,
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    } as User;

    this.users.set(user.id, user);
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
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
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
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  // Session operations
  async createSession(data: Partial<Session>): Promise<Session> {
    const session = {
      ...data,
      id: data.id!,
      userId: data.userId!,
      token: data.token!,
      expiresAt: data.expiresAt!,
      createdAt: data.createdAt || new Date(),
      lastAccessedAt: data.lastAccessedAt || new Date(),
    } as Session;

    this.sessions.set(session.id, session);
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
    return updatedSession;
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async findSessionById(id: string): Promise<Session | null> {
    return this.sessions.get(id) || null;
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (session.token === token) {
        return session;
      }
    }
    return null;
  }

  async findUserSessions(userId: string): Promise<Session[]> {
    const userSessions: Session[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        userSessions.push(session);
      }
    }
    return userSessions;
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const sessionIds: string[] = [];
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        sessionIds.push(id);
      }
    }
    sessionIds.forEach(id => this.sessions.delete(id));
  }

  // MFA operations
  async saveMFASecret(userId: string, method: MFAMethod, secret: string): Promise<void> {
    // Remove existing secret for this method
    this.mfaSecrets = this.mfaSecrets.filter(
      s => !(s.userId === userId && s.method === method)
    );
    
    if (secret) {
      this.mfaSecrets.push({ userId, method, secret });
    }
  }

  async getMFASecret(userId: string, method: MFAMethod): Promise<string | null> {
    const secret = this.mfaSecrets.find(
      s => s.userId === userId && s.method === method
    );
    return secret?.secret || null;
  }

  async saveBackupCodes(userId: string, codes: string[]): Promise<void> {
    // Remove existing codes
    this.backupCodes = this.backupCodes.filter(c => c.userId !== userId);
    
    // Add new codes
    codes.forEach(code => {
      this.backupCodes.push({ userId, code, used: false });
    });
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const backupCode = this.backupCodes.find(
      c => c.userId === userId && c.code === code && !c.used
    );
    
    if (backupCode) {
      backupCode.used = true;
      return true;
    }
    
    return false;
  }

  // Account operations
  async createAccountLink(userId: string, provider: AuthProvider, providerId: string): Promise<void> {
    // Remove existing link for this provider
    this.accountLinks = this.accountLinks.filter(
      link => !(link.userId === userId && link.provider === provider)
    );
    
    this.accountLinks.push({ userId, provider, providerId });
  }

  async findAccountLinks(userId: string): Promise<Array<{ provider: AuthProvider; providerId: string }>> {
    return this.accountLinks
      .filter(link => link.userId === userId)
      .map(({ provider, providerId }) => ({ provider, providerId }));
  }

  async deleteAccountLink(userId: string, provider: AuthProvider): Promise<void> {
    this.accountLinks = this.accountLinks.filter(
      link => !(link.userId === userId && link.provider === provider)
    );
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