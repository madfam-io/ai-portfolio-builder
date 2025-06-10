# 🚀 PRISMA AI Portfolio Builder - Implementation Plan

**Start Date:** June 10, 2025  
**Target Completion:** August 31, 2025  
**Priority:** Critical Security & Stability Fixes First

## 🎯 Implementation Overview

This document outlines the specific implementation steps to address the issues identified in the Codebase Diagnostic Report. Each task includes detailed steps, code examples, and validation criteria.

## 📅 Week 1: Critical Security & Compatibility Fixes

### Day 1-2: Security Vulnerabilities

#### 1. Encrypt GitHub Access Tokens

**File to modify:** `app/api/integrations/github/callback/route.ts`

**Step 1:** Create encryption utility

```typescript
// lib/utils/crypto.ts
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

export function encrypt(text: string): {
  encrypted: string;
  iv: string;
  tag: string;
} {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

export function decrypt(encryptedData: {
  encrypted: string;
  iv: string;
  tag: string;
}): string {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Step 2:** Update GitHub callback to encrypt tokens

```typescript
// app/api/integrations/github/callback/route.ts
import { encrypt } from '@/lib/utils/crypto';

// In the callback handler:
const encryptedToken = encrypt(access_token);
await supabase.from('github_tokens').insert({
  user_id: user.id,
  access_token: encryptedToken.encrypted,
  token_iv: encryptedToken.iv,
  token_tag: encryptedToken.tag,
  expires_at: expiresAt,
});
```

**Step 3:** Update database schema

```sql
-- supabase/migrations/20250106_encrypt_github_tokens.sql
ALTER TABLE github_tokens
ADD COLUMN token_iv TEXT,
ADD COLUMN token_tag TEXT;

-- Update column name for clarity
ALTER TABLE github_tokens
RENAME COLUMN access_token TO encrypted_token;
```

#### 2. Update Vulnerable Dependencies

**Commands to run:**

```bash
# Update specific vulnerable packages
pnpm update @supabase/ssr@^0.6.1
pnpm update eslint-config-next@^15.3.3

# Run security audit
pnpm audit

# Fix any remaining vulnerabilities
pnpm audit fix
```

**Validation:**

- No vulnerabilities in `pnpm audit`
- All tests pass
- Application runs without errors

### Day 3: React Hooks Compatibility Fix

#### 1. Update Node.js Version Documentation

**File:** `README.md` and `package.json`

```json
{
  "engines": {
    "node": ">=18.17.0 <21.0.0 || >=21.8.0",
    "npm": ">=9.0.0"
  }
}
```

#### 2. Add Node Version Check

```typescript
// scripts/check-node-version.js
const semver = require('semver');
const { engines } = require('../package.json');

const version = process.version;
if (!semver.satisfies(version, engines.node)) {
  console.error(
    `Required node version ${engines.node} not satisfied with current version ${version}.`
  );
  process.exit(1);
}
```

### Day 4-5: Implement Structured Logging

#### 1. Create Logger Service

```typescript
// lib/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      const contextStr = context ? JSON.stringify(context) : '';
      console.log(
        `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`
      );
    } else {
      // In production, send to logging service
      // Example: Sentry, LogRocket, etc.
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, { ...context, error: error?.stack });
  }
}

export const logger = new Logger();
```

#### 2. Replace Console Statements

**Search and replace patterns:**

```bash
# Find all console.log statements
grep -r "console.log" --include="*.ts" --include="*.tsx" .

# Find all console.error statements
grep -r "console.error" --include="*.ts" --include="*.tsx" .
```

**Example replacement:**

```typescript
// Before
console.log('User logged in', userId);
console.error('Failed to fetch data', error);

// After
import { logger } from '@/lib/utils/logger';

logger.info('User logged in', { userId });
logger.error('Failed to fetch data', error);
```

## 📅 Week 2: High Priority Fixes

### Day 6-7: Modularize Translation System

#### 1. Create Language JSON Files

```typescript
// lib/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "landing": {
    "heroTitle": "Turn Your CV Into a",
    "heroSubtitle": "Professional Portfolio",
    // ... more translations
  }
}

// lib/i18n/locales/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar"
  },
  "landing": {
    "heroTitle": "Convierte tu CV en un",
    "heroSubtitle": "Portafolio Profesional",
    // ... more translations
  }
}
```

#### 2. Create Translation Loader

```typescript
// lib/i18n/loader.ts
import type { Translations } from './types';

const translationCache = new Map<string, Translations>();

export async function loadTranslations(locale: string): Promise<Translations> {
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    const translations = await import(`./locales/${locale}.json`);
    translationCache.set(locale, translations.default);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}`, error);
    // Fallback to English
    const fallback = await import('./locales/en.json');
    return fallback.default;
  }
}
```

#### 3. Update Context Provider

```typescript
// lib/i18n/context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadTranslations } from './loader';
import type { Translations } from './types';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('es');
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranslations(language).then(t => {
      setTranslations(t);
      setLoading(false);
    });
  }, [language]);

  if (loading || !translations) {
    return <div>Loading translations...</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

### Day 8-10: Add Critical Test Coverage

#### 1. Authentication Tests

```typescript
// __tests__/lib/auth/auth.test.ts
import { createClient } from '@/lib/supabase/server';
import { validatePassword, hashPassword } from '@/lib/auth/auth';

