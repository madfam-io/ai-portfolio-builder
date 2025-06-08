# MADFAM AI Portfolio Builder

> Transform your professional profiles into stunning portfolio websites in under 30 minutes using AI-powered content generation.

## 🚀 Overview

MADFAM AI Portfolio Builder is a SaaS platform that automates portfolio creation for freelancers, consultants, and creative professionals. By connecting LinkedIn, GitHub, and uploading CVs, users get a professionally designed portfolio website with AI-enhanced content.

> **Current Status**: Pre-MVP Development Phase - Technology foundation setup complete, ready for core application development.

### 🎯 Mission

Transform scattered professional profiles into stunning portfolio websites in under 30 minutes using AI-powered content generation.

### Key Features

- **30-Minute Setup**: From signup to published portfolio
- **AI Content Enhancement**: Automatic bio rewriting and project descriptions
- **Multi-Source Import**: LinkedIn, GitHub, CV/Resume integration
- **Smart Templates**: Industry-specific designs with AI recommendations
- **Custom Domains**: Professional subdomain or bring your own
- **Real-time Preview**: See changes instantly as you edit

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
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

- **Hosting**: Vercel (Next.js optimized, NOT compatible with GitHub Pages)
- **CDN**: Cloudflare
- **Monitoring**: Sentry
- **Analytics**: PostHog
- **Payments**: Stripe

> ⚠️ **Note**: This application requires server-side functionality and cannot be deployed to GitHub Pages. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options.

## 📦 Prerequisites

- Node.js 18.17.0 or higher
- pnpm 8.0.0 or higher
- Supabase account
- OpenAI API key
- Stripe account (for payments)

## 🔧 Installation

> **Note**: This application is currently in pre-MVP phase. The basic Next.js application structure is implemented and ready for development. Choose your preferred setup method:

1. Clone the repository:

```bash
git clone https://github.com/madfam/ai-portfolio-builder.git
cd ai-portfolio-builder
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with required API keys (see `.env.example` for all required variables):

```env
# Essential for development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up Supabase (when database is implemented):

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local development
supabase start

# Run migrations (when available)
pnpm supabase:migrate
```

6. Start the development server:

```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🐳 Docker Setup (Alternative)

For a containerized development environment with all dependencies:

```bash
# Quick start with Docker
pnpm docker:dev

# Or manually
cp .env.example .env.local
# Edit .env.local with your API keys
docker-compose -f docker-compose.dev.yml up -d

# Access:
# - App: http://localhost:3000
# - pgAdmin: http://localhost:5050
# - Database: localhost:5432
```

See [docs/DOCKER.md](./docs/DOCKER.md) for complete Docker setup guide.

## 🏗️ Project Structure

```
ai-portfolio-builder/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── editor/           # Portfolio editor components
│   └── templates/        # Portfolio templates
├── lib/                   # Utility functions
│   ├── ai/               # AI service integrations
│   ├── db/               # Database queries
│   └── auth/             # Authentication helpers
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── public/               # Static assets
├── supabase/             # Database migrations & schemas
├── __tests__/            # Test files and utilities
├── e2e/                  # End-to-end tests
├── scripts/              # Build and utility scripts
├── docs/                 # Project documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── CONTRIBUTING.md   # Contribution guidelines
│   ├── DEPLOYMENT.md     # Deployment guides
│   └── GIT_WORKFLOW.md   # Git workflow
├── .archive/             # Legacy and archived files
├── .husky/               # Git hooks
└── Configuration files   # Next.js, TypeScript, ESLint, etc.
```

## 🚦 Development Workflow

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check
```

### Code Quality

```bash
# Linting
pnpm lint

# Formatting
pnpm format

# Pre-commit checks
pnpm pre-commit
```

### Database Management

```bash
# Generate types from database
pnpm supabase:types

# Create new migration
pnpm supabase:migration create <migration_name>

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

## 🎯 Roadmap

### MVP (Month 1) - In Progress

- [x] Project setup and documentation
- [x] Technology stack alignment
- [x] Environment configuration
- [x] Next.js application foundation
- [x] Docker development setup
- [ ] Authentication system (Supabase Auth)
- [ ] Database schema and migrations
- [ ] Profile import (LinkedIn, GitHub)
- [ ] AI content generation pipeline
- [ ] Template system
- [ ] Portfolio editor interface
- [ ] Publishing pipeline
- [ ] Payment integration (Stripe)

### Phase 2 (Month 2-3)

- [ ] Custom domains
- [ ] Analytics dashboard
- [ ] Team collaboration
- [ ] Mobile app (React Native)
- [ ] API marketplace
- [ ] Advanced AI features

### Phase 3 (Month 4-6)

- [ ] White-label solution
- [ ] International expansion
- [ ] Enterprise features
- [ ] Performance optimization
- [ ] Multi-region deployment

---

Built with ❤️ by the MADFAM team
