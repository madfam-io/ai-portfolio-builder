# 🚀 Getting Started Guide

> Get your Portfolio Builder development environment up and running in 5 minutes!

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Required | Installation |
|------|---------|----------|--------------|
| **Node.js** | ≥18.17.0 | ✅ Yes | [Download](https://nodejs.org/) |
| **pnpm** | ≥10.12.1 | ✅ Yes | `npm install -g pnpm` |
| **Git** | Latest | ✅ Yes | [Download](https://git-scm.com/) |
| **Docker** | Latest | ⚡ Optional | [Download](https://docker.com/) |
| **PostgreSQL** | 14+ | ⚡ Optional | Via Docker or [Download](https://postgresql.org/) |
| **Redis** | 7+ | ⚡ Optional | Via Docker or [Download](https://redis.io/) |

## 🎯 Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/aldoruizluna/labspace/ai-portfolio-builder.git

# Navigate to project directory
cd ai-portfolio-builder
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
pnpm install

# This will also build the @madfam packages automatically
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your API keys (see below)
```

### Step 4: Configure Essential Services

You'll need to update `.env.local` with real API keys:

#### 🔑 Supabase (Required)
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your project URL and keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 🤖 HuggingFace (Required for AI features)
1. Create account at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create a new token:
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
```

#### 💳 Stripe (Optional - for payments)
1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
```

### Step 5: Run Database Migrations

```bash
# If using Supabase (recommended)
pnpm supabase:migrate

# The migrations will create all necessary tables
```

### Step 6: Start Development Server

```bash
# Start the development server
pnpm dev

# Server will start on http://localhost:3000
```

### Step 7: Verify Installation

Open your browser and navigate to:
- 🌐 **Main App**: http://localhost:3000
- 🔍 **API Health**: http://localhost:3000/api/v1/health

You should see the Portfolio Builder homepage!

## 🐳 Docker Development (Alternative)

For a fully containerized setup with all services:

```bash
# Start all services (PostgreSQL, Redis, pgAdmin)
docker-compose up -d

# Run migrations
pnpm supabase:migrate

# Start the app
pnpm dev
```

Services will be available at:
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: localhost:5050

## 📝 Environment Variables Guide

### Essential Variables (Required)

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# AI Service
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxx

# Security (Generate your own)
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars
CSRF_SECRET=your-csrf-secret-32-chars
```

### Optional Services

```env
# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Redis Cache
REDIS_URL=redis://localhost:6379
```

## 🧪 Verify Your Setup

Run these commands to ensure everything is working:

```bash
# Check TypeScript compilation
pnpm type-check

# Run tests
pnpm test

# Check linting
pnpm lint

# Build the project
pnpm build
```

## 🎨 Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run test suite |
| `pnpm lint` | Check code quality |
| `pnpm type-check` | Check TypeScript |
| `pnpm format` | Format code with Prettier |

### Project Structure

```
ai-portfolio-builder/
├── app/                 # Next.js app directory
│   ├── api/            # API routes (v1)
│   ├── (dashboard)/    # Dashboard pages
│   └── (app)/          # Public pages
├── components/         # React components
├── lib/               # Core business logic
│   ├── ai/           # AI services
│   ├── api/          # API utilities
│   └── supabase/     # Database
├── docs/              # Documentation
└── types/             # TypeScript types
```

## 🔧 Common Issues & Solutions

### Issue: Port 3000 Already in Use
```bash
# Kill the process using port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Issue: Database Connection Failed
```bash
# Ensure PostgreSQL is running
docker-compose up -d postgres

# Check connection string
echo $DATABASE_URL
```

### Issue: Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

## 🚢 Next Steps

Now that you have the development environment running:

1. **Explore the App**: Create your first AI-powered portfolio
2. **Read the Docs**: Check out our [Architecture Guide](../architecture/README.md)
3. **Join Development**: See [Contributing Guidelines](../../CONTRIBUTING.md)
4. **Deploy to Production**: Follow the [Deployment Guide](../DEPLOYMENT_GUIDE.md)

## 🆘 Need Help?

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/aldoruizluna/labspace/ai-portfolio-builder/issues)
- 💬 [Discussions](https://github.com/aldoruizluna/labspace/ai-portfolio-builder/discussions)
- 📧 Email: support@madfam.io

---

<div align="center">
  <strong>Happy Building! 🚀</strong><br>
  You're now ready to transform CVs into stunning portfolios with AI
</div>