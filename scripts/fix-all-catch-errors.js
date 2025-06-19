#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix unused error variables in catch blocks
function fixCatchErrors(content) {
  // Pattern to match catch blocks with unused error variables
  const catchPattern = /catch\s*\(\s*(error|e|err|ex|exception)\s*\)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/g;
  
  return content.replace(catchPattern, (match, errorVar, blockContent) => {
    // Check if the error variable is actually used in the block
    const errorVarRegex = new RegExp(`\\b${errorVar}\\b`, 'g');
    const usages = blockContent.match(errorVarRegex) || [];
    
    // Count real usages (not in strings or comments)
    let realUsages = 0;
    usages.forEach(usage => {
      const index = blockContent.indexOf(usage);
      const before = blockContent.substring(Math.max(0, index - 20), index);
      const after = blockContent.substring(index + usage.length, Math.min(blockContent.length, index + usage.length + 20));
      
      // Skip if it's in a string or comment
      if (!before.match(/['"`]$/) && !after.match(/^['"`]/) && !before.match(/\/\/\s*$/) && !before.match(/\/\*.*$/)) {
        realUsages++;
      }
    });
    
    // If not used, prefix with underscore
    if (realUsages === 0) {
      return `catch (_${errorVar}) {${blockContent}}`;
    }
    
    return match;
  });
}

// Get all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: [
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    '.git/**',
    'scripts/**',
    '*.config.js',
    '*.setup.js'
  ]
});

console.log(`Found ${files.length} files to check\n`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = fixCatchErrors(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files with unused catch error variables`);