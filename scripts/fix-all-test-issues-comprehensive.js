#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Comprehensive test fix script to address all common test issues
 * This will fix syntax errors, duplicate mocks, and import conflicts
 */

// Patterns to fix
const fixes = [
  // Fix duplicate mock declarations
  {
    pattern: /jest\.mock\(['"]@\/lib\/i18n\/refactored-context['"],\s*\(\)\s*=>\s*\({[\s\S]*?}\)\);[\s\S]*?jest\.mock\(['"]@\/lib\/i18n\/refactored-context['"],/g,
    replacement: (match) => {
      // Keep only the first mock
      const firstMock = match.split('jest.mock')[1];
      return 'jest.mock' + firstMock + ';';
    },
    description: 'Remove duplicate i18n mock declarations'
  },

  // Fix duplicate useLanguage declarations in mocks
  {
    pattern: /useLanguage:\s*\(\)\s*=>\s*mockUseLanguage\(\),[\s\S]*?useLanguage:/g,
    replacement: 'useLanguage: () => mockUseLanguage(),',
    description: 'Remove duplicate useLanguage in mocks'
  },

  // Fix duplicate imports
  {
    pattern: /import\s+{\s*mockUseLanguage\s*}\s+from\s+['"]@\/test-utils\/mock-i18n['"];[\s\S]*?import\s+{\s*mockUseLanguage\s*}\s+from/g,
    replacement: "import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';",
    description: 'Fix duplicate mockUseLanguage imports'
  },

  // Fix malformed mock declarations
  {
    pattern: /}\)\);\s*useLanguage:/g,
    replacement: '}));',
    description: 'Fix malformed mock endings'
  },

  // Fix duplicate mock imports
  {
    pattern: /(import[^;]+from\s+['"][^'"]+['"];)\s*\1/g,
    replacement: '$1',
    description: 'Remove duplicate import statements'
  },

  // Fix React component mock syntax
  {
    pattern: /jest\.mock\(['"]@\/components\/ui\/([^'"]+)['"],\s*\(\)\s*=>\s*\({[^}]*}\)\s*\);/g,
    replacement: (match, componentPath) => {
      const componentName = componentPath.split('/').pop();
      const pascalCase = componentName.charAt(0).toUpperCase() + componentName.slice(1);
      return `jest.mock('@/components/ui/${componentPath}', () => ({
  ${pascalCase}: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));`;
    },
    description: 'Fix UI component mocks'
  },

  // Fix missing React imports in test files
  {
    pattern: /^((?!import\s+React)[\s\S])*(<[A-Z])/m,
    replacement: (match, before, jsx) => {
      if (!match.includes('import React')) {
        return "import React from 'react';\n" + before + jsx;
      }
      return match;
    },
    description: 'Add missing React imports'
  },

  // Fix date mock issues
  {
    pattern: /new Date\(['"]2025-06-01['"]\)/g,
    replacement: "new Date('2025-06-01T00:00:00.000Z')",
    description: 'Fix date timezone issues'
  },

  // Fix async test patterns
  {
    pattern: /it\(['"]([^'"]+)['"]\s*,\s*\(\)\s*=>\s*{/g,
    replacement: (match, testName) => {
      if (match.includes('async') || testName.toLowerCase().includes('async')) {
        return match;
      }
      return `it('${testName}', async () => {`;
    },
    description: 'Add async to test functions'
  },

  // Fix Supabase mock conflicts
  {
    pattern: /jest\.mock\(['"]@\/lib\/supabase\/(?:client|server)['"]\);[\s\S]*?jest\.mock\(['"]@\/lib\/supabase\/(?:client|server)['"]\);/g,
    replacement: "jest.mock('@/lib/supabase/server');",
    description: 'Remove duplicate Supabase mocks'
  },

  // Fix test utility imports
  {
    pattern: /import\s+{\s*renderWithProviders\s*}\s+from\s+['"][^'"]+test-utils[^'"]*['"];/g,
    replacement: "import { renderWithProviders } from '@/__tests__/utils/test-utils';",
    description: 'Standardize test utility imports'
  },

  // Fix mock return value patterns
  {
    pattern: /mockResolvedValue\(\s*{\s*data:\s*null\s*}\s*\)/g,
    replacement: 'mockResolvedValue({ data: null, error: null })',
    description: 'Fix incomplete mock return values'
  },

  // Remove console.log statements from tests
  {
    pattern: /console\.(log|error|warn)\([^)]*\);?\s*\n/g,
    replacement: '',
    description: 'Remove console statements from tests'
  },

  // Fix missing semicolons
  {
    pattern: /}\)\)(?!;)[\s]*\n(?![\s]*})/g,
    replacement: '}));\n',
    description: 'Add missing semicolons'
  },

  // Fix duplicate describe blocks
  {
    pattern: /describe\(['"]([^'"]+)['"]\s*,[\s\S]*?\n}\);[\s]*describe\(['"]\\1['"]\s*,/g,
    replacement: (match) => {
      // Keep only the first describe block
      return match.split('describe(')[1];
    },
    description: 'Remove duplicate describe blocks'
  }
];

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  const changes = [];

  fixes.forEach(fix => {
    const originalContent = content;
    if (typeof fix.replacement === 'function') {
      content = content.replace(fix.pattern, fix.replacement);
    } else {
      content = content.replace(fix.pattern, fix.replacement);
    }
    
    if (content !== originalContent) {
      modified = true;
      changes.push(fix.description);
    }
  });

  // Additional specific fixes for common patterns
  
  // Fix multiple mock declarations for the same module
  const mockDeclarations = {};
  const lines = content.split('\n');
  const newLines = [];
  
  lines.forEach(line => {
    const mockMatch = line.match(/jest\.mock\(['"]([^'"]+)['"]/);
    if (mockMatch) {
      const modulePath = mockMatch[1];
      if (mockDeclarations[modulePath]) {
        // Skip duplicate mock
        modified = true;
        changes.push(`Removed duplicate mock for ${modulePath}`);
        return;
      }
      mockDeclarations[modulePath] = true;
    }
    newLines.push(line);
  });
  
  if (modified) {
    content = newLines.join('\n');
  }

  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}:`);
    changes.forEach(change => console.log(`   - ${change}`));
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔧 Starting comprehensive test fix...\n');

// Find all test files
const testFiles = glob.sync('**/*.test.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', '.next/**', 'coverage/**'],
  cwd: process.cwd()
});

console.log(`Found ${testFiles.length} test files to process\n`);

let fixedCount = 0;
let errorCount = 0;

testFiles.forEach(file => {
  try {
    if (processFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    errorCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`   - Fixed ${fixedCount} files`);
console.log(`   - Errors: ${errorCount}`);
console.log(`   - Unchanged: ${testFiles.length - fixedCount - errorCount}`);

// Now create standardized mock files
console.log('\n🏗️  Creating standardized mock structure...');

// Create global mocks directory if it doesn't exist
const mockDir = path.join(process.cwd(), '__tests__', 'setup');
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}

// Create global mocks file
const globalMocksContent = `/**
 * Global mocks for all tests
 * Import this in jest.setup.js
 */

// Mock next/navigation
export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockRefresh = jest.fn();
export const mockBack = jest.fn();
export const mockPrefetch = jest.fn();
export const mockPathname = '/';
export const mockSearchParams = new URLSearchParams();

export const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  refresh: mockRefresh,
  back: mockBack,
  prefetch: mockPrefetch,
  pathname: mockPathname,
  searchParams: mockSearchParams,
};

export const mockUseRouter = jest.fn(() => mockRouter);
export const mockUsePathname = jest.fn(() => mockPathname);
export const mockUseSearchParams = jest.fn(() => mockSearchParams);

// Mock i18n
export const mockUseLanguage = jest.fn(() => ({
  t: {
    test: 'test',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
  },
  lang: 'en',
  setLang: jest.fn(),
}));

// Mock Supabase
export const createSupabaseMock = () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDelete = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockFrom = jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
  }));

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signIn: jest.fn().mockResolvedValue({ data: null, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: mockFrom,
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  };
};

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
`;

fs.writeFileSync(path.join(mockDir, 'global-mocks.ts'), globalMocksContent);
console.log('✅ Created global-mocks.ts');

// Create test environment file
const testEnvContent = `/**
 * Test environment configuration
 */

