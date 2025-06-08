# CLAUDE.md - AI Development Context

This document provides essential context for AI assistants working on the MADFAM AI Portfolio Builder project.

## 🎯 Project Overview

**Product**: AI-powered SaaS platform for creating professional portfolios
**Mission**: Enable professionals to create stunning portfolios in under 30 minutes
**Target Users**: Freelancers, consultants, designers, developers, creative professionals

## 🏗️ Current Development Phase

**Phase**: Foundation Development - Landing Page Complete ✅
**Sprint**: Ready for Core SaaS Features Implementation  
**Priority**: Authentication system, database setup, and user onboarding
**Status**: Multilanguage landing page implemented, Docker environment configured, component architecture established

### ✅ Completed Features

- **Multilanguage Support**: Spanish (default) and English with seamless switching
- **Professional Landing Page**: Fully responsive with dark mode support
- **Docker Development Environment**: Complete containerized setup
- **Component Architecture**: Modular, reusable components
- **Testing Infrastructure**: Unit tests, E2E tests, and CI/CD foundation

## 📋 Key Development Commands

### 🐳 Docker Development (Recommended)

```bash
# Start complete development environment
./scripts/docker-dev.sh

# Docker management
docker-compose -f docker-compose.dev.yml logs -f    # View logs
docker-compose -f docker-compose.dev.yml down       # Stop environment
docker-compose -f docker-compose.dev.yml restart app # Restart app only

# Access URLs:
# 🌐 App: http://localhost:3000 (with multilanguage support)
# 🗄️ pgAdmin: http://localhost:5050 (admin@madfam.io / admin)
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

# Database (Future)
pnpm supabase:migrate      # Run migrations
pnpm supabase:types        # Generate TypeScript types
pnpm supabase:reset        # Reset database

# Testing
pnpm test:unit             # Unit tests only
pnpm test:e2e              # E2E tests
pnpm test:watch            # Watch mode
```

## 🔑 Critical Implementation Details

### AI Content Generation

1. **Bio Enhancement Pipeline**

   - Use GPT-4 for bio rewriting
   - Max 150 words output
   - Focus on value proposition and achievements
   - Professional tone by default

2. **Project Description Enhancement**

   - Extract key outcomes and metrics
   - Use STAR format (Situation, Task, Action, Result)
   - Highlight technologies and skills
   - Keep under 100 words per project

3. **Template Recommendation**
   - Analyze industry and content type
   - Consider visual vs text-heavy portfolios
   - Match template style to professional tone

### Performance Requirements

- Portfolio generation: < 30 seconds total
- AI processing: < 5 seconds per request
- Page load: < 3 seconds
- API response: < 500ms (p95)

### Security Considerations

1. **API Keys**: Never commit to repository
2. **User Data**: Encrypt PII at rest
3. **AI Content**: Filter for inappropriate content
4. **Rate Limiting**: Implement on all endpoints

## 🚨 Common Pitfalls to Avoid

1. **Over-engineering**: Start simple, iterate based on user feedback
2. **AI Dependency**: Always have fallbacks for AI failures
3. **Long Setup**: Keep onboarding under 30 minutes
4. **Complex UI**: Prioritize simplicity over features

## 📁 Code Organization Patterns

### Current Component Structure (Landing Page)

```typescript
// components/landing/Header.tsx
'use client'; // Required for client-side hooks

import { useLanguage } from '@/lib/i18n/simple-context';

export default function Header() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header>
      <button onClick={() => setLanguage('en')}>
        {t.features}
      </button>
    </header>
  );
}
```

### Internationalization Pattern

```typescript
// lib/i18n/simple-context.tsx
'use client';

const translations = {
  es: { heroTitle: 'Convierte tu CV en un' },
  en: { heroTitle: 'Turn Your CV Into a' },
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context || { t: translations.es, language: 'es' };
};
```

### Future Component Structure (SaaS Phase)

