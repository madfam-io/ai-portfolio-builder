#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix patterns
const fixes = [
  {
    name: 'Fix toHaveBeenCalledWith syntax errors',
    pattern: /expect\(([^)]+)\)\.toHaveBeenCalledWith\(\s*\{[\s\S]*?\);/g,
    fix: (match) => {
      // Count opening and closing braces
      let openCount = (match.match(/\{/g) || []).length;
      let closeCount = (match.match(/\}/g) || []).length;
      
      if (openCount > closeCount) {
        // Add missing closing braces
        const missingBraces = '}'.repeat(openCount - closeCount);
        return match.replace(/\);$/, missingBraces + ');');
      }
      return match;
    }
  },
  
  {
    name: 'Fix test timeout syntax',
    pattern: /it\(['"]([^'"]+)['"]\s*,\s*(\d+)\s*,\s*async\s*\(\)/g,
    fix: (match, name, timeout) => `it('${name}', async () =>`
  },
  
  {
    name: 'Fix test timeout at end',
    pattern: /\}\s*,\s*(\d+)\s*\);/g,
    fix: (match, timeout) => `}, ${timeout});`
  },
  
  {
    name: 'Fix missing import for beforeEach',
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@jest\/globals['"]/g,
    fix: (match, imports) => {
      const importList = imports.split(',').map(i => i.trim());
      const needed = ['jest', 'describe', 'it', 'expect', 'beforeEach', 'afterEach'];
      const missing = needed.filter(n => !importList.includes(n));
      if (missing.length > 0) {
        importList.push(...missing);
      }
      return `import { ${[...new Set(importList)].join(', ')} } from '@jest/globals'`;
    }
  },
  
  {
    name: 'Fix async store imports',
    pattern: /await\s+import\(['"]zustand['"]\)/g,
    fix: () => `import('zustand')`
  },
  
  {
    name: 'Fix mock return values',
    pattern: /jest\.fn\(\)\.mockReturnValue\(undefined\)/g,
    fix: () => `jest.fn()`
  }
];

// Process all test files
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}', { 
  cwd: path.join(__dirname, '..'),
  ignore: ['**/node_modules/**']
});

console.log(`Found ${testFiles.length} test files to process`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;
  
  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, fix.fix);
    if (newContent !== content) {
      content = newContent;
      fileFixed = true;
      console.log(`  ✓ Applied ${fix.name} to ${file}`);
    }
  });
  
  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
  }
});

console.log(`\nFixed ${totalFixed} test files`);