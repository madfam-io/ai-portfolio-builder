/**
 * @madfam/auth-kit
 *
 * Supabase adapter for production use
 */

import { BaseAdapter } from './base-adapter';
import type { User, Session, MFAMethod, AuthProvider } from '../core/types';

/**
 * Supabase storage adapter
 *
 * Uses Supabase as the backend for authentication data
 */
export class SupabaseAdapter extends BaseAdapter {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(config: { url: string; key: string }) {
    super();
    this.supabaseUrl = config.url;
    this.supabaseKey = config.key;
  }

  // User operations
  createUser(_data: Partial<User>): Promise<User> {
    // Implementation would use Supabase client
    throw new Error('Supabase adapter not yet implemented');
  }

  updateUser(_id: string, _data: Partial<User>): Promise<User> {
    throw new Error('Supabase adapter not yet implemented');
  }

  deleteUser(_id: string): Promise<void> {
    throw new Error('Supabase adapter not yet implemented');
  }

  findUserById(_id: string): Promise<User | null> {
    throw new Error('Supabase adapter not yet implemented');
  }

  findUserByEmail(_email: string): Promise<User | null> {
    throw new Error('Supabase adapter not yet implemented');
  }

  // Session operations
  createSession(_data: Partial<Session>): Promise<Session> {
    throw new Error('Supabase adapter not yet implemented');
  }

  updateSession(_id: string, _data: Partial<Session>): Promise<Session> {
    throw new Error('Supabase adapter not yet implemented');
  }

  deleteSession(_id: string): Promise<void> {
    throw new Error('Supabase adapter not yet implemented');
  }

  findSessionById(_id: string): Promise<Session | null> {
    throw new Error('Supabase adapter not yet implemented');
  }

  findSessionByToken(_token: string): Promise<Session | null> {
    throw new Error('Supabase adapter not yet implemented');
  }

  findUserSessions(_userId: string): Promise<Session[]> {
    throw new Error('Supabase adapter not yet implemented');
  }

  deleteUserSessions(_userId: string): Promise<void> {
    throw new Error('Supabase adapter not yet implemented');
  }

  // MFA operations
  saveMFASecret(
    _userId: string,
    _method: MFAMethod,
    _secret: string
  ): Promise<void> {
    throw new Error('Supabase adapter not yet implemented');
  }

  getMFASecret(_userId: string, _method: MFAMethod): Promise<string | null> {
    throw new Error('Supabase adapter not yet implemented');
  }

  saveBackupCodes(_userId: string, _codes: string[]): Promise<void> {
    throw new Error('Supabase adapter not yet implemented');
  }

  verifyBackupCode(_userId: string, _code: string): Promise<boolean> {
    throw new Error('Supabase adapter not yet implemented');
  }

  // Account operations
  createAccountLink(
    _userId: string,
    _provider: AuthProvider,
    _providerId: string
  ): Promise<void> {
    throw new Error('Supabase adapter not yet implemented');
  }

  findAccountLinks(
    _userId: string
  ): Promise<Array<{ provider: AuthProvider; providerId: string }>> {
    throw new Error('Supabase adapter not yet implemented');
  }

  deleteAccountLink(_userId: string, _provider: AuthProvider): Promise<void> {
    throw new Error('Supabase adapter not yet implemented');
  }
}
