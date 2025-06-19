#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(`Found ${testFiles.length} test files to fix import paths`);

// Process each file
testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fileName = path.basename(filePath);

  // Fix relative imports to test utils
  const patterns = [
    // Fix relative imports like ../../../utils/ or ../../../../utils/
    [
      /from ['"]\.\.\/\.\.\/\.\.\/utils\/([\w-]+)['"]/g,
      "from '@/__tests__/utils/$1'",
    ],
    [
      /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\/([\w-]+)['"]/g,
      "from '@/__tests__/utils/$1'",
    ],
    [
      /from ['"]\.\.\/\.\.\/utils\/([\w-]+)['"]/g,
      "from '@/__tests__/utils/$1'",
    ],
    [/from ['"]\.\.\/utils\/([\w-]+)['"]/g, "from '@/__tests__/utils/$1'"],
    // Fix imports without subdirectory
    [/from ['"]\.\.\/test-utils['"]/g, "from '@/__tests__/utils/test-utils'"],
    [
      /from ['"]\.\.\/\.\.\/test-utils['"]/g,
      "from '@/__tests__/utils/test-utils'",
    ],
    [
      /from ['"]\.\.\/\.\.\/\.\.\/test-utils['"]/g,
      "from '@/__tests__/utils/test-utils'",
    ],
  ];

  patterns.forEach(([pattern, replacement]) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed import paths in ${fileName}`);
  }
});

console.log('\nDone! All test files have been checked for import paths.');
