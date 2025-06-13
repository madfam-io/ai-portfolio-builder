
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
console.log(`Found ${files.length} files to process`);

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = content;
  let fileModified = false;

  // Fix individual icon imports to named imports
  // Pattern: 
  // Replace with: import { IconName } from 'react-icons/xx'
  
  const importRegex = /import\s+(\w+)\s+from\s+['"]react-icons\/(\w+)\/\1['"]/g;
  const matches = [...content.matchAll(importRegex)];
  
  if (matches.length > 0) {
    // Group imports by icon set
    const importsBySet = new Map();
    
    matches.forEach(match => {
      const [, iconName, iconSet] = match;
      if (!importsBySet.has(iconSet)) {
        importsBySet.set(iconSet, []);
      }
      importsBySet.get(iconSet).push(iconName);
    });
    
    // Replace all individual imports
    modified = modified.replace(importRegex, '');
    
    // Add grouped imports
    const newImports = [];
    for (const [iconSet, icons] of importsBySet) {
      const uniqueIcons = [...new Set(icons)].sort();
      newImports.push(`import { ${uniqueIcons.join(', ')} } from 'react-icons/${iconSet}';`);
    }
    
    // Find where to insert the new imports
    const firstImportMatch = modified.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertIndex = firstImportMatch.index;
      modified = modified.slice(0, insertIndex) + newImports.join('\n') + '\n' + modified.slice(insertIndex);
    } else {
      // No imports found, add at the beginning
      modified = newImports.join('\n') + '\n\n' + modified;
    }
    
    fileModified = true;
  }
  
  // Also handle HiSparkles specifically
  const hiSparklesRegex = /import\s+HiSparkles\s+from\s+['"]react-icons\/hi\/HiSparkles['"]/g;
  if (hiSparklesRegex.test(modified)) {
    modified = modified.replace(hiSparklesRegex, 'import { HiSparkles } from \'react-icons/hi\'');
    fileModified = true;
  }
  
  // Clean up extra newlines
  modified = modified.replace(/\n{3,}/g, '\n\n');
  modified = modified.replace(/(\nimport[^;]+;)\n{2,}(?=import)/g, '$1\n');
  
  if (fileModified) {
    fs.writeFileSync(file, modified);
    console.log(`Fixed imports in ${file}`);
    totalFixed++;
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
console.log('React icons imports have been converted to named imports format');