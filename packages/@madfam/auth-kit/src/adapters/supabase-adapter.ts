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
 * Supabase adapter for production use
 */

import { BaseAdapter } from './base-adapter';
import type { User, Session, MFAMethod, AuthProvider } from '../core/types';

interface SupabaseClient {
  from(table: string): any;
  auth: any;
}

interface SupabaseConfig {
  url: string;
  key: string;
  client?: SupabaseClient;
}

/**
 * Supabase storage adapter
 *
 * Uses Supabase as the backend for authentication data
 */
export class SupabaseAdapter extends BaseAdapter {
  private supabaseUrl: string;
  private supabaseKey: string;
  private client: SupabaseClient | null = null;

  constructor(config: SupabaseConfig) {
    super();
    this.supabaseUrl = config.url;
    this.supabaseKey = config.key;
    this.client = config.client || null;
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error(
        'Supabase client not initialized. Please provide a client instance or install @supabase/supabase-js'
      );
    }
    return this.client;
  }

  // User operations
  async createUser(data: Partial<User>): Promise<User> {
    const client = this.getClient();
    const userData = {
      id: data.id,
      email: data.email,
      email_verified: data.emailVerified || false,
      created_at: data.createdAt || new Date(),
      updated_at: data.updatedAt || new Date(),
      metadata: data.metadata || {},
      profile: data.profile || {},
      mfa: data.mfa || null,
    };

    const { data: user, error } = await client
      .from('auth_users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return this.mapSupabaseUser(user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const client = this.getClient();
    const updateData = {
      email: data.email,
      email_verified: data.emailVerified,
      updated_at: new Date(),
      metadata: data.metadata,
      profile: data.profile,
      mfa: data.mfa,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const { data: user, error } = await client
      .from('auth_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return this.mapSupabaseUser(user);
  }

  async deleteUser(id: string): Promise<void> {
    const client = this.getClient();

    // Delete user sessions first
    await this.deleteUserSessions(id);

    // Delete user
    const { error } = await client.from('auth_users').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async findUserById(id: string): Promise<User | null> {
    const client = this.getClient();
    const { data: user, error } = await client
      .from('auth_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return user ? this.mapSupabaseUser(user) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const client = this.getClient();
    const { data: user, error } = await client
      .from('auth_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return user ? this.mapSupabaseUser(user) : null;
  }

  async findUsers(filter: Record<string, any>): Promise<User[]> {
    const client = this.getClient();
    let query = client.from('auth_users').select('*');

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      if (key.includes('.')) {
        // Handle nested properties (e.g., metadata.passwordResetToken)
        const [column, jsonPath] = key.split('.');
        query = query.eq(`${column}->>${jsonPath}`, value);
      } else {
        query = query.eq(key, value);
      }
    });

    const { data: users, error } = await query;

    if (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }

    return users ? users.map((user: any) => this.mapSupabaseUser(user)) : [];
  }

  // Session operations
  async createSession(data: Partial<Session>): Promise<Session> {
    const client = this.getClient();
    const sessionData = {
      id: data.id,
      user_id: data.userId,
      token: data.token,
      refresh_token: data.refreshToken,
      expires_at: data.expiresAt,
      created_at: data.createdAt || new Date(),
      last_accessed_at: new Date(),
      device_id: data.deviceId,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    };

    const { data: session, error } = await client
      .from('auth_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return this.mapSupabaseSession(session);
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session> {
    const client = this.getClient();
    const updateData = {
      expires_at: data.expiresAt,
      last_accessed_at: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const { data: session, error } = await client
      .from('auth_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }

    return this.mapSupabaseSession(session);
  }

  async deleteSession(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('auth_sessions').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  async findSessionById(id: string): Promise<Session | null> {
    const client = this.getClient();
    const { data: session, error } = await client
      .from('auth_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find session: ${error.message}`);
    }

    return session ? this.mapSupabaseSession(session) : null;
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    const client = this.getClient();
    const { data: session, error } = await client
      .from('auth_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find session: ${error.message}`);
    }

    return session ? this.mapSupabaseSession(session) : null;
  }

  async findUserSessions(userId: string): Promise<Session[]> {
    const client = this.getClient();
    const { data: sessions, error } = await client
      .from('auth_sessions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to find user sessions: ${error.message}`);
    }

    return sessions
      ? sessions.map((session: any) => this.mapSupabaseSession(session))
      : [];
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('auth_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete user sessions: ${error.message}`);
    }
  }

  // MFA operations
  async saveMFASecret(
    userId: string,
    method: MFAMethod,
    secret: string
  ): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('auth_mfa_secrets').upsert({
      user_id: userId,
      method,
      secret,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (error) {
      throw new Error(`Failed to save MFA secret: ${error.message}`);
    }
  }

  async getMFASecret(
    userId: string,
    method: MFAMethod
  ): Promise<string | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('auth_mfa_secrets')
      .select('secret')
      .eq('user_id', userId)
      .eq('method', method)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get MFA secret: ${error.message}`);
    }

    return data?.secret || null;
  }

  async saveBackupCodes(userId: string, codes: string[]): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('auth_backup_codes').upsert({
      user_id: userId,
      codes,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (error) {
      throw new Error(`Failed to save backup codes: ${error.message}`);
    }
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const client = this.getClient();
    const { data, error } = await client
      .from('auth_backup_codes')
      .select('codes')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to verify backup code: ${error.message}`);
    }

    const codes = data?.codes || [];
    const isValid = codes.includes(code);

    if (isValid) {
      // Remove the used code
      const remainingCodes = codes.filter((c: string) => c !== code);
      await client
        .from('auth_backup_codes')
        .update({ codes: remainingCodes, updated_at: new Date() })
        .eq('user_id', userId);
    }

    return isValid;
  }

  // Account operations
  async createAccountLink(
    userId: string,
    provider: AuthProvider,
    providerId: string
  ): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('auth_account_links').insert({
      user_id: userId,
      provider,
      provider_id: providerId,
      created_at: new Date(),
    });

    if (error) {
      throw new Error(`Failed to create account link: ${error.message}`);
    }
  }

  async findAccountLinks(
    userId: string
  ): Promise<Array<{ provider: AuthProvider; providerId: string }>> {
    const client = this.getClient();
    const { data, error } = await client
      .from('auth_account_links')
      .select('provider, provider_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to find account links: ${error.message}`);
    }

    return data
      ? data.map((link: any) => ({
          provider: link.provider,
          providerId: link.provider_id,
        }))
      : [];
  }

  async deleteAccountLink(
    userId: string,
    provider: AuthProvider
  ): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('auth_account_links')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) {
      throw new Error(`Failed to delete account link: ${error.message}`);
    }
  }

  // Helper methods
  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      emailVerified: supabaseUser.email_verified,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at),
      metadata: supabaseUser.metadata || {},
      profile: supabaseUser.profile || {},
      mfa: supabaseUser.mfa || null,
    };
  }

  private mapSupabaseSession(supabaseSession: any): Session {
    return {
      id: supabaseSession.id,
      userId: supabaseSession.user_id,
      token: supabaseSession.token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: new Date(supabaseSession.expires_at),
      createdAt: new Date(supabaseSession.created_at),
      lastAccessedAt: new Date(
        supabaseSession.last_accessed_at || supabaseSession.created_at
      ),
      deviceId: supabaseSession.device_id,
      ipAddress: supabaseSession.ip_address,
      userAgent: supabaseSession.user_agent,
    };
  }
}
