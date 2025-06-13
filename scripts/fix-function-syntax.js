#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(tsx?|jsx?)$/) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        results.push(...findFiles(filePath, pattern));
      }
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Find all relevant files
const files = findFiles('.');
console.log(`Found ${files.length} files to check`);

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = content;
  let fileModified = false;

  // Fix function declarations with double return type syntax
  // Pattern: function Name(): JSX.Element ({ ... }): React.ReactElement
  // Should be: function Name({ ... }): React.ReactElement
  const doubleReturnTypeRegex = /export\s+(default\s+)?function\s+(\w+)\(\)\s*:\s*JSX\.Element\s*\(/g;
  if (doubleReturnTypeRegex.test(modified)) {
    modified = modified.replace(doubleReturnTypeRegex, 'export $1function $2(');
    fileModified = true;
  }

  // Also fix arrow functions with the same issue
  const arrowDoubleReturnTypeRegex = /export\s+(const\s+)?(\w+)\s*=\s*\(\)\s*:\s*JSX\.Element\s*\(/g;
  if (arrowDoubleReturnTypeRegex.test(modified)) {
    modified = modified.replace(arrowDoubleReturnTypeRegex, 'export $1$2 = (');
    fileModified = true;
  }

  if (fileModified) {
    fs.writeFileSync(file, modified);
    console.log(`Fixed ${file}`);
    totalFixed++;
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);