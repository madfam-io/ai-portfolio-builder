# CLAUDE.md - AI Development Context

This document provides essential context for AI assistants working on the MADFAM AI Portfolio Builder project.

## 🎯 Project Overview

**Product**: AI-powered SaaS platform for creating professional portfolios
**Mission**: Enable professionals to create stunning portfolios in under 30 minutes
**Target Users**: Freelancers, consultants, designers, developers, creative professionals

## 🏗️ Current Development Phase

**Phase**: Foundation Development - COMPLETE ✅
**Sprint**: Ready for Core SaaS Features Implementation  
**Priority**: Authentication system, database setup, and user onboarding
**Status**: Full multilingual platform with complete landing page, unified navigation, currency system, and comprehensive documentation

### ✅ Completed Features

- **Complete Multilingual Platform**: Spanish (default) and English with seamless switching across ALL pages
- **Professional Landing Page**: Fully responsive with dark mode support
- **Unified Navigation System**: Consistent header, footer, and navigation across all public pages
- **Dynamic Currency System**: MXN → USD → EUR rotation with real-time pricing display
- **Dark Mode Implementation**: Default dark theme with localStorage persistence
- **Docker Development Environment**: Complete containerized setup with PostgreSQL, Redis, and pgAdmin
- **Component Architecture**: Modular, reusable components with BaseLayout system
- **Testing Infrastructure**: Unit tests, E2E tests, and CI/CD foundation
- **Complete i18n Documentation**: Comprehensive multilingual development guidelines

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

### ✅ Phase 1: Foundation Platform - COMPLETE

- [x] **Complete Multilingual Landing Page**: Spanish (default) + English with full translation coverage
- [x] **Unified Navigation System**: Header, footer, and consistent navigation across all pages
- [x] **Dynamic Currency & Pricing**: MXN → USD → EUR rotation with real exchange rates
- [x] **Dark Mode System**: Default dark theme with localStorage persistence
- [x] **Component Architecture**: Modular, reusable components with BaseLayout pattern
- [x] **Docker Development Setup**: PostgreSQL + Redis + pgAdmin containerized environment
- [x] **Testing Infrastructure**: Unit tests, E2E tests, and CI/CD foundation
- [x] **Complete i18n System**: React Context with TypeScript and mandatory workflow
- [x] **Responsive Design**: Mobile-first with comprehensive dark mode support
- [x] **Professional Styling**: Modern CSS architecture with gradient effects and animations
- [x] **Public Pages Structure**: About, Dashboard, Editor pages with full multilingual support
- [x] **Development Documentation**: Comprehensive guidelines for multilingual development

### 🎯 Phase 2: Core SaaS Features - READY TO START

**Priority 1: Authentication & User Management**

- [ ] Supabase integration and configuration
- [ ] User authentication system (email/password + OAuth)
- [ ] User profile management
- [ ] Protected route middleware

**Priority 2: Portfolio Creation Engine**

- [ ] Database schema for portfolios, users, and templates
- [ ] Portfolio editor interface (functional)
- [ ] Template selection and customization system
- [ ] Real-time preview functionality

**Priority 3: AI Enhancement Pipeline**

- [ ] OpenAI/Claude API integration
- [ ] Bio enhancement algorithms
- [ ] Project description optimization
- [ ] Template recommendation engine

**Priority 4: Data Import & Export**

- [ ] LinkedIn profile import
- [ ] GitHub repositories integration
- [ ] CV/Resume PDF parsing
- [ ] Portfolio publishing and deployment

**Priority 5: Payment & Subscription**

- [ ] Stripe payment integration
- [ ] Subscription management
- [ ] Plan upgrade/downgrade flows
- [ ] Billing dashboard

### 🔮 Phase 3: Advanced Features

- [ ] Custom domains and white-label options
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Portfolio performance tracking
- [ ] SEO optimization tools
- [ ] Social media integration

### 🌟 Phase 4: Scale & Expansion

- [ ] Mobile app (React Native)
- [ ] API marketplace and integrations
- [ ] Enterprise features
- [ ] Multi-tenant architecture
- [ ] Advanced AI features

## 📋 Next Development Priorities

### Immediate Next Steps (Week 1-2)

1. **Set up Supabase project** and configure environment variables
2. **Implement authentication system** with email/password and Google OAuth
3. **Create user database schema** with proper relationships
4. **Build protected dashboard** with user session management

### Short Term Goals (Month 1)

1. **Functional portfolio editor** with basic template system
2. **AI bio enhancement** integration with OpenAI/Claude
3. **File upload system** for images and CV parsing
4. **Basic portfolio publishing** with unique URLs

### Medium Term Goals (Month 2-3)

