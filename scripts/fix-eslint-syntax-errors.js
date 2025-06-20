#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files with syntax errors
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: ['**/node_modules/**'],
});

console.log(`Fixing ESLint syntax errors in ${testFiles.length} test files`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;

  // Fix missing closing braces in describe blocks
  if (content.includes('describe(') && !content.includes('});')) {
    const lastDescribeIndex = content.lastIndexOf('describe(');
    if (lastDescribeIndex > 0) {
      const afterDescribe = content.substring(lastDescribeIndex);
      if (!afterDescribe.includes('});')) {
        content = content + '\n});';
        fileFixed = true;
        console.log(`  ✓ Added missing closing brace to ${file}`);
      }
    }
  }

  // Fix incomplete test blocks
  const lines = content.split('\n');
  let braceCount = 0;
  let inDescribe = false;
  let needsClosing = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('describe(')) {
      inDescribe = true;
    }

    // Count opening braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceCount += openBraces - closeBraces;

    // Check if we're at the end with unclosed braces
    if (i === lines.length - 1 && braceCount > 0 && inDescribe) {
      needsClosing = true;
    }
  }

  if (needsClosing) {
    for (let i = 0; i < braceCount; i++) {
      content += '\n});';
    }
    fileFixed = true;
    console.log(`  ✓ Added ${braceCount} missing closing braces to ${file}`);
  }

  // Remove unused afterEach imports
  if (content.includes('afterEach') && !content.includes('afterEach(')) {
    content = content.replace(/,\s*afterEach/g, '');
    content = content.replace(/afterEach,\s*/g, '');
    content = content.replace(/{ afterEach }/g, '{}');
    fileFixed = true;
    console.log(`  ✓ Removed unused afterEach import from ${file}`);
  }

  // Fix duplicate imports
  const importLines = content
    .split('\n')
    .filter(line => line.includes('import'));
  const uniqueImports = [...new Set(importLines)];
  if (importLines.length !== uniqueImports.length) {
    const nonImportLines = content
      .split('\n')
      .filter(line => !line.includes('import'));
    content = uniqueImports.join('\n') + '\n' + nonImportLines.join('\n');
    fileFixed = true;
    console.log(`  ✓ Fixed duplicate imports in ${file}`);
  }

  // Fix declaration or statement expected errors
  content = content.replace(/\n\n\n+/g, '\n\n');
  content = content.replace(/^[\s]*$/gm, '');

  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
  }
});

console.log(`\nFixed ${totalFixed} test files`);
