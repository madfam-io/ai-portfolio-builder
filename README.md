# MADFAM AI Portfolio Builder

> Transform your professional profiles into stunning portfolio websites in under 30 minutes using AI-powered content generation.

## 🚀 Overview

MADFAM AI Portfolio Builder is a SaaS platform that automates portfolio creation for freelancers, consultants, and creative professionals. By connecting LinkedIn, GitHub, and uploading CVs, users get a professionally designed portfolio website with AI-enhanced content.

> **Current Status**: Foundation Complete (v0.1.0) - Multilanguage landing page deployed, Docker environment configured, authentication and database implementation in progress.

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
- **State Management**: React Context (Zustand planned)
- **Forms**: React Hook Form + Zod (planned)
- **Animation**: Framer Motion (planned)

### Backend (Planned)

- **Database**: PostgreSQL (via Docker for dev, Supabase for production)
- **Authentication**: Supabase Auth + OAuth 2.0
- **AI Services**: OpenAI GPT-4, Claude API
- **File Storage**: Supabase Storage
- **Cache**: Redis (local for dev, Upstash for production)

### Infrastructure

- **Development**: Docker Compose (PostgreSQL, Redis, pgAdmin)
- **Hosting**: Vercel (Next.js optimized, NOT compatible with GitHub Pages)
- **CDN**: Cloudflare (planned)
- **Monitoring**: Sentry (planned)
- **Analytics**: PostHog (planned)
- **Payments**: Stripe (planned)

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
git clone https://github.com/madfam-io/ai-portfolio-builder.git
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
git clone https://github.com/madfam-io/ai-portfolio-builder.git
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

### Database Management

```bash
# With Docker (current)
docker-compose -f docker-compose.dev.yml exec db psql -U postgres

# Future Supabase commands
# pnpm supabase:types     # Generate types from database
# pnpm supabase:migrate   # Run migrations
# pnpm supabase:reset     # Reset database
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
- **[Roadmap](./docs/ROADMAP.md)** - Development roadmap and feature planning
- **[Issues](./docs/ISSUES.md)** - Active issues, bugs, and task tracking
- **[AI Guidelines](./CLAUDE.md)** - AI development context and best practices

## 🆘 Support

- **Documentation**: See [`docs/`](./docs/) directory
- **Issues**: Report bugs in [ISSUES.md](./docs/ISSUES.md) or GitHub Issues
- **Email**: hello@madfam.io
- **GitHub**: [madfam-io/ai-portfolio-builder](https://github.com/madfam-io/ai-portfolio-builder)

## 🎯 Development Progress

### Current Status

**Version**: 0.1.0 - Foundation Release  
**Phase**: Core SaaS Features Development  
**Focus**: Authentication & Database Setup

### Key Achievements

- ✅ **Multilanguage Support**: Full Spanish/English implementation
- ✅ **Professional Landing Page**: Responsive design with dark mode
- ✅ **Development Environment**: Docker setup with PostgreSQL & Redis
- ✅ **Testing Infrastructure**: Jest, Playwright, and CI/CD pipeline
- ✅ **Component Architecture**: Modular, reusable components

### 🚧 Currently In Progress

- Authentication system implementation (Supabase Auth)
- Database schema design and migrations
- User dashboard and onboarding flow
- Fixing test suite issues (see [ISSUES.md](./docs/ISSUES.md))

### 📋 Development Resources

For detailed development planning and tracking:

- **[Development Roadmap](./docs/ROADMAP.md)** - Complete feature roadmap through 2025
- **[Active Issues](./docs/ISSUES.md)** - Current bugs, tasks, and feature requests
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to get involved

### 🎯 Project Goals

1. **30-Minute Portfolio Creation**: From signup to published site
2. **AI-Powered Content**: Enhance bios and project descriptions automatically
3. **Professional Templates**: Industry-specific designs with smart recommendations
4. **Seamless Integration**: Import from LinkedIn, GitHub, and CV uploads
5. **Custom Domains**: Professional URLs for every portfolio

---

Built with ❤️ by the MADFAM team
