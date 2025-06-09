# CLAUDE.md - AI Development Context

This document provides essential context for AI assistants working on the PRISMA by MADFAM AI Portfolio Builder project.

## 🎯 Project Overview

**Product**: AI-powered SaaS platform for creating professional portfolios
**Mission**: Enable professionals to create stunning portfolios in under 30 minutes
**Target Users**: Freelancers, consultants, designers, developers, creative professionals

## 🏗️ Current Development Phase

**Phase**: PRISMA Foundation Complete - v0.0.1-alpha ✅
**Sprint**: Portfolio Builder & AI Integration  
**Priority**: Editor interface, AI content enhancement, template system
**Status**: Complete PRISMA-branded platform with geolocation detection, enhanced authentication, and comprehensive testing

### ✅ Completed Features

- **PRISMA Rebrand Complete**: Updated brand identity, logos, and messaging throughout platform
- **Intelligent Geolocation Detection**: Automatic language/currency selection based on user location
- **Enhanced Authentication System**: Supabase Auth with 12-character password requirements and OAuth
- **Professional Landing Page**: Fully responsive PRISMA-branded interface with dark mode
- **Smart Flag System**: Mexican flag (🇲🇽) for Spanish, US flag (🇺🇸) for English based on geolocation
- **Multi-Currency Support**: Automatic currency detection (MXN/USD/EUR) with localized pricing
- **Docker Development Environment**: Complete containerized setup with PostgreSQL, Redis, and pgAdmin
- **Component Architecture**: Modular, reusable components with TypeScript and comprehensive testing
- **Updated Testing Suite**: Jest unit tests, React Testing Library, and Playwright E2E tests updated for PRISMA

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
# 🌐 App: http://localhost:3000 (with geolocation-based language detection)
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

### AI Content Generation ✅ UNIFIED HUGGINGFACE ARCHITECTURE

**Single Connection Strategy**: All AI capabilities through HuggingFace Inference API with dynamic model selection

1. **Bio Enhancement Pipeline** ✅ IMPLEMENTED

   - **User Choice**: Select from Llama 3.1 8B Instruct, Phi-3.5 Mini, Mistral 7B v0.3
   - **Auto-Default**: Automatically uses highest quality/cost ratio model (currently Llama 3.1 8B)
   - **Live Updates**: Real-time model availability and performance metrics
   - Max 150 words output with multi-dimensional quality scoring
   - Focus on value proposition and quantifiable achievements
   - Professional tone by default with customizable options
   - Mock responses available for development without API keys

2. **Project Description Enhancement** ✅ IMPLEMENTED

   - **User Choice**: Select from Phi-3.5 Mini (recommended), DeepSeek Coder 6.7B, Llama 3.1 8B
   - **Best Value Default**: Phi-3.5 Mini Instruct for optimal speed/quality balance
   - **Model Switching**: Easy switching between models for comparison
   - Extract key outcomes, metrics, and achievements automatically
   - Use STAR format (Situation, Task, Action, Result) structure
   - Highlight technologies and quantifiable business impact
   - Intelligent length optimization (50-150 words per project)

3. **Template Recommendation** ✅ IMPLEMENTED

   - **User Choice**: Select from Llama 3.1 8B Instruct (recommended), Mistral 7B v0.3
   - **Live Model Updates**: Access to latest open-source models as they become available
   - **Performance Tracking**: Cost per request, response time, quality metrics
   - Analyze industry, content type, and professional experience level
   - Consider visual vs text-heavy portfolios based on skill set
   - Match template style to professional tone and target audience
   - Provide alternative recommendations with confidence scoring

4. **Model Selection Interface** ✅ IMPLEMENTED
   - **Per-Task Selection**: Different models can be selected for bio, project, template tasks
   - **Real-Time Metrics**: Display cost, speed, and quality ratings for each model
   - **User Preferences**: Save and persist model selections across sessions
   - **Automatic Fallback**: Graceful degradation to backup models if primary unavailable

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

### ✅ Phase 1: PRISMA Foundation Platform - COMPLETE (v0.0.1-alpha)

- [x] **PRISMA Rebrand Complete**: Updated brand identity, logos, and messaging throughout platform
- [x] **Intelligent Geolocation Detection**: Automatic language/currency selection based on user location with fallbacks
- [x] **Enhanced Authentication System**: Supabase Auth with 12-character password requirements and OAuth (LinkedIn, GitHub)
- [x] **Smart Flag System**: Mexican flag (🇲🇽) for Spanish, US flag (🇺🇸) for English based on geolocation
- [x] **Multi-Currency Support**: Automatic currency detection (MXN/USD/EUR) with localized pricing
- [x] **Professional Landing Page**: Fully responsive PRISMA-branded interface with dark mode
- [x] **Component Architecture**: Modular, reusable components with TypeScript and comprehensive testing
- [x] **Docker Development Setup**: PostgreSQL + Redis + pgAdmin containerized environment
- [x] **Updated Testing Suite**: Jest unit tests, React Testing Library, and Playwright E2E tests updated for PRISMA
- [x] **Geolocation Utils**: IP-based detection with timezone and browser language fallbacks
- [x] **Security Enhancements**: Password complexity validation and secure authentication flows
- [x] **Complete i18n System**: React Context with geolocation integration and TypeScript support
- [x] **Documentation Update**: All documentation updated for PRISMA brand and current features

### 🎯 Phase 2: Core SaaS Features - IN DEVELOPMENT (targeting v0.1.0-beta)

**Priority 1: Portfolio Builder Interface**

- [ ] Portfolio editor interface development
- [ ] Template system expansion (more industry-specific templates)
- [ ] Real-time preview functionality
- [ ] PRISMA subdomain system implementation

**Priority 2: AI Content Enhancement** ✅ COMPLETE

- [x] Unified HuggingFace AI integration with multi-model selection capabilities
- [x] Dynamic model selection with live updates and performance metrics
- [x] Bio enhancement with quality scoring and professional optimization
- [x] Project description optimization using STAR format with metrics extraction
- [x] Template recommendation based on user profile, industry, and experience analysis
- [x] Multi-dimensional content quality scoring and improvement suggestions
- [x] Mock development environment for seamless development experience

**Priority 3: Profile Import & Integration**

- [ ] LinkedIn profile import functionality
- [ ] GitHub repositories integration and portfolio generation
- [ ] CV/Resume PDF parsing with AI content extraction
- [ ] Social media profile integration

**Priority 4: Publishing & Deployment**

- [ ] PRISMA subdomain generation and management
- [ ] Custom domain connection system
- [ ] Portfolio publishing pipeline with CDN
- [ ] SEO optimization and meta tag generation

**Priority 5: Payment & Subscription**

- [ ] Stripe payment integration
- [ ] Subscription management
- [ ] Plan upgrade/downgrade flows
- [ ] Billing dashboard

### 🔮 Phase 3: Advanced Features (v0.2.0-beta and beyond)

- [ ] Custom domains and white-label options
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Portfolio performance tracking
- [ ] SEO optimization tools
- [ ] Social media integration

### 🌟 Phase 4: Scale & Expansion (v1.0.0-stable and beyond)

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
2. ✅ **AI content enhancement** integration complete (Unified HuggingFace with multi-model selection)
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
HUGGINGFACE_API_KEY=
# Note: Unified HuggingFace connection for all AI models with user selection

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
