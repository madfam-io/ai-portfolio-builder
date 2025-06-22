/**
 * @madfam/auth-kit
 *
 * World-class authentication system with multi-provider support, MFA, and enterprise features
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

import { EventEmitter } from '../utils/event-emitter';
import type {
  AuthKitConfig,
  User,
  Session,
  SignUpData,
  SignInData,
  AuthResult,
  AuthError,
  AuthProvider,
  MFASetupResult,
  // MFAChallenge,
  AuthEvent,
  AuthEventType,
  PasswordValidationResult,
} from './types';
import { SessionManager } from './session-manager';
import { MFAManager } from './mfa-manager';
import { ProviderManager } from './provider-manager';
import { SecurityManager } from './security-manager';
import { EmailManager } from './email-manager';
import { validatePassword } from '../utils/password-validator';
import { generateId } from '../utils/id-generator';
import { Logger } from '../utils/logger';

/**
 * Main AuthKit class
 *
 * Provides a comprehensive authentication system with support for:
 * - Multiple authentication providers
 * - Multi-factor authentication
 * - Session management
 * - Security features
 * - Email notifications
 */
export class AuthKit extends EventEmitter {
  private config: AuthKitConfig;
  private logger: Logger;
  private sessionManager: SessionManager;
  private mfaManager: MFAManager;
  private providerManager: ProviderManager;
  private securityManager: SecurityManager;
  private emailManager?: EmailManager;

  constructor(config: AuthKitConfig) {
    super();
    this.config = config;
    this.logger = new Logger('AuthKit');

    // Initialize managers
    this.sessionManager = new SessionManager(config.session, config.adapter);
    this.mfaManager = new MFAManager(config.mfa, config.adapter);
    this.providerManager = new ProviderManager(
      config.providers,
      config.adapter
    );
    this.securityManager = new SecurityManager(config.security);

    if (config.email) {
      this.emailManager = new EmailManager(config.email);
    }

    this.logger.info('AuthKit initialized');
  }

  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      this.logger.debug('Sign up attempt', { email: data.email });

      // Run before hook
      const processedData = this.config.hooks?.beforeSignUp
        ? await this.config.hooks.beforeSignUp(data)
        : data;

      // Check rate limit
      await this.securityManager.checkRateLimit('signup', data.email);

      // Check if user already exists
      const existingUser = await this.config.adapter?.findUserByEmail(
        processedData.email
      );
      if (existingUser) {
        throw this.createError('INVALID_CREDENTIALS', 'User already exists');
      }

      // Validate password
      const passwordValidation = await this.validatePassword(
        processedData.password
      );
      if (!passwordValidation.valid) {
        throw this.createError(
          'INVALID_CREDENTIALS',
          passwordValidation.feedback?.join(', ') || 'Invalid password'
        );
      }

      // Hash password
      const hashedPassword = await this.providerManager.hashPassword(
        processedData.password
      );

