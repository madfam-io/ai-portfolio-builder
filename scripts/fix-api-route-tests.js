#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const testFiles = [
  '__tests__/app/api/v1/ai/enhance-bio/route.test.ts',
  '__tests__/app/api/v1/ai/optimize-project/route.test.ts',
  '__tests__/app/api/v1/ai/recommend-template/route.test.ts',
  '__tests__/app/api/v1/ai/models/route.test.ts',
  '__tests__/app/api/v1/analytics/repositories/[id]/route.test.ts',
  '__tests__/app/api/v1/portfolios/[id]/route.test.ts',
  '__tests__/app/api/v1/portfolios/check-subdomain/route.test.ts',
  '__tests__/app/api/v1/portfolios/[id]/publish/route.test.ts',
];

function fixApiRouteTest(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: Add missing mocks for createClient
  if (
    !content.includes("jest.mock('@/lib/supabase/server')") &&
    content.includes('import { createClient }')
  ) {
    const mockSection = `
// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
`;
    const importIndex = content.indexOf('import {');
    if (importIndex > -1) {
      const insertPos = content.indexOf('\n', importIndex) + 1;
      content =
        content.slice(0, insertPos) + mockSection + content.slice(insertPos);
      modified = true;
    }
  }

  // Fix 2: Mock the auth middleware properly
  if (
    !content.includes("jest.mock('@/lib/api/middleware/auth')") &&
    content.includes('withAuth')
  ) {
    const authMock = `
// Mock auth middleware
jest.mock('@/lib/api/middleware/auth', () => ({
  withAuth: (handler) => handler,
  AuthenticatedRequest: {},
}));
`;
    const importIndex = content.indexOf('import {');
    if (importIndex > -1) {
      const insertPos = content.indexOf('\n', importIndex) + 1;
      content =
        content.slice(0, insertPos) + authMock + content.slice(insertPos);
      modified = true;
    }
  }

  // Fix 3: Mock error handling utilities
  if (
    !content.includes("jest.mock('@/lib/services/error')") &&
    content.includes('errorLogger')
  ) {
    const errorMock = `
// Mock error utilities
jest.mock('@/lib/services/error', () => ({
  parseJsonBody: jest.fn().mockImplementation(async (request) => {
    const body = await request.json();
    return body;
  }),
  errorLogger: jest.fn(),
}));
`;
    const importIndex = content.indexOf('import {');
    if (importIndex > -1) {
      const insertPos = content.indexOf('\n', importIndex) + 1;
      content =
        content.slice(0, insertPos) + errorMock + content.slice(insertPos);
      modified = true;
    }
  }

  // Fix 4: Ensure request has user property for authenticated routes
  if (
    content.includes('const request = createMockRequest') &&
    !content.includes('request.user =')
  ) {
    content = content.replace(
      /const request = createMockRequest\(([\s\S]*?)\);/g,
      (match, args) => {
        return `const request = createMockRequest(${args});\n      request.user = { id: 'user_123', email: 'test@example.com' };`;
      }
    );
    modified = true;
  }

  // Fix 5: Add createClient mock in setupCommonMocks
  if (
    content.includes('setupCommonMocks(') &&
    !content.includes('createClient:')
  ) {
    content = content.replace(
      /setupCommonMocks\(\{/g,
      `setupCommonMocks({
        createClient: jest.fn().mockResolvedValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user_123', email: 'test@example.com' } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'user_123', ai_credits: 10 },
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: [{ id: 'test_id' }],
                error: null,
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ ai_credits: 9 }],
                error: null,
              }),
            }),
          }),
        }),`
    );
    modified = true;
  }

  // Fix 6: Mock HuggingFaceService instances
  if (
    content.includes('HuggingFaceService') &&
    !content.includes('mockImplementation(() => ({')
  ) {
    content = content.replace(
      /HuggingFaceService: jest\.fn\(\)/g,
      `HuggingFaceService: jest.fn().mockImplementation(() => ({
          healthCheck: jest.fn().mockResolvedValue(true),
          enhanceBio: jest.fn().mockResolvedValue({
            enhancedBio: 'Enhanced bio content',
            tone: 'professional',
            wordCount: 10,
            keyHighlights: ['Enhanced'],
          }),
          optimizeProject: jest.fn().mockResolvedValue({
            optimizedTitle: 'Optimized Title',
            optimizedDescription: 'Optimized description',
            metrics: ['100% improvement'],
          }),
          recommendTemplate: jest.fn().mockResolvedValue({
            template: 'modern',
            confidence: 0.9,
            reasoning: 'Best fit for your profile',
          }),
        }))`
    );
    modified = true;
  }

  // Fix 7: Fix module mocking syntax
  if (content.includes('jest.doMock')) {
    content = content.replace(/jest\.doMock/g, 'jest.mock');
    modified = true;
  }

  // Fix 8: Add proper mock for createClient import
  if (
    content.includes('const { createClient }') &&
    !content.includes('jest.mocked(createClient)')
  ) {
    content = content.replace(
      /const \{ createClient \} = jest\.requireMock\('@\/lib\/supabase\/server'\);/g,
      `const { createClient } = await import('@/lib/supabase/server');
const mockCreateClient = jest.mocked(createClient);`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

// Fix all test files
testFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  fixApiRouteTest(fullPath);
});

console.log('\n🎉 API route test fixing complete!');
