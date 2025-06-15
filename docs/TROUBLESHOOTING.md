# 🔧 Troubleshooting Guide

This guide helps you resolve common issues when developing or deploying PRISMA.

**Last Updated**: June 15, 2025  
**Version**: v0.3.0-beta  
**Support**: hello@prisma.madfam.io

## 📋 Table of Contents

- [Development Issues](#development-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [Runtime Errors](#runtime-errors)
- [Database Issues](#database-issues)
- [Authentication Problems](#authentication-problems)
- [AI Service Issues](#ai-service-issues)
- [Performance Issues](#performance-issues)
- [Testing Issues](#testing-issues)
- [Docker Issues](#docker-issues)
- [Getting Help](#getting-help)

## 💻 Development Issues

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use the clean script
pnpm dev:clean
```

### Module Not Found

**Problem**: `Module not found: Can't resolve '@/components/...'`

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
pnpm install
pnpm dev
```

### TypeScript Errors

**Problem**: Type errors in IDE but build works

**Solution**:
```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"

# Or regenerate types
pnpm type-check
```

### Hot Reload Not Working

**Problem**: Changes not reflecting in browser

**Solution**:
1. Check if file is in `.next` cache
2. Clear browser cache
3. Restart dev server:
```bash
pnpm dev:clean
```

## 🏗️ Build & Deployment Issues

### Build Failures

**Problem**: `Build error occurred`

**Common Solutions**:

1. **Environment Variables**
```bash
# Ensure all required vars are set
cp .env.example .env.local
# Edit .env.local with your values
```

2. **Dependencies**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

3. **Memory Issues**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### Vercel Deployment Fails

**Problem**: Build succeeds locally but fails on Vercel

**Solutions**:

1. **Check Build Command**
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install"
}
```

2. **Environment Variables**
- Add all variables from `.env.local` to Vercel dashboard
- Ensure variable names match exactly

3. **Node Version**
```json
// package.json
{
  "engines": {
    "node": ">=18.17.0"
  }
}
```

## 🚨 Runtime Errors

### Hydration Errors

**Problem**: `Hydration failed because the initial UI does not match`

**Solutions**:

1. **Dynamic Imports**
```typescript
// For client-only components
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
});
```

2. **Conditional Rendering**
```typescript
// Use useEffect for client-only code
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

### CORS Errors

**Problem**: `Access to fetch at '...' from origin '...' has been blocked by CORS`

**Solution**:
```typescript
// app/api/[...]/route.ts
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

## 🗄️ Database Issues

### Connection Errors

**Problem**: `Can't reach database server`

**Solutions**:

1. **Docker Running**
```bash
# Check if containers are running
docker ps

# Start containers
./scripts/docker-dev.sh
```

2. **Connection String**
```env
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/prisma_dev"
```

3. **Network Issues**
```bash
# Test connection
psql -h localhost -U postgres -d prisma_dev
```

### Migration Errors

**Problem**: `Migration failed`

**Solutions**:

```bash
# Reset database (development only!)
pnpm prisma migrate reset

# Apply migrations
pnpm prisma migrate dev

# Generate client
pnpm prisma generate
```

## 🔐 Authentication Problems

### Login Failures

**Problem**: Can't log in with valid credentials

**Solutions**:

1. **Check Supabase Connection**
```typescript
// Verify environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

2. **Session Storage**
```typescript
// Clear corrupted sessions
localStorage.clear();
sessionStorage.clear();
```

3. **OAuth Redirect**
```env
# Ensure correct redirect URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Protected Routes Access

**Problem**: Unauthorized access to protected routes

**Solution**:
```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*']
};
```

## 🤖 AI Service Issues

### HuggingFace API Errors

**Problem**: AI enhancement failing

**Solutions**:

1. **API Key**
```env
# Check API key is set
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxx
```

2. **Rate Limiting**
```typescript
// Implement retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function enhanceWithRetry(content: string) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await enhance(content);
    } catch (error) {
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
      } else {
        throw error;
      }
    }
  }
}
```

3. **Fallback to Mock Data**
```typescript
// Use mock data in development
if (!process.env.HUGGINGFACE_API_KEY) {
  return mockAIResponse();
}
```

## ⚡ Performance Issues

### Slow Page Loads

**Problem**: Pages loading slowly

**Solutions**:

1. **Check Bundle Size**
```bash
pnpm build
pnpm analyze
```

2. **Optimize Images**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/large-image.jpg"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

3. **Enable Caching**
```typescript
// API route caching
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300',
    },
  });
}
```

### Memory Leaks

**Problem**: Application becoming slower over time

**Solutions**:

1. **Clean Up Effects**
```typescript
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  
  // Cleanup
  return () => clearInterval(timer);
}, []);
```

2. **Unsubscribe from Stores**
```typescript
useEffect(() => {
  const unsubscribe = store.subscribe(() => {});
  
  return unsubscribe;
}, []);
```

## 🧪 Testing Issues

### Test Failures

**Problem**: Tests passing locally but failing in CI

**Solutions**:

1. **Environment Consistency**
```bash
# Use same Node version
nvm use 18.17.0
```

2. **Clear Test Cache**
```bash
pnpm test -- --clearCache
```

3. **Mock External Services**
```typescript
// __mocks__/next/navigation.js
module.exports = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/test',
};
```

### Coverage Issues

**Problem**: Low test coverage

**Solution**:
```bash
# Generate coverage report
pnpm test:coverage

# Focus on critical paths
# - Authentication flows
# - Portfolio CRUD operations
# - AI enhancement pipeline
```

## 🐳 Docker Issues

### Container Won't Start

**Problem**: Docker containers failing to start

**Solutions**:

1. **Check Docker Desktop**
```bash
# Ensure Docker is running
docker --version
docker ps
```

2. **Clean Restart**
```bash
# Remove all containers and volumes
docker-compose down -v
./scripts/docker-dev.sh
```

3. **Port Conflicts**
```bash
# Check for port conflicts
lsof -ti:3000,5432,6379,5050
```

### Database Connection from Docker

**Problem**: App can't connect to PostgreSQL in Docker

**Solution**:
```env
# Use Docker service name
DATABASE_URL="postgresql://postgres:password@postgres:5432/prisma_dev"
```

## 🌐 Common Error Messages

### "fetch failed"

**Causes**:
- Network connectivity issues
- API endpoint down
- CORS problems

**Solution**:
```typescript
// Add error handling
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
} catch (error) {
  console.error('Fetch error:', error);
  // Handle gracefully
}
```

### "Invalid environment variables"

**Solution**:
```bash
# Validate environment
pnpm env:validate

# Check required variables
Required:
- DATABASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check Documentation**
   - README.md
   - API_REFERENCE.md
   - This troubleshooting guide

2. **Search Issues**
   - GitHub Issues
   - Stack Overflow

3. **Gather Information**
   - Error messages
   - Environment details
   - Steps to reproduce

### Where to Get Help

1. **GitHub Issues**
   - Bug reports
   - Feature requests
   - Documentation issues

2. **Community**
   - Discord (coming soon)
   - Stack Overflow tag: `prisma-portfolio`

3. **Emergency Support**
   - Email: hello@prisma.madfam.io
   - Response time: 24-48 hours

### Reporting Bugs

Include:
- Node version: `node --version`
- pnpm version: `pnpm --version`
- OS and version
- Complete error message
- Minimal reproduction steps

---

Remember: Most issues have been encountered before. Check existing issues and documentation first!

---

_Troubleshooting guide last updated: June 15, 2025_