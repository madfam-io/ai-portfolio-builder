# Contributing to MADFAM AI Portfolio Builder

Thank you for your interest in contributing to the MADFAM AI Portfolio Builder! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the project and users
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, discriminatory language, or personal attacks
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ai-portfolio-builder.git`
3. Add upstream remote: `git remote add upstream https://github.com/madfam/ai-portfolio-builder.git`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes following our guidelines
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## 💻 Development Process

### Branch Naming Convention

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

Examples:

- `feature/github-import`
- `fix/auth-redirect-loop`
- `docs/api-authentication`

### Development Workflow

1. **Always sync with main**: `git pull upstream main`
2. **Install dependencies**: `pnpm install`
3. **Run tests**: `pnpm test`
4. **Start development**: `pnpm dev`
5. **Check types**: `pnpm type-check`
6. **Lint code**: `pnpm lint`
7. **Format code**: `pnpm format`

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

```typescript
// Use meaningful variable names
const userPortfolio = await getUserPortfolio(userId);

// Prefer const over let
const MAX_RETRIES = 3;

// Use async/await over promises
async function fetchUserData(userId: string) {
  try {
    const user = await db.users.findUnique({ where: { id: userId } });
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    throw error;
  }
}

// Use optional chaining
const userName = user?.profile?.name ?? 'Anonymous';

// Prefer early returns
function validateEmail(email: string) {
  if (!email) return false;
  if (!email.includes('@')) return false;
  return true;
}
```

### React Components

```tsx
// Use functional components with TypeScript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' &&
          'bg-gray-200 text-gray-900 hover:bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}
```

### File Organization

```
components/
├── Button/
│   ├── Button.tsx         # Component implementation
│   ├── Button.test.tsx    # Tests
│   ├── Button.stories.tsx # Storybook stories
│   └── index.ts          # Export
```

### CSS/Tailwind

- Use Tailwind utility classes
- Create custom components using `@apply` sparingly
- Use CSS modules for complex animations
- Follow mobile-first responsive design

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or fixes
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add LinkedIn OAuth integration

- Implement LinkedIn OAuth 2.0 flow
- Add profile data extraction
- Update user model with LinkedIn fields

Closes #123
```

```
fix(editor): resolve preview refresh issue

Preview was not updating when changing templates.
Added proper dependency tracking to useEffect.
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch**: `git pull upstream main`
2. **Run all checks**:
   ```bash
   pnpm test
   pnpm type-check
   pnpm lint
   pnpm format
   ```
3. **Update documentation** if needed
4. **Add tests** for new features
5. **Check bundle size** for significant changes

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Bundle size impact assessed
```

### Review Process

1. All PRs require at least one review
2. Address all feedback comments
3. Keep PRs focused and small when possible
4. Update PR description with changes made

## 🧪 Testing Guidelines

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Integration Tests

```typescript
import { createClient } from '@supabase/supabase-js';
import { renderHook } from '@testing-library/react-hooks';
import { usePortfolio } from './usePortfolio';

describe('usePortfolio', () => {
  it('fetches portfolio data successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePortfolio('test-user-id')
    );

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.portfolio).toBeDefined();
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can create portfolio', async ({ page }) => {
  // Navigate to signup
  await page.goto('/signup');

  // Fill form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Verify redirect to onboarding
  await expect(page).toHaveURL('/onboarding');

  // Complete onboarding
  await page.click('text=Connect LinkedIn');
  // ... continue test
});
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Generates an AI-enhanced bio based on user's professional data
 * @param {string} originalBio - The original bio text
 * @param {string} tone - Desired tone (professional, casual, creative)
 * @param {string} industry - User's industry for context
 * @returns {Promise<string>} Enhanced bio text
 * @throws {AIServiceError} If AI service fails
 */
export async function enhanceBio(
  originalBio: string,
  tone: ToneType,
  industry: string
): Promise<string> {
  // Implementation
}
```

### API Documentation

Document all API endpoints in the following format:

```typescript
/**
 * @route POST /api/portfolio/generate
 * @description Generates a new portfolio from user data
 * @access Private
 * @body {
 *   templateId: string,
 *   profileData: ProfileData,
 *   preferences: GenerationPreferences
 * }
 * @response {
 *   portfolioId: string,
 *   previewUrl: string,
 *   generationTime: number
 * }
 */
```

## 🐛 Reporting Issues

### Bug Reports

Include:

1. Clear description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment details (OS, browser, Node version)

### Feature Requests

Include:

1. Problem statement
2. Proposed solution
3. Alternative solutions considered
4. Additional context

## 💡 Getting Help

- Check existing [issues](https://github.com/madfam/ai-portfolio-builder/issues)
- Review [documentation](https://docs.madfam.io)
- Ask in [Discord](https://discord.gg/madfam)
- Email: dev@madfam.io

## 🏆 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor-only events

Thank you for contributing to MADFAM AI Portfolio Builder! 🚀
