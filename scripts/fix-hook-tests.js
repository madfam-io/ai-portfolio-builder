#!/usr/bin/env node
/**
 * Script to fix hook test issues
 */

const fs = require('fs');
const path = require('path');

// Hook test files that need fixing
const hookTestFiles = [
  '__tests__/hooks/useRealTimePreview.test.ts',
  '__tests__/hooks/useEditorHistory.test.ts',
  '__tests__/hooks/useAutoSave.test.ts',
  '__tests__/hooks/useDebounce.test.ts',
];

function fixHookTest(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Remove jest.unmock calls for hooks
    const unmockPattern =
      /\/\/ Unmock the hook for this test file\s*\n\s*jest\.unmock\(['"]@\/hooks\/[^'"]+['"]\);\s*\n/g;
    if (unmockPattern.test(content)) {
      content = content.replace(unmockPattern, '');
      changed = true;
    }

    // Alternative pattern without comment
    const unmockPattern2 = /jest\.unmock\(['"]@\/hooks\/[^'"]+['"]\);\s*\n/g;
    if (unmockPattern2.test(content)) {
      content = content.replace(unmockPattern2, '');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing hook test issues...\n');

let fixed = 0;
let total = 0;

hookTestFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    total++;
    if (fixHookTest(fullPath)) {
      fixed++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log(`\n📊 Summary: Fixed ${fixed}/${total} hook test files`);
