# CLAUDE.md - AI Development Context

This document provides essential context for AI assistants working on the PRISMA by MADFAM AI Portfolio Builder project.

**Last Updated**: June 15, 2025  
**Version**: v0.3.0-beta  
**Repository Started**: June 2025

## 🎯 Project Overview

**Product**: AI-powered SaaS platform for creating professional portfolios
**Mission**: Enable professionals to create stunning portfolios in under 30 minutes
**Target Users**: Freelancers, consultants, designers, developers, creative professionals

## 🏗️ Current Development Phase

**Phase**: Phase 3 - Core SaaS Features (In Progress) 🚀  
**Status**: 85/100 Codebase Health Score  
**Priority**: Building portfolio editor, publishing system, and full SaaS functionality  
**As of**: June 15, 2025

### ✅ Completed Achievements

- **95/100 Architecture Score**: Enterprise patterns with minor cleanup needed
- **Test Infrastructure**: 40+ test suites, coverage growing
- **40% Bundle Size Reduction**: Through code splitting and lazy loading
- **shadcn/ui Migration**: In progress, dual component system
- **API Versioning**: Full /api/v1/ structure with middleware
- **Zustand State Management**: Global stores with persistence
- **Redis Caching**: Advanced caching with in-memory fallback
- **TypeScript Strict Mode**: 100% type safety
- **PostHog Analytics**: Integration ready for activation
- **Portfolio Variants**: A/B testing system implemented

## 📋 Key Development Commands

### 🐳 Docker Development (Recommended)

```bash
# Start complete development environment
./scripts/docker-dev.sh

# Access URLs:
# 🌐 App: http://localhost:3000
# 🗄️ pgAdmin: http://localhost:5050 (admin@prisma.io / admin)
# 📊 Database: localhost:5432
# 🔴 Redis: localhost:6379
```

### 💻 Local Development

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm test                   # Run all tests
pnpm lint                   # Lint code
pnpm format                 # Format code
pnpm type-check            # TypeScript validation

# Testing
pnpm test:unit             # Unit tests only
pnpm test:e2e              # E2E tests
pnpm test:watch            # Watch mode
```

## 🚀 Current Codebase Status

### Health Metrics

- **Overall Score**: 85/100 (B+)
- **Architecture**: 95/100 ✅
- **Code Quality**: 90/100 ✅
- **Testing**: 25/100 🚧
- **Performance**: 85/100 ✅
- **Documentation**: 70/100 🔄

### Technical Stack

- **Frontend**: Next.js 15, React 18, TypeScript 5.3 (strict)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: Zustand stores with domain separation
- **API**: RESTful /api/v1/ with versioning
- **Database**: PostgreSQL (Docker local, Supabase-ready)
- **Cache**: Redis with in-memory fallback
- **Testing**: Jest, RTL, Playwright (40+ test suites)

## 🔑 Critical Implementation Details

### AI Content Generation ✅ UNIFIED HUGGINGFACE ARCHITECTURE

**Single Connection Strategy**: All AI capabilities through HuggingFace Inference API with dynamic model selection

1. **Bio Enhancement Pipeline**

   - User selects from multiple models (Llama 3.1, Phi-3.5, Mistral)
   - Max 150 words with quality scoring
   - Professional tone optimization

2. **Project Description Enhancement**

   - STAR format (Situation, Task, Action, Result)
   - Extract metrics and achievements
   - 50-150 words per project

3. **Template Recommendation**
   - Industry and experience analysis
   - Visual vs text-heavy matching
   - Confidence scoring

### Performance Requirements

- Portfolio generation: < 30 seconds total
- AI processing: < 5 seconds per request
- Page load: < 3 seconds
- API response: < 500ms (p95)

## 🏗️ Architecture Patterns

### API Structure (v1 Versioning)

```
app/api/v1/
├── portfolios/          # Portfolio CRUD
├── ai/                  # AI services
│   ├── enhance-bio/
│   ├── optimize-project/
│   └── recommend-template/
└── analytics/           # Analytics endpoints
```

### Component Structure (shadcn/ui + Atomic)

```
components/ui/
├── [shadcn components]  # Design system
├── atoms/              # Legacy (aliased)
├── molecules/          # Composite components
└── organisms/          # Complex features
```

### State Management

```
lib/store/
├── auth-store.ts       # Authentication
├── portfolio-store.ts  # Portfolio CRUD
├── ui-store.ts        # UI state
└── ai-store.ts        # AI preferences
```

## 🚨 Common Pitfalls to Avoid

1. **Over-engineering**: Start simple, iterate based on feedback
2. **AI Dependency**: Always have fallbacks for AI failures
3. **Long Setup**: Keep onboarding under 30 minutes
4. **Complex UI**: Prioritize simplicity over features
5. **Large Files**: Keep files under 500 lines
6. **Translation**: Use modular i18n system
7. **Type Safety**: Always use TypeScript interfaces
8. **Test Coverage**: Write tests before features

## 📊 Key Metrics to Track

- **Technical**: Response times, error rates, uptime
- **Business**: Signup rate, portfolio completion rate, time to publish
- **User**: NPS score, feature usage, retention rate

## 🎯 Next Development Phase

### Phase 3: Core SaaS Features (In Progress - June 2025)

**Priority 1: Portfolio Builder Interface**

- Portfolio editor with real-time preview
- Template system expansion
- Subdomain system implementation

**Priority 2: Authentication & Database**

- Supabase Auth integration
- User management system
- Portfolio data persistence

**Priority 3: Publishing Pipeline**

- Subdomain generation
- CDN deployment
- SEO optimization

**Priority 4: Payments**

- Stripe integration
- Subscription management
- Billing dashboard

## 🔐 Environment Variables

### Development (Optional)

Basic features work without environment variables.

### Production Features (Required)

```env
# Supabase (Future)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
HUGGINGFACE_API_KEY=

