# Git Workflow & Best Practices

This document establishes Git workflows, commit protocols, and best practices for the MADFAM AI Portfolio Builder project.

## 📋 Table of Contents

- [Branch Strategy](#branch-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Git Hooks](#git-hooks)
- [Release Management](#release-management)
- [Quick Reference](#quick-reference)

## 🌿 Branch Strategy

### Main Branches

```
main (production)
├── develop (integration)
├── staging (pre-production)
└── feature/* (development)
```

### Branch Types

#### `main`

- **Purpose**: Production-ready code
- **Protection**: Requires PR + review + CI passing
- **Auto-deploy**: To production environment
- **Naming**: `main`

#### `develop`

- **Purpose**: Integration branch for features
- **Protection**: Requires PR + CI passing
- **Auto-deploy**: To development environment
- **Naming**: `develop`

#### `staging`

- **Purpose**: Pre-production testing
- **Protection**: Requires PR + review
- **Auto-deploy**: To staging environment
- **Naming**: `staging`

#### Feature Branches

- **Purpose**: Individual features/fixes
- **Lifetime**: Short-lived (1-7 days)
- **Naming**: `feature/description`, `fix/bug-name`, `docs/update-name`

### Branch Naming Convention

```bash
# Features
feature/github-integration
feature/ai-bio-rewriter
feature/payment-system

# Bug fixes
fix/auth-redirect-loop
fix/mobile-responsive-editor
fix/api-rate-limiting

# Documentation
docs/api-documentation
docs/deployment-guide

# Chores/Maintenance
chore/dependency-updates
chore/eslint-configuration

# Releases
release/v1.0.0
hotfix/v1.0.1
```

## 📝 Commit Guidelines

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type       | Description             | Example                                      |
| ---------- | ----------------------- | -------------------------------------------- |
| `feat`     | New feature             | `feat(auth): add LinkedIn OAuth integration` |
| `fix`      | Bug fix                 | `fix(editor): resolve preview refresh issue` |
| `docs`     | Documentation           | `docs(api): add authentication endpoints`    |
| `style`    | Code formatting         | `style(components): fix eslint warnings`     |
| `refactor` | Code refactoring        | `refactor(ai): extract prompt templates`     |
| `perf`     | Performance improvement | `perf(db): optimize portfolio queries`       |
| `test`     | Adding tests            | `test(auth): add OAuth flow tests`           |
| `chore`    | Maintenance             | `chore(deps): update next.js to 14.1.0`      |
| `ci`       | CI/CD changes           | `ci(github): add automated testing workflow` |
| `build`    | Build system            | `build(webpack): optimize bundle size`       |

### Scope Examples

- `auth` - Authentication system
- `editor` - Portfolio editor
- `ai` - AI content generation
- `db` - Database operations
- `api` - API routes
- `ui` - User interface components
- `deploy` - Deployment configuration

### Commit Message Examples

#### Good Commits ✅

```bash
feat(auth): add LinkedIn OAuth integration

- Implement OAuth 2.0 flow for LinkedIn
- Add profile data extraction from LinkedIn API
- Update user model to store LinkedIn profile data
- Add error handling for API failures

Closes #123
```

```bash
fix(editor): resolve portfolio preview not updating

The preview component wasn't reacting to template changes.
Added proper dependency tracking to useEffect hook.

Fixes #456
```

```bash
docs(deployment): add Vercel deployment guide

- Step-by-step deployment instructions
- Environment variable configuration
- Custom domain setup
- Troubleshooting section
```

#### Bad Commits ❌

```bash
# Too vague
fix: bug fix

# No description
feat: new feature

# Not following convention
Added LinkedIn integration and fixed some bugs

# Missing scope when needed
feat: add OAuth
```

### Commit Best Practices

1. **Atomic Commits**: One logical change per commit
2. **Clear Subject**: 50 characters or less, imperative mood
3. **Detailed Body**: Explain what and why, not how
4. **Reference Issues**: Include issue numbers
5. **Breaking Changes**: Use `BREAKING CHANGE:` in footer

## 🔄 Pull Request Process

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] 🚀 New feature
- [ ] 🐛 Bug fix
- [ ] 📚 Documentation update
- [ ] 🎨 Style/formatting
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] 🧪 Adding tests
- [ ] 🔧 CI/CD changes

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Bundle size impact assessed

## Related Issues

Closes #123
Related to #456
```

### PR Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat(scope): add new feature"

# 3. Push to remote
git push origin feature/new-feature

# 4. Create PR on GitHub
# 5. Address review feedback
# 6. Merge when approved
```

### Review Requirements

- **Required reviewers**: 1 (for main/staging)
- **Status checks**: All CI tests must pass
- **Merge strategy**: Squash and merge (for cleaner history)

## 🪝 Git Hooks

### Pre-commit Hook Setup

```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Setup husky
npx husky install
npm pkg set scripts.prepare="husky install"

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### Lint-staged Configuration

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"],
    "*.{js,jsx,ts,tsx,json,md}": ["git add"]
  }
}
```

### Commit Message Hook

```bash
# Add commit-msg hook
npx husky add .husky/commit-msg 'npx commitlint --edit $1'

# Install commitlint
npm install --save-dev @commitlint/config-conventional @commitlint/cli

# Configure commitlint
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

## 🚀 Release Management

### Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backward compatible)
- **PATCH** (0.0.1): Bug fixes

### Release Process

```bash
# 1. Create release branch
git checkout -b release/v1.0.0

# 2. Update version
npm version minor  # or major/patch

# 3. Update CHANGELOG.md
# 4. Commit version bump
git commit -m "chore(release): bump version to 1.0.0"

# 5. Create PR to main
# 6. After merge, tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Changelog Format

```markdown
# Changelog

## [1.0.0] - 2025-01-15

### Added

- LinkedIn OAuth integration
- AI-powered bio rewriting
- Template recommendation system

### Changed

- Improved editor performance
- Updated pricing tiers

### Fixed

- Mobile responsive issues
- Authentication redirect loop

### Breaking Changes

- API endpoint structure changed
```

## 📚 Quick Reference

### Daily Workflow

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/feature-name

# Work and commit
git add .
git commit -m "feat(scope): description"

# Push and create PR
git push origin feature/feature-name
# Create PR on GitHub

# After PR merged, cleanup
git checkout main
git pull origin main
git branch -d feature/feature-name
```

### Emergency Hotfix

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "fix(critical): resolve security issue"

# Push and create PR to main
git push origin hotfix/critical-bug
# Create PR with "hotfix" label

# After merge, delete branch
git branch -d hotfix/critical-bug
```

### Useful Commands

```bash
# Check status
git status
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Amend last commit
git add .
git commit --amend

# Interactive rebase (clean up commits)
git rebase -i HEAD~3

# Force push (only on feature branches!)
git push --force-with-lease origin feature-branch

# Sync with upstream
git fetch origin
git rebase origin/main
```

### Alias Setup

```bash
# Add to ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    graph = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    pushf = push --force-with-lease
```

## 🚨 Common Issues & Solutions

### Merge Conflicts

```bash
# When conflict occurs
git status  # See conflicted files
# Edit files to resolve conflicts
git add .
git commit -m "resolve: merge conflict in file.js"
```

### Accidentally Committed to Wrong Branch

```bash
# Move commits to correct branch
git log --oneline -3  # Note commit hash
git reset --hard HEAD~1  # Remove from current branch
git checkout correct-branch
git cherry-pick <commit-hash>
```

### Clean Up Feature Branch

```bash
# Squash commits before merging
git rebase -i HEAD~3
# Choose 'squash' for commits to combine
```

This workflow ensures code quality, traceability, and smooth collaboration across the development team.
