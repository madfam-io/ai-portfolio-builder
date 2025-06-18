#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**']
});

console.log(`Found ${testFiles.length} test files to check for remaining errors`);

// Process each file
testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fileName = path.basename(filePath);

  // 1. Fix duplicate semicolons
  const doubleSemicolonPattern = /;{2,}/g;
  if (doubleSemicolonPattern.test(content)) {
    content = content.replace(doubleSemicolonPattern, ';');
    modified = true;
    console.log(`Fixed double semicolons in ${fileName}`);
  }

  // 2. Fix });;
  const doubleClosingPattern = /}\);{2,}/g;
  if (doubleClosingPattern.test(content)) {
    content = content.replace(doubleClosingPattern, '});');
    modified = true;
    console.log(`Fixed double closing semicolons in ${fileName}`);
  }

  // 3. Fix closing parentheses followed by semicolon on new line
  const misplacedSemicolonPattern = /}\)\s*\n\s*;/g;
  if (misplacedSemicolonPattern.test(content)) {
    content = content.replace(misplacedSemicolonPattern, '});');
    modified = true;
    console.log(`Fixed misplaced semicolons in ${fileName}`);
  }

  // 4. Fix broken mock patterns
  const brokenMockPattern = /}\)\)\s*;\s*;/g;
  if (brokenMockPattern.test(content)) {
    content = content.replace(brokenMockPattern, '}));');
    modified = true;
    console.log(`Fixed broken mock patterns in ${fileName}`);
  }

  // 5. Fix dangling commas in mock declarations
  const danglingCommaPattern = /,\s*\)/g;
  if (danglingCommaPattern.test(content)) {
    content = content.replace(danglingCommaPattern, ')');
    modified = true;
    console.log(`Fixed dangling commas in ${fileName}`);
  }

  // 6. Fix malformed closing of describe/test blocks
  const malformedClosingPattern = /}\)\s*\n\s*}/g;
  if (malformedClosingPattern.test(content)) {
    content = content.replace(malformedClosingPattern, match => {
      // Check if this is inside a describe/test block that needs the closing
      const lines = match.split('\n');
      return lines[0] + '\n' + lines[lines.length - 1];
    });
    modified = true;
    console.log(`Fixed malformed closings in ${fileName}`);
  }

  // 7. Fix incomplete mock statements
  const incompleteMockPattern = /jest\.mock\([^)]+$|jest\.mock\([^)]+\n[^)]+$/gm;
  if (incompleteMockPattern.test(content)) {
    console.log(`Warning: Incomplete mock statement found in ${fileName}`);
  }

  // 8. Fix broken arrow functions
  const brokenArrowPattern = /=>\s*\n\s*{/g;
  if (content.includes('=>\n') && !content.includes('=> {\n')) {
    content = content.replace(brokenArrowPattern, '=> {');
    modified = true;
    console.log(`Fixed broken arrow functions in ${fileName}`);
  }

  // 9. Fix specific syntax error patterns
  // Fix: request); pattern (missing parenthesis)
  const missingParenPattern = /request\);\s*\n\s*const response/g;
  if (missingParenPattern.test(content)) {
    content = content.replace(missingParenPattern, 'request);\n\n    const response');
    modified = true;
    console.log(`Fixed missing parenthesis pattern in ${fileName}`);
  }

  // 10. Fix no newline at end of file
  if (!content.endsWith('\n')) {
    content += '\n';
    modified = true;
    console.log(`Added newline at end of ${fileName}`);
  }

  // 11. Fix duplicate useLanguage mocks
  const useLanguageMockCount = (content.match(/jest\.mock\('@\/lib\/i18n\/refactored-context'/g) || []).length;
  if (useLanguageMockCount > 1) {
    // Find all instances
    const mockRegex = /jest\.mock\('@\/lib\/i18n\/refactored-context'[^}]+}\)\);?/gs;
    const mocks = content.match(mockRegex) || [];
    
    if (mocks.length > 1) {
      // Keep the first comprehensive mock, remove others
      const firstMock = mocks[0];
      content = content.replace(mockRegex, '');
      
      // Re-insert the first mock after imports
      const lastImportMatch = content.match(/^import.*from.*;$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const insertPos = content.indexOf(lastImport) + lastImport.length;
        content = content.slice(0, insertPos) + '\n\n' + firstMock + '\n' + content.slice(insertPos);
      }
      
      modified = true;
      console.log(`Fixed duplicate useLanguage mocks in ${fileName}`);
    }
  }

  // 12. Fix specific file issues
  if (fileName === 'route.test.ts' && content.includes('),\n    };')) {
    content = content.replace(/\),\s*\n\s*};/g, ')\n    };');
    modified = true;
    console.log(`Fixed specific route.test.ts pattern`);
  }

  // 13. Fix mock declaration without proper closing
  const mockWithoutClosing = /jest\.mock\([^)]+\)\s*,\s*$/gm;
  if (mockWithoutClosing.test(content)) {
    content = content.replace(mockWithoutClosing, match => match.replace(/,\s*$/, ');'));
    modified = true;
    console.log(`Fixed mock without closing in ${fileName}`);
  }

  // Write the file if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fileName}`);
  }
});

console.log('\nDone! All test files have been checked for remaining errors.');