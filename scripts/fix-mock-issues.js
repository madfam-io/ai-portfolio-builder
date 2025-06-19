#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(`Found ${testFiles.length} test files to check for mock issues...`);

let totalFixed = 0;

testFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix 1: Add missing afterEach for tests that use jest.useFakeTimers
  if (content.includes('jest.useFakeTimers') && !content.includes('jest.useRealTimers')) {
    const describeBlocks = content.split(/describe\(/g);
    for (let i = 1; i < describeBlocks.length; i++) {
      if (describeBlocks[i].includes('jest.useFakeTimers') && !describeBlocks[i].includes('jest.useRealTimers')) {
        // Find the end of this describe block
        const blockEnd = describeBlocks[i].lastIndexOf('});');
        if (blockEnd > 0) {
          describeBlocks[i] = describeBlocks[i].slice(0, blockEnd) + `
  afterEach(() => {
    jest.useRealTimers();
  });
` + describeBlocks[i].slice(blockEnd);
          modified = true;
        }
      }
    }
    if (modified) {
      content = describeBlocks.join('describe(');
    }
  }

  // Fix 2: Add proper return types for mock functions
  content = content.replace(
    /jest\.fn\(\)\.mockReturnValue\(void 0\)/g,
    'jest.fn().mockReturnValue(undefined)'
  );

  // Fix 3: Fix async test without await
  content = content.replace(
    /it\((['"`])([^'"`]+)(['"`]),\s*async\s*\(\)\s*=>\s*\{([^}]*expect\([^)]*\)\.resolves[^}]*)\}/g,
    (match, q1, name, q2, body) => {
      if (!body.includes('await')) {
        body = body.replace(/(\s*)expect\(/g, '$1await expect(');
      }
      return `it(${q1}${name}${q2}, async () => {${body}}`;
    }
  );

  // Fix 4: Fix HuggingFace service mock constructor
  if (content.includes("jest.mock('@/lib/ai/huggingface-service')") && 
      content.includes('HuggingFaceService:') &&
      !content.includes('jest.fn(() =>')) {
    content = content.replace(
      /HuggingFaceService:\s*mockHuggingFaceService/g,
      'HuggingFaceService: jest.fn(() => mockHuggingFaceInstance)'
    );
    
    // Ensure mockHuggingFaceInstance is defined
    if (!content.includes('mockHuggingFaceInstance')) {
      content = content.replace(
        /const mockHuggingFaceService = jest\.fn\(\);/,
        `const mockHuggingFaceInstance = {
  getAvailableModels: jest.fn(),
  enhanceBio: jest.fn(),
  optimizeProjectDescription: jest.fn(),
  recommendTemplate: jest.fn(),
  healthCheck: jest.fn(),
  getUsageStats: jest.fn(),
};`
      );
    }
    modified = true;
  }

  // Fix 5: Add missing i18n mock import where useLanguage is used
  if (content.includes('useLanguage') && !content.includes("jest.mock('@/lib/i18n/refactored-context')")) {
    // Add the mock before the component imports
    const importMatch = content.match(/(import.*from.*['"]@\/.*['"];?\s*\n)+/);
    if (importMatch) {
      const mockCode = `
// Mock i18n
import { mockUseLanguage } from '@/test-utils/mock-i18n';
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: mockUseLanguage,
}));

`;
      content = content.replace(importMatch[0], mockCode + importMatch[0]);
      modified = true;
    }
  }

  // Fix 6: Fix cache mock issues
  if (content.includes('cache.get') || content.includes('cache.set')) {
    if (!content.includes("jest.mock('@/lib/cache")) {
      const importMatch = content.match(/(import.*from.*['"]@\/.*['"];?\s*\n)+/);
      if (importMatch) {
        const mockCode = `
// Mock cache
jest.mock('@/lib/cache/redis-cache.server', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  },
}));

`;
        content = content.replace(importMatch[0], mockCode + importMatch[0]);
        modified = true;
      }
    }
  }

  // Fix 7: Mock fetch for tests that use it
  if ((content.includes('fetch(') || content.includes('Response')) && !content.includes('global.fetch')) {
    // Add fetch mock in beforeEach
    content = content.replace(
      /beforeEach\(\(\) => \{/g,
      `beforeEach(() => {
    global.fetch = jest.fn();`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n✨ Fixed mock issues in ${totalFixed} test files`);