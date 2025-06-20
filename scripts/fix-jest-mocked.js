#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(
  `Found ${testFiles.length} test files to check for jest.mocked issues...`
);

let totalFixed = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix jest.mocked() usage - replace with direct cast
  if (content.includes('jest.mocked(')) {
    // Pattern 1: jest.mocked(SomeClass).mockImplementation
    content = content.replace(
      /jest\.mocked\((\w+)\)\.mockImplementation/g,
      '($1 as jest.MockedClass<typeof $1>).mockImplementation'
    );

    // Pattern 2: jest.mocked(someFunction)
    content = content.replace(
      /jest\.mocked\((\w+\.\w+)\)/g,
      '($1 as jest.MockedFunction<typeof $1>)'
    );

    // Pattern 3: jest.mocked(logger.error) standalone
    content = content.replace(
      /\(logger\.(\w+) as jest\.MockedFunction<typeof logger\.\w+>\)\.mockImplementation\(\(\) => undefined\)/g,
      '// @ts-ignore\n    logger.$1.mockImplementation(() => {})'
    );

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed jest.mocked in: ${file}`);
  }
});

console.log(`\n✨ Fixed jest.mocked in ${totalFixed} test files`);
