
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to match individual icon imports
const INDIVIDUAL_IMPORT_PATTERN = /import\s+(\w+)\s+from\s+['"]react-icons\/(\w+)\/\1['"]/g;
const MULTI_INDIVIDUAL_IMPORT_PATTERN = /import\s+(\w+),\s*(\w+)(?:,\s*(\w+))*\s+from\s+['"]react-icons\/(\w+)\/\1['"]/g;

// Files to process
const files = glob.sync('**/*.{js,jsx,ts,tsx}', { 
  ignore: ['node_modules/**', '.next/**', 'scripts/**', 'types/**'] 
});

console.log(`Found ${files.length} files to process`);

let totalFixed = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let modified = content;
  let fileModified = false;

  // First, find all individual imports from the same icon set and combine them
  const importsBySet = new Map();
  
  // Match individual imports
  const matches = [...content.matchAll(/import\s+(\w+)\s+from\s+['"]react-icons\/(\w+)\/\1['"]/g)];
  
  matches.forEach(match => {
    const [fullMatch, iconName, iconSet] = match;
    if (!importsBySet.has(iconSet)) {
      importsBySet.set(iconSet, new Set());
    }
    importsBySet.get(iconSet).add(iconName);
  });

  // If we found individual imports, replace them with combined imports
  if (importsBySet.size > 0) {
    // Remove all individual imports first
    modified = modified.replace(/import\s+\w+\s+from\s+['"]react-icons\/\w+\/\w+['"]\s*;?\s*\n?/g, '');
    
    // Add combined imports at the beginning of the imports section
    const reactImportMatch = modified.match(/import\s+.*?\s+from\s+['"]react['"]\s*;?\s*\n?/);
    let insertPosition = 0;
    
    if (reactImportMatch) {
      insertPosition = reactImportMatch.index + reactImportMatch[0].length;
    } else {
      // Find the first import statement
      const firstImportMatch = modified.match(/import\s+.*?\s+from\s+['"]/);
      if (firstImportMatch) {
        insertPosition = firstImportMatch.index;
      }
    }

    // Build the new imports
    const newImports = [];
    for (const [iconSet, icons] of importsBySet) {
      const iconList = Array.from(icons).sort().join(', ');
      newImports.push(`import { ${iconList} } from 'react-icons/${iconSet}';`);
    }

    // Insert the new imports
    if (insertPosition > 0) {
      modified = modified.slice(0, insertPosition) + newImports.join('\n') + '\n' + modified.slice(insertPosition);
    } else {
      // If no imports found, add at the beginning after 'use client' if present
      const useClientMatch = modified.match(/['"]use client['"]\s*;?\s*\n?/);
      if (useClientMatch) {
        insertPosition = useClientMatch.index + useClientMatch[0].length;
        modified = modified.slice(0, insertPosition) + '\n' + newImports.join('\n') + '\n' + modified.slice(insertPosition);
      } else {
        modified = newImports.join('\n') + '\n\n' + modified;
      }
    }

    fileModified = true;
    totalFixed++;
  }

  // Also check for HiSparkles which needs special handling
  if (modified.includes('import HiSparkles from \'react-icons/hi/HiSparkles\'')) {
    modified = modified.replace(
      /import HiSparkles from ['"]react-icons\/hi\/HiSparkles['"]/g,
      'import { HiSparkles } from \'react-icons/hi\''
    );
    fileModified = true;
  }

  // Clean up any duplicate newlines
  modified = modified.replace(/\n{3,}/g, '\n\n');

  if (fileModified) {
    fs.writeFileSync(file, modified);
    console.log(`Fixed imports in ${file}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
console.log('React icons imports have been converted back to named imports format');