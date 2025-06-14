/**
 * Validation Middleware Usage Examples
 * 
 * This file demonstrates how to use the validation middleware
 * in your API routes for comprehensive input validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  validateRequest, 
  createValidationMiddleware,
  validationErrorResponse,
  commonSchemas 
} from './validate-request';

// ============================================
// Example 1: Basic POST endpoint validation
// ============================================

// Define your validation schemas
const createPortfolioSchemas = {
  body: z.object({
    name: z.string().min(1).max(100),
    title: z.string().min(1).max(100),
    bio: z.string().min(10).max(500),
    template: z.enum(['developer', 'designer', 'consultant']).optional(),
    social: z.object({
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
      twitter: z.string().url().optional(),
    }).optional(),
  }),
};

// Use in your API route
export async function POST(request: NextRequest) {
  try {
    // Validate the request
    const { body } = await validateRequest(request, createPortfolioSchemas);
    
    // Now 'body' is fully typed and validated
    // TypeScript knows body.name, body.title, etc. exist and are strings
    
    // Your business logic here
    const portfolio = await createPortfolio(body);
    
    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    return validationErrorResponse(error);
  }
}

// ============================================
// Example 2: GET endpoint with query validation
// ============================================

const listPortfoliosSchemas = {
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

export async function GET(request: NextRequest) {
  try {
    const { query } = await validateRequest(request, listPortfoliosSchemas);
    
    // query is now typed with all the fields above
    const portfolios = await getPortfolios({
      page: query.page,
      limit: query.limit,
      filters: {
        status: query.status,
        search: query.search,
      },
      sort: {
        by: query.sortBy,
        order: query.sortOrder,
      },
    });
    
    return NextResponse.json(portfolios);
  } catch (error) {
    return validationErrorResponse(error);
  }
}

// ============================================
// Example 3: Using validation middleware
// ============================================

// Create reusable validation middleware
const validateUpdatePortfolio = createValidationMiddleware({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(100).optional(),
    bio: z.string().min(10).max(500).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
  params: z.object({
    id: commonSchemas.uuid,
  }),
});

// Use in PATCH endpoint
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validated = await validateUpdatePortfolio(request, { params });
    
    // validated.body contains the update data
    // validated.params.id contains the portfolio ID
    
    const updated = await updatePortfolio(
      validated.params.id,
      validated.body
    );
    
    return NextResponse.json(updated);
  } catch (error) {
    return validationErrorResponse(error);
  }
}

// ============================================
// Example 4: Complex validation with custom logic
// ============================================

const complexValidationSchemas = {
  body: z.object({
    email: commonSchemas.email,
    password: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
    profile: z.object({
      firstName: z.string().min(1).max(50),
      lastName: z.string().min(1).max(50),
      dateOfBirth: z.string().datetime(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']),
        notifications: z.boolean(),
        language: z.enum(['en', 'es', 'fr']),
      }),
    }),
    acceptedTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  }),
  headers: z.object({
    'x-client-version': z.string().regex(/^\d+\.\d+\.\d+$/),
    'x-request-id': commonSchemas.uuid.optional(),
  }),
};

// ============================================
// Example 5: File upload validation
// ============================================

const fileUploadSchemas = {
  query: z.object({
    type: z.enum(['avatar', 'project', 'certificate']),
  }),
  headers: z.object({
    'content-type': z.string().refine(
      val => val.startsWith('image/'),
      'Only image files are allowed'
    ),
    'content-length': z.string().transform(Number).pipe(
      z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB')
    ),
  }),
};

// ============================================
// Example 6: Webhook validation with HMAC
// ============================================

const webhookSchemas = {
  body: z.object({
    event: z.enum(['payment.success', 'payment.failed', 'subscription.updated']),
    data: z.record(z.unknown()),
    timestamp: z.number(),
  }),
  headers: z.object({
    'x-webhook-signature': z.string(),
    'x-webhook-timestamp': z.string().transform(Number),
  }),
};

// Custom validation options for webhooks
export async function handleWebhook(request: NextRequest) {
  try {
    const validated = await validateRequest(
      request, 
      webhookSchemas,
      {
        sanitize: false, // Don't sanitize webhook data
        stripUnknown: false, // Keep all webhook fields
      }
    );
    
    // Verify HMAC signature
    const isValid = await verifyWebhookSignature(
      validated.body,
      validated.headers['x-webhook-signature']
    );
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Process webhook
    await processWebhook(validated.body);
    
    return NextResponse.json({ received: true });
  } catch (error) {
    return validationErrorResponse(error);
  }
}

// ============================================
// Helper functions (mock implementations)
// ============================================

async function createPortfolio(data: any) {
  // Implementation
  return { id: '123', ...data };
}

async function getPortfolios(options: any) {
  // Implementation
  return { items: [], total: 0 };
}

async function updatePortfolio(id: string, data: any) {
  // Implementation
  return { id, ...data };
}

async function verifyWebhookSignature(body: any, signature: string) {
  // Implementation
  return true;
}

async function processWebhook(data: any) {
  // Implementation
}