jest.mock('@/lib/supabase/server');

describe('Authentication', () => {
  describe('Password Validation', () => {
    test('should require minimum 12 characters', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('validpassword123!')).toBe(true);
    });

    test('should require complexity', () => {
      expect(validatePassword('simplesimple')).toBe(false);
      expect(validatePassword('Complex123!')).toBe(true);
    });
  });

  describe('User Authentication', () => {
    test('should authenticate valid user', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: { id: '123' } },
            error: null,
          }),
        },
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      // Test authentication flow
    });
  });
});
```

#### 2. Admin Feature Tests

```typescript
// __tests__/components/admin/AdminUserDashboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminUserDashboard } from '@/components/admin/AdminUserDashboard';

describe('AdminUserDashboard', () => {
  test('should display user statistics', () => {
    render(<AdminUserDashboard />);
    expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Users/i)).toBeInTheDocument();
  });

  test('should filter users by role', async () => {
    render(<AdminUserDashboard />);

    const filterSelect = screen.getByRole('combobox', { name: /filter by role/i });
    fireEvent.change(filterSelect, { target: { value: 'admin' } });

    // Assert filtered results
  });
});
```

### Day 11-12: CSRF Protection Implementation

#### 1. Create CSRF Middleware

```typescript
// lib/middleware/csrf.ts
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_COOKIE = 'csrf_token';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get(CSRF_HEADER);
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  if (!token || !cookieToken) return false;

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(cookieToken));
}

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF for GET requests
  if (request.method === 'GET') return null;

  // Validate CSRF token for state-changing requests
  if (!validateCSRFToken(request)) {
    return new NextResponse('Invalid CSRF token', { status: 403 });
  }

  return null;
}
```

#### 2. Update API Routes

```typescript
// app/api/portfolios/route.ts
import { csrfMiddleware } from '@/lib/middleware/csrf';

export async function POST(request: NextRequest) {
  // Check CSRF token
  const csrfResponse = csrfMiddleware(request);
  if (csrfResponse) return csrfResponse;

  // Continue with normal processing
  // ...
}
```

### Day 13-14: Expand Rate Limiting

#### 1. Create Rate Limiter Service

```typescript
// lib/services/rateLimiter.ts
import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export class RateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.REDIS_TOKEN!,
    });
  }

  async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in window
    const count = await this.redis.zcard(key);

    if (count >= config.max) {
      return { allowed: false, remaining: 0 };
    }

    // Add current request
    await this.redis.zadd(key, { score: now, member: now });
    await this.redis.expire(key, Math.ceil(config.windowMs / 1000));

    return { allowed: true, remaining: config.max - count - 1 };
  }
}
```

#### 2. Apply to All API Routes

```typescript
// middleware.ts
import { RateLimiter } from '@/lib/services/rateLimiter';

const limiter = new RateLimiter();

export async function middleware(request: NextRequest) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = request.ip || 'anonymous';
    const { allowed, remaining } = await limiter.checkLimit(identifier, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
    });

    if (!allowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(
            Date.now() + 15 * 60 * 1000
          ).toISOString(),
        },
      });
    }

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }
}
```

## 📊 Validation Criteria

### Week 1 Completion Checklist

- [ ] GitHub tokens encrypted in database
- [ ] No security vulnerabilities in `pnpm audit`
- [ ] React hooks working with Node.js version
- [ ] Structured logging implemented
- [ ] All console statements replaced

### Week 2 Completion Checklist

- [ ] Translation system modularized
- [ ] Authentication tests passing
- [ ] Admin feature tests passing
- [ ] CSRF protection active
- [ ] Rate limiting on all endpoints

## 🚦 Success Metrics

### Security Improvements

- **Before:** 1 critical vulnerability
- **After:** 0 vulnerabilities
- **Validation:** Run `pnpm audit`

### Code Quality

- **Before:** 1800+ line translation file
- **After:** Modular JSON files < 200 lines each
- **Validation:** File size checks

### Test Coverage

- **Before:** ~50% coverage
- **Target:** 70% coverage (Week 2)
- **Validation:** `pnpm test:coverage`

### Performance

- **Before:** Bundle includes all translations
- **After:** Lazy-loaded translations
- **Validation:** Bundle analyzer

## 📝 Implementation Notes

1. **Backup First:** Create database backups before schema changes
2. **Feature Flags:** Use environment variables to toggle new features
3. **Gradual Rollout:** Deploy security fixes immediately, others gradually
4. **Monitor Metrics:** Track error rates and performance during rollout
5. **Communication:** Update team on progress daily

## 🎯 Next Steps After Week 2

1. **Month 1:** Continue with medium priority items
2. **Month 2:** Address technical debt systematically
3. **Month 3:** Prepare for React 19 migration
4. **Ongoing:** Maintain code quality standards

This implementation plan provides concrete steps to transform the codebase from its current state to a more secure, maintainable, and scalable platform.
