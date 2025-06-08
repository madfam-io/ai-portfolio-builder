# MADFAM AI Portfolio Builder

> Transform your professional profiles into stunning portfolio websites in under 30 minutes using AI-powered content generation.

## 🚀 Overview

MADFAM AI Portfolio Builder is a SaaS platform that automates portfolio creation for freelancers, consultants, and creative professionals. By connecting LinkedIn, GitHub, and uploading CVs, users get a professionally designed portfolio website with AI-enhanced content.

> **Current Status**: Foundation Development Phase - Landing page with multilanguage support complete, Docker environment configured, ready for core SaaS features.

### 🎯 Mission

Transform scattered professional profiles into stunning portfolio websites in under 30 minutes using AI-powered content generation.

### ✨ Implemented Features

- **🌍 Multilanguage Support**: Spanish (default) and English with seamless switching
- **🎨 Professional Landing Page**: Fully responsive with dark mode support
- **🐳 Docker Development Environment**: Complete containerized setup with database and Redis
- **🧪 Test-Driven Development**: Comprehensive testing with Jest and Playwright
- **⚡ Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **🔒 Production-Ready Setup**: ESLint, Prettier, pre-commit hooks, and CI/CD foundation

### 🎯 Planned Features

- **30-Minute Setup**: From signup to published portfolio
- **AI Content Enhancement**: Automatic bio rewriting and project descriptions
- **Multi-Source Import**: LinkedIn, GitHub, CV/Resume integration
- **Smart Templates**: Industry-specific designs with AI recommendations
- **Custom Domains**: Professional subdomain or bring your own
- **Real-time Preview**: See changes instantly as you edit

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui + React Icons
- **Internationalization**: React Context with TypeScript
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + OAuth 2.0
- **AI Services**: OpenAI GPT-4, Claude API
- **File Storage**: Supabase Storage
- **Cache**: Redis (Upstash)

### Infrastructure

- **Development**: Docker Compose (PostgreSQL, Redis, pgAdmin)
- **Hosting**: Vercel (Next.js optimized, NOT compatible with GitHub Pages)
- **CDN**: Cloudflare
- **Monitoring**: Sentry
- **Analytics**: PostHog
- **Payments**: Stripe

> ⚠️ **Note**: This application requires server-side functionality and cannot be deployed to GitHub Pages. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options.

## 📦 Prerequisites

### For Local Development

- Node.js 18.17.0 or higher
- pnpm 8.0.0 or higher

### For Docker Development (Recommended)

- Docker Desktop
- Docker Compose v2.22+

### For Production Features (Optional)

- Supabase account (for database and auth)
- OpenAI API key (for AI features)
- Stripe account (for payments)

## 🔧 Quick Start

Choose your preferred development environment:

### 🐳 Docker Setup (Recommended)

Get up and running with a complete development environment in one command:

```bash
# Clone the repository
git clone https://github.com/madfam/ai-portfolio-builder.git
cd ai-portfolio-builder

# Quick start with Docker (includes PostgreSQL, Redis, pgAdmin)
./scripts/docker-dev.sh

# Application will be available at:
# 🌐 App: http://localhost:3000 (with multilanguage support)
# 🗄️ pgAdmin: http://localhost:5050 (admin@madfam.io / admin)
# 📊 Database: localhost:5432
# 🔴 Redis: localhost:6379
```

### 💻 Local Development Setup

For traditional local development:

