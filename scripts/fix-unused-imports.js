#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running TypeScript compiler to find unused imports...');

try {
  // Run tsc to get all errors
  execSync('pnpm tsc --noEmit', { stdio: 'pipe' });
} catch (error) {
  // Parse the error output
  const output = error.stdout ? error.stdout.toString() : '';
  const stderr = error.stderr ? error.stderr.toString() : '';
  const allOutput = output + stderr;
  
  // Find all "is declared but its value is never read" errors
  const unusedImportRegex = /(.+):(\d+):(\d+)\s*\n\s*Type error: '(\w+)' is declared but its value is never read\./g;
  const matches = [...allOutput.matchAll(unusedImportRegex)];
  
  console.log(`Found ${matches.length} unused imports`);
  
  // Group by file
  const fileGroups = {};
  matches.forEach(match => {
    const [, file, line, col, importName] = match;
    if (!fileGroups[file]) {
      fileGroups[file] = [];
    }
    fileGroups[file].push({ line: parseInt(line), col: parseInt(col), name: importName });
  });
  
  // Fix each file
  Object.entries(fileGroups).forEach(([file, imports]) => {
    console.log(`Fixing ${file}...`);
    let content = fs.readFileSync(file, 'utf8');
    
    // For each import, remove it from the import statement
    imports.forEach(({ name }) => {
      // Remove from named imports
      content = content.replace(new RegExp(`(\\{[^}]*),\\s*${name}\\s*(,?)([^}]*\\})`, 'g'), (match, before, comma, after) => {
        if (comma) {
          return `${before}${comma}${after}`;
        } else {
          return `${before}${after}`;
        }
      });
      
      // Remove if it's the only import
      content = content.replace(new RegExp(`(\\{)\\s*${name}\\s*(\\})`, 'g'), '');
      
      // Remove if it's the first import
      content = content.replace(new RegExp(`(\\{)\\s*${name}\\s*,\\s*`, 'g'), '{');
      
      // Remove entire import line if it's now empty
      content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"]\s*;?\s*\n/g, '');
      
      // Remove default imports
      content = content.replace(new RegExp(`import\\s+${name}\\s+from\\s+['"][^'"]+['"]\\s*;?\\s*\\n`, 'g'), '');
    });
    
    fs.writeFileSync(file, content);
  });
  
  console.log('Fixed all unused imports');
}