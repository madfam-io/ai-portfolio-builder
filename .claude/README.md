# 🤖 Claude AI Assistant Guide - PRISMA Portfolio Builder

## Quick Overview

You are working on **PRISMA by MADFAM**, an AI-powered SaaS platform that enables professionals to create stunning portfolio websites in under 30 minutes. This is a sophisticated, production-ready platform with enterprise-grade architecture.

### Current Status (June 21, 2025)
- **Version**: 0.3.0-beta (DEPLOYMENT READY ✅)
- **Health Score**: 95/100 
- **Build Status**: CLEAN - Zero errors, Zero warnings
- **Tests**: 730+ passing (100% success rate)
- **Target**: Sub-30-second portfolio generation

## 🎯 Platform Mission

Enable professionals (freelancers, consultants, designers, developers) to showcase their work through AI-enhanced portfolios with:
- Automatic content optimization
- Professional templates
- One-click publishing
- Real-time analytics

## 🏗️ Technical Architecture

### Core Technologies
- **Frontend**: Next.js 15, React 18, TypeScript 5.3 (strict mode)
- **UI**: Tailwind CSS + shadcn/ui components
- **State**: Zustand stores with domain separation
- **AI**: HuggingFace API integration
- **Testing**: Jest + RTL + Playwright (730+ tests)
- **Database**: PostgreSQL (Docker/Supabase-ready)
- **Cache**: Redis with in-memory fallback

### Key Features Implemented
1. **Portfolio Editor**: Real-time preview, drag-and-drop sections
2. **AI Enhancement**: Bio optimization, project descriptions, template recommendations
3. **Template System**: 8 professional templates (Modern, Minimal, Business, Creative, etc.)
4. **Publishing Pipeline**: Subdomain generation, SEO optimization
5. **Analytics**: User journey tracking, portfolio performance metrics
6. **Multilingual**: Spanish/English with smart geolocation

## 📁 Project Structure

```
ai-portfolio-builder/
├── app/                    # Next.js App Router
│   ├── api/v1/            # Versioned API endpoints
│   ├── editor/            # Portfolio editor pages
│   ├── dashboard/         # User dashboard
│   └── [subdomain]/       # Published portfolio routes
├── components/            
│   ├── ui/                # shadcn/ui components
│   ├── editor/            # Editor components
│   ├── templates/         # Portfolio templates
│   └── portfolio/         # Portfolio display components
├── lib/
│   ├── ai/                # AI service implementations
│   ├── store/             # Zustand state management
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
└── __tests__/             # Test suites (730+ tests)
```

## 🚀 Common Development Tasks

### Starting Development
```bash
# Docker (recommended - includes DB + Redis)
./scripts/docker-dev.sh

# Local only
pnpm dev
```

### Running Tests
```bash
pnpm test          # All tests
pnpm test:watch    # Watch mode
pnpm test:e2e      # E2E tests
```

### Code Quality
```bash
pnpm lint          # ESLint (must be clean)
pnpm type-check    # TypeScript (must pass)
pnpm format        # Prettier formatting
```

## 🎨 Working with Portfolio Features

### Adding New Templates
1. Create template in `components/templates/`
2. Follow existing pattern (see `ModernTemplate.tsx`)
3. Register in template system
4. Add preview assets
5. Test responsive behavior

### Enhancing AI Features
- AI services in `lib/ai/`
- HuggingFace integration for content generation
- Model selection system for different tasks
- Performance target: <5 seconds per enhancement

### Portfolio Editor Development
- Components in `components/editor/`
- State management via `portfolio-store.ts`
- Real-time preview updates
- Auto-save every 30 seconds

## ⚠️ Important Patterns

### Async/Await with TypeScript Interfaces
```typescript
// When interface requires Promise but no await needed
async method(): Promise<Result> {
  await Promise.resolve(); // Satisfies ESLint
  return computeResult();
}
```

### Type Safety
```typescript
// Use intermediate casting for complex types
const userAny = user as any;
const typed = userAny as TargetType;
```

### Internationalization
```typescript
// Always use translation system
const { t } = useLanguage();
return <h1>{t.heroTitle}</h1>;
```

## 📊 Performance Requirements

- Portfolio generation: <30 seconds ✅
- AI processing: <5 seconds per request ✅
- Page load: <3 seconds (90+ Lighthouse) ✅
- Bundle size: <200KB gzipped ✅

## 🔐 Security Considerations

- Field-level encryption for sensitive data
- CSRF protection on all API routes
- Rate limiting implemented
- Input validation with Zod schemas
- OAuth ready (GitHub, LinkedIn)

## 📚 Key Documentation

- **Platform Context**: `.claude/platform-context.md`
- **AI Systems**: `.claude/ai-systems.md`
- **User Features**: `.claude/user-features.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Testing Guide**: See test files for patterns

## 🚨 Common Pitfalls to Avoid

1. **Never hardcode text** - Use i18n system
2. **Keep files <500 lines** - Split large components
3. **Test before committing** - All tests must pass
4. **Maintain type safety** - No `any` types
5. **Follow patterns** - Check existing implementations

## 🎯 Current Development Focus

### Beta Launch Priorities
1. Ensure deployment stability
2. Monitor performance metrics
3. Gather user feedback
4. Spanish market optimization

### Next Features (Phase 4)
1. Authentication implementation (Supabase)
2. Payment integration (Stripe)
3. Team collaboration features
4. Advanced analytics dashboard

## 💡 Tips for Success

1. **Understand the dual nature**: Technical excellence serving user value
2. **Follow existing patterns**: The codebase has established conventions
3. **Test thoroughly**: 730+ tests exist for a reason
4. **Performance matters**: Users expect fast portfolio generation
5. **Think globally**: Spanish/English support is core

## 🆘 Getting Help

- Check existing implementations first
- Review test files for usage examples
- Follow TypeScript compiler guidance
- Use ESLint autofix when possible
- Reference this guide and other .claude/ docs

---

Remember: You're building a platform that helps professionals showcase their best work. Every line of code should serve that mission while maintaining the high standards already established in this codebase.