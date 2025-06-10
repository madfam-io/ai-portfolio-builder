# JSDoc Documentation Standards for PRISMA

This document outlines the comprehensive JSDoc documentation standards for the PRISMA AI Portfolio Builder platform. Following these standards ensures consistent, maintainable, and discoverable code documentation.

## 📋 Table of Contents

1. [General Guidelines](#general-guidelines)
2. [File Documentation](#file-documentation)
3. [Component Documentation](#component-documentation)
4. [Function Documentation](#function-documentation)
5. [Type Documentation](#type-documentation)
6. [Hook Documentation](#hook-documentation)
7. [API Route Documentation](#api-route-documentation)
8. [Examples](#examples)
9. [Tools and Setup](#tools-and-setup)

## 🎯 General Guidelines

### Required Documentation

All public APIs, components, functions, and types MUST be documented with JSDoc comments.

### Documentation Principles

- **Clarity**: Documentation should be clear and easy to understand
- **Completeness**: Include all parameters, return values, and exceptions
- **Examples**: Provide usage examples for complex APIs
- **Maintenance**: Keep documentation in sync with code changes

### Comment Style

````javascript
/**
 * Brief description (required)
 *
 * Detailed description explaining the purpose, behavior, and usage.
 * Can span multiple lines and include implementation details.
 *
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * ```typescript
 * const result = functionName(param);
 * console.log(result);
 * ```
 *
 * @see {@link RelatedFunction} For related functionality
 * @since 1.0.0
 * @author PRISMA Development Team
 */
````

## 📄 File Documentation

Every file should start with a comprehensive file header:

````javascript
/**
 * @fileoverview Brief description of the file's purpose
 *
 * Detailed description explaining:
 * - What the file contains
 * - Main functionality provided
 * - Key components or exports
 * - Dependencies and relationships
 *
 * @example
 * ```typescript
 * import { ComponentName } from './path/to/file';
 *
 * function usage() {
 *   return <ComponentName prop="value" />;
 * }
 * ```
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 * @since 0.1.0
 */
````

### Required File Header Tags

- `@fileoverview` - Brief description
- `@author` - Author information
- `@version` - Current version
- `@since` - Version when introduced

### Optional File Header Tags

- `@example` - Usage examples
- `@see` - Related files or documentation
- `@todo` - Known issues or planned improvements
- `@deprecated` - If file is deprecated

## ⚛️ Component Documentation

React components require comprehensive documentation:

````typescript
/**
 * Brief component description
 *
 * Detailed description explaining:
 * - Component purpose and functionality
 * - When and how to use it
 * - Key features and capabilities
 * - Performance considerations
 *
 * @component
 * @example
 * ```tsx
 * <ComponentName
 *   requiredProp="value"
 *   optionalProp={42}
 *   onAction={(data) => console.log(data)}
 * >
 *   <ChildComponent />
 * </ComponentName>
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.requiredProp - Description of required prop
 * @param {number} [props.optionalProp=0] - Description of optional prop with default
 * @param {(data: any) => void} props.onAction - Callback description
 * @param {React.ReactNode} [props.children] - Child components
 *
 * @returns {JSX.Element} The rendered component
 *
 * @throws {Error} When invalid props are provided
 *
 * @see {@link RelatedComponent} For similar functionality
 * @since 1.0.0
 */
````

### Component-Specific Tags

- `@component` - Identifies React components
- `@param {Object} props` - Document the props object
- `@param {Type} props.propName` - Individual prop documentation
- `@returns {JSX.Element}` - Always JSX.Element for components

### Props Documentation Format

```typescript
/**
 * @param {string} props.title - The component title
 * @param {number} [props.maxItems=10] - Maximum items to display (optional with default)
 * @param {'small' | 'medium' | 'large'} props.size - Component size variant
 * @param {() => void} props.onClose - Callback when component closes
 * @param {React.ReactNode} [props.children] - Child components
 */
```

## 🔧 Function Documentation

All functions should be thoroughly documented:

````typescript
/**
 * Brief function description
 *
 * Detailed explanation of what the function does, how it works,
 * and any important implementation details or side effects.
 *
 * @async
 * @function
 * @param {Type} param1 - Description of first parameter
 * @param {Type} [param2] - Optional parameter description
 * @param {Object} options - Options object
 * @param {boolean} [options.flag=false] - Option flag with default
 * @param {string} options.required - Required option
 *
 * @returns {Promise<ReturnType>} Description of return value
 *
 * @throws {ValidationError} When input validation fails
 * @throws {NetworkError} When network request fails
 *
 * @example
 * ```typescript
 * const result = await functionName('param', { required: 'value' });
 * console.log(result);
 * ```
 *
 * @since 1.0.0
 */
````

### Function-Specific Tags

- `@function` - Identifies functions
- `@async` - For async functions
- `@param` - Parameter documentation
- `@returns` - Return value documentation
- `@throws` - Exception documentation

## 📝 Type Documentation

TypeScript interfaces and types should be documented:

````typescript
/**
 * Brief description of the type/interface
 *
 * Detailed explanation of when and how to use this type,
 * including any constraints or special considerations.
 *
 * @interface
 * @example
 * ```typescript
 * const data: TypeName = {
 *   property1: 'value',
 *   property2: 42,
 * };
 * ```
 *
 * @see {@link RelatedType} For related types
 * @since 1.0.0
 */
interface TypeName {
  /** Brief description of property1 */
  property1: string;

  /**
   * Detailed description of property2
   * @default 0
   */
  property2?: number;

  /**
   * Method description
   * @param input - Method parameter
   * @returns Method return value
   */
  method(input: string): boolean;
}
````

### Type-Specific Tags

- `@interface` - For TypeScript interfaces
- `@typedef` - For type definitions
- `@property` - For object properties (alternative to inline comments)

## 🪝 Hook Documentation

Custom React hooks require special documentation:

````typescript
/**
 * Brief hook description
 *
 * Detailed explanation of the hook's purpose, behavior,
 * and when to use it. Include any rules or constraints.
 *
 * @hook
 * @param {Type} param - Hook parameter description
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.enabled=true] - Whether hook is enabled
 *
 * @returns {Object} Hook return object
 * @returns {Type} returns.data - Data returned by hook
 * @returns {boolean} returns.loading - Loading state
 * @returns {Error | null} returns.error - Error state
 * @returns {() => void} returns.refetch - Function to refetch data
 *
 * @example
 * ```typescript
 * function Component() {
 *   const { data, loading, error, refetch } = useCustomHook('param');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>{data}</div>;
 * }
 * ```
 *
 * @throws {Error} When hook is used outside required provider
 *
 * @since 1.0.0
 */
````

### Hook-Specific Tags

- `@hook` - Identifies React hooks
- Document return object properties with `@returns {Type} returns.property`

## 🛠 API Route Documentation

API routes need comprehensive documentation:

````typescript
/**
 * Brief API endpoint description
 *
 * Detailed explanation of the endpoint's purpose, behavior,
 * authentication requirements, and any side effects.
 *
 * @route {Method} /api/endpoint/path
 * @auth Required for this endpoint
 * @ratelimit 100 requests per hour
 *
 * @param {NextRequest} request - The Next.js request object
 * @param {Object} context - Route context
 * @param {Object} context.params - Route parameters
 * @param {string} context.params.id - Resource ID from URL
 *
 * @returns {Promise<NextResponse>} JSON response
 *
 * @throws {401} When authentication fails
 * @throws {403} When user lacks permission
 * @throws {404} When resource not found
 * @throws {429} When rate limit exceeded
 * @throws {500} When server error occurs
 *
 * @example
 * ```typescript
 * // GET /api/users/123
 * const response = await fetch('/api/users/123');
 * const user = await response.json();
 * ```
 *
 * @since 1.0.0
 */
````

### API-Specific Tags

- `@route` - HTTP method and path
- `@auth` - Authentication requirements
- `@ratelimit` - Rate limiting information
- `@throws {statusCode}` - HTTP error responses

## 📚 Examples

### Complete Component Example

````typescript
/**
 * @fileoverview Portfolio Card Component
 *
 * A reusable card component for displaying portfolio information
 * with hover effects, actions, and responsive design.
 *
 * @author PRISMA Development Team
 * @version 1.2.0
 * @since 1.0.0
 */

import React from 'react';

/**
 * Props for the PortfolioCard component
 *
 * @interface
 */
interface PortfolioCardProps {
  /** Portfolio data to display */
  portfolio: Portfolio;
  /** Whether the card is currently selected */
  isSelected?: boolean;
  /** Callback when card is clicked */
  onClick?: (portfolio: Portfolio) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show action buttons */
  showActions?: boolean;
}

/**
 * Portfolio Card Component
 *
 * Displays portfolio information in a card format with optional
 * actions and selection state. Supports keyboard navigation
 * and follows accessibility best practices.
 *
 * @component
 * @example
 * ```tsx
 * <PortfolioCard
 *   portfolio={portfolioData}
 *   isSelected={selectedId === portfolioData.id}
 *   onClick={(portfolio) => handleSelect(portfolio)}
 *   showActions={true}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Portfolio} props.portfolio - Portfolio data to display
 * @param {boolean} [props.isSelected=false] - Whether card is selected
 * @param {(portfolio: Portfolio) => void} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showActions=true] - Whether to show actions
 *
 * @returns {JSX.Element} The rendered portfolio card
 *
 * @since 1.0.0
 */
export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  isSelected = false,
  onClick,
  className = '',
  showActions = true,
}) => {
  // Component implementation
};
````

## 🔧 Tools and Setup

### VSCode Extensions

- **TypeScript Importer** - Auto-import management
- **JSDoc Generator** - Auto-generate JSDoc comments
- **Document This** - Generate documentation templates

### JSDoc Configuration

Create `jsdoc.json` in project root:

```json
{
  "source": {
    "include": ["./components", "./lib", "./hooks", "./app"],
    "exclude": ["node_modules", "dist", ".next"]
  },
  "opts": {
    "destination": "./docs/api/",
    "recurse": true
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": false,
    "monospaceLinks": false
  }
}
```

### TypeScript Integration

Ensure `tsconfig.json` includes JSDoc support:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

### Documentation Generation

Add scripts to `package.json`:

```json
{
  "scripts": {
    "docs:generate": "jsdoc -c jsdoc.json",
    "docs:serve": "http-server docs/api -p 3001",
    "docs:watch": "nodemon --exec 'npm run docs:generate' --watch components --watch lib"
  }
}
```

## 📖 Best Practices

### 1. Write Documentation First

Document the intended API before implementation to clarify design.

### 2. Keep Documentation Current

Update documentation with every code change.

### 3. Use Clear Language

Write for developers who are unfamiliar with the code.

### 4. Provide Examples

Include realistic usage examples for complex APIs.

### 5. Link Related Items

Use `@see` tags to reference related functions, components, or documentation.

### 6. Document Edge Cases

Explain unusual behavior, limitations, or workarounds.

### 7. Include Version Information

Use `@since` and `@deprecated` to track API evolution.

## ✅ Documentation Checklist

Before submitting code, ensure:

- [ ] File header with `@fileoverview` and metadata
- [ ] All public functions/components documented
- [ ] All parameters and return values documented
- [ ] Examples provided for complex APIs
- [ ] Error conditions documented with `@throws`
- [ ] TypeScript types properly documented
- [ ] Links to related functionality included
- [ ] Documentation tested with JSDoc generator

---

This documentation standard ensures that PRISMA maintains high-quality, discoverable, and maintainable code documentation across the entire platform.
