#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.test.{ts,tsx}', {
  ignore: ['**/node_modules/**'],
});

console.log(`Found ${testFiles.length} test files to check for syntax errors`);

// Process each file
testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fileName = path.basename(filePath);

  // 1. Fix duplicate jest.mock statements for useLanguage
  const useLanguageMockPattern =
    /jest\.mock\('@\/lib\/i18n\/refactored-context'[^}]+}\);?\s*\n?/gs;
  const useLanguageMocks = content.match(useLanguageMockPattern);

  if (useLanguageMocks && useLanguageMocks.length > 1) {
    // Keep only the first mock (the one with implementation)
    const firstMock = useLanguageMocks[0];
    content = content.replace(useLanguageMockPattern, '');

    // Find where to insert the single mock
    const firstImportMatch = content.match(/^import.*from.*;$/m);
    if (firstImportMatch) {
      const insertPos =
        content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
      content =
        content.slice(0, insertPos) +
        '\n\n' +
        firstMock +
        '\n' +
        content.slice(insertPos);
    }

    modified = true;
    console.log(`Fixed duplicate useLanguage mocks in ${fileName}`);
  }

  // 2. Fix syntax errors with misplaced parentheses
  // Fix pattern: })jest.mock(
  content = content.replace(/}\)\s*jest\.mock\(/g, '});\n\njest.mock(');

  // Fix pattern: }););
  content = content.replace(/}\);\s*\);/g, '});');

  // Fix pattern: mock statement followed by random );
  content = content.replace(/}\)\)\s*;\s*\n\s*\);/g, '}));');

  // Fix standalone ); on its own line
  content = content.replace(/^\s*\);\s*$/gm, '');

  // 3. Fix misplaced commas in describe blocks
  content = content.replace(/describe\([^{]+{\s*,\s*$/gm, match =>
    match.replace(',', '')
  );

  // 4. Fix imports from @/tests/utils (should be @/__tests__/utils)
  if (content.includes('@/tests/utils/')) {
    content = content.replace(/@\/tests\/utils\//g, '@/__tests__/utils/');
    modified = true;
    console.log(`Fixed import paths in ${fileName}`);
  }

  // 5. Fix missing closing parentheses for jest.mock
  const mockBlocks = content.split('jest.mock(');
  let fixedContent = mockBlocks[0];

  for (let i = 1; i < mockBlocks.length; i++) {
    let block = mockBlocks[i];
    let openParens = 1;
    let closeIndex = -1;

    for (let j = 0; j < block.length; j++) {
      if (block[j] === '(') openParens++;
      if (block[j] === ')') {
        openParens--;
        if (openParens === 0) {
          closeIndex = j;
          break;
        }
      }
    }

    if (closeIndex === -1) {
      // Missing closing parenthesis
      const nextMockIndex = block.search(/jest\.(mock|doMock|unmock)/);
      const describeIndex = block.search(/describe\(/);

      let insertIndex = block.length;
      if (nextMockIndex > -1)
        insertIndex = Math.min(insertIndex, nextMockIndex);
      if (describeIndex > -1)
        insertIndex = Math.min(insertIndex, describeIndex);

      // Find the last }) before the insertIndex
      const lastBraceIndex = block.lastIndexOf('})', insertIndex);
      if (lastBraceIndex > -1) {
        block =
          block.slice(0, lastBraceIndex + 2) +
          ');' +
          block.slice(lastBraceIndex + 2);
        modified = true;
        console.log(`Fixed missing closing parenthesis in ${fileName}`);
      }
    }

    fixedContent += 'jest.mock(' + block;
  }

  if (fixedContent !== content) {
    content = fixedContent;
  }

  // 6. Clean up extra blank lines (more than 2 consecutive)
  content = content.replace(/\n{3,}/g, '\n\n');

  // 7. Ensure proper spacing after imports
  content = content.replace(/(^import.*;\s*$)\n([^i\n])/gm, '$1\n\n$2');

  // Write the file if modified
  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed syntax in ${fileName}`);
  }
});

console.log('\nDone! All test files have been checked for syntax errors.');
