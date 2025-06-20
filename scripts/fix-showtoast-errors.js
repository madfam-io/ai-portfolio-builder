#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files that might have showToast issues
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: ['**/node_modules/**'],
});

console.log(`Checking ${testFiles.length} test files for showToast issues`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;

  // Check if file uses showToast and needs ui-store mock
  if (
    content.includes('showToast') &&
    !content.includes("jest.mock('@/lib/store/ui-store'")
  ) {
    // Add ui-store mock before the first describe or test
    const insertPosition =
      content.indexOf('describe(') ||
      content.indexOf('test(') ||
      content.indexOf('it(');
    if (insertPosition > 0) {
      const beforeDescribe = content.substring(0, insertPosition);
      const afterDescribe = content.substring(insertPosition);

      const mockCode = `
// Mock ui-store
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: () => ({
    showToast: jest.fn(),
  }),
}));

`;

      content = beforeDescribe + mockCode + afterDescribe;
      fileFixed = true;
      console.log(`  ✓ Added ui-store mock to ${file}`);
    }
  }

  // Fix assignment to constant variable errors in store tests
  if (
    file.includes('store') &&
    content.includes('Assignment to constant variable')
  ) {
    // This is likely a store test that needs proper mocking
    content = content.replace(
      /const\s+(\w+)\s*=\s*usePortfolioStore\(\)/g,
      'let $1 = usePortfolioStore()'
    );
    fileFixed = true;
    console.log(`  ✓ Fixed const assignment in ${file}`);
  }

  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
  }
});

console.log(`\nFixed ${totalFixed} test files`);