# OAuth (Future)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (Future)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Redis
REDIS_URL=
```

## 🌍 Multilingual Requirements

**CRITICAL**: All user-facing content must support Spanish (default) and English.

### Implementation Pattern

```typescript
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function Component() {
  const { t } = useLanguage();
  return <h1>{t.welcomeMessage}</h1>;
}
```

### Translation Organization

```
lib/i18n/translations/
├── es/              # Spanish (default)
│   ├── common.ts
│   ├── landing.ts
│   └── ...
└── en/              # English
    ├── common.ts
    ├── landing.ts
    └── ...
```

## 📈 Performance Budgets

- JavaScript bundle: < 200KB (gzipped)
- CSS bundle: < 50KB (gzipped)
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## 🔄 Git Workflow

1. Create feature branches from `main`
2. Use conventional commits
3. Run tests before pushing
4. Keep PRs focused and small
5. Update documentation with code

## 🆘 Support & Documentation

- **Documentation Hub**: `/docs/` directory
- **Health Report**: `CODEBASE_HEALTH.md`
- **Roadmap**: `docs/ROADMAP.md`
- **API Reference**: `docs/API_REFERENCE.md`

Remember: The goal is to create a delightful user experience that converts visitors into paying customers while maintaining code quality and performance.

**Document Status**: Active development guide  
**Last Review**: June 15, 2025

---

# Important Development Guidelines

## Code Organization

- Keep files under 500 lines for optimal AI IDE performance
- Use modular architecture with clear separation of concerns
- Follow established patterns in the codebase
- Write comprehensive JSDoc comments for public APIs

## Component Development Guidelines

### shadcn/ui Integration Patterns

- **Use shadcn components first**: Always prefer shadcn/ui components for new features
- **Enhance, don't replace**: Add functionality while preserving design
- **Maintain backward compatibility**: Use migration aliases
- **Follow variant patterns**: Use class-variance-authority (CVA)
- **TypeScript interfaces**: Extend shadcn component props

## Testing Requirements

- Write tests before implementing features (TDD approach)
- Maintain 90%+ test coverage for critical paths
- Use established test utilities in `__tests__/utils/`
- Run tests before committing: `pnpm test`

## Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP guidelines for web security

# Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
ALWAYS use the modular i18n system for translations - never hardcode text.
ALWAYS run type checking before committing: `pnpm type-check`
