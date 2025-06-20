#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Final test fixes...\n');

// Get all failing tests
function getFailingTests() {
  try {
    const output = execSync('npm test -- --listTests 2>&1', {
      encoding: 'utf8',
    });
    const allTests = output
      .split('\n')
      .filter(
        line =>
          (line.includes('__tests__') && line.endsWith('.ts')) ||
          line.endsWith('.tsx')
      );

    const failing = [];
    allTests.forEach(test => {
      try {
        const result = execSync(`npm test -- ${test} --passWithNoTests 2>&1`, {
          encoding: 'utf8',
          timeout: 5000,
        });
        if (result.includes('FAIL ')) {
          failing.push(test);
        }
      } catch (e) {
        failing.push(test);
      }
    });

    return failing;
  } catch (e) {
    return [];
  }
}

// Fix auth store test
function fixAuthStoreTest() {
  const filePath = path.join(
    process.cwd(),
    '__tests__/lib/store/auth-store.test.ts'
  );
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add missing mocks
    if (!content.includes("jest.mock('@/lib/supabase/client'")) {
      const mocks = `
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signIn: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  })),
}));

`;
      content = mocks + content;
    }

    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed auth-store.test.ts');
  }
}

// Fix middleware test
function fixMiddlewareTest() {
  const filePath = path.join(process.cwd(), '__tests__/middleware.test.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Ensure proper mock setup
    if (!content.includes('mockGetSession.mockResolvedValue')) {
      content = content.replace(
        'beforeEach(() => {',
        `beforeEach(() => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });`
      );
    }

    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed middleware.test.ts');
  }
}

// Fix component tests with missing React imports
function fixComponentTests() {
  const componentTests = execSync(
    'find __tests__/components -name "*.tsx" -type f',
    { encoding: 'utf8' }
  )
    .split('\n')
    .filter(f => f.trim());

  let fixed = 0;
  componentTests.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Add React import
      if (
        !content.includes('import React') &&
        !content.includes('import * as React')
      ) {
        content = "import React from 'react';\n" + content;
        modified = true;
      }

      // Fix act imports
      if (content.includes('act(') && !content.includes('import { act }')) {
        content = content.replace(
          /from '@testing-library\/react';/,
          ", act } from '@testing-library/react';"
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(file, content);
        fixed++;
      }
    }
  });

  if (fixed > 0) {
    console.log(`✅ Fixed ${fixed} component tests`);
  }
}

// Fix API route tests
function fixAPIRouteTests() {
  const apiTests = execSync(
    'find __tests__/app/api -name "*.test.ts" -type f',
    { encoding: 'utf8' }
  )
    .split('\n')
    .filter(f => f.trim());

  let fixed = 0;
  apiTests.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Add NextRequest/Response mocks
      if (
        !content.includes('global.fetch = jest.fn()') &&
        content.includes('NextRequest')
      ) {
        content = content.replace(
          /beforeEach\(\(\) => \{/,
          `beforeEach(() => {
    global.fetch = jest.fn();`
        );
        modified = true;
      }

      // Add auth mocks for protected routes
      if (
        content.includes('createClient') &&
        !content.includes("jest.mock('@/lib/supabase/server'")
      ) {
        const authMock = `
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));

`;
        content = authMock + content;
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(file, content);
        fixed++;
      }
    }
  });

  if (fixed > 0) {
    console.log(`✅ Fixed ${fixed} API route tests`);
  }
}

// Main execution
async function main() {
  fixAuthStoreTest();
  fixMiddlewareTest();
  fixComponentTests();
  fixAPIRouteTests();

  console.log('\n✨ Final fixes applied!');

  // Run sample tests to verify
  console.log('\n📊 Verifying fixes...\n');

  const verifyTests = [
    '__tests__/lib/store/auth-store.test.ts',
    '__tests__/middleware.test.ts',
  ];

  verifyTests.forEach(test => {
    try {
      const result = execSync(`npm test -- ${test} --passWithNoTests 2>&1`, {
        encoding: 'utf8',
        timeout: 10000,
      });

      if (result.includes('PASS ')) {
        console.log(`✅ ${test} - FIXED!`);
      } else {
        console.log(`❌ ${test} - Still failing`);
      }
    } catch (e) {
      console.log(`❌ ${test} - Error running test`);
    }
  });
}

main();
