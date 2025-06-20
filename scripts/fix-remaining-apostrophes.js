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

console.log(`Checking ${files.length} files for remaining apostrophe issues...`);

let totalFixes = 0;
const filesWithChanges = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let fileFixes = 0;

  // Fix patterns that are causing parsing errors
  // 1. Fix string comparisons with &apos;
  content = content.replace(/=== '([^']+)&apos;/g, "=== '$1'");
  content = content.replace(/!== '([^']+)&apos;/g, "!== '$1'");
  
  // 2. Fix ternary operators with &apos; in strings
  content = content.replace(/\? '([^']+)&apos; :/g, "? '$1' :");
  content = content.replace(/: '([^']+)&apos;/g, ": '$1'");
  
  // 3. Fix array items with &apos;
  content = content.replace(/\['([^']+)&apos;/g, "['$1'");
  content = content.replace(/'([^']+)&apos;]/g, "'$1']");
  
  // 4. Fix template literal placeholders
  content = content.replace(/\$\{[^}]*\}\s*\|\|\s*'0&apos;/g, "${analyticsData?.results.duration || '0'}");
  
  // 5. Fix specific patterns found in the errors
  content = content.replace(/'all&apos;/g, "'all'");
  content = content.replace(/'active&apos;/g, "'active'");
  content = content.replace(/'paused&apos;/g, "'paused'");
  content = content.replace(/'All Time&apos;/g, "'All Time'");
  content = content.replace(/'0&apos;/g, "'0'");
  
  // 6. Fix hover states and classes
  content = content.replace(/dark:hover:bg-gray-700&apos;/g, "dark:hover:bg-gray-700'");
  
  // Count fixes
  if (content !== originalContent) {
    fileFixes = (originalContent.match(/&apos;/g) || []).length - (content.match(/&apos;/g) || []).length;
    if (fileFixes > 0) {
      fs.writeFileSync(file, content);
      totalFixes += fileFixes;
      filesWithChanges.push({ file, changes: fileFixes });
      console.log(`✓ Fixed ${fileFixes} apostrophe issues in ${file}`);
    }
  }
});

console.log('\n=== Summary ===');
console.log(`Total fixes: ${totalFixes}`);
console.log(`Files modified: ${filesWithChanges.length}`);

if (filesWithChanges.length > 0) {
  console.log('\nTop files with changes:');
  filesWithChanges
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 10)
    .forEach(({ file, changes }) => {
      console.log(`  ${file}: ${changes} fixes`);
    });
}