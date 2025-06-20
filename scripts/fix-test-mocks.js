#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(`Found ${testFiles.length} test files to check...`);

let totalFixed = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix 1: HuggingFaceService mock pattern
  if (content.includes('(HuggingFaceService as any).mockImplementation')) {
    // Replace class mock with instance mock
    content = content.replace(
      /\(HuggingFaceService as any\)\.mockImplementation\(\s*\(\) => mockHuggingFaceInstance\s*\);/g,
      `jest.mocked(HuggingFaceService).mockImplementation(() => mockHuggingFaceInstance as any);`
    );
    modified = true;
  }

  // Fix 2: jest.mock for HuggingFaceService
  if (
    content.includes("jest.mock('@/lib/ai/huggingface-service')") &&
    !content.includes('HuggingFaceService: jest.fn()')
  ) {
    // Update the mock to properly mock the class
    content = content.replace(
      /jest\.mock\('@\/lib\/ai\/huggingface-service'\);/g,
      `jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(),
}));`
    );
    modified = true;
  }

  // Fix 3: Add proper type assertions for mocked functions
  if (
    content.includes('as jest.MockedFunction') &&
    !content.includes('jest.mocked')
  ) {
    content = content.replace(
      /\((\w+) as jest\.MockedFunction<typeof \w+>\)/g,
      'jest.mocked($1)'
    );
    modified = true;
  }

  // Fix 4: Fix logger mock implementations
  if (content.includes('mockImplementation(() => {})')) {
    content = content.replace(
      /mockImplementation\(\(\) => \{\}\)/g,
      'mockImplementation(() => undefined)'
    );
    modified = true;
  }

  // Fix 5: Fix test timeout syntax
  if (content.match(/it\('.*',\s*\d+,\s*async/)) {
    // Fix timeout as third parameter
    content = content.replace(
      /it\(('.*'),\s*(\d+),\s*(async.*?)\)/g,
      'it($1, $3, $2)'
    );
    modified = true;
  }

  // Fix 6: Add missing test environment comments for node tests
  if (
    file.includes('/api/') &&
    !content.includes('@jest-environment') &&
    content.includes('NextRequest')
  ) {
    content = `/**
 * @jest-environment node
 */

${content}`;
    modified = true;
  }

  // Fix 7: Fix mockResolvedValue with undefined
  if (content.includes('.mockResolvedValue(undefined)')) {
    content = content.replace(
      /\.mockResolvedValue\(undefined\)/g,
      '.mockResolvedValue(void 0)'
    );
    modified = true;
  }

  // Fix 8: Fix mockReturnValue with undefined
  if (content.includes('.mockReturnValue(undefined)')) {
    content = content.replace(
      /\.mockReturnValue\(undefined\)/g,
      '.mockReturnValue(void 0)'
    );
    modified = true;
  }

  // Fix 9: Add missing FormData polyfill for tests that need it
  if (
    content.includes('FormData') &&
    !content.includes('global.FormData') &&
    file.includes('/api/')
  ) {
    const formDataPolyfill = `// Polyfill FormData for Node environment
global.FormData = class FormData {
  private data: Map<string, any> = new Map();
  
  append(key: string, value: any) {
    this.data.set(key, value);
  }
  
  get(key: string) {
    return this.data.get(key);
  }
  
  has(key: string) {
    return this.data.has(key);
  }
  
  delete(key: string) {
    this.data.delete(key);
  }
  
  *[Symbol.iterator]() {
    yield* this.data;
  }
};
`;

    // Add after imports but before jest.mock calls
    const importMatch = content.match(
      /(import[\s\S]*?from\s+['"][^'"]+['"];?\s*\n)+/
    );
    if (importMatch) {
      const lastImportEnd = importMatch.index + importMatch[0].length;
      content =
        content.slice(0, lastImportEnd) +
        '\n' +
        formDataPolyfill +
        content.slice(lastImportEnd);
      modified = true;
    }
  }

  // Fix 10: Fix async test syntax
  if (content.includes('async () => {')) {
    // Ensure proper async/await in tests
    content = content.replace(
      /it\((['"`].*?['"`]),\s*async\s*\(\)\s*=>\s*\{/g,
      'it($1, async () => {'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n✨ Fixed ${totalFixed} test files`);
