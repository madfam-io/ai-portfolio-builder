#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, ignore = []) {
  const results = [];
  
  function walk(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        // Check if should ignore
        const shouldIgnore = ignore.some(ignorePattern => 
          filePath.includes(ignorePattern)
        );
        
        if (shouldIgnore) continue;
        
        if (stat.isDirectory()) {
          walk(filePath);
        } else if (pattern.test(file)) {
          results.push(filePath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }
  
  walk(dir);
  return results;
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;

  // Pattern to match react-icons imports
  const importPattern = /import\s*\{([^}]+)\}\s*from\s*['"]react-icons\/(\w+)['"]/g;

  content = content.replace(importPattern, (match, icons, libName) => {
    modified = true;
    
    // Parse the imported icons
    const iconList = icons.split(',').map(icon => icon.trim());
    
    // Generate individual imports
    const imports = iconList.map(icon => {
      return `import ${icon} from 'react-icons/${libName}/${icon}'`;
    });
    
    return imports.join(';\n');
  });

  if (modified) {
    // Clean up any duplicate imports that might have been created
    const lines = content.split('\n');
    const seenImports = new Set();
    const cleanedLines = [];
    
    for (const line of lines) {
      const importMatch = line.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const importKey = `${importMatch[1]}-${importMatch[2]}`;
        if (!seenImports.has(importKey)) {
          seenImports.add(importKey);
          cleanedLines.push(line);
        }
      } else {
        cleanedLines.push(line);
      }
    }
    
    content = cleanedLines.join('\n');
    
    // Only write if content actually changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Refactored: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
  }
  
  return false;
}

function main() {
  console.log('🔍 Searching for react-icons imports to refactor...\n');
  
  const ignorePatterns = [
    'node_modules',
    '.next',
    'dist',
    'build',
    'coverage',
    '.git'
  ];
  
  // Find all TypeScript and JavaScript files
  const files = findFiles(
    process.cwd(), 
    /\.(ts|tsx|js|jsx)$/,
    ignorePatterns
  );
  
  let refactoredCount = 0;
  let errorCount = 0;
  let checkedCount = 0;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if file contains react-icons imports
      if (content.includes('react-icons/')) {
        checkedCount++;
        if (refactorFile(file)) {
          refactoredCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${path.relative(process.cwd(), file)}:`, error.message);
      errorCount++;
    }
  });
  
  console.log('\n📊 Refactoring Complete!');
  console.log(`📁 Files checked: ${checkedCount}`);
  console.log(`✅ Files refactored: ${refactoredCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (refactoredCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Run "pnpm build" to verify the build still works');
    console.log('2. Run "pnpm test" to ensure all tests pass');
    console.log('3. Check bundle size reduction');
  }
}

// Run the script
main();
