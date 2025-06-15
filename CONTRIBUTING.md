# 🤝 Contributing to PRISMA by MADFAM

Welcome to the PRISMA project! We're excited that you're interested in contributing to our AI-powered portfolio builder. This guide will help you get started with contributing to our codebase.

**Last Updated**: June 15, 2025  
**Version**: v0.3.0-beta  
**Repository Started**: June 2025

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Community](#community)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be Respectful**: Treat everyone with respect and consideration
- **Be Collaborative**: Work together to solve problems
- **Be Inclusive**: Welcome diverse perspectives and experiences
- **Be Professional**: Maintain professionalism in all interactions
- **Be Constructive**: Provide helpful feedback and suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm 8.0.0 or higher
- Docker Desktop (for full-stack development)
- Git

### First Steps

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/ai-portfolio-builder.git
   cd ai-portfolio-builder
   ```

2. **Set Up Git**
   ```bash
   # Add upstream remote
   git remote add upstream https://github.com/aldoruizluna/labspace/ai-portfolio-builder.git
   
   # Configure Git
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

## 🛠️ Development Setup

### Docker Development (Recommended)

For full-stack development with database and caching:

```bash
# Start all services
./scripts/docker-dev.sh

# Services available:
# App: http://localhost:3000
# pgAdmin: http://localhost:5050
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Local Development

For frontend-only development:

```bash
# Start development server
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Check types
pnpm type-check
```

### Environment Variables

Create a `.env.local` file for local development:

```env
# Copy from .env.example
cp .env.example .env.local

# Add your API keys (optional for basic features)
```

## 💡 How to Contribute

### Types of Contributions

1. **🐛 Bug Fixes**
   - Check existing [issues](https://github.com/aldoruizluna/labspace/ai-portfolio-builder/issues)
   - Create a test that reproduces the bug
   - Fix the bug and ensure all tests pass

2. **✨ New Features**
   - Check the [roadmap](./docs/ROADMAP.md) for planned features
   - Discuss major features in an issue first
   - Follow the existing code patterns

3. **📚 Documentation**
   - Improve existing documentation
   - Add missing documentation
   - Fix typos and clarify confusing sections

4. **🧪 Tests**
   - Add missing tests
   - Improve test coverage
   - Fix flaky tests

5. **🎨 UI/UX Improvements**
   - Follow the existing design system
   - Ensure accessibility (WCAG 2.1 AA)
   - Test on multiple devices and browsers

6. **🌍 Translations**
   - Add missing translation keys
   - Improve existing translations
   - Maintain consistency across languages

## 📏 Coding Standards

### TypeScript

- **Strict Mode**: All code must pass TypeScript strict mode
- **No `any`**: Avoid using `any` type
- **Interfaces**: Define interfaces for all data structures
- **Type Safety**: Ensure complete type coverage

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ❌ Bad
const user: any = { name: 'John' };
```

### React Components

- **Functional Components**: Use functional components with hooks
- **Props Interfaces**: Define props interfaces for all components
- **Component Organization**: Keep components focused and modular

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn('btn', `btn-${variant}`)}
    >
      {children}
    </button>
  );
}
```

### File Organization

- **File Size**: Keep files under 500 lines
- **Single Responsibility**: One component/function per file
- **Naming**: Use PascalCase for components, camelCase for utilities

### Styling

- **Tailwind CSS**: Use Tailwind utility classes
- **Custom CSS**: Use CSS modules for complex styles
- **Dark Mode**: Ensure all components support dark mode
- **Responsive**: Mobile-first approach

### Internationalization

- **No Hardcoded Text**: All user-facing text must use translations
- **Translation Keys**: Use descriptive, hierarchical keys

```typescript
// ✅ Good
const { t } = useLanguage();
return <h1>{t.dashboard.title}</h1>;

// ❌ Bad
return <h1>Dashboard</h1>;
```

## 🧪 Testing Guidelines

### Test Requirements

- **New Features**: Must include tests
- **Bug Fixes**: Must include a test that reproduces the bug
- **Coverage**: Aim for 90%+ coverage on critical paths

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole('button'));
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## 🔄 Pull Request Process

### 1. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, well-documented code
- Follow the coding standards
- Add or update tests
- Update documentation if needed

### 3. Commit Your Changes

Use conventional commits:

```bash
# Types: feat, fix, docs, style, refactor, test, chore
git commit -m "feat: add portfolio export functionality"
git commit -m "fix: resolve language toggle issue in mobile menu"
git commit -m "docs: update API documentation"
```

### 4. Run Quality Checks

```bash
# Run all checks
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
```

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Translations added (if applicable)
```

### Review Process

1. **Automated Checks**: CI/CD must pass
2. **Code Review**: At least one maintainer review
3. **Testing**: Manual testing may be required
4. **Merge**: Squash and merge to main

## 🐛 Reporting Issues

### Before Creating an Issue

1. Search existing issues
2. Check the [roadmap](./docs/ROADMAP.md) for known issues
3. Ensure you can reproduce the issue

### Issue Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: 
- OS: 
- Version: 

## Screenshots
If applicable
```

## 💡 Feature Requests

### Before Requesting a Feature

1. Check the [roadmap](./docs/ROADMAP.md)
2. Search existing feature requests
3. Consider if it aligns with project goals

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How could this be implemented?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other relevant information
```

## 🌟 Recognition

Contributors who make significant contributions will be:

- Added to the contributors list
- Mentioned in release notes
- Given credit in the documentation

## 📞 Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Use GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: hello@prisma.madfam.io

## 🎯 Areas Needing Help

Current areas where we especially need contributions:

1. **Test Coverage**: Improving test coverage to 90%+
2. **Documentation**: API documentation and tutorials
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Performance**: Bundle size optimization
5. **Translations**: Additional language support
6. **UI/UX**: Design system improvements

## 🙏 Thank You!

Thank you for contributing to PRISMA! Your efforts help make portfolio creation accessible to professionals worldwide. Every contribution, no matter how small, is valued and appreciated.

Happy coding! 🚀

---

_Contributing guidelines last updated: June 15, 2025_