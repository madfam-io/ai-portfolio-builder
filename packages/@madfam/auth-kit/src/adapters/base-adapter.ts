/**
 * @madfam/auth-kit
 * 
 * Base adapter class
 */

import type {
  AuthAdapter,
  User,
  Session,
  MFAMethod,
  AuthProvider,
} from '../core/types';

/**
 * Base adapter class for extending
 */
export abstract class BaseAdapter implements AuthAdapter {
  // User operations
  abstract createUser(data: Partial<User>): Promise<User>;
  abstract updateUser(id: string, data: Partial<User>): Promise<User>;
  abstract deleteUser(id: string): Promise<void>;
  abstract findUserById(id: string): Promise<User | null>;
  abstract findUserByEmail(email: string): Promise<User | null>;
  
  // Session operations
  abstract createSession(data: Partial<Session>): Promise<Session>;
  abstract updateSession(id: string, data: Partial<Session>): Promise<Session>;
  abstract deleteSession(id: string): Promise<void>;
  abstract findSessionById(id: string): Promise<Session | null>;
  abstract findSessionByToken(token: string): Promise<Session | null>;
  abstract findUserSessions(userId: string): Promise<Session[]>;
  abstract deleteUserSessions(userId: string): Promise<void>;
  
  // MFA operations
  abstract saveMFASecret(userId: string, method: MFAMethod, secret: string): Promise<void>;
  abstract getMFASecret(userId: string, method: MFAMethod): Promise<string | null>;
  abstract saveBackupCodes(userId: string, codes: string[]): Promise<void>;
  abstract verifyBackupCode(userId: string, code: string): Promise<boolean>;
  
  // Account operations
  abstract createAccountLink(userId: string, provider: AuthProvider, providerId: string): Promise<void>;
  abstract findAccountLinks(userId: string): Promise<Array<{ provider: AuthProvider; providerId: string }>>;
  abstract deleteAccountLink(userId: string, provider: AuthProvider): Promise<void>;
}