      // Create user
      if (!this.config.adapter) {
        throw new Error('Storage adapter not configured');
      }
      const user = await this.config.adapter.createUser({
        id: generateId(),
        email: processedData.email,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ...processedData.metadata,
          passwordHash: hashedPassword,
        },
        profile: processedData.profile,
      });

      // Create session
      const session = await this.sessionManager.createSession(user.id);

      // Send verification email
      if (this.config.providers.email?.verification === 'required') {
        await this.sendVerificationEmail(user);
      }

      // Emit event
      await this.emit('user.created', user);

      // Run after hook
      if (this.config.hooks?.afterSignUp) {
        await this.config.hooks.afterSignUp(user);
      }

      this.logger.info('User signed up successfully', { userId: user.id });

      return { user, session };
    } catch (error) {
      this.logger.error('Sign up failed', error as Error);
      throw error;
    }
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      this.logger.debug('Sign in attempt', { email: data.email });

      // Run before hook
      const processedData = this.config.hooks?.beforeSignIn
        ? await this.config.hooks.beforeSignIn(data)
        : data;

      // Check rate limit
      await this.securityManager.checkRateLimit('signin', data.email);

      // Find user
      const user = await this.config.adapter?.findUserByEmail(
        processedData.email
      );
      if (!user) {
        await this.securityManager.recordFailedAttempt(processedData.email);
        throw this.createError(
          'INVALID_CREDENTIALS',
          'Invalid email or password'
        );
      }

      // Check if account is locked
      if (await this.securityManager.isAccountLocked(user.id)) {
        throw this.createError(
          'ACCOUNT_LOCKED',
          'Account is locked due to multiple failed attempts'
        );
      }

      // Verify password
      const passwordHash = user.metadata?.passwordHash as string;
      const isValidPassword = await this.providerManager.verifyPassword(
        processedData.password,
        passwordHash
      );

      if (!isValidPassword) {
        await this.securityManager.recordFailedAttempt(user.id);
        throw this.createError(
          'INVALID_CREDENTIALS',
          'Invalid email or password'
        );
      }

      // Check email verification
      if (
        this.config.providers.email?.verification === 'required' &&
        !user.emailVerified
      ) {
        throw this.createError(
          'EMAIL_NOT_VERIFIED',
          'Please verify your email address'
        );
      }

      // Reset failed attempts on successful login
      await this.securityManager.resetFailedAttempts(user.id);

      // Check if MFA is required
      if (user.mfa?.enabled) {
        const challenge = await this.mfaManager.createChallenge(
          user.id,
          user.mfa.preferredMethod || 'totp'
        );

        this.logger.info('MFA challenge created', { userId: user.id });

        return {
          user,
          session: {} as Session, // Placeholder - actual session created after MFA
          requiresMFA: true,
          mfaChallengeId: challenge.id,
        };
      }

      // Create session
      const session = await this.sessionManager.createSession(user.id, {
        rememberMe: processedData.rememberMe,
        deviceId: processedData.deviceId,
      });

      // Update last sign in
      if (!this.config.adapter) {
        throw new Error('Storage adapter not configured');
      }
      await this.config.adapter.updateUser(user.id, {
        metadata: {
          ...user.metadata,
          lastSignInAt: new Date(),
          signInCount: (user.metadata?.signInCount || 0) + 1,
        },
      });

      // Emit event
      await this.emit('user.signed_in', { user, session });

      // Run after hook
      if (this.config.hooks?.afterSignIn) {
        await this.config.hooks.afterSignIn(user, session);
      }

      this.logger.info('User signed in successfully', { userId: user.id });

      return { user, session };
    } catch (error) {
      this.logger.error('Sign in failed', error as Error);
      throw error;
    }
  }

  /**
   * Sign out a user
   */
  async signOut(sessionToken: string): Promise<void> {
    try {
      this.logger.debug('Sign out attempt');

      const session = await this.sessionManager.getSession(sessionToken);
      if (!session) {
        throw this.createError('SESSION_EXPIRED', 'Invalid or expired session');
      }

      // Run before hook
      if (this.config.hooks?.beforeSignOut) {
        await this.config.hooks.beforeSignOut(session.userId);
      }

      // Revoke session
      await this.sessionManager.revokeSession(session.id);

      // Emit event
      await this.emit('user.signed_out', session.userId);

      // Run after hook
      if (this.config.hooks?.afterSignOut) {
        await this.config.hooks.afterSignOut(session.userId);
      }

      this.logger.info('User signed out successfully', {
        userId: session.userId,
      });
    } catch (error) {
      this.logger.error('Sign out failed', error as Error);
      throw error;
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(
    provider: AuthProvider,
    options?: { redirectTo?: string; scopes?: string[] }
  ): Promise<{ url: string }> {
    try {
      this.logger.debug('OAuth sign in attempt', { provider });

      const url = await this.providerManager.getOAuthUrl(provider, options);

      this.logger.info('OAuth URL generated', { provider });

      return { url };
    } catch (error) {
      this.logger.error('OAuth sign in failed', error as Error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    provider: AuthProvider,
    code: string,
    state?: string
  ): Promise<AuthResult> {
    try {
      this.logger.debug('OAuth callback', { provider });

      // Exchange code for tokens and user info
      const providerUser = await this.providerManager.handleOAuthCallback(
        provider,
        code,
        state
      );

      // Find or create user
      let user = await this.config.adapter?.findUserByEmail(providerUser.email);

      if (!user) {
        // Create new user
        if (!this.config.adapter) {
          throw new Error('Storage adapter not configured');
        }
        user = await this.config.adapter.createUser({
          id: generateId(),
          email: providerUser.email,
          emailVerified: true, // OAuth providers verify email
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            fullName: providerUser.name,
            avatarUrl: providerUser.avatar,
          },
        });

        await this.emit('user.created', user);
      }

      // Link provider account
      if (!this.config.adapter) {
        throw new Error('Storage adapter not configured');
      }
      await this.config.adapter.createAccountLink(
        user.id,
        provider,
        providerUser.id
      );

      // Create session
      const session = await this.sessionManager.createSession(user.id);

      // Emit event
      await this.emit('user.signed_in', { user, session });

      this.logger.info('OAuth sign in successful', {
        userId: user.id,
        provider,
      });

      return { user, session };
    } catch (error) {
      this.logger.error('OAuth callback failed', error as Error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  getSession(token: string): Promise<Session | null> {
    return this.sessionManager.getSession(token);
  }

  /**
   * Refresh session
   */
  async refreshSession(refreshToken: string): Promise<Session> {
    const session = await this.sessionManager.refreshSession(refreshToken);
    await this.emit('session.refreshed', session);
    return session;
  }

  /**
   * Validate password against requirements
   */
  validatePassword(password: string): Promise<PasswordValidationResult> {
    const requirements = this.config.providers.email?.passwordRequirements;
    return validatePassword(password, requirements);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      this.logger.debug('Password reset requested', { email });

      // Check rate limit
      await this.securityManager.checkRateLimit('password-reset', email);

      const user = await this.config.adapter?.findUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        this.logger.debug('Password reset for non-existent user', { email });
        return;
      }

      // Generate reset token
      const resetToken = generateId();
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      if (!this.config.adapter) {
        throw new Error('Storage adapter not configured');
      }
      await this.config.adapter.updateUser(user.id, {
        metadata: {
          ...user.metadata,
          passwordResetToken: resetToken,
          passwordResetExpiry: resetExpiry,
        },
      });

      // Send email
      if (this.emailManager) {
        await this.emailManager.sendPasswordResetEmail(user.email, resetToken);
      }

      // Emit event
      await this.emit('password.reset_requested', user);

      this.logger.info('Password reset email sent', { userId: user.id });
    } catch (error) {
      this.logger.error('Password reset failed', error as Error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  resetPassword(_token: string, _newPassword: string): Promise<void> {
    try {
      this.logger.debug('Password reset attempt');

      // Find user with reset token
      // const users = await this.config.adapter?.findUserByEmail(''); // This needs to be improved
      // In a real implementation, we'd have a method to find user by reset token

      throw new Error('Reset password not fully implemented');
    } catch (error) {
      this.logger.error('Password reset failed', error as Error);
      throw error;
    }
  }

  /**
   * MFA methods
   */
  get mfa() {
    return {
      enable: (userId: string, method: MFAMethod = 'totp') =>
        this.enableMFA(userId, method),
      disable: (userId: string, method?: MFAMethod) =>
        this.disableMFA(userId, method),
      verify: (challengeId: string, token: string) =>
        this.verifyMFA(challengeId, token),
      challenge: (challengeId: string, token: string) =>
        this.completeMFAChallenge(challengeId, token),
    };
  }

  private async enableMFA(
    userId: string,
    method: MFAMethod
  ): Promise<MFASetupResult> {
    const result = await this.mfaManager.setupMFA(userId, method);

    await this.config.adapter?.updateUser(userId, {
      mfa: {
        enabled: true,
        methods: [method],
        preferredMethod: method,
        backupCodesGenerated: false,
      },
    });

    await this.emit('mfa.enabled', { userId, method });

    if (this.config.hooks?.onMFAEnabled) {
      const user = await this.config.adapter?.findUserById(userId);
      if (user) {
        await this.config.hooks.onMFAEnabled(user, method);
      }
    }

    return result;
  }

  private async disableMFA(userId: string, method?: MFAMethod): Promise<void> {
    await this.mfaManager.disableMFA(userId, method);

    await this.emit('mfa.disabled', { userId, method });

    if (this.config.hooks?.onMFADisabled) {
      const user = await this.config.adapter?.findUserById(userId);
      if (user && method) {
        await this.config.hooks.onMFADisabled(user, method);
      }
    }
  }

  private async verifyMFA(
    challengeId: string,
    token: string
  ): Promise<boolean> {
    const isValid = await this.mfaManager.verifyToken(challengeId, token);

    if (isValid) {
      await this.emit('mfa.verified', { challengeId });
    }

    return isValid;
  }

  private async completeMFAChallenge(
    challengeId: string,
    token: string
  ): Promise<AuthResult> {
    const challenge = await this.mfaManager.getChallenge(challengeId);
    if (!challenge) {
      throw this.createError('MFA_INVALID', 'Invalid or expired MFA challenge');
    }

    const isValid = await this.mfaManager.verifyToken(challengeId, token);
    if (!isValid) {
      throw this.createError('MFA_INVALID', 'Invalid MFA token');
    }

    // Get user
    const user = await this.config.adapter?.findUserById(challenge.userId);
    if (!user) {
      throw this.createError('USER_NOT_FOUND', 'User not found');
    }

    // Create session
    const session = await this.sessionManager.createSession(user.id);

    // Emit events
    await this.emit('mfa.verified', { challengeId });
    await this.emit('user.signed_in', { user, session });

    return { user, session };
  }

  /**
   * Send verification email
   */
  private async sendVerificationEmail(user: User): Promise<void> {
    if (!this.emailManager) return;

    const verificationToken = generateId();

    await this.config.adapter?.updateUser(user.id, {
      metadata: {
        ...user.metadata,
        verificationToken,
      },
    });

    await this.emailManager.sendVerificationEmail(
      user.email,
      verificationToken
    );
  }

  /**
   * Create auth error
   */
  private createError(
    code: AuthErrorCode,
    message: string,
    details?: Record<string, any>
  ): AuthError {
    return { code, message, details };
  }

  /**
   * Emit auth event
   */
  private emit(type: AuthEventType, data?: any): void {
    const event: AuthEvent = {
      type,
      timestamp: new Date(),
      data,
    };

    if (data?.user?.id) {
      event.userId = data.user.id;
    } else if (typeof data === 'string') {
      event.userId = data;
    } else if (data?.userId) {
      event.userId = data.userId;
    }

    if (data?.session?.id) {
      event.sessionId = data.session.id;
    } else if (data?.sessionId) {
      event.sessionId = data.sessionId;
    }

    super.emit(type, event);
  }
}