// Set up environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
process.env.HUGGINGFACE_API_KEY = 'hf_test_123';
process.env.NODE_ENV = 'test';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
`;

fs.writeFileSync(path.join(mockDir, 'test-environment.ts'), testEnvContent);
console.log('✅ Created test-environment.ts');

// Update jest.setup.js to use new structure
const jestSetupContent = `/**
 * Jest setup file
 * Runs before all tests
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import './setup/test-environment';
import './setup/global-mocks';

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => require('./__tests__/setup/global-mocks').mockUseRouter(),
  usePathname: () => require('./__tests__/setup/global-mocks').mockUsePathname(),
  useSearchParams: () => require('./__tests__/setup/global-mocks').mockUseSearchParams(),
  useParams: jest.fn(() => ({})),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock i18n
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => require('./__tests__/setup/global-mocks').mockUseLanguage(),
  LanguageProvider: ({ children }) => children,
}));

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => require('./__tests__/setup/global-mocks').createSupabaseMock(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => require('./__tests__/setup/global-mocks').createSupabaseMock(),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
`;

const setupPath = path.join(process.cwd(), 'jest.setup.js');
fs.writeFileSync(setupPath, jestSetupContent);
console.log('✅ Updated jest.setup.js');

console.log('\n✨ Comprehensive test fix completed!');
console.log('\nNext steps:');
console.log('1. Run: pnpm test to see improved results');
console.log('2. Fix any remaining syntax errors manually');
console.log('3. Start adding new tests for uncovered code');