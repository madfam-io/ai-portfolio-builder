#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(
  `Found ${testFiles.length} test files to check for timeout syntax...`
);

let totalFixed = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix test timeout syntax with comma before timeout value
  // Pattern: it('description', async (, 20000) => {
  const timeoutPattern =
    /it\((['"`].*?['"`]),\s*async\s*\(,\s*(\d+)\)\s*=>\s*\{/g;
  if (content.match(timeoutPattern)) {
    content = content.replace(timeoutPattern, 'it($1, async () => {');
    modified = true;
  }

  // Fix test timeout syntax with timeout as second parameter
  // Pattern: it('description', 20000, async () => {
  const timeoutPattern2 =
    /it\((['"`].*?['"`]),\s*(\d+),\s*async\s*\(\)\s*=>\s*\{/g;
  if (content.match(timeoutPattern2)) {
    content = content.replace(timeoutPattern2, 'it($1, async () => {');
    modified = true;
  }

  // Fix test timeout syntax with timeout in wrong position
  // Pattern: it('description'(20000), async () => {
  const timeoutPattern3 =
    /it\((['"`].*?['"`])\s*\(\s*(\d+)\s*\),\s*async\s*\(\)\s*=>\s*\{/g;
  if (content.match(timeoutPattern3)) {
    content = content.replace(timeoutPattern3, 'it($1, async () => {');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed timeout syntax in: ${file}`);
  }
});

console.log(`\n✨ Fixed timeout syntax in ${totalFixed} test files`);
