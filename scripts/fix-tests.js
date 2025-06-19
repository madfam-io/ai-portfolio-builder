#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Common fixes to apply
const fixes = [
  // Add jest imports
  {
    pattern: /^(import .* from ['"]@testing-library\/react['"];?)$/m,
    replacement: `import { jest } from '@jest/globals';\n$1`,
    condition: content =>
      !content.includes("from '@jest/globals'") &&
      content.includes('@testing-library/react'),
  },
  // Fix createClient imports in tests
  {
    pattern: /import { createClient } from ['"]@\/lib\/supabase\/server['"];/g,
    replacement: `// Removed direct createClient import - use setupCommonMocks instead`,
    condition: content => content.includes('__tests__'),
  },
  // Add missing act import
  {
    pattern: /import ({[^}]*}) from ['"]@testing-library\/react['"];/g,
    replacement: (match, imports) => {
      if (!imports.includes('act')) {
        const newImports = imports.replace('}', ', act }');
        return `import ${newImports} from '@testing-library/react';`;
      }
      return match;
    },
    condition: content =>
      content.includes('act(') && !content.includes('import.*act.*from'),
  },
  // Fix useLanguage mock
  {
    pattern: /mockUseLanguage\.mockReturnValue/g,
    replacement:
      '(useLanguage as jest.MockedFunction<typeof useLanguage>).mockReturnValue',
    condition: content => content.includes('mockUseLanguage.mockReturnValue'),
  },
  // Fix store setState mocks
  {
    pattern: /(use\w+Store)\.setState/g,
    replacement: '($1 as any).setState',
    condition: content => content.includes('Store.setState'),
  },
  // Add jest environment pragma
  {
    pattern: /^/,
    replacement: `/**\n * @jest-environment jsdom\n */\n\n`,
    condition: content =>
      !content.includes('@jest-environment') && content.includes('.tsx"'),
  },
  {
    pattern: /^/,
    replacement: `/**\n * @jest-environment node\n */\n\n`,
    condition: content =>
      !content.includes('@jest-environment') &&
      content.includes('route.test.ts'),
  },
];

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true,
});

console.log(`Found ${testFiles.length} test files to process`);

let filesFixed = 0;

testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changed = false;

  fixes.forEach(fix => {
    if (fix.condition(content)) {
      if (typeof fix.replacement === 'function') {
        content = content.replace(fix.pattern, fix.replacement);
      } else {
        content = content.replace(fix.pattern, fix.replacement);
      }
      changed = true;
    }
  });

  if (changed && content !== originalContent) {
    fs.writeFileSync(filePath, content);
    filesFixed++;
    console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
});

console.log(`\nFixed ${filesFixed} files`);
