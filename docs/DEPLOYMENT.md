# MADFAM AI Portfolio Builder - Deployment Guide

> **Current Status**: Foundation Development Phase - Landing page with multilanguage support complete, Docker environment configured, ready for production deployment.

## 📋 Table of Contents

- [Production Deployment](#production-deployment)
  - [Vercel (Recommended)](#-vercel-deployment-recommended)
  - [Alternative Platforms](#-alternative-deployment-platforms)
- [Docker Deployment](#-docker-deployment)
- [Environment Configuration](#-environment-variable-configuration)
- [Custom Domain Setup](#-custom-domain-setup)
- [Production Checklist](#-production-checklist)
- [Troubleshooting](#-troubleshooting)

## ⚠️ Why GitHub Pages Won't Work

GitHub Pages is a static site hosting service that **cannot** run Next.js applications with server-side features. Here's why this application is incompatible:

### 1. **Server-Side Rendering (SSR) & API Routes**

- Next.js App Router uses React Server Components that require a Node.js runtime
- Future `/app/api/*` routes will need server execution for:
  - Database queries to Supabase
  - AI API calls (HuggingFace, open-source models)
  - Authentication flows
  - Payment processing (Stripe)

### 2. **Dynamic Features Requiring Runtime**

- **Authentication**: Supabase Auth requires server-side session management
- **Database Operations**: Real-time PostgreSQL queries can't run on static hosting
- **File Uploads**: Processing CV/resume uploads needs server-side parsing
- **AI Integration**: API calls to OpenAI/Claude require secure server-side execution
- **OAuth Flows**: LinkedIn/GitHub authentication needs server callbacks

### 3. **Security Requirements**

- API keys and secrets must be kept server-side
- Row Level Security (RLS) requires server-side database connections
- Rate limiting and request validation need runtime execution

### 4. **Next.js Features We Use**

```javascript
// These features require a server:
- App Router with Server Components
- Multilanguage support with React Context
- Dynamic routes with data fetching
- API Routes (/app/api/* - planned)
- Middleware for auth protection (planned)
- Server Actions (planned)
- Streaming SSR
```

## 🐳 Docker Deployment

For production environments that require containerization, our Docker setup provides a complete isolated environment.

### Production Docker Setup

```bash
# Clone and setup
git clone https://github.com/madfam/ai-portfolio-builder.git
cd ai-portfolio-builder

# Build and run production containers
./scripts/docker-prod.sh

# Or manually:
docker-compose up -d --build

# Services will be available at:
# 🌐 App: http://localhost:3000
# 🗄️ Database: localhost:5432
# 🔴 Redis: localhost:6379
```

### Docker Compose Configuration

```yaml
# docker-compose.yml (Production)
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://app.madfam.io
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: portfolio_builder
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Docker Environment Variables

```bash
# .env.production
NODE_ENV=production
POSTGRES_PASSWORD=secure_password_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🚀 Vercel Deployment (Recommended)

Vercel is the recommended platform as it's built by the Next.js team and provides optimal performance and developer experience.

### Prerequisites

1. GitHub account with repository access
2. Vercel account (free tier available)
3. Environment variables ready (for future features)
4. Supabase project configured (for future features)

### Step-by-Step Deployment

#### 1. **Prepare Your Repository**

```bash
# Ensure your code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. **Connect to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `ai-portfolio-builder` repository

#### 3. **Configure Build Settings**

```yaml
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

#### 4. **Set Environment Variables**

**Current Status**: For the foundation phase (landing page), no environment variables are required. Add these for future SaaS features:

```bash
# Basic Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Future: Supabase Configuration (when implementing auth/database)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Future: AI Services (when implementing AI features)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Future: OAuth Providers (when implementing social login)
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Future: Stripe Payment Processing (when implementing payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Future: Redis Cache (when implementing caching)
REDIS_URL=redis://default:password@host:port
REDIS_TOKEN=your-token

# Future: Monitoring (when implementing analytics)
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

#### 5. **Deploy**

1. Click "Deploy"
2. Wait for build to complete (typically 2-5 minutes)
3. Visit your deployment URL

#### 6. **Configure Domain (Optional)**

```bash
# In Vercel Dashboard > Settings > Domains
1. Add your custom domain
2. Update DNS records:
   - A Record: 76.76.21.21
   - CNAME: cname.vercel-dns.com
3. Enable HTTPS (automatic)
```

### Vercel-Specific Features

#### Edge Functions Configuration

```javascript
// middleware.ts for auth protection
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

#### Caching Headers

```javascript
// app/api/portfolios/[slug]/route.ts
export async function GET(request: Request) {
  // Enable edge caching
  return new Response(data, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate'
    }
  })
}
```

## 🔄 Alternative Deployment Platforms

### Netlify (With Limitations)

Netlify can host Next.js but with reduced functionality compared to Vercel.

#### Limitations on Netlify:

- No support for Next.js 14 App Router streaming
- Limited middleware support
- Larger cold start times
- No built-in image optimization

#### Deployment Steps:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build configuration (netlify.toml)
[build]
  command = "pnpm build"
  publish = ".next"

[functions]
  directory = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Deploy
netlify deploy --prod
```

### Railway

Railway provides full Node.js runtime support with integrated PostgreSQL.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Add environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=...

# Deploy
railway up
```

### Render

Render offers Docker-based deployments with automatic SSL.

```yaml
# render.yaml
services:
  - type: web
    name: ai-portfolio-builder
    env: node
    plan: starter
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: NODE_VERSION
        value: 18.17.0
```

### DigitalOcean App Platform

```yaml
# app.yaml
name: ai-portfolio-builder
region: nyc
services:
  - name: web
    github:
      repo: your-username/ai-portfolio-builder
      branch: main
    build_command: pnpm install && pnpm build
    run_command: pnpm start
    http_port: 3000
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
```

## 🔧 Environment Variable Configuration

### Development vs Production

```bash
# .env.local (Development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-dev-key

# Production (Set in platform dashboard)
NEXT_PUBLIC_APP_URL=https://app.madfam.io
SUPABASE_SERVICE_ROLE_KEY=your-prod-key
```

### Security Best Practices

1. **Never commit `.env` files**

   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different keys for environments**

   - Separate Stripe keys for test/production
   - Different Supabase projects
   - Isolated OAuth applications

3. **Rotate keys regularly**
   - Set up key rotation reminders
   - Use secret management tools
   - Monitor for exposed credentials

## 🌐 Custom Domain Setup

### DNS Configuration

#### For apex domain (madfam.io):

```
A     @     76.76.21.21     (Vercel IP)
AAAA  @     2606:4700::6810:84e5  (Vercel IPv6)
```

#### For subdomain (app.madfam.io):

```
CNAME app   cname.vercel-dns.com
```

### SSL Certificate

- Vercel: Automatic Let's Encrypt
- Other platforms: May require manual setup

### Email Configuration (for custom domains)

```
MX    @     10 mx1.emailservice.com
MX    @     20 mx2.emailservice.com
TXT   @     "v=spf1 include:emailservice.com ~all"
```

## ✅ Production Checklist

### Pre-Deployment

- [ ] **Code Quality**

  ```bash
  pnpm test          # All tests passing
  pnpm type-check    # No TypeScript errors
  pnpm lint          # No linting issues
  pnpm build         # Build succeeds locally
  ```

- [ ] **Environment Variables**

  - [ ] All required variables set
  - [ ] Production API keys configured
  - [ ] OAuth redirect URLs updated
  - [ ] Webhook endpoints configured

- [ ] **Database**

  ```bash
  # Run production migrations
  pnpm supabase migration run --db-url $PRODUCTION_DB_URL

  # Verify RLS policies
  pnpm supabase test db
  ```

- [ ] **Security**
  - [ ] API rate limiting configured
  - [ ] CORS settings reviewed
  - [ ] CSP headers implemented
  - [ ] Secrets rotated from development

### Post-Deployment

- [ ] **Functional Testing**

  - [ ] User registration/login works
  - [ ] OAuth flows complete successfully
  - [ ] Portfolio generation functions
  - [ ] Payment processing active
  - [ ] File uploads working

- [ ] **Performance Verification**

  ```bash
  # Run Lighthouse audit
  lighthouse https://your-app.vercel.app --view

  # Target scores:
  # Performance: > 90
  # Accessibility: > 95
  # Best Practices: > 95
  # SEO: > 90
  ```

- [ ] **Monitoring Setup**

  - [ ] Error tracking (Sentry) receiving events
  - [ ] Analytics (PostHog) tracking users
  - [ ] Uptime monitoring configured
  - [ ] Log aggregation working

- [ ] **Backup Verification**
  - [ ] Database backups scheduled
  - [ ] Backup restoration tested
  - [ ] Disaster recovery plan documented

### Production Configuration

```javascript
// next.config.js - Production optimizations
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 🆘 Troubleshooting

### Common Deployment Issues

#### Build Failures

```bash
# Error: Cannot find module
Solution: Clear cache and rebuild
- Vercel: Redeploy with "Use existing Build Cache" unchecked
- Check package.json for missing dependencies

# Error: Environment variable not found
Solution: Verify all variables are set in platform dashboard
```

#### Runtime Errors

```bash
# 500 Internal Server Error
1. Check function logs in platform dashboard
2. Verify database connection
3. Ensure API keys are valid
4. Check for missing await statements

# CORS errors
1. Update CORS configuration in next.config.js
2. Verify API routes include proper headers
3. Check OAuth redirect URLs match production domain
```

#### Performance Issues

```bash
# Slow initial load
1. Enable Vercel Edge Functions
2. Implement proper caching strategies
3. Optimize images with next/image
4. Use dynamic imports for large components

# Database timeouts
1. Add connection pooling
2. Optimize queries with indexes
3. Implement caching layer
4. Consider database scaling options
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/production-checklist)
- [Web.dev Performance Guide](https://web.dev/performance)

---

For deployment support, contact the development team or refer to our internal documentation.
