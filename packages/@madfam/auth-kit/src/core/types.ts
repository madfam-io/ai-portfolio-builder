/**
 * @madfam/auth-kit
 * 
 * World-class authentication system with multi-provider support, MFA, and enterprise features
 * 
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 * 
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 * 
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Core type definitions for the authentication system
 */

// User types
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: UserMetadata;
  profile?: UserProfile;
  mfa?: MFAStatus;
  roles?: string[];
  permissions?: string[];
}

export interface UserMetadata {
  fullName?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  timezone?: string;
  acceptedTermsAt?: Date;
  lastSignInAt?: Date;
  signInCount?: number;
  [key: string]: any;
}

export interface UserProfile {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  [key: string]: any;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export type SessionType = 'jwt' | 'database';

export interface SessionConfig {
  type: SessionType;
  secret?: string;
  expiresIn: string | number;
  refreshThreshold?: string | number;
  absoluteTimeout?: string | number;
  storage?: SessionStorageConfig;
}

export interface SessionStorageConfig {
  adapter: 'memory' | 'redis' | 'database';
  options?: Record<string, any>;
}

// Authentication types
export interface SignUpData {
  email: string;
  password: string;
  metadata?: Partial<UserMetadata>;
  profile?: Partial<UserProfile>;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface AuthResult {
  user: User;
  session: Session;
  requiresMFA?: boolean;
  mfaChallengeId?: string;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_LOCKED'
  | 'MFA_REQUIRED'
  | 'MFA_INVALID'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'INTERNAL_ERROR';

// Provider types
export type AuthProvider = 
  | 'email'
  | 'google'
  | 'github'
  | 'linkedin'
  | 'microsoft'
  | 'apple'
  | 'facebook'
  | 'twitter'
  | 'saml'
  | 'oidc';

export interface ProviderConfig {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: string[];
  [key: string]: any;
}

export interface EmailProviderConfig extends ProviderConfig {
  verification: 'required' | 'optional' | 'none';
  passwordRequirements?: PasswordRequirements;
  magicLink?: boolean;
}

export interface OAuthProviderConfig extends ProviderConfig {
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  allowedDomains?: string[];
  allowedEmails?: string[];
}

export interface SAMLProviderConfig extends ProviderConfig {
  providers: SAMLProvider[];
}

export interface SAMLProvider {
  id: string;
  name: string;
  entryPoint: string;
  issuer: string;
  cert: string;
  attributeMapping?: Record<string, string>;
}

// Password types
export interface PasswordRequirements {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSymbols?: boolean;
  preventCommon?: boolean;
  preventBreached?: boolean;
  preventReuse?: number;
  customValidator?: (password: string) => boolean | string;
}

export interface PasswordValidationResult {
  valid: boolean;
  score: number;
  feedback?: string[];
  warning?: string;
}

// MFA types
export type MFAMethod = 'totp' | 'sms' | 'email' | 'backup';

export interface MFAConfig {
  enabled: boolean;
  required?: boolean;
  methods: Partial<Record<MFAMethod, MFAMethodConfig>>;
}

export interface MFAMethodConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface TOTPConfig extends MFAMethodConfig {
  issuer: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number;
  window?: number;
}

export interface SMSConfig extends MFAMethodConfig {
  provider: 'twilio' | 'vonage' | 'aws';
  from: string;
  template?: string;
}

export interface MFAStatus {
  enabled: boolean;
  methods: MFAMethod[];
  preferredMethod?: MFAMethod;
  backupCodesGenerated: boolean;
  lastUsedAt?: Date;
}

export interface MFASetupResult {
  method: MFAMethod;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

export interface MFAChallenge {
  id: string;
  userId: string;
  method: MFAMethod;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

// Security types
export interface SecurityConfig {
  rateLimit?: RateLimitConfig;
  ipAllowlist?: string[];
  ipBlocklist?: string[];
  deviceFingerprinting?: boolean;
  sessionFixation?: 'none' | 'regenerate' | 'migrate';
  csrfProtection?: boolean;
  bruteForceProtection?: boolean;
  accountLockout?: AccountLockoutConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  maxAttempts: number;
  blockDuration?: number;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface AccountLockoutConfig {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number;
  resetOnSuccess: boolean;
}

// Email types
export interface EmailConfig {
  provider: 'sendgrid' | 'ses' | 'smtp' | 'resend';
  from: string;
  replyTo?: string;
  templates?: EmailTemplates;
  options?: Record<string, any>;
}

export interface EmailTemplates {
  verification?: string;
  passwordReset?: string;
  mfaChallenge?: string;
  accountLocked?: string;
  securityAlert?: string;
  [key: string]: string | undefined;
}

// Hook types
export interface AuthHooks {
  beforeSignUp?: (data: SignUpData) => Promise<SignUpData> | SignUpData;
  afterSignUp?: (user: User) => Promise<void> | void;
  beforeSignIn?: (data: SignInData) => Promise<SignInData> | SignInData;
  afterSignIn?: (user: User, session: Session) => Promise<void> | void;
  beforeSignOut?: (userId: string) => Promise<void> | void;
  afterSignOut?: (userId: string) => Promise<void> | void;
  onMFAEnabled?: (user: User, method: MFAMethod) => Promise<void> | void;
  onMFADisabled?: (user: User, method: MFAMethod) => Promise<void> | void;
  onPasswordChanged?: (user: User) => Promise<void> | void;
  onAccountLocked?: (user: User, reason: string) => Promise<void> | void;
  onSessionCreated?: (session: Session) => Promise<void> | void;
  onSessionRefreshed?: (session: Session) => Promise<void> | void;
  onSessionRevoked?: (sessionId: string) => Promise<void> | void;
}

// Main configuration
export interface AuthKitConfig {
  providers: ProvidersConfig;
  session: SessionConfig;
  mfa?: MFAConfig;
  security?: SecurityConfig;
  email?: EmailConfig;
  hooks?: AuthHooks;
  database?: DatabaseConfig;
  adapter?: AuthAdapter;
}

export interface ProvidersConfig {
  email?: EmailProviderConfig;
  google?: OAuthProviderConfig;
  github?: OAuthProviderConfig;
  linkedin?: OAuthProviderConfig;
  microsoft?: OAuthProviderConfig;
  apple?: OAuthProviderConfig;
  facebook?: OAuthProviderConfig;
  twitter?: OAuthProviderConfig;
  saml?: SAMLProviderConfig;
  oidc?: OAuthProviderConfig;
}

export interface DatabaseConfig {
  provider: 'supabase' | 'prisma' | 'mongodb' | 'postgres';
  url: string;
  options?: Record<string, any>;
}

// Adapter interface
export interface AuthAdapter {
  // User operations
  createUser(data: Partial<User>): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  
  // Session operations
  createSession(data: Partial<Session>): Promise<Session>;
  updateSession(id: string, data: Partial<Session>): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  findSessionById(id: string): Promise<Session | null>;
  findSessionByToken(token: string): Promise<Session | null>;
  findUserSessions(userId: string): Promise<Session[]>;
  deleteUserSessions(userId: string): Promise<void>;
  
  // MFA operations
  saveMFASecret(userId: string, method: MFAMethod, secret: string): Promise<void>;
  getMFASecret(userId: string, method: MFAMethod): Promise<string | null>;
  saveBackupCodes(userId: string, codes: string[]): Promise<void>;
  verifyBackupCode(userId: string, code: string): Promise<boolean>;
  
  // Account operations
  createAccountLink(userId: string, provider: AuthProvider, providerId: string): Promise<void>;
  findAccountLinks(userId: string): Promise<Array<{ provider: AuthProvider; providerId: string }>>;
  deleteAccountLink(userId: string, provider: AuthProvider): Promise<void>;
}

// Event types
export interface AuthEvent {
  type: AuthEventType;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export type AuthEventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.signed_in'
  | 'user.signed_out'
  | 'user.verified'
  | 'mfa.enabled'
  | 'mfa.disabled'
  | 'mfa.challenged'
  | 'mfa.verified'
  | 'password.changed'
  | 'password.reset_requested'
  | 'password.reset_completed'
  | 'session.created'
  | 'session.refreshed'
  | 'session.revoked'
  | 'account.locked'
  | 'account.unlocked'
  | 'security.suspicious_activity';

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Awaitable<T> = T | Promise<T>;