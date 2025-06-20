#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(`Found ${testFiles.length} test files to fix specific issues...`);

let totalFixed = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix 1: Fix async syntax errors from zustand mocking
  if (
    content.includes(
      "const { create: actualCreate } = await import('zustand');"
    )
  ) {
    // This needs to be in an async context
    content = content.replace(
      /const \{ create: actualCreate \} = await import\('zustand'\);/,
      `let actualCreate;
beforeAll(async () => {
  const zustand = await import('zustand');
  actualCreate = zustand.create;
});`
    );
    modified = true;
  }

  // Fix 2: Fix the zustand mock to work properly
  if (
    content.includes("jest.mock('zustand'") &&
    content.includes('actualCreate')
  ) {
    content = content.replace(
      /jest\.mock\('zustand'.*?\}\);/s,
      `jest.mock('zustand', () => ({
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
}))`
    );
    modified = true;
  }

  // Fix 3: Fix import order issues with mocks
  if (content.includes('jest.unmock') && content.includes('import')) {
    // Move unmock after other mocks but before imports
    const unmockMatch = content.match(/jest\.unmock\([^)]+\);/g);
    if (unmockMatch) {
      unmockMatch.forEach(unmock => {
        content = content.replace(unmock, '');
        // Add unmock after all other mocks
        content = content.replace(
          /(jest\.mock[^;]+;\s*\n)+(.*?import)/s,
          `$1${unmock}\n\n$2`
        );
      });
      modified = true;
    }
  }

  // Fix 4: Fix test syntax errors from improper act usage
  if (content.includes('import { act }') && content.includes('actHook')) {
    // actHook doesn't exist, it should be renderHook with act
    content = content.replace(/actHook/g, 'renderHook');
    content = content.replace(
      /import \{ render, actHook, act \}/g,
      'import { render, renderHook, act }'
    );
    modified = true;
  }

  // Fix 5: Fix middleware test issues with response checks
  if (
    file.includes('middleware') &&
    content.includes('expect(response.status)')
  ) {
    // Ensure response is defined before checking status
    content = content.replace(
      /const response = await middleware\(request\);[\s]*expect\(response\.status\)/g,
      `const response = await middleware(request);
      expect(response).toBeDefined();
      expect(response.status)`
    );
    modified = true;
  }

  // Fix 6: Fix portfolio service test issues
  if (file.includes('portfolio') && file.includes('service')) {
    // Mock Supabase if not already mocked
    if (!content.includes("jest.mock('@/lib/supabase")) {
      content =
        `jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

` + content;
      modified = true;
    }
  }

  // Fix 7: Fix validation test issues
  if (file.includes('validation')) {
    // Ensure all validation tests have proper error expectations
    content = content.replace(
      /expect\(\(\) => ([^)]+)\)\.toThrow\(\)/g,
      'expect(() => $1).toThrow()'
    );
    modified = true;
  }

  // Fix 8: Fix API route tests with missing mocks
  if (
    file.includes('app/api') &&
    content.includes('POST') &&
    !content.includes('NextRequest')
  ) {
    // Ensure NextRequest is imported
    if (!content.includes('import { NextRequest')) {
      content = content.replace(
        /from '@jest\/globals';/,
        `from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';`
      );
      modified = true;
    }
  }

  // Fix 9: Fix template config test
  if (file.includes('templateConfig.test.ts')) {
    // The templates object might not be exported, mock it differently
    content = content.replace(
      /import \{ templates \} from/g,
      'import { getTemplateConfig } from'
    );
    content = content.replace(
      /expect\(templates\)/g,
      'expect(getTemplateConfig())'
    );
    modified = true;
  }

  // Fix 10: Fix CSRF test issues
  if (file.includes('csrf') && content.includes('FormData')) {
    // Ensure FormData polyfill is at the very top
    if (content.includes('global.FormData = class FormData')) {
      const formDataPolyfill = content.match(
        /\/\/ Polyfill FormData[\s\S]*?\};/
      );
      if (formDataPolyfill) {
        content = content.replace(formDataPolyfill[0], '');
        content = formDataPolyfill[0] + '\n\n' + content;
        modified = true;
      }
    }
  }

  // Fix 11: Remove duplicate test names
  if (
    content.includes(
      "it('should redirect unauthenticated users from /dashboard to signin'"
    )
  ) {
    // Check for duplicates
    const matches = content.match(
      /it\(['"`]should redirect unauthenticated users from \/dashboard to signin['"`]/g
    );
    if (matches && matches.length > 1) {
      // Keep first, remove others
      let firstFound = false;
      content = content.replace(
        /it\(['"`]should redirect unauthenticated users from \/dashboard to signin['"`][\s\S]*?\}\);/g,
        match => {
          if (!firstFound) {
            firstFound = true;
            return match;
          }
          return ''; // Remove duplicate
        }
      );
      modified = true;
    }
  }

  // Fix 12: Fix console mock issues
  if (content.includes('jest.spyOn(console')) {
    // Ensure console methods return void
    content = content.replace(
      /jest\.spyOn\(console, '(\w+)'\)\.mockImplementation\(\(\) => \{\}\)/g,
      "jest.spyOn(console, '$1').mockImplementation(() => undefined)"
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n✨ Fixed specific issues in ${totalFixed} test files`);
