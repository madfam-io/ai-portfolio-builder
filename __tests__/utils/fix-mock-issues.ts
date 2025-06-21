#!/usr/bin/env ts-node
/**
 * Script to fix mock issues in test files
 * This will update all test files that use useLanguage mock to use the correct pattern
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const FIX_PATTERNS = [
  {
    // Fix duplicate mock declarations
    pattern:
      /jest\.mock\('@\/lib\/i18n\/refactored-context'[^}]+}\);\s*jest\.mock\('@\/lib\/i18n\/refactored-context'[^}]+}\);/gs,
    replacement: (match: string) => {
      // Keep only the second mock (usually the one with jest.fn())
      const mocks = match.match(
        /jest\.mock\('[^']+',\s*\(\)\s*=>\s*\([^}]+}\)\);/g
      );
      return mocks ? mocks[mocks.length - 1] : match;
    },
  },
  {
    // Fix mockReturnValue pattern
    pattern: /mockUseLanguage\.mockReturnValue\(/g,
    replacement: '(mockUseLanguage as any).mockImplementation(() => (',
  },
  {
    // Ensure proper closing for mockImplementation
    pattern:
      /\(mockUseLanguage as any\)\.mockImplementation\(\(\) => \(([^}]+})\s*as any\)/g,
    replacement: '(mockUseLanguage as any).mockImplementation(() => ($1)',
  },
];

function processTestFile(file: string): { processed: boolean; fixed: boolean } {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Check if file contains useLanguage mock
  if (!content.includes('mockUseLanguage') && !content.includes('@/lib/i18n/refactored-context')) {
    return { processed: false, fixed: false };
  }

  let newContent = content;
  let changed = false;

  for (const fix of FIX_PATTERNS) {
    const beforeLength = newContent.length;
    newContent = newContent.replace(fix.pattern, fix.replacement);
    
    if (newContent.length !== beforeLength) {
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, newContent);
    console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
  }

  return { processed: true, fixed: changed };
}

async function fixTestFiles() {
  try {
    // Find all test files with useLanguage mocks
    const testFiles = await glob('__tests__/**/*.{test,spec}.{ts,tsx}', {
      cwd: process.cwd(),
      absolute: true,
    });

    let filesFixed = 0;
    let totalFiles = 0;

    for (const file of testFiles) {
      const result = processTestFile(file);
      if (result.processed) totalFiles++;
      if (result.fixed) filesFixed++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total files scanned: ${testFiles.length}`);
    console.log(`   Files with useLanguage: ${totalFiles}`);
    console.log(`   Files fixed: ${filesFixed}`);
  } catch (error) {
    console.error('Error fixing test files:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixTestFiles();
}

export { fixTestFiles };
