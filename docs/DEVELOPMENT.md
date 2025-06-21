# 🛠️ PRISMA Development Guide

[← Back to Documentation Hub](./README.md) | [↑ Back to Main README](../README.md)

---

Complete guide for developing, testing, and contributing to the PRISMA AI Portfolio Builder platform.

**Last Updated**: June 15, 2025  
**Version**: v0.4.0-beta

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Git Workflow](#git-workflow)
7. [Contributing](#contributing)
8. [Architecture Patterns](#architecture-patterns)
9. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17.0+ (recommended: use Docker instead)
- **Docker Desktop** (recommended approach)
- **Git** with conventional commits setup
- **pnpm** 8.0.0+ (for local development)

### One-Command Setup (Recommended)

```bash
# Clone repository
git clone https://github.com/aldoruizluna/ai-portfolio-builder.git
cd ai-portfolio-builder

# Start complete development environment
./scripts/docker-dev.sh

# Access the application
open http://localhost:3000
```

**What this gives you:**

- 🌐 Next.js app at `http://localhost:3000`
- 🗄️ PostgreSQL database at `localhost:5432`
- 🔴 Redis cache at `localhost:6379`
- 📊 pgAdmin interface at `http://localhost:5050`
- ✅ Hot reload and debugging enabled
- 🌍 Multilingual support (Spanish/English)

### Alternative: Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check
```

## 🔧 Environment Setup

### Docker Development (Recommended)

**Benefits:**

- Consistent environment across team
- No local database setup required
- Production parity
- Easy cleanup and reset

**Services Included:**

```yaml
Services:
  app: # Next.js development server
  postgres: # PostgreSQL 15 database
  redis: # Redis 7 cache
  pgadmin: # Database management UI
```

**Useful Commands:**

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart specific service
docker-compose -f docker-compose.dev.yml restart app

# Stop environment
docker-compose -f docker-compose.dev.yml down

# Reset with clean data
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Local Development Setup

**Environment Variables (Optional):**

```bash
# .env.local - Basic development works without these
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: AI Features
HUGGINGFACE_API_KEY=your_token_here

# Optional: GitHub Analytics
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Future: When implementing authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Package Scripts:**

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript validation

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI

# Docker
pnpm docker:dev       # Start Docker development environment
pnpm docker:prod      # Start Docker production environment
```

## 🔄 Development Workflow

### Daily Development Process

1. **Start Environment**

   ```bash
   ./scripts/docker-dev.sh
   ```

2. **Create Feature Branch**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

3. **Develop with Hot Reload**

   - Make changes to code
   - View changes at `http://localhost:3000`
   - Check browser console for errors
   - Use React DevTools for debugging

4. **Run Tests Frequently**

   ```bash
   pnpm test              # Quick unit tests
   pnpm test:coverage     # Full test suite
   ```

5. **Before Committing**

   ```bash
   pnpm lint:fix          # Fix code issues
   pnpm type-check        # Verify TypeScript
   pnpm test              # Ensure tests pass
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

### Project Structure

```
ai-portfolio-builder/
├── app/                          # Next.js 15 App Router
│   ├── api/                     # API routes
│   │   ├── ai/                  # AI enhancement endpoints
│   │   ├── analytics/           # GitHub analytics API
│   │   └── integrations/        # OAuth integrations
│   ├── (pages)/                 # Page components
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── landing/                 # Public landing page
│   ├── editor/                  # Portfolio editor
│   ├── admin/                   # Admin dashboard
│   ├── analytics/               # Analytics components
│   ├── templates/               # Portfolio templates
│   ├── shared/                  # Reusable components
│   └── ui/                      # Base UI components
├── lib/                         # Core libraries
│   ├── ai/                      # AI service integration
│   ├── auth/                    # Authentication logic
│   ├── i18n/                    # Internationalization
│   ├── services/                # Business logic services
│   ├── supabase/                # Database client
│   └── utils/                   # Utility functions
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
├── __tests__/                   # Test files
├── e2e/                         # End-to-end tests
└── docs/                        # Documentation
```

## 📝 Code Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use strict typing
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ✅ Good: Export interfaces
export interface ComponentProps {
  title: string;
  isVisible?: boolean;
  onAction: (data: string) => void;
}

// ✅ Good: Use const assertions
const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
type Language = (typeof SUPPORTED_LANGUAGES)[number];

// ❌ Avoid: any types
const data: any = {}; // Use specific types instead

// ❌ Avoid: implicit any
function process(data) {} // Add proper typing
```

### React Component Standards

```tsx
// ✅ Good: Functional component with TypeScript
'use client'; // Add when using hooks/client features

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}
```

### Internationalization Standards

```tsx
// ✅ Good: Use translation hook
import { useLanguage } from '@/lib/i18n/minimal-context';

export function Component() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t.heroTitle}</h1>
      <button onClick={() => setLanguage('en')}>{t.switchLanguage}</button>
    </div>
  );
}

// ❌ Avoid: Hardcoded strings
export function BadComponent() {
  return <h1>Welcome to PRISMA</h1>; // Use translation keys
}
```

### API Route Standards

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const body = await request.json();
    const validated = requestSchema.parse(body);

    // 2. Authentication check (if required)
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Business logic
    const result = await processRequest(validated);

    // 4. Return response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### File Organization Standards

```
# Component Organization
components/ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.test.tsx     # Tests
├── ComponentName.stories.tsx  # Storybook (optional)
├── hooks.ts                   # Component-specific hooks
├── types.ts                   # Component types
└── index.ts                   # Exports

# Export Pattern
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './types';
```

## 🧪 Testing

### Testing Philosophy

- **Test behavior, not implementation**
- **Focus on user-facing functionality**
- **Maintain test coverage above 80%**
- **Write tests that are easy to understand and maintain**

### Testing Structure

```
__tests__/
├── app/                    # Page component tests
├── components/            # Component unit tests
├── lib/                   # Library function tests
├── api/                   # API route tests
├── hooks/                 # Custom hook tests
└── utils/                 # Test utilities

e2e/                       # End-to-end tests
├── auth.spec.ts          # Authentication flows
├── landing-page.spec.ts  # Landing page behavior
└── setup/                # E2E test configuration
```

### Unit Testing Examples

```typescript
// Component Test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

```typescript
// API Route Test
import { POST } from '@/app/api/portfolios/route';
import { NextRequest } from 'next/server';

describe('/api/portfolios', () => {
  it('creates portfolio with valid data', async () => {
    const request = new NextRequest('http://localhost/api/portfolios', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Portfolio',
        description: 'Test description',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Test Portfolio');
  });
});
```

### E2E Testing Examples

```typescript
// e2e/landing-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('30 minutes')).toBeVisible();
  });

  test('should switch language', async ({ page }) => {
    // Check initial Spanish content
    await expect(page.getByText('Características')).toBeVisible();

    // Click language toggle
    await page.getByRole('button', { name: /ES|🇲🇽/ }).click();

    // Check English content appears
    await expect(page.getByText('Features')).toBeVisible();
  });

  test('should navigate to demo', async ({ page }) => {
    await page.getByRole('link', { name: 'Demo' }).click();
    await expect(page).toHaveURL('/demo/interactive');
  });
});
```

### Running Tests

```bash
# Unit Tests
pnpm test                 # Run all unit tests
pnpm test:watch          # Run tests in watch mode
pnpm test:coverage       # Run with coverage report
pnpm test Button         # Run specific test file

