# Translation Key Naming Conventions

This document defines the naming conventions for translation keys in the PRISMA Portfolio Builder i18n system.

## General Rules

1. **Use camelCase** for all translation keys
2. **Be descriptive** but concise
3. **Group related keys** with common prefixes
4. **Avoid abbreviations** unless widely understood (e.g., `url`, `api`)

## Key Structure

### Page-Specific Keys

All page-specific translations should follow this pattern:

```typescript
// Pattern: [pageName][Element]
// Examples:
dashboardTitle          // Page title
dashboardSubtitle       // Page subtitle
dashboardWelcomeMessage // Welcome message on dashboard
dashboardEmptyState     // Empty state message
```

### Common UI Elements

Reusable UI elements should be in the common namespace:

```typescript
// Actions
save              // Button labels
cancel
edit
delete
create
update

// Status
loading           // Loading states
saving
saved
error
success

// Navigation
home
about
contact
dashboard
profile
```

### Form Elements

Form-related translations:

```typescript
// Pattern: [formName][FieldName][Type]
// Examples:
signInEmailLabel
signInEmailPlaceholder
signInEmailError
signInPasswordLabel
signInPasswordPlaceholder
signInPasswordError
```

### Feature-Specific Keys

Features should have their own namespace:

```typescript
// Pattern: [featureName][Element]
// Examples:
portfolioEditorTitle
portfolioEditorSaveButton
portfolioEditorCancelButton
portfolioEditorSuccessMessage
```

### Lists and Sequences

For lists of similar items, use descriptive names instead of numbers:

```typescript
// ❌ Avoid
heroTitle1
heroTitle2
heroTitle3

// ✅ Prefer
heroMainTitle
heroSubtitle
heroTagline

// OR for truly sequential items
features: {
  aiPowered: {
    title: "AI-Powered",
    description: "..."
  },
  responsive: {
    title: "Responsive",
    description: "..."
  }
}
```

### Error Messages

Error messages should be descriptive:

```typescript
// Pattern: [context]Error[Type]
// Examples:
authErrorInvalidCredentials
authErrorEmailRequired
portfolioErrorNameRequired
apiErrorNetworkFailure
```

### Success Messages

Success messages follow similar pattern:

```typescript
// Pattern: [context]Success[Action]
// Examples:
authSuccessSignIn
portfolioSuccessSaved
profileSuccessUpdated
```

## Naming Patterns by Category

### 1. Authentication

```typescript
// Sign In
signInTitle
signInEmailLabel
signInPasswordLabel
signInSubmitButton
signInForgotPassword
signInNoAccount

// Sign Up
signUpTitle
signUpNameLabel
signUpEmailLabel
signUpPasswordLabel
signUpConfirmPasswordLabel
signUpSubmitButton
signUpHaveAccount

// Password Reset
resetPasswordTitle
resetPasswordEmailLabel
resetPasswordSubmitButton
resetPasswordBackToSignIn
```

### 2. Dashboard

```typescript
dashboardTitle
dashboardWelcomeBack      // "Welcome back, {name}"
dashboardMyPortfolios
dashboardCreatePortfolio
dashboardRecentActivity
dashboardQuickActions
```

### 3. Portfolio Editor

```typescript
editorTitle
editorSaveButton
editorPublishButton
editorPreviewButton
editorAddSection
editorDeleteSection
editorUnsavedChanges
```

### 4. API Responses

```typescript
apiErrorUnauthorized
apiErrorNotFound
apiErrorServerError
apiErrorValidationFailed
apiSuccessDataSaved
apiSuccessDataDeleted
```

## Migration Guide

When updating existing keys to follow these conventions:

1. **Create new key** with proper naming
2. **Update component** to use new key
3. **Keep old key** temporarily for backward compatibility
4. **Remove old key** after all references are updated

Example migration:

```typescript
// Old
translations = {
  "welcomeMessage": "Welcome!",
  "welcome_back": "Welcome back!",
  "WelcomeUser": "Welcome, {name}!"
}

// New
translations = {
  "welcome": "Welcome!",
  "welcomeBack": "Welcome back!",
  "welcomeUser": "Welcome, {name}!"
}
```

## Best Practices

1. **Consistency**: Use the same pattern throughout the application
2. **Context**: Include enough context to understand where the key is used
3. **Reusability**: Create common keys for frequently used text
4. **Searchability**: Use names that are easy to search in the codebase
5. **No hardcoded text**: Every user-facing string should be a translation key

## Examples of Good vs Bad Naming

```typescript
// ❌ Bad
title1                    // Not descriptive
btn_save                  // Wrong case style
SaveButtonTextForProfile  // Too verbose, wrong case
err                      // Too abbreviated

// ✅ Good
profileTitle             // Clear and contextual
saveButton              // Simple and reusable
profileSaveError        // Descriptive error
welcomeMessage          // Clear purpose
```

## Special Cases

### Pluralization

For pluralized text, use the count suffix:

```typescript
portfolioCount_zero    // "No portfolios"
portfolioCount_one     // "1 portfolio"
portfolioCount_other   // "{count} portfolios"
```

### Dynamic Content

For content with variables:

```typescript
welcomeUser           // "Welcome, {name}!"
lastUpdatedAt        // "Last updated {date}"
itemsSelected        // "{count} items selected"
```

## Validation

Use these rules to validate translation keys:

1. Must be in camelCase
2. No special characters except underscores for special cases
3. No spaces
4. Start with lowercase letter
5. Descriptive enough to understand usage without context

## Tools

Consider using these tools to maintain consistency:

- ESLint rule for translation key format
- Script to validate all translation files
- Auto-completion in IDE for translation keys

---

**Note**: This is a living document. Update it as new patterns emerge or better conventions are discovered.