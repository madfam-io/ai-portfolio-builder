# MADFAM AI Portfolio Builder

> Transform your professional profiles into stunning portfolio websites in under 30 minutes using AI-powered content generation.

## 🚀 Overview

MADFAM AI Portfolio Builder is a SaaS platform that automates portfolio creation for freelancers, consultants, and creative professionals. By connecting LinkedIn, GitHub, and uploading CVs, users get a professionally designed portfolio website with AI-enhanced content.

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

4. Configure your `.env.local` with required API keys:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# OAuth Providers
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Redis
REDIS_URL=your_redis_url
```

5. Run database migrations:
```bash
pnpm supabase:migrate
```

6. Start the development server:
```bash
pnpm dev
```

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
└── supabase/            # Database migrations & schemas
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

## 🆘 Support

- Documentation: [docs.madfam.io](https://docs.madfam.io)
- Email: support@madfam.io
- Discord: [Join our community](https://discord.gg/madfam)

## 🎯 Roadmap

### MVP (Month 1)
- [x] Project setup and documentation
- [ ] Authentication system
- [ ] Profile import (LinkedIn, GitHub)
- [ ] AI content generation
- [ ] Template system
- [ ] Publishing pipeline

### Phase 2 (Month 2-3)
- [ ] Custom domains
- [ ] Analytics dashboard
- [ ] Team collaboration
- [ ] Mobile app
- [ ] API marketplace

### Phase 3 (Month 4-6)
- [ ] White-label solution
- [ ] Advanced AI features
- [ ] International expansion
- [ ] Enterprise features

---

Built with ❤️ by the MADFAM team