# API Validation Guide

This guide demonstrates how to use the validation middleware and schemas in your API routes.

## Overview

The AI Portfolio Builder uses a comprehensive validation system to ensure data integrity and security:

1. **Zod Schemas**: Type-safe validation schemas
2. **Middleware**: Automatic validation before route handlers
3. **Sanitization**: XSS prevention through DOMPurify
4. **Error Handling**: Consistent error responses

## Using Validation in API Routes

### Method 1: Using createValidatedHandler

```typescript
import { createValidatedHandler, commonSchemas } from '@/lib/api/middleware/validation';
import { createPortfolioSchema } from '@/lib/validation/schemas/portfolio';
import { z } from 'zod';

// Define validation schema
const validationSchema = {
  body: createPortfolioSchema,
  query: commonSchemas.pagination,
};

// Create validated handler
export const POST = createValidatedHandler(
  validationSchema,
  async (request, context) => {
    // Access validated data
    const { body, query } = request.validated;
    
    // Your route logic here
    const portfolio = await createPortfolio(body);
    
    return NextResponse.json(portfolio);
  }
);
```

### Method 2: Using validateRequest Middleware

```typescript
import { validateRequest } from '@/lib/api/middleware/validation';
import { enhanceBioSchema } from '@/lib/validation/schemas/ai';

export async function POST(request: NextRequest) {
  // Apply validation
  const validation = validateRequest({
    body: enhanceBioSchema,
    sanitize: true, // Enable XSS sanitization
  });
  
  const validationResult = await validation(request);
  if (validationResult) {
    return validationResult; // Return validation error
  }
  
  // Access validated data
  const { text, model, tone } = (request as any).validated.body;
  
  // Your route logic here
  const enhanced = await enhanceBio(text, { model, tone });
  
  return NextResponse.json({ enhanced });
}
```

### Method 3: Using Validation Schemas Directly

```typescript
import { portfolioQuerySchema } from '@/lib/validation/schemas/portfolio';
import { apiError, apiSuccess } from '@/lib/api/response-helpers';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate
    const validated = portfolioQuerySchema.parse(query);
    
    // Use validated data
    const portfolios = await getPortfolios(validated);
    
    return apiSuccess(portfolios);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('Validation failed', {
        status: 400,
        errors: error.errors,
      });
    }
    
    return apiError('Internal server error');
  }
}
```

## Available Validation Schemas

### Portfolio Schemas

```typescript
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioQuerySchema,
  subdomainCheckSchema,
  publishPortfolioSchema,
} from '@/lib/validation/schemas/portfolio';
```

### AI Schemas

```typescript
import {
  enhanceBioSchema,
  optimizeProjectSchema,
  recommendTemplateSchema,
  generateContentSchema,
  batchAIOperationSchema,
  aiFeedbackSchema,
} from '@/lib/validation/schemas/ai';
```

### Common Schemas

```typescript
import { commonSchemas } from '@/lib/api/middleware/validation';

// Available schemas:
commonSchemas.id          // UUID validation
commonSchemas.email       // Email validation
commonSchemas.password    // Strong password validation
commonSchemas.url         // URL validation
commonSchemas.pagination  // Pagination params
commonSchemas.dateRange   // Date range validation
commonSchemas.fileUpload  // File upload validation
```

## Security Features

### XSS Prevention

By default, all string inputs are sanitized using DOMPurify to prevent XSS attacks:

```typescript
const validation = validateRequest({
  body: schema,
  sanitize: true, // Default: true
});
```

### SQL Injection Prevention

The middleware in `middleware/security/validation.ts` checks for SQL injection patterns:

```typescript
// Automatically rejected patterns:
- SQL keywords (SELECT, INSERT, UPDATE, DELETE, etc.)
- SQL comments (-- or /**/)
- Common injection patterns
```

### Request Size Limits

The security middleware enforces a 10MB request size limit by default.

## Error Response Format

Validation errors return a consistent format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Invalid email format"
    },
    {
      "path": "projects.0.title",
      "message": "Title is required"
    }
  ]
}
```

## Best Practices

1. **Always validate user input**: Never trust client-side data
2. **Use strict schemas**: Define exact shapes, don't allow unknown fields
3. **Sanitize by default**: Keep sanitization enabled unless you have a specific reason
4. **Type safety**: Use the inferred types from schemas for type safety

```typescript
import type { CreatePortfolioInput } from '@/lib/validation/schemas/portfolio';

function processPortfolio(data: CreatePortfolioInput) {
  // TypeScript knows the exact shape of data
}
```

5. **Custom validation**: Add refinements for business logic

```typescript
const customSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: "End date must be after start date" }
);
```

## Testing Validation

```typescript
import { createPortfolioSchema } from '@/lib/validation/schemas/portfolio';

describe('Portfolio Validation', () => {
  it('should validate correct data', () => {
    const valid = {
      name: 'John Doe',
      template: 'developer',
      email: 'john@example.com',
    };
    
    expect(() => createPortfolioSchema.parse(valid)).not.toThrow();
  });
  
  it('should reject invalid data', () => {
    const invalid = {
      name: 'J', // Too short
      template: 'invalid', // Not in enum
      email: 'not-an-email',
    };
    
    expect(() => createPortfolioSchema.parse(invalid)).toThrow();
  });
});
```

## Migration Guide

If you have existing routes without validation:

1. Create or use existing schemas
2. Add validation middleware
3. Update route handler to use validated data
4. Test with invalid inputs
5. Update error handling

The validation system ensures your API is secure, type-safe, and maintains data integrity throughout the application.