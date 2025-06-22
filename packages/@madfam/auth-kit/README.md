# @madfam/auth-kit

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-MCAL--1.0-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/typescript-%3E%3D5.0-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/coverage-95%25-brightgreen.svg" alt="Coverage" />
</p>

<p align="center">
  <strong>World-class authentication system with multi-provider support, MFA, and enterprise features</strong>
</p>

<p align="center">
  Build secure authentication flows in minutes with production-tested components and best practices.
</p>

## ✨ Features

### 🎯 Core Features
- **Multi-Provider Support** - Email/password, OAuth (Google, GitHub, LinkedIn), magic links, passkeys
- **MFA/2FA** - TOTP authenticator apps, SMS, backup codes
- **Session Management** - JWT or database sessions with automatic refresh
- **Password Security** - Strength validation, breach detection, secure reset flows
- **React Components** - Pre-built login/signup forms, MFA setup, account recovery
- **Type Safety** - Full TypeScript support with comprehensive types

### 🚀 Enterprise Features
- **SSO/SAML** - Enterprise single sign-on support
- **RBAC** - Role-based access control with permissions
- **Audit Logging** - Track all authentication events
- **Compliance** - GDPR, SOC2, HIPAA ready
- **Advanced Security** - Rate limiting, IP allowlisting, device fingerprinting
- **Multi-tenancy** - Isolated authentication per organization

## 📦 Installation

```bash
npm install @madfam/auth-kit
# or
yarn add @madfam/auth-kit
# or
pnpm add @madfam/auth-kit
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { createAuthKit } from '@madfam/auth-kit';

const auth = createAuthKit({
  providers: {
    email: {
      enabled: true,
      passwordRequirements: {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true,
      },
    },
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    type: 'jwt',
    secret: process.env.SESSION_SECRET,
    expiresIn: '7d',
  },
  mfa: {
    enabled: true,
    methods: ['totp', 'sms'],
  },
});
```

### React Integration

```tsx
import { AuthProvider, LoginForm, useAuth } from '@madfam/auth-kit/react';

function App() {
  return (
    <AuthProvider auth={auth}>
      <YourApp />
    </AuthProvider>
  );
}

function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.email}!</div>;

  return (
    <LoginForm
      onSuccess={(user) => console.log('Logged in:', user)}
      onError={(error) => console.error('Login failed:', error)}
      providers={['email', 'google', 'github']}
      showRememberMe
      showForgotPassword
    />
  );
}
```

## 📖 Usage

### Email/Password Authentication

```typescript
// Sign up
const { user, session } = await auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  metadata: {
    fullName: 'John Doe',
    acceptedTerms: true,
  },
});

// Sign in
const { user, session } = await auth.signIn({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  rememberMe: true,
});

// Password reset
await auth.sendPasswordResetEmail('user@example.com');
await auth.resetPassword(token, 'NewSecurePassword123!');
```

### OAuth Authentication

```typescript
// Initiate OAuth flow
const { url } = await auth.signInWithOAuth('google', {
  redirectTo: '/dashboard',
  scopes: ['email', 'profile'],
});

// Handle OAuth callback
const { user, session } = await auth.handleOAuthCallback();
```

### Multi-Factor Authentication

```typescript
// Enable MFA
const { secret, qrCode, backupCodes } = await auth.mfa.enable({
  method: 'totp',
  userId: user.id,
});

// Verify MFA token
const isValid = await auth.mfa.verify({
  userId: user.id,
  token: '123456',
});

// Challenge during login
if (result.requiresMFA) {
  const { session } = await auth.mfa.challenge({
    userId: result.userId,
    token: '123456',
  });
}
```

### Session Management

```typescript
// Get current session
const session = await auth.getSession();

// Refresh session
const newSession = await auth.refreshSession();

// Validate session
const isValid = await auth.validateSession(token);

// Revoke session
await auth.revokeSession(sessionId);

// Revoke all sessions
await auth.revokeAllSessions(userId);
```

### Middleware

```typescript
// Next.js middleware
import { withAuth } from '@madfam/auth-kit/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

// Express middleware
import { authMiddleware } from '@madfam/auth-kit/middleware';

app.use(authMiddleware({
  auth,
  requireAuth: true,
  roles: ['admin'],
}));
```

## 🎨 React Components

### Pre-built Components

```tsx
import {
  LoginForm,
  SignUpForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  MFASetup,
  MFAChallenge,
  AccountRecovery,
  UserProfile,
  SessionManager,
} from '@madfam/auth-kit/react';

// Customizable login form
<LoginForm
  providers={['email', 'google', 'github']}
  theme="dark"
  logo="/logo.png"
  termsUrl="/terms"
  privacyUrl="/privacy"
/>

// MFA setup flow
<MFASetup
  methods={['totp', 'sms']}
  onComplete={(backupCodes) => {
    // Show backup codes to user
  }}
/>
```

### Hooks

```tsx
// Authentication state
const { user, session, isLoading, error } = useAuth();

// Authentication actions
const { signIn, signUp, signOut } = useAuthActions();

// Session management
const { isValid, expiresAt, refresh } = useSession();

// MFA status
const { isEnabled, methods, challenge } = useMFA();

// Permissions
const { can, cannot } = usePermissions();
```