# E2E Tests
pnpm test:e2e            # Run all E2E tests
pnpm test:e2e:ui         # Run E2E tests with UI
pnpm test:e2e --debug    # Debug E2E tests

# Test Coverage
pnpm test:coverage       # Generate coverage report
open coverage/lcov-report/index.html  # View coverage
```

### Test Coverage Goals

| Component Type | Target Coverage | Priority |
| -------------- | --------------- | -------- |
| API Routes     | 90%+            | Critical |
| Components     | 85%+            | High     |
| Hooks          | 90%+            | High     |
| Utils          | 80%+            | Medium   |
| Types          | N/A             | N/A      |

## 🔀 Git Workflow

### Branch Strategy

- **`main`**: Production-ready code
- **`feature/*`**: New features
- **`fix/*`**: Bug fixes
- **`docs/*`**: Documentation updates
- **`refactor/*`**: Code refactoring

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or fixes
- `chore`: Maintenance tasks

**Examples:**

```bash
# Feature commit
git commit -m "feat(auth): add LinkedIn OAuth integration

- Implement LinkedIn OAuth 2.0 flow
- Add profile data extraction
- Update user model with LinkedIn fields

Closes #123"

# Bug fix
git commit -m "fix(editor): resolve preview refresh issue

Preview was not updating when changing templates.
Added proper dependency tracking to useEffect."

# Documentation
git commit -m "docs(api): add authentication examples

Added code examples for all auth endpoints
to improve developer experience."
```

### Pull Request Workflow

1. **Create Feature Branch**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   - Follow coding standards
   - Add tests for new features
   - Update documentation if needed

3. **Before Creating PR**

   ```bash
   # Ensure code quality
   pnpm lint:fix
   pnpm type-check
   pnpm test
   pnpm test:e2e

   # Update branch with latest main
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git rebase main  # or merge main
   ```

4. **Create Pull Request**

   - Use descriptive title
   - Include detailed description
   - Link related issues
   - Add screenshots for UI changes

5. **PR Review Process**
   - All tests must pass
   - Code review from team member
   - Address feedback comments
   - Squash commits if requested

### Pre-commit Hooks

Automatically run on commit:

```bash
# Installed with husky
- ESLint checks
- Prettier formatting
- TypeScript validation
- Test validation for changed files
```

Setup pre-commit hooks:

```bash
pnpm prepare  # Installs husky hooks
```

## 🤝 Contributing

### How to Contribute

1. **Fork the Repository**

   - Fork on GitHub
   - Clone your fork locally

2. **Set Up Development Environment**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-portfolio-builder.git
   cd ai-portfolio-builder
   git remote add upstream https://github.com/aldoruizluna/ai-portfolio-builder.git
   ./scripts/docker-dev.sh
   ```

3. **Find or Create an Issue**

   - Check existing issues
   - Create new issue if needed
   - Comment that you're working on it

4. **Develop Your Feature**

   - Create feature branch
   - Follow coding standards
   - Add comprehensive tests
   - Update documentation

5. **Submit Pull Request**
   - Ensure all tests pass
   - Update README if needed
   - Follow PR template

### Contribution Guidelines

**Code Quality Requirements:**

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] TypeScript strict mode compliant
- [ ] ESLint passes without warnings
- [ ] New features include tests
- [ ] Documentation updated

**Review Criteria:**

- Code quality and maintainability
- Test coverage and quality
- Documentation completeness
- Performance implications
- Security considerations

### Types of Contributions

**🐛 Bug Reports**

- Use issue template
- Include reproduction steps
- Provide environment details
- Add screenshots if relevant

**✨ Feature Requests**

- Describe the problem
- Propose a solution
- Consider alternatives
- Estimate complexity

**📝 Documentation**

- Fix typos or errors
- Add missing information
- Improve clarity
- Add examples

**🧪 Testing**

- Add missing test coverage
- Improve test quality
- Add E2E scenarios
- Performance testing

## 🏗️ Architecture Patterns

### Component Patterns

```tsx
// 1. Server Components (default)
export default function ServerComponent() {
  // Can fetch data directly
  // Rendered on server
  return <div>Static content</div>;
}

// 2. Client Components (when needed)
('use client');
export default function ClientComponent() {
  // Can use hooks and browser APIs
  // Hydrated on client
  const [state, setState] = useState();
  return <div>Interactive content</div>;
}

// 3. Compound Components
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
};

// Usage:
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>;
```

### Custom Hook Patterns

```typescript
// 1. Data Fetching Hook
export function usePortfolio(id: string) {
  const [data, setData] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true);
        const portfolio = await getPortfolio(id);
        setData(portfolio);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [id]);

  return { data, loading, error };
}

// 2. Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(value) : value;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [value, setStoredValue] as const;
}
```

### Service Layer Patterns

```typescript
// services/portfolioService.ts
export class PortfolioService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
    const validated = portfolioSchema.parse(data);
    const response = await this.apiClient.post('/portfolios', validated);
    return transformApiPortfolio(response.data);
  }

  async getPortfolio(id: string): Promise<Portfolio> {
    const response = await this.apiClient.get(`/portfolios/${id}`);
    return transformApiPortfolio(response.data);
  }

  async updatePortfolio(
    id: string,
    data: Partial<Portfolio>
  ): Promise<Portfolio> {
    const response = await this.apiClient.patch(`/portfolios/${id}`, data);
    return transformApiPortfolio(response.data);
  }
}

// Singleton instance
export const portfolioService = new PortfolioService(apiClient);
```

## 🐛 Troubleshooting

### Common Development Issues

#### 1. Docker Issues

**Problem**: Docker containers won't start

```bash
# Solution: Clean up Docker
docker system prune -a
docker-compose -f docker-compose.dev.yml down -v
./scripts/docker-dev.sh
```

**Problem**: Port conflicts

```bash
# Solution: Check what's using the port
lsof -i :3000
# Kill the process or change port in docker-compose.dev.yml
```

#### 2. Node.js/pnpm Issues

**Problem**: pnpm command not found

```bash
# Solution: Install pnpm
npm install -g pnpm@latest
```

**Problem**: Package installation fails

```bash
# Solution: Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 3. Next.js Issues

**Problem**: Hot reload not working

```bash
# Solution: Check file watching limits (Linux/macOS)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Problem**: TypeScript errors in development

```bash
# Solution: Restart TypeScript server
# In VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
pnpm type-check  # Check for real errors
```

#### 4. Testing Issues

**Problem**: Tests failing unexpectedly

```bash
# Solution: Clear Jest cache
pnpm test --clearCache
rm -rf coverage/
pnpm test
```

**Problem**: E2E tests failing

```bash
# Solution: Update Playwright browsers
npx playwright install
pnpm test:e2e
```

#### 5. Translation Issues

**Problem**: Missing translation keys

```bash
# Solution: Check translation file
# Ensure key exists in lib/i18n/minimal-context.tsx
# Add missing keys for both languages
```

**Problem**: Language not switching

```bash
# Solution: Clear localStorage and check implementation
# Browser DevTools -> Application -> Local Storage -> Clear
```

### Getting Help

1. **Check Documentation**

   - Review relevant docs first
   - Search existing issues

2. **Debug Systematically**

   - Check browser console
   - Review server logs
   - Use React DevTools

3. **Ask for Help**

   - Create detailed issue
   - Include error messages
   - Provide reproduction steps

4. **Community Resources**
   - GitHub Discussions
   - Stack Overflow
   - Next.js Documentation

### Performance Debugging

```bash
# Analyze bundle size
pnpm build
npx @next/bundle-analyzer

# Check performance
pnpm lighthouse http://localhost:3000

# Profile React components
# Use React DevTools Profiler in browser
```

### Environment Debugging

```typescript
// Add to components for debugging
export function DebugInfo() {
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs">
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
      <div>Next.js: {process.env.NEXT_PUBLIC_APP_URL}</div>
      <div>Browser: {typeof window !== 'undefined' ? 'Client' : 'Server'}</div>
    </div>
  );
}
```

---

This development guide provides everything needed to contribute effectively to PRISMA. For additional questions, check our [Architecture Guide](./ARCHITECTURE.md) or [create an issue](https://github.com/aldoruizluna/ai-portfolio-builder/issues).

---

_Development guide last updated: June 15, 2025_
