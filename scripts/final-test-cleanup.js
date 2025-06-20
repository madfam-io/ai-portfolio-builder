#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: ['**/node_modules/**'],
});

console.log(`Final cleanup for ${testFiles.length} test files`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;

  // Ensure all test files have basic structure
  if (!content.includes('describe(') && content.length > 50) {
    // This might be a broken test file, skip it
    return;
  }

  // Basic cleanup
  content = content.replace(/\n\n\n+/g, '\n\n');
  content = content.replace(/^\s*\n/gm, '\n');

  // Fix common mock issues
  if (content.includes('undefined}')) {
    content = content.replace(/undefined}/g, '}');
    fileFixed = true;
  }

  // Ensure proper closing braces
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;

  if (openBraces > closeBraces && content.includes('describe(')) {
    const missingBraces = openBraces - closeBraces;
    for (let i = 0; i < missingBraces; i++) {
      content += '\n});';
    }
    fileFixed = true;
    console.log(`  ✓ Added ${missingBraces} missing closing braces to ${file}`);
  }

  // Fix import issues
  content = content.replace(
    /import { jest, describe, it, expect, beforeEach, jest,  } from '@jest\/globals';/g,
    "import { jest, describe, it, expect, beforeEach } from '@jest/globals';"
  );

  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
  }
});

console.log(`\nCleaned up ${totalFixed} test files`);
