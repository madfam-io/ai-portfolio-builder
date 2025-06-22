/**
 * @madfam/auth-kit
 * 
 * Provider management module
 */

import bcrypt from 'bcryptjs';
import type {
  ProvidersConfig,
  AuthProvider,
  AuthAdapter,
  OAuthProviderConfig,
} from './types';
import { Logger } from '../utils/logger';

export interface OAuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

export class ProviderManager {
  private config: ProvidersConfig;
  private adapter?: AuthAdapter;
  private logger: Logger;

  constructor(config: ProvidersConfig, adapter?: AuthAdapter) {
    this.config = config;
    this.adapter = adapter;
    this.logger = new Logger('ProviderManager');
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Get OAuth authorization URL
   */
  async getOAuthUrl(
    provider: AuthProvider,
    options?: { redirectTo?: string; scopes?: string[] }
  ): Promise<string> {
    const providerConfig = this.config[provider] as OAuthProviderConfig;
    
    if (!providerConfig?.enabled) {
      throw new Error(`OAuth provider ${provider} is not enabled`);
    }

    if (!providerConfig.clientId) {
      throw new Error(`OAuth provider ${provider} is not configured`);
    }

    const state = this.generateState();
    const redirectUri = options?.redirectTo || providerConfig.redirectUri || this.getDefaultRedirectUri();
    
    // Store state for verification
    if (this.adapter) {
      // In a real implementation, we'd store this state temporarily
    }

    switch (provider) {
      case 'google':
        return this.getGoogleAuthUrl(providerConfig, redirectUri, state, options?.scopes);
      case 'github':
        return this.getGithubAuthUrl(providerConfig, redirectUri, state, options?.scopes);
      case 'linkedin':
        return this.getLinkedInAuthUrl(providerConfig, redirectUri, state, options?.scopes);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    provider: AuthProvider,
    code: string,
    state?: string
  ): Promise<OAuthUser> {
    const providerConfig = this.config[provider] as OAuthProviderConfig;
    
    if (!providerConfig?.enabled) {
      throw new Error(`OAuth provider ${provider} is not enabled`);
    }

    // Verify state to prevent CSRF
    if (state) {
      // In a real implementation, we'd verify the state
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(provider, code);
    
    // Get user info
    const userInfo = await this.getUserInfo(provider, tokens.access_token);
    
    this.logger.info('OAuth callback handled', { provider, userId: userInfo.id });
    
    return userInfo;
  }

  /**
   * Get Google OAuth URL
   */
  private getGoogleAuthUrl(
    config: OAuthProviderConfig,
    redirectUri: string,
    state: string,
    scopes?: string[]
  ): string {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const defaultScopes = ['openid', 'email', 'profile'];
    const finalScopes = scopes || config.scope || defaultScopes;
    
    const params = new URLSearchParams({
      client_id: config.clientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: finalScopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get GitHub OAuth URL
   */
  private getGithubAuthUrl(
    config: OAuthProviderConfig,
    redirectUri: string,
    state: string,
    scopes?: string[]
  ): string {
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const defaultScopes = ['user:email'];
    const finalScopes = scopes || config.scope || defaultScopes;
    
    const params = new URLSearchParams({
      client_id: config.clientId!,
      redirect_uri: redirectUri,
      scope: finalScopes.join(' '),
      state,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get LinkedIn OAuth URL
   */
  private getLinkedInAuthUrl(
    config: OAuthProviderConfig,
    redirectUri: string,
    state: string,
    scopes?: string[]
  ): string {
    const baseUrl = 'https://www.linkedin.com/oauth/v2/authorization';
    const defaultScopes = ['openid', 'profile', 'email'];
    const finalScopes = scopes || config.scope || defaultScopes;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId!,
      redirect_uri: redirectUri,
      scope: finalScopes.join(' '),
      state,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(
    provider: AuthProvider,
    code: string
  ): Promise<{ access_token: string; refresh_token?: string }> {
    const config = this.config[provider] as OAuthProviderConfig;
    
    switch (provider) {
      case 'google':
        return this.exchangeGoogleCode(config, code);
      case 'github':
        return this.exchangeGithubCode(config, code);
      case 'linkedin':
        return this.exchangeLinkedInCode(config, code);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Exchange Google authorization code
   */
  private async exchangeGoogleCode(
    config: OAuthProviderConfig,
    code: string
  ): Promise<{ access_token: string; refresh_token?: string }> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        redirect_uri: config.redirectUri || this.getDefaultRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to exchange Google code: ${data.error}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }

  /**
   * Exchange GitHub authorization code
   */
  private async exchangeGithubCode(
    config: OAuthProviderConfig,
    code: string
  ): Promise<{ access_token: string }> {
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        redirect_uri: config.redirectUri || this.getDefaultRedirectUri(),
      }),
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(`Failed to exchange GitHub code: ${data.error}`);
    }

    return {
      access_token: data.access_token,
    };
  }

  /**
   * Exchange LinkedIn authorization code
   */
  private async exchangeLinkedInCode(
    config: OAuthProviderConfig,
    code: string
  ): Promise<{ access_token: string; refresh_token?: string }> {
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        redirect_uri: config.redirectUri || this.getDefaultRedirectUri(),
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to exchange LinkedIn code: ${data.error}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }

  /**
   * Get user info from OAuth provider
   */
  private async getUserInfo(provider: AuthProvider, accessToken: string): Promise<OAuthUser> {
    switch (provider) {
      case 'google':
        return this.getGoogleUserInfo(accessToken);
      case 'github':
        return this.getGithubUserInfo(accessToken);
      case 'linkedin':
        return this.getLinkedInUserInfo(accessToken);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Get Google user info
   */
  private async getGoogleUserInfo(accessToken: string): Promise<OAuthUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google user info');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.picture,
    };
  }

  /**
   * Get GitHub user info
   */
  private async getGithubUserInfo(accessToken: string): Promise<OAuthUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub user info');
    }

    // Get email separately if not public
    let email = data.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const emails = await emailResponse.json();
      email = emails.find((e: any) => e.primary)?.email;
    }

    return {
      id: data.id.toString(),
      email,
      name: data.name || data.login,
      avatar: data.avatar_url,
    };
  }

  /**
   * Get LinkedIn user info
   */
  private async getLinkedInUserInfo(accessToken: string): Promise<OAuthUser> {
    // Get basic profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileResponse.json();
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn user info');
    }

    return {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    };
  }

  /**
   * Generate state for OAuth
   */
  private generateState(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < 32; i++) {
      state += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return state;
  }

  /**
   * Get default redirect URI
   */
  private getDefaultRedirectUri(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      : 'http://localhost:3000/auth/callback';
  }
}