```typescript
// components/Button/Button.tsx
export interface ButtonProps {
  // Props interface
}

export function Button(props: ButtonProps) {
  // Component implementation
}

// components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### API Route Pattern

```typescript
// app/api/portfolios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { portfolioSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Validate input
    const body = await request.json();
    const validated = portfolioSchema.parse(body);

    // 3. Process request
    const result = await createPortfolio(user.id, validated);

    // 4. Return response
    return NextResponse.json(result);
  } catch (error) {
    // Error handling
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

### Custom Hook Pattern

```typescript
// hooks/usePortfolio.ts
export function usePortfolio(portfolioId: string) {
  const [data, setData] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Implementation
  }, [portfolioId]);

  return { data, loading, error };
}
```

## 🧪 Testing Guidelines

### Unit Test Example

```typescript
describe('enhanceBio', () => {
  it('should enhance bio with professional tone', async () => {
    const input = 'I make websites';
    const result = await enhanceBio(input, 'professional', 'tech');

    expect(result).toContain('develop');
    expect(result.length).toBeLessThan(150);
  });
});
```

### Integration Test Example

```typescript
describe('Portfolio API', () => {
  it('should create portfolio for authenticated user', async () => {
    const response = await fetch('/api/portfolios', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPortfolioData),
    });

    expect(response.status).toBe(201);
  });
});
```

## 🔄 Git Workflow

1. Always create feature branches from `main`
2. Use conventional commits
3. Run tests before pushing
4. Keep PRs focused and small
5. Update documentation with code changes

## 📊 Key Metrics to Track

- **Technical**: Response times, error rates, uptime
- **Business**: Signup rate, portfolio completion rate, time to publish
- **User**: NPS score, feature usage, retention rate

## 🆘 When You Need Help

1. Check existing documentation in `/docs`
2. Review similar implementations in codebase
3. Look for patterns in `ARCHITECTURE.md`
4. Follow conventions in `CONTRIBUTING.md`

## 🚀 Development Roadmap

### ✅ Foundation Complete (Current)

- [x] **Multilanguage Landing Page**: Spanish (default) + English with language toggle
- [x] **Component Architecture**: Modular landing page components
- [x] **Docker Development Setup**: PostgreSQL + Redis + pgAdmin
- [x] **Testing Infrastructure**: Unit tests, E2E tests, CI/CD foundation
- [x] **i18n System**: React Context with TypeScript support
- [x] **Responsive Design**: Mobile-first with dark mode support

### 🎯 Next Sprint - Core SaaS Features

- [ ] User authentication (Supabase Auth + OAuth)
- [ ] Database schema and migrations
- [ ] User dashboard and onboarding flow
- [ ] Profile import (LinkedIn/GitHub/CV upload)
- [ ] AI bio enhancement pipeline
- [ ] Template selection system
- [ ] Portfolio editor interface
- [ ] Publishing and deployment pipeline
- [ ] Stripe payment integration

### 🔮 Future Phases

- [ ] Custom domains and white-label features
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] API marketplace and integrations

## 💡 Development Tips

1. **Use TypeScript strictly**: Enable all strict checks
2. **Optimize for mobile**: Test on mobile devices regularly
3. **Cache aggressively**: Use Redis for expensive operations
4. **Log everything**: Structured logging for debugging
5. **Feature flag new features**: Use environment variables

## 🔐 Environment Variables

### Current Development (Optional)

For basic landing page development, no environment variables are required.

### Future SaaS Features

Required when implementing core features:

```env
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services (Content Generation)
OPENAI_API_KEY=
ANTHROPIC_API_KEY= # Optional, for Claude

# OAuth (Social Login)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (Payments)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Redis (Caching)
REDIS_URL=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Docker Environment

The Docker setup includes PostgreSQL and Redis containers, so external services are only needed for production features.

## 📈 Performance Budgets

- JavaScript bundle: < 200KB (gzipped)
- CSS bundle: < 50KB (gzipped)
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

Remember: The goal is to create a delightful user experience that converts visitors into paying customers while maintaining code quality and performance.
