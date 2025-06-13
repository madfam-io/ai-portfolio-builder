
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

  // Remove standalone semicolons on their own lines
  const semicolonLineRegex = /^\s*;\s*$/gm;
  if (semicolonLineRegex.test(modified)) {
    modified = modified.replace(semicolonLineRegex, '');
    fileModified = true;
  }

  // Also fix the script file that got corrupted
  if (file.includes('fix-react-icons-imports-simple.js')) {
    // Fix the corrupted header
    if (modified.startsWith('import { IconName }')) {
      modified = modified.replace(/^import \{ IconName \} from 'react-icons\/xx';\n\n/, '');
      fileModified = true;
    }
  }

  if (fileModified) {
    fs.writeFileSync(file, modified);
    console.log(`Fixed ${file}`);
    totalFixed++;
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);