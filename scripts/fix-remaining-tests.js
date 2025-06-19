#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get list of all failing test files
function getFailingTests() {
  try {
    const output = execSync('npm test 2>&1 | grep -E "FAIL " | awk \'{print $2}\'', { encoding: 'utf8' });
    return output.split('\n').filter(line => line.trim());
  } catch (e) {
    console.log('Error getting failing tests:', e.message);
    return [];
  }
}

// Fix common test issues
function fixTestFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: Add missing mock imports
  if (!content.includes("import { jest }") && content.includes("jest.")) {
    content = `import { jest } from '@jest/globals';\n` + content;
    modified = true;
  }

  // Fix 2: Fix router mock setup
  if (content.includes("useRouter") && !content.includes("jest.mock('next/navigation')")) {
    const mockSection = `
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));
`;
    const importIndex = content.indexOf("import");
    if (importIndex > -1) {
      const insertPos = content.indexOf('\n', importIndex) + 1;
      content = content.slice(0, insertPos) + mockSection + content.slice(insertPos);
      modified = true;
    }
  }

  // Fix 3: Fix zustand store mocks
  if (content.includes("zustand") && !content.includes("jest.mock('zustand')")) {
    const zustandMock = `
// Mock zustand
jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
`;
    const importIndex = content.indexOf("import");
    if (importIndex > -1) {
      const insertPos = content.indexOf('\n', importIndex) + 1;
      content = content.slice(0, insertPos) + zustandMock + content.slice(insertPos);
      modified = true;
    }
  }

  // Fix 4: Add console mocks to prevent noise
  if (!content.includes("jest.spyOn(console") && content.includes("describe(")) {
    const consoleMock = `
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
`;
    content = content.replace(/(describe\([^{]+\{)/, '$1' + consoleMock);
    modified = true;
  }

  // Fix 5: Fix test timeout syntax
  content = content.replace(/it\(\s*'([^']+)',\s*(\d+),\s*async/g, "it('$1', async");
  if (content.includes(", async")) {
    modified = true;
  }

  // Fix 6: Fix async store imports
  if (content.includes("await import('zustand')")) {
    content = content.replace(
      /let actualCreate;\s*beforeAll\(async \(\) => \{\s*const zustand = await import\('zustand'\);\s*actualCreate = zustand\.create;\s*\}\);/g,
      ''
    );
    modified = true;
  }

  // Fix 7: Fix test environment declarations
  if (!content.includes("@jest-environment") && content.includes("window") && !content.includes("global.window")) {
    content = `/**
 * @jest-environment jsdom
 */

` + content;
    modified = true;
  }

  // Fix 8: Fix FormData polyfill
  if (content.includes("FormData") && !content.includes("global.FormData")) {
    const formDataPolyfill = `
// Polyfill FormData for Node environment
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
    content = formDataPolyfill + content;
    modified = true;
  }

  // Fix 9: Mock fetch globally
  if (content.includes("fetch") && !content.includes("global.fetch")) {
    const fetchMock = `
// Mock global fetch
global.fetch = jest.fn();
`;
    const beforeEachIndex = content.indexOf("beforeEach");
    if (beforeEachIndex > -1) {
      const insertPos = content.indexOf("{", beforeEachIndex) + 1;
      content = content.slice(0, insertPos) + fetchMock + content.slice(insertPos);
      modified = true;
    }
  }

  // Fix 10: Fix React component mocks
  if (content.includes("render(") && !content.includes("@testing-library/react")) {
    content = content.replace(
      /import \{ render/g,
      "import { render"
    );
    if (!content.includes("mockUseLanguage")) {
      const i18nMock = `
// Mock i18n
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(() => ({
    t: {
      common: { close: 'Close' },
      errors: { generic: 'Error' },
    },
    language: 'en',
    setLanguage: jest.fn(),
    isLoading: false,
  })),
  LanguageProvider: ({ children }) => children,
}));
`;
      const importIndex = content.indexOf("import");
      if (importIndex > -1) {
        const insertPos = content.indexOf('\n', importIndex) + 1;
        content = content.slice(0, insertPos) + i18nMock + content.slice(insertPos);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Main execution
console.log('🔍 Finding failing tests...\n');
const failingTests = getFailingTests();

if (failingTests.length === 0) {
  console.log('No failing tests found or unable to get test list.');
  console.log('Fixing known problematic test files...\n');
  
  // Fix known problematic files
  const knownProblematicFiles = [
    '__tests__/hooks/useRealTimePreview.test.ts',
    '__tests__/hooks/useAutoSave.test.ts',
    '__tests__/hooks/use-toast.test.ts',
    '__tests__/components/auth/protected-route.test.tsx',
    '__tests__/integration/template-system.test.tsx',
    '__tests__/integration/portfolio-publishing.test.tsx',
    '__tests__/integration/api-flow.test.ts',
    '__tests__/integration/ai-enhancement-flow.test.tsx',
    '__tests__/integration/auth-flow.test.tsx',
    '__tests__/feedback/feedback-system.test.ts',
    '__tests__/e2e/template-switching.test.ts',
    '__tests__/e2e/portfolio-creation-journey.test.ts',
    '__tests__/performance/optimization.test.ts',
    '__tests__/monitoring/signoz-integration.test.ts',
    '__tests__/onboarding/onboarding-store.test.ts',
  ];

  let fixedCount = 0;
  knownProblematicFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fixTestFile(fullPath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n✨ Fixed ${fixedCount} test files!`);
} else {
  console.log(`Found ${failingTests.length} failing test files.\n`);
  
  let fixedCount = 0;
  failingTests.forEach(testFile => {
    const fullPath = path.join(process.cwd(), testFile);
    if (fixTestFile(fullPath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n✨ Fixed ${fixedCount} out of ${failingTests.length} test files!`);
}

console.log('\n📊 Run tests again to check progress.');