1. **Complete template system** with customization options
2. **LinkedIn/GitHub integration** for automatic data import
3. **Stripe payment system** with subscription management
4. **Advanced editor features** with real-time collaboration

## 📊 Foundation Phase Metrics - COMPLETED

### Technical Achievements

- **Translation Keys**: 200+ translation keys covering all user-facing content
- **Components**: 25+ reusable components with consistent architecture
- **Pages**: 6 fully functional pages (Landing, About, Dashboard, Editor, etc.)
- **Test Coverage**: 141 total tests with 114+ passing after multilingual migration
- **Languages**: 2 fully supported languages (Spanish default, English)
- **Currencies**: 3 supported currencies (MXN, USD, EUR) with real-time conversion
- **CSS Architecture**: Modern utility-first approach with dark mode support

### User Experience Features

- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG-compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized bundle sizes and loading performance
- **Dark Mode**: System-wide dark theme with user preference persistence
- **Navigation**: Unified header/footer across all pages with smooth transitions
- **Currency Switching**: Dynamic pricing display with smooth currency rotation

### Development Infrastructure

- **Docker Environment**: Complete containerized development setup
- **Database Ready**: PostgreSQL and Redis containers configured
- **CI/CD Foundation**: Testing pipeline and pre-commit hooks
- **Documentation**: Comprehensive multilingual development guidelines
- **Git Workflow**: Conventional commits and feature branch workflow
- **TypeScript**: Strict typing throughout the codebase

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

## 🌍 Multilingual Development Requirements

**CRITICAL**: All user-facing content must support Spanish (default) and English. This SaaS is fully multilingual.

### Mandatory Multilingual Implementation

**Every component** that displays user-facing text must:

1. **Import the translation hook**:

   ```typescript
   import { useLanguage } from '@/lib/i18n/minimal-context';

   export default function MyComponent() {
     const { t } = useLanguage();
   ```

2. **Use translation keys** instead of hardcoded strings:

   ```typescript
   // ❌ Wrong - hardcoded English
   <h1>Welcome to Dashboard</h1>

   // ✅ Correct - translation key
   <h1>{t.welcomeToDashboard}</h1>
   ```

3. **Add translation keys** to both Spanish and English in `/lib/i18n/minimal-context.tsx`:
   ```typescript
   const translations = {
     es: {
       welcomeToDashboard: 'Bienvenido al Panel',
       // ... other Spanish translations
     },
     en: {
       welcomeToDashboard: 'Welcome to Dashboard',
       // ... other English translations
     },
   };
   ```

### Development Workflow

When implementing **ANY** new feature:

1. **Plan translations first** - identify all user-facing text
2. **Add translation keys** to the i18n system for both languages
3. **Implement components** using translation keys
4. **Test language switching** to ensure both languages work
5. **Never commit** hardcoded English or Spanish text

### Components That Need Multilingual Support

- **ALL pages** (`app/**/*.tsx`)
- **ALL landing components** (`components/landing/**/*.tsx`)
- **ALL shared components** (`components/shared/**/*.tsx`)
- **ALL UI components** (`components/ui/**/*.tsx`)
- **Error messages and alerts**
- **Form labels and placeholders**
- **Button text and tooltips**
- **Navigation items**

### Current Translation Coverage

✅ **Fully Translated**:

- Landing page (Hero, Features, How it Works, Templates, Pricing, Footer)
- Header navigation and tooltips
- About page
- Dashboard page
- Editor page
- Back to top button

### Translation Key Naming Convention

```typescript
// Page-specific translations
aboutTitle: 'About MADFAM.AI',
dashboardWelcome: 'Welcome to Dashboard',
editorSave: 'Save',

// Common actions
save: 'Save',
cancel: 'Cancel',
edit: 'Edit',
delete: 'Delete',

// Status and states
loading: 'Loading...',
error: 'Error',
success: 'Success',

// Navigation
home: 'Home',
features: 'Features',
pricing: 'Pricing',
```

### Debugging Multilingual Issues

1. **Check console** for missing translation keys
2. **Test language toggle** in browser
3. **Verify localStorage** language persistence
4. **Ensure LanguageProvider** wraps components
5. **Check default language** is Spanish (t.language === 'es')

### Pre-commit Checklist

Before any commit:

- [ ] No hardcoded English/Spanish text in user-facing components
- [ ] All new text has corresponding translation keys
- [ ] Both Spanish and English translations are complete
- [ ] Language toggle works on all new pages
- [ ] Default language is Spanish for first-time visitors

### Testing Multilingual Features

```typescript
// Test Spanish default
expect(component).toHaveTextContent('Comenzar Gratis');

// Test English toggle
fireEvent.click(languageToggle);
expect(component).toHaveTextContent('Get Started Free');
```

**Remember**: The user experience must be seamless in both languages. Spanish is the default and primary language.
