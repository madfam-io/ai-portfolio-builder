# CLAUDE.md - AI Development Context

This document provides essential context for AI assistants working on the MADFAM AI Portfolio Builder project.

## 🎯 Project Overview

**Product**: AI-powered SaaS platform for creating professional portfolios
**Mission**: Enable professionals to create stunning portfolios in under 30 minutes
**Target Users**: Freelancers, consultants, designers, developers, creative professionals

## 🏗️ Current Development Phase

**Phase**: Pre-MVP Development
**Sprint**: Foundation Setup (Week 1 of 3)
**Priority**: Core infrastructure and authentication system

## 📋 Key Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm test                   # Run all tests
pnpm lint                   # Lint code
pnpm format                 # Format code
pnpm type-check            # TypeScript validation

# Database
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

### Component Structure
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
        'Authorization': `Bearer ${testToken}`,
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

## 🚀 MVP Checklist

- [ ] User authentication (email + OAuth)
- [ ] Profile import (LinkedIn/GitHub)
- [ ] AI bio enhancement
- [ ] Template selection
- [ ] Portfolio editor
- [ ] Publishing system
- [ ] Basic analytics
- [ ] Stripe integration

## 💡 Development Tips

1. **Use TypeScript strictly**: Enable all strict checks
2. **Optimize for mobile**: Test on mobile devices regularly
3. **Cache aggressively**: Use Redis for expensive operations
4. **Log everything**: Structured logging for debugging
5. **Feature flag new features**: Use environment variables

## 🔐 Environment Variables

Required for development:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY= # Optional, for Claude

# OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Redis
REDIS_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📈 Performance Budgets

- JavaScript bundle: < 200KB (gzipped)
- CSS bundle: < 50KB (gzipped)
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

Remember: The goal is to create a delightful user experience that converts visitors into paying customers while maintaining code quality and performance.