## 🔧 Configuration

### Full Configuration Example

```typescript
const auth = createAuthKit({
  // Provider configuration
  providers: {
    email: {
      enabled: true,
      verification: 'required', // 'required' | 'optional' | 'none'
      passwordRequirements: {
        minLength: 12,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        preventCommon: true,
        preventBreached: true,
      },
    },
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowedDomains: ['company.com'], // Restrict to specific domains
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowedOrgs: ['my-org'], // Restrict to GitHub orgs
    },
    saml: {
      enabled: true,
      providers: [
        {
          id: 'okta',
          entryPoint: 'https://company.okta.com/app/saml/sso',
          issuer: 'http://www.okta.com/123456',
          cert: process.env.OKTA_CERT!,
        },
      ],
    },
  },

  // Session configuration
  session: {
    type: 'database', // 'jwt' | 'database'
    expiresIn: '7d',
    refreshThreshold: '1d',
    absoluteTimeout: '30d',
    storage: {
      adapter: 'redis', // 'memory' | 'redis' | 'database'
      options: {
        url: process.env.REDIS_URL,
      },
    },
  },

  // MFA configuration
  mfa: {
    enabled: true,
    required: false, // Force all users to enable MFA
    methods: {
      totp: {
        enabled: true,
        issuer: 'My App',
        algorithm: 'SHA256',
        digits: 6,
        period: 30,
      },
      sms: {
        enabled: true,
        provider: 'twilio',
        from: '+1234567890',
      },
      backup: {
        enabled: true,
        count: 10,
        length: 8,
      },
    },
  },

  // Security configuration
  security: {
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      blockDuration: 60 * 60 * 1000, // 1 hour
    },
    ipAllowlist: process.env.ALLOWED_IPS?.split(','),
    deviceFingerprinting: true,
    sessionFixation: 'regenerate',
    csrfProtection: true,
  },

  // Email configuration
  email: {
    provider: 'sendgrid', // 'sendgrid' | 'ses' | 'smtp'
    from: 'noreply@example.com',
    templates: {
      verification: 'template-id-1',
      passwordReset: 'template-id-2',
      mfaChallenge: 'template-id-3',
    },
  },

  // Hooks and callbacks
  hooks: {
    beforeSignUp: async (data) => {
      // Validate or transform signup data
      return data;
    },
    afterSignIn: async (user, session) => {
      // Track login event
      await analytics.track('user.signed_in', { userId: user.id });
    },
    onMFAEnabled: async (user, method) => {
      // Send confirmation email
      await sendEmail(user.email, 'MFA enabled');
    },
  },

  // Database configuration (if using Supabase)
  database: {
    provider: 'supabase',
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_SERVICE_KEY!,
  },
});
```

## 🗄️ Storage Adapters

### Supabase

```typescript
import { SupabaseAdapter } from '@madfam/auth-kit/adapters';

const auth = createAuthKit({
  adapter: new SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_SERVICE_KEY!,
  }),
});
```

### Custom Adapter

```typescript
import { BaseAdapter } from '@madfam/auth-kit/adapters';

class MyCustomAdapter extends BaseAdapter {
  async createUser(data) {
    // Implementation
  }
  
  async findUserByEmail(email) {
    // Implementation
  }
  
  // ... other required methods
}
```

## 🧪 Testing

```typescript
import { createMockAuth } from '@madfam/auth-kit/testing';

const mockAuth = createMockAuth({
  users: [
    { id: '1', email: 'test@example.com', password: 'password123' },
  ],
});

// Use in tests
const { user } = await mockAuth.signIn({
  email: 'test@example.com',
  password: 'password123',
});
```

## 📈 Events

```typescript
auth.on('user.created', async (user) => {
  await welcomeEmail.send(user);
});

auth.on('user.signed_in', async ({ user, session, ip }) => {
  await auditLog.record('auth.login', { user, ip });
});

auth.on('mfa.enabled', async ({ user, method }) => {
  await notifications.send(user, 'MFA enabled');
});

auth.on('password.reset', async ({ user }) => {
  await securityAlert.send(user);
});
```

## 🔒 Security Best Practices

1. **Password Requirements**: Enforce strong passwords with breach detection
2. **Rate Limiting**: Prevent brute force attacks
3. **Session Security**: Use secure, httpOnly cookies
4. **MFA**: Encourage or require multi-factor authentication
5. **Audit Logging**: Track all authentication events
6. **CSRF Protection**: Enable for state-changing operations
7. **Input Validation**: Sanitize all user inputs
8. **Secure Headers**: Set appropriate security headers

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This software is licensed under the MADFAM Code Available License (MCAL) v1.0.

- ✅ Use for personal projects
- ✅ Use for educational purposes
- ✅ Use for internal business purposes
- ❌ Commercial use requires license
- ❌ Redistribution requires permission

For commercial licensing: licensing@madfam.io

## 🏆 Built by MADFAM

Part of the MADFAM ecosystem of world-class developer tools.

---

<p align="center">
  <a href="https://madfam.io">Website</a> •
  <a href="https://github.com/madfam-io/auth-kit">GitHub</a> •
  <a href="https://docs.madfam.io/auth-kit">Documentation</a> •
  <a href="https://madfam.io/support">Support</a>
</p>