# Development Conventions - PRISMA Portfolio Builder

## Code Style Guidelines

### TypeScript Conventions

#### Type Definitions
```typescript
// ✅ DO: Use interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ DO: Use type for unions and aliases
type Status = 'active' | 'inactive' | 'pending';
type UserId = string;

// ❌ DON'T: Use 'any' type
// ✅ DO: Use 'unknown' and type guards
function processData(data: unknown) {
  if (isValidUser(data)) {
    // Now data is typed as User
  }
}
```

#### Async/Await Patterns
```typescript
// When interface requires Promise but no await needed
async method(): Promise<Result> {
  // Add this to satisfy ESLint require-await
  await Promise.resolve();
  return computeResult();
}

// Type casting pattern
const userAny = user as any;
const typed = userAny as TargetType;
```

### React Component Patterns

#### Component Structure
```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentProps } from '@/types';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  variant?: 'default' | 'primary';
}

// 3. Component Definition
export function MyComponent({ title, variant = 'default' }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = useState(false);
  const { t } = useLanguage();
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    setState(!state);
  };
  
  // 7. Render
  return (
    <div className={cn('base-classes', {
      'conditional-class': state
    })}>
      {t.componentText}
    </div>
  );
}
```

#### File Organization
```
components/
├── feature/
│   ├── FeatureComponent.tsx      # Main component
│   ├── FeatureComponent.test.tsx # Tests
│   ├── subcomponents/           # Feature-specific subcomponents
│   └── hooks/                   # Feature-specific hooks
```

### State Management Patterns

#### Zustand Store Structure
```typescript
// lib/store/feature-store.ts
interface FeatureState {
  // State
  items: Item[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadItems: () => Promise<void>;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  reset: () => void;
}

export const useFeatureStore = create<FeatureState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        isLoading: false,
        error: null,
        
        // Actions implementation
        loadItems: async () => {
          set({ isLoading: true, error: null });
          try {
            const items = await fetchItems();
            set({ items, isLoading: false });
          } catch (error) {
            set({ error: error.message, isLoading: false });
          }
        },
        // ... other actions
      }),
      {
        name: 'feature-storage',
      }
    )
  )
);
```

### API Route Patterns

#### Route Structure
```typescript
// app/api/v1/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';

// Schema validation
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Validation
    const body = await request.json();
    const data = schema.parse(body);
    
    // 3. Business logic
    const result = await createResource(data);
    
    // 4. Response
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    // 5. Error handling
    logger.error('Resource creation failed', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
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

### Testing Patterns

#### Component Testing
```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders with required props', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const onAction = jest.fn();
    render(<MyComponent title="Test" onAction={onAction} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

#### API Testing
```typescript
// __tests__/api/resource.test.ts
import { POST } from '@/app/api/v1/resource/route';
import { createMockRequest } from '@/test/utils';

describe('POST /api/v1/resource', () => {
  it('creates resource with valid data', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { name: 'Test', email: 'test@example.com' }
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### File Naming Conventions

```
# Components
PascalCase.tsx           # React components
useHookName.ts          # Custom hooks
ComponentName.test.tsx  # Component tests

# Utilities/Lib
kebab-case.ts           # Utility files
service-name.ts         # Service files

# API Routes
route.ts                # API route handlers

# Types
types.ts                # Type definitions
schema.ts               # Zod schemas

# Constants
constants.ts            # Constant values
config.ts              # Configuration
```

### CSS/Styling Conventions

#### Tailwind Classes Order
```typescript
// Order: Layout → Spacing → Typography → Colors → Effects
className="flex items-center justify-between p-4 text-lg font-semibold text-gray-900 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
```

#### Component Styling Pattern
```typescript
// Use cn() for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  // Base classes
  "px-4 py-2 rounded-md",
  // Conditional classes
  {
    "bg-blue-500 text-white": variant === 'primary',
    "bg-gray-200 text-gray-900": variant === 'secondary',
  },
  // Optional className prop
  className
)} />
```

### Internationalization (i18n) Patterns

#### Always Use Translation System
```typescript
// ❌ DON'T: Hardcode text
<h1>Welcome to PRISMA</h1>

// ✅ DO: Use translation system
const { t } = useLanguage();
<h1>{t.welcome}</h1>
```

#### Translation File Structure
```typescript
// lib/i18n/translations/en/landing.ts
export const landingEn = {
  hero: {
    title: "Create Your Professional Portfolio",
    subtitle: "In under 30 minutes with AI",
  },
  // Nested structure for organization
};
```

### Error Handling Patterns

#### Try-Catch with Logging
```typescript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : 'Unknown error',
    context: { userId, operation: 'riskyOperation' }
  });
  
  // User-friendly error
  return { 
    success: false, 
    error: 'Something went wrong. Please try again.' 
  };
}
```

### Performance Patterns

#### Dynamic Imports
```typescript
// For heavy components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
);
```

#### Image Optimization
```typescript
// Always use next/image
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurUrl}
/>
```

### Git Commit Conventions

```bash
# Format: type(scope): message

feat(editor): add drag-and-drop functionality
fix(auth): resolve session timeout issue
docs(api): update endpoint documentation
style(ui): improve button hover states
refactor(store): simplify state management
test(portfolio): add integration tests
chore(deps): update dependencies
```

### Environment Variables

```bash
# Naming convention
NEXT_PUBLIC_*  # Client-side variables
*_SECRET      # Sensitive values
*_URL         # Service URLs
*_KEY         # API keys

# Required check pattern
const apiKey = process.env.HUGGINGFACE_API_KEY;
if (!apiKey) {
  throw new Error('HUGGINGFACE_API_KEY is required');
}
```

### Security Patterns

#### Input Validation
```typescript
// Always validate user input
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  name: z.string().min(2).max(50),
});

// Sanitize for display
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput);
```

#### API Security
```typescript
// Rate limiting
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// CSRF protection
const token = request.headers.get('x-csrf-token');
if (!validateCSRFToken(token)) {
  return new Response('Invalid CSRF token', { status: 403 });
}
```

### Documentation Patterns

#### Function Documentation
```typescript
/**
 * Enhances user bio with AI
 * @param bio - Original bio text
 * @param context - User context for enhancement
 * @returns Enhanced bio with quality score
 * @throws {AIServiceError} If enhancement fails
 */
async function enhanceBio(
  bio: string, 
  context: BioContext
): Promise<EnhancedContent> {
  // Implementation
}
```

#### Component Documentation
```typescript
/**
 * Portfolio editor component with real-time preview
 * 
 * @example
 * ```tsx
 * <PortfolioEditor
 *   portfolio={portfolio}
 *   onSave={handleSave}
 *   enableAI={true}
 * />
 * ```
 */
```

### Accessibility Patterns

```typescript
// Always include accessibility attributes
<button
  onClick={handleClick}
  aria-label="Save portfolio"
  aria-busy={isSaving}
  disabled={isSaving}
>
  {isSaving ? 'Saving...' : 'Save'}
</button>

// Semantic HTML
<nav aria-label="Main navigation">
<main role="main">
<aside aria-label="Sidebar">
```

## Code Review Checklist

Before submitting PR, ensure:

- [ ] TypeScript strict mode passes
- [ ] ESLint shows no errors/warnings
- [ ] All tests pass
- [ ] No hardcoded text (use i18n)
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Mobile responsive
- [ ] Accessibility attributes added
- [ ] Performance considered (lazy loading, etc.)
- [ ] Security validated (input sanitization)
- [ ] Documentation updated if needed