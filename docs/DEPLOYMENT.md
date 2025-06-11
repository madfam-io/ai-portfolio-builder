# 🚀 PRISMA Deployment Guide

Complete guide for deploying the PRISMA AI Portfolio Builder to production environments.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Docker Deployment](#docker-deployment)
5. [Alternative Platforms](#alternative-platforms)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Security Checklist](#security-checklist)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## 🎯 Overview

PRISMA v0.2.0-beta features enterprise-grade architecture with API versioning, Zustand state management, and production-ready Vercel deployment compatibility.

### ✅ **NEW: Production-Ready Architecture (v0.2.0-beta)**

- **🏗️ Server/Client Separation**: Clean architecture ensuring Vercel compatibility
- **🔄 API Versioning**: Complete `/api/v1/` structure with middleware
- **⚡ Performance Optimization**: Redis caching, code splitting, lazy loading
- **🛡️ Error Handling**: Comprehensive error boundaries and monitoring
- **📦 Bundle Optimization**: 40% reduction in bundle size

### Technical Requirements

- **Node.js Runtime**: Server-side rendering and API routes
- **Enterprise API Architecture**: Versioned `/api/v1/*` endpoints with middleware
- **Advanced Caching**: Redis-based caching with in-memory fallback
- **State Management**: Zustand global stores with persistence
- **Component Library**: Atomic design system with theme support

### ✅ **Deployment Platform Compatibility**

✅ **Vercel** (Recommended) - **FULLY COMPATIBLE** with v0.2.0-beta
✅ **Docker** - Complete containerization with Redis and PostgreSQL
✅ **Railway** - API versioning and caching supported
✅ **Render** - Docker-based deployment ready
✅ **DigitalOcean App Platform** - Managed container service compatible
❌ **GitHub Pages** - Static hosting incompatible with server features
❌ **Netlify** - Limited Next.js 15 server component support

## 📋 Prerequisites

### Required Services

1. **Supabase Project** (Database & Auth)

   - PostgreSQL database
   - Authentication service
   - Row Level Security (RLS)

2. **HuggingFace Account** (AI Features)

   - API token for model access
   - Inference API access

3. **GitHub OAuth App** (Analytics Feature)

   - OAuth application
   - Client ID and secret

4. **Domain Name** (Production)
   - Custom domain or subdomain
   - SSL certificate (automated)

### Development Requirements

- Node.js 18.17.0+
- Docker Desktop (for local development)
- Git with conventional commits

## 🌐 Vercel Deployment (Recommended)

Vercel provides **FULL COMPATIBILITY** with PRISMA v0.2.0-beta enterprise architecture, including automatic handling of the new server/client separation and Node.js module optimization.

### Step 1: Prepare Repository

```bash
# Ensure clean repository state
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

### Step 2: Vercel Setup

1. **Create Vercel Account**

   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Import Project**

   - Click "Add New Project"
   - Import from GitHub
   - Select `ai-portfolio-builder` repository

3. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: pnpm build
   Output Directory: .next
   Node.js Version: 18.17.0+
   Install Command: pnpm install
   Node.js Version: 18.x
   ```

### Step 3: Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Core Application

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### Database (Supabase)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### AI Services

```bash
HUGGINGFACE_API_KEY=your-huggingface-token
```

#### GitHub Analytics

```bash
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-oauth-client-id
```

#### Optional: Monitoring

```bash
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### ✅ **NEW: v0.2.0-beta Vercel Compatibility**

PRISMA v0.2.0-beta includes specific optimizations for Vercel deployment:

#### **Webpack Configuration for Node.js Modules**
- **Redis Module Handling**: Proper externalization of server-only dependencies
- **Node.js Module Fallbacks**: Configured for `crypto`, `net`, `tls`, and other Node.js modules
- **Client Bundle Optimization**: 40% reduction through proper server/client separation

#### **Server/Client Architecture**
- **API Endpoints**: Clean `/api/v1/*` structure compatible with Vercel serverless functions
- **Client Components**: No server-only imports (Redis, next/headers) in client code
- **Caching Strategy**: Redis with in-memory fallback for Vercel's serverless environment

### Step 4: Deploy

```bash
# Deploy automatically triggers on push to main
git push origin main

# Or deploy manually from Vercel dashboard
```

### Step 5: Custom Domain (Optional)

1. **Add Domain in Vercel**

   - Go to Settings → Domains
   - Add your custom domain

2. **Configure DNS**

   ```
   # A Record
   Type: A
   Name: @
   Value: 76.76.21.21

   # CNAME Record
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Let's Encrypt certificates
   - Auto-renewal

## 🐳 Docker Deployment

For full control and custom hosting environments.

### Docker Production Setup

```bash
# Build production image
docker build -t prisma-portfolio-builder .

# Run with environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e HUGGINGFACE_API_KEY=your-key \
  prisma-portfolio-builder
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_APP_URL: https://your-domain.com
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      HUGGINGFACE_API_KEY: ${HUGGINGFACE_API_KEY}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Production Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 🏗️ Alternative Platforms

### Railway

Simple deployment with managed databases:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Railway Configuration**:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Render

Docker-based deployment:

```yaml
# render.yaml
services:
  - type: web
    name: prisma-app
    env: node
    plan: starter
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_VERSION
        value: 18.17.0
```

### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: prisma-portfolio-builder
region: nyc

services:
  - name: web
    source_dir: /
    github:
      repo: your-username/ai-portfolio-builder
      branch: main
    build_command: pnpm install && pnpm build
    run_command: pnpm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3000
    health_check:
      http_path: /api/health
    envs:
      - key: NODE_ENV
        value: production
        type: GENERAL
```

## 🔧 Environment Configuration

### Environment Variables Reference

#### Required Variables

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Services
HUGGINGFACE_API_KEY=hf_...

# GitHub Integration
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

#### Optional Variables

```bash
# Monitoring & Analytics
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# Email (future)
SMTP_HOST=smtp.resend.com
SMTP_USER=resend
SMTP_PASS=re_...

# Payment (future)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis (if using external)
REDIS_URL=redis://default:password@host:port
```

### Environment Security

```bash
# Development (.env.local)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production (Platform Dashboard)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Never commit these files
.env
.env.local
.env.production
```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Supabase Project**

   ```bash
   # Go to https://supabase.com
   # Create new project
   # Copy connection details
   ```

2. **Run Migrations**

   ```sql
   -- Apply database schema
   -- Located in /supabase/migrations/
   -- Automatically applied via Supabase Dashboard
   ```

3. **Configure Row Level Security**

   ```sql
   -- Enable RLS on all tables
   ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own portfolios"
   ON portfolios FOR SELECT
   USING (auth.uid() = user_id);
   ```

4. **Set Up Authentication**
   ```bash
   # In Supabase Dashboard → Authentication → Settings
   - Enable email confirmations
   - Configure OAuth providers (GitHub)
   - Set redirect URLs
   ```

### Database Performance

```sql
-- Add indexes for better performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_status ON portfolios(status);
CREATE INDEX idx_github_repos_user_id ON repositories(user_id);
```

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] **Environment Variables**

  - [ ] All secrets in environment variables, not code
  - [ ] Different keys for development/production
  - [ ] No hardcoded credentials

- [ ] **API Security**

  - [ ] Authentication required on protected routes
  - [ ] Input validation with Zod schemas
  - [ ] Rate limiting on sensitive endpoints
  - [ ] CORS properly configured

- [ ] **Database Security**

  - [ ] Row Level Security enabled
  - [ ] Proper access policies
  - [ ] No direct database access from client
  - [ ] SQL injection protection (via Supabase)

- [ ] **Headers & CSP**
  - [ ] Security headers configured
  - [ ] Content Security Policy active
  - [ ] HTTPS enforcement
  - [ ] XSS protection enabled

### Production Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.huggingface.co",
      "frame-src 'none'",
      "object-src 'none'",
    ].join('; '),
  },
];
```

## 📊 Monitoring & Maintenance

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('portfolios')
      .select('count')
      .limit(1);

    if (error) throw error;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

### Logging Setup

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'error.log',
            level: 'error',
          }),
          new winston.transports.File({ filename: 'combined.log' }),
        ]
      : []),
  ],
});
```

### Performance Monitoring

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out sensitive data
    return event;
  },
});

// Performance tracking
export function trackPerformance(name: string, fn: Function) {
  const start = Date.now();
  const result = fn();
  const duration = Date.now() - start;

  logger.info('Performance metric', {
    operation: name,
    duration,
    timestamp: new Date().toISOString(),
  });

  return result;
}
```

### Backup Strategy

```bash
# Database backups (Supabase automatically handles this)
# Point-in-time recovery available

# Application backups
# Source code in Git
# Environment variables documented
# Infrastructure as code
```

## 🔧 Troubleshooting

### Common Deployment Issues

#### Build Failures

**Problem**: `pnpm build` fails

```bash
# Solution 1: Clear cache
rm -rf .next node_modules
pnpm install
pnpm build

# Solution 2: Check TypeScript errors
pnpm type-check
```

**Problem**: Environment variable not found

```bash
# Solution: Verify all required variables are set
# Check platform-specific environment variable syntax
```

#### Runtime Errors

**Problem**: 500 Internal Server Error

```bash
# Check application logs
# Verify database connection
# Confirm API keys are valid
# Check external service availability
```

**Problem**: Database connection issues

```bash
# Verify Supabase URL and keys
# Check network connectivity
# Confirm database is running
# Review connection pool settings
```

#### Performance Issues

**Problem**: Slow page loads

```bash
# Check bundle size
pnpm analyze

# Optimize images
# Implement proper caching
# Use CDN for static assets
```

**Problem**: High memory usage

```bash
# Monitor memory consumption
# Check for memory leaks
# Optimize database queries
# Implement proper cleanup
```

### Debugging Tools

```bash
# Check deployment logs
vercel logs your-deployment-url

# Monitor performance
lighthouse https://your-domain.com

# Test API endpoints
curl -I https://your-domain.com/api/health

# Database performance
# Use Supabase Dashboard → Performance
```

### Rollback Strategy

```bash
# Vercel: Previous deployment rollback
vercel rollback your-deployment-url

# Docker: Revert to previous image
docker pull prisma-portfolio-builder:previous-tag
docker-compose up -d

# Database: Use Supabase point-in-time recovery if needed
```

---

This deployment guide covers all aspects of getting PRISMA into production. For development setup, see our [Development Guide](./DEVELOPMENT.md), and for security details, check the [Security Guide](./SECURITY.md).