```bash
# Clone and setup
git clone https://github.com/madfam/ai-portfolio-builder.git
cd ai-portfolio-builder
pnpm install

# Environment setup (optional for basic development)
cp .env.example .env.local
# Edit .env.local with your API keys if needed

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the multilanguage landing page.

## 🌍 Current Features

### Multilanguage Support

- **Default Language**: Spanish (ES)
- **Secondary Language**: English (EN)
- **Language Toggle**: Click flag icon in header (🇪🇸/🇺🇸)
- **Persistence**: Language choice saved to localStorage
- **Browser Detection**: Automatic language detection

### Landing Page Components

- **Responsive Design**: Mobile-first with dark mode support
- **Hero Section**: AI-powered portfolio creation messaging
- **Features**: Showcase of platform capabilities
- **How It Works**: 3-step process explanation
- **Templates**: Preview of available portfolio designs
- **Pricing**: Subscription tiers (Free, Pro, Business)
- **Social Proof**: Trust indicators and testimonials

### Development Environment

See [docs/DOCKER.md](./docs/DOCKER.md) for complete Docker setup guide.

## 🏗️ Project Structure

```
ai-portfolio-builder/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page (multilanguage)
│   ├── layout.tsx         # Root layout with i18n provider
│   ├── globals.css        # Global styles
│   └── api/               # API routes (future)
├── components/            # React components
│   ├── landing/           # Landing page components
│   │   ├── Header.tsx     # Navigation with language toggle
│   │   ├── Hero.tsx       # Main hero section
│   │   ├── Features.tsx   # Features showcase
│   │   ├── HowItWorks.tsx # Process explanation
│   │   ├── Templates.tsx  # Template previews
│   │   ├── Pricing.tsx    # Subscription tiers
│   │   ├── CTA.tsx        # Call-to-action section
│   │   ├── Footer.tsx     # Footer links
│   │   └── SocialProof.tsx# Trust indicators
│   ├── ui/                # Shadcn/ui components (future)
│   └── InteractiveScript.tsx # Vanilla JS interactions
├── lib/                   # Utility functions
│   ├── i18n/              # Internationalization
│   │   ├── simple-context.tsx # React Context for i18n
│   │   ├── types.ts       # Translation types
│   │   └── translations.ts # Spanish/English translations
│   ├── auth/              # Authentication helpers (future)
│   └── utils/             # Utility functions
├── __tests__/             # Test files
│   ├── app/page.test.tsx  # Landing page tests
│   └── lib/auth/          # Auth tests
├── e2e/                   # End-to-end tests
├── scripts/               # Build and utility scripts
│   ├── docker-dev.sh      # Docker development setup
│   └── setup-git.sh       # Git configuration
├── docs/                  # Project documentation
├── docker-compose.dev.yml # Development environment
├── Dockerfile.dev         # Development container
└── Configuration files    # Next.js, TypeScript, ESLint, etc.
```

## 🚦 Development Workflow

### Docker Commands

```bash
# Start development environment
./scripts/docker-dev.sh

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment
docker-compose -f docker-compose.dev.yml down

# Restart just the app
docker-compose -f docker-compose.dev.yml restart app
```

### Testing

```bash
# Run all tests
pnpm test

# Unit tests only
pnpm test:unit

# E2E tests
pnpm test:e2e

# Test with coverage
pnpm test:coverage

# Type checking
pnpm type-check
```

### Code Quality

```bash
# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format

# Pre-commit checks (runs automatically)
pnpm pre-commit
```

### Database Management (Future)

```bash
# Generate types from database
pnpm supabase:types

# Run migrations
pnpm supabase:migrate

# Reset database
pnpm supabase:reset
```

## 📊 Performance Targets

- **Page Load**: < 3 seconds (LCP)
- **API Response**: < 500ms (p95)
- **Portfolio Generation**: < 30 seconds
- **Uptime**: 99.9%

## 🔐 Security

- All data encrypted at rest (AES-256)
- TLS 1.3 for all connections
- OAuth 2.0 for social logins
- Rate limiting on all API endpoints
- GDPR compliant data handling

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is proprietary software. All rights reserved.

## 📚 Documentation

For detailed technical documentation, see the [`docs/`](./docs/) directory:

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical architecture
- **[Contributing](./docs/CONTRIBUTING.md)** - Development setup and contribution guidelines
- **[Docker Setup](./docs/DOCKER.md)** - Containerized development and production setup
- **[Deployment](./docs/DEPLOYMENT.md)** - Deployment guides and infrastructure
- **[Git Workflow](./docs/GIT_WORKFLOW.md)** - Branching strategy and development workflow
- **[AI Guidelines](./CLAUDE.md)** - AI development context and best practices

## 🆘 Support

- Documentation: [docs.madfam.io](https://docs.madfam.io)
- Email: support@madfam.io
- Discord: [Join our community](https://discord.gg/madfam)

## 🎯 Development Roadmap

### ✅ Foundation Complete (Current)

- [x] Project setup and documentation
- [x] Technology stack alignment
- [x] Docker development environment
- [x] Next.js 14 application foundation
- [x] **Multilanguage support (Spanish/English)**
- [x] **Professional landing page**
- [x] **Responsive design with dark mode**
- [x] **Component-based architecture**
- [x] **Test-driven development setup**
- [x] **CI/CD pipeline foundation**

### 🚀 Next Phase - Core SaaS Features

- [ ] Authentication system (Supabase Auth)
- [ ] Database schema and migrations
- [ ] User dashboard and onboarding
- [ ] Profile import (LinkedIn, GitHub, CV upload)
- [ ] AI content generation pipeline (OpenAI/Claude)
- [ ] Portfolio template system
- [ ] Portfolio editor interface
- [ ] Publishing and deployment pipeline
- [ ] Payment integration (Stripe)

### 📈 Growth Phase

- [ ] Custom domains and white-label
- [ ] Analytics dashboard and SEO tools
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] API marketplace and integrations
- [ ] Advanced AI features and personalization

### 🌍 Scale Phase

- [ ] Multi-region deployment
- [ ] Enterprise features and SSO
- [ ] Performance optimization
- [ ] Additional language support
- [ ] Marketplace for templates and plugins

---

Built with ❤️ by the MADFAM team
