#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.turbo/**',
    'scripts/fix-*.js'
  ]
});

console.log(`Processing ${files.length} files to fix parsing errors...`);

let totalFixes = 0;
const filesWithChanges = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let fileFixes = 0;

  // Fix incorrectly escaped HTML entities in TypeScript/JavaScript code
  // Priority: Fix generic types and TypeScript syntax first
  
  // 1. Fix generic types
  content = content.replace(/&lt;(\w+(?:\s*,\s*\w+)*)\s*&gt;/g, '<$1>');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  
  // 2. Fix logical operators
  content = content.replace(/&amp;&amp;/g, '&&');
  content = content.replace(/&amp;/g, '&');
  
  // 3. Fix quotes in code (not in JSX text)
  // This is tricky - we want to preserve &apos; in JSX text but fix it in code
  // Look for patterns that indicate code context
  content = content.replace(/(\w+)&apos;(\w+)/g, "$1'$2"); // contractions in code
  content = content.replace(/&quot;/g, '"');
  
  // 4. Count changes
  if (content !== originalContent) {
    fileFixes = (originalContent.match(/&[a-z]+;/g) || []).length - (content.match(/&[a-z]+;/g) || []).length;
    if (fileFixes < 0) fileFixes = 1; // At least one change was made
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    totalFixes += fileFixes;
    filesWithChanges.push({ file, changes: fileFixes });
    console.log(`✓ Fixed parsing errors in ${file}`);
  }
});

console.log('\n=== Summary ===');
console.log(`Total fixes: ${totalFixes}`);
console.log(`Files modified: ${filesWithChanges.length}`);