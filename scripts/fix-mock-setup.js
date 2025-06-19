#!/usr/bin/env node

/**
 * Script to fix mock setup issues in test files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Common mock patterns that need fixing
const mockPatterns = [
  {
    // Fix HuggingFaceService mock
    pattern: /jest\.mock\('@\/lib\/ai\/huggingface-service'\);/g,
    replacement: `jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(),
}));`,
  },
  {
    // Fix createClient mock
    pattern: /jest\.mock\('@\/lib\/supabase\/server'\);/g,
    replacement: `jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));`,
  },
  {
    // Fix logger mock
    pattern: /jest\.mock\('@\/lib\/utils\/logger'\);/g,
    replacement: `jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));`,
  },
  {
    // Fix AnalyticsService mock
    pattern: /jest\.mock\('@\/lib\/services\/analyticsService'\);/g,
    replacement: `jest.mock('@/lib/services/analyticsService', () => ({
  AnalyticsService: jest.fn(),
}));`,
  },
  {
    // Fix withCacheHeaders mock
    pattern: /jest\.mock\('@\/lib\/cache\/cache-headers'\);/g,
    replacement: `jest.mock('@/lib/cache/cache-headers', () => ({
  withCacheHeaders: jest.fn((response) => response),
  generateETag: jest.fn(() => 'test-etag'),
}));`,
  },
  {
    // Fix authenticateUser mock
    pattern: /jest\.mock\('@\/lib\/api\/middleware\/auth'\);/g,
    replacement: `jest.mock('@/lib/api/middleware/auth', () => ({
  authenticateUser: jest.fn(),
  hasPermission: jest.fn(),
  withAuth: jest.fn((handler) => handler),
}));`,
  },
  {
    // Fix cookies mock
    pattern: /jest\.mock\('next\/headers'\);/g,
    replacement: `jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));`,
  },
  {
    // Fix enhancedStripeService mock
    pattern: /jest\.mock\('@\/lib\/services\/stripe\/stripe-enhanced'\);/g,
    replacement: `jest.mock('@/lib/services/stripe/stripe-enhanced', () => ({
  enhancedStripeService: {
    isAvailable: jest.fn(),
    checkPromotionalEligibility: jest.fn(),
    createCheckoutSession: jest.fn(),
    createPortalSession: jest.fn(),
  },
  PROMOTIONAL_CONFIG: {
    code: 'TEST_PROMO',
    description: 'Test promotion',
    discountPercentage: 50,
  },
}));`,
  },
];

// Additional patterns to fix mock usage
const usagePatterns = [
  {
    // Fix HuggingFaceService usage
    pattern: /\(HuggingFaceService as jest\.Mock\)\.mockImplementation/g,
    replacement:
      '(HuggingFaceService as jest.MockedClass<typeof HuggingFaceService>).mockImplementation',
  },
  {
    // Fix createClient usage
    pattern: /\(createClient as jest\.Mock\)\.mockReturnValue/g,
    replacement:
      '(createClient as jest.MockedFunction<typeof createClient>).mockReturnValue',
  },
  {
    // Fix logger usage
    pattern: /\(logger\.(\w+) as jest\.Mock\)/g,
    replacement: '(logger.$1 as jest.MockedFunction<typeof logger.$1>)',
  },
];

function fixMockFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Apply mock declaration fixes
    for (const { pattern, replacement } of mockPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    }

    // Apply usage pattern fixes
    for (const { pattern, replacement } of usagePatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    }

    // Fix import issues
    if (
      content.includes('import { HuggingFaceService }') &&
      !content.includes('import type { HuggingFaceService }')
    ) {
      content = content.replace(
        'import { HuggingFaceService }',
        'import type { HuggingFaceService }'
      );
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing mock setup issues in test files...\n');

  const testFiles = glob.sync('__tests__/**/*.{test,spec}.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true,
  });

  let fixed = 0;
  let total = testFiles.length;

  for (const file of testFiles) {
    if (fixMockFile(file)) {
      fixed++;
    }
  }

  console.log(`\n📊 Summary: Fixed ${fixed}/${total} test files`);
}

main().catch(console.error);
