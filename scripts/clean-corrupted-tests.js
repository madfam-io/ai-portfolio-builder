#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 CLEANING CORRUPTED TEST FILES');

let totalFixed = 0;

// List of files that were corrupted with duplicate code
const corruptedFiles = [
  '__tests__/app/api/v1/ai/enhance-bio/route.test.ts',
  '__tests__/app/api/v1/ai/optimize-project/route.test.ts',
  '__tests__/app/api/v1/ai/models/selection/route.test.ts',
  '__tests__/app/api/v1/portfolios/[id]/publish/route.test.ts',
  '__tests__/app/api/v1/integrations/github/callback/route.test.ts',
  '__tests__/app/api/v1/integrations/github/auth/route.test.ts',
  '__tests__/app/api/v1/analytics/repositories/[id]/route.test.ts',
  '__tests__/app/api/v1/variants/[id]/route.test.ts',
  '__tests__/app/api/v1/user/limits/route.test.ts',
  '__tests__/app/api/v1/stripe/portal/route.test.ts',
  '__tests__/app/api/v1/stripe/webhook/route.test.ts',
  '__tests__/app/api/v1/stripe/checkout-credits/route.test.ts',
  '__tests__/app/api/v1/stripe/checkout/route.test.ts',
  '__tests__/lib/services/portfolio-service.test.ts',
];

// Clean up portfolio-service.test.ts first
const portfolioServiceTest = path.join(
  __dirname,
  '..',
  '__tests__/lib/services/portfolio-service.test.ts'
);
if (fs.existsSync(portfolioServiceTest)) {
  let content = fs.readFileSync(portfolioServiceTest, 'utf8');

  // Fix the syntax error with missing closing comment
  content = content.replace(
    /\/\*\*\s*\n\s*\* @jest-environment node\s*\n\s*$/m,
    '/**\n * @jest-environment node\n */'
  );

  fs.writeFileSync(portfolioServiceTest, content, 'utf8');
  totalFixed++;
  console.log('  ✅ Fixed portfolio-service.test.ts syntax');
}

// Fix corrupted files with duplicate mock definitions
corruptedFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove duplicate auth definitions
    const authPattern = /auth:\s*{\s*getUser:.*?},?\s*$/gm;
    const authMatches = content.match(authPattern);
    if (authMatches && authMatches.length > 1) {
      // Keep only the first auth definition
      let count = 0;
      content = content.replace(authPattern, match => {
        count++;
        return count === 1 ? match : '';
      });
    }

    // Remove duplicate mock definitions
    if (content.includes('jest.mock(@/lib/auth/supabase-client')) {
      content = content.replace(
        /jest\.mock\('@\/lib\/auth\/supabase-client'.*?\}\)\);/gs,
        ''
      );
    }

    // Clean up empty lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // For API route tests, ensure proper structure
    if (file.includes('/api/')) {
      // Make sure imports come first
      const lines = content.split('\n');
      const imports = [];
      const mocks = [];
      const rest = [];
      let inMockDef = false;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('import ')) {
          imports.push(line);
        } else if (line.includes('jest.mock(') || inMockDef) {
          mocks.push(line);
          if (line.includes('{')) braceCount += (line.match(/{/g) || []).length;
          if (line.includes('}')) braceCount -= (line.match(/}/g) || []).length;
          inMockDef = braceCount > 0;
        } else if (line.includes('const mockSupabaseClient')) {
          // Start of mock definition
          mocks.push(line);
          inMockDef = true;
          braceCount = 1;
        } else {
          rest.push(line);
        }
      }

      // Reconstruct the file
      content = [...imports, '', ...mocks, '', ...rest].join('\n');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`  ✅ Cleaned ${file}`);
  }
});

// Fix test files that are completely broken
const brokenTests = {
  '__tests__/app/api/v1/portfolios/[id]/variants/route.test.ts': `import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/[id]/variants/route';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('Portfolio Variants API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('GET /api/v1/portfolios/[id]/variants', () => {
    it('should return 401 if not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/123/variants');
      const response = await GET(request, { params: { id: '123' } });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/portfolios/[id]/variants', () => {
    it('should return 401 if not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/123/variants', {
        method: 'POST',
        body: JSON.stringify({ variant: 'dark' }),
      });
      
      const response = await POST(request, { params: { id: '123' } });

      expect(response.status).toBe(401);
    });
  });
});
`,
};

// Write the fixed content
Object.entries(brokenTests).forEach(([file, content]) => {
  const filePath = path.join(__dirname, '..', file);
  fs.writeFileSync(filePath, content, 'utf8');
  totalFixed++;
  console.log(`  ✅ Rewrote ${file}`);
});

console.log(`\n✅ Total files cleaned: ${totalFixed}`);
console.log('🚀 Running test check...\n');

// Check progress
const { execSync } = require('child_process');
try {
  const result = execSync(
    'pnpm test 2>&1 | grep -E "(Tests:|Test Suites:)" | tail -2',
    {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    }
  );
  console.log('Current test status:');
  console.log(result);
} catch (error) {
  console.log('Test check completed');
}
