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

console.log(`Fixing final parsing errors in ${files.length} files...`);

let totalFixes = 0;
const filesWithChanges = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let fileFixes = 0;

  // Fix specific patterns causing parsing errors
  // 1. Fix ternary with just '&apos; as the false value
  content = content.replace(/\? '([^']+)' : '&apos;/g, "? '$1' : ''");
  
  // 2. Fix string comparisons ending with &apos;
  content = content.replace(/'([^']+)&apos;/g, "'$1'");
  
  // 3. Fix any remaining standalone &apos; in code context
  content = content.replace(/: '&apos;/g, ": ''");
  content = content.replace(/' &apos;/g, "' '");
  
  // 4. Fix template literals with &apos;
  content = content.replace(/\${([^}]+)}&apos;/g, "${$1}'");
  
  // 5. Fix array/object property access with &apos;
  content = content.replace(/\['&apos;/g, "['");
  content = content.replace(/&apos;]/g, "']");
  
  // 6. Special case for empty string replacements
  content = content.replace(/\? '\+' : '&apos;/g, "? '+' : ''");
  content = content.replace(/\? '-' : '&apos;/g, "? '-' : ''");
  
  // Count fixes
  if (content !== originalContent) {
    fileFixes = (originalContent.match(/&apos;/g) || []).length - (content.match(/&apos;/g) || []).length;
    if (fileFixes > 0) {
      fs.writeFileSync(file, content);
      totalFixes += fileFixes;
      filesWithChanges.push({ file, changes: fileFixes });
      console.log(`✓ Fixed ${fileFixes} issues in ${file}`);
    }
  }
});

console.log('\n=== Summary ===');
console.log(`Total fixes: ${totalFixes}`);
console.log(`Files modified: ${filesWithChanges.length}`);