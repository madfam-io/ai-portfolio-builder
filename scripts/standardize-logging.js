#!/usr/bin/env node

/**
 * Script to replace console.* calls with structured logger
 * This helps standardize logging across the codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace
const replacements = [
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.info(',
    importNeeded: true,
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error(',
    importNeeded: true,
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn(',
    importNeeded: true,
  },
  {
    pattern: /console\.debug\(/g,
    replacement: 'logger.debug(',
    importNeeded: true,
  },
];

// Directories to skip
const skipDirs = [
  'node_modules',
  '.next',
  'coverage',
  'dist',
  'build',
  '.git',
  '__tests__', // Skip test files for now
];

// File extensions to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Check if file should be processed
function shouldProcessFile(filePath) {
  // Skip if in excluded directory
  for (const dir of skipDirs) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
      return false;
    }
  }

  // Skip if not a supported file extension
  const ext = path.extname(filePath);
  if (!fileExtensions.includes(ext)) {
    return false;
  }

  // Skip logger.ts itself
  if (filePath.endsWith('logger.ts') || filePath.endsWith('logger.js')) {
    return false;
  }

  return true;
}

// Add logger import if needed
function addLoggerImport(content, filePath) {
  // Check if logger is already imported
  if (
    content.includes("from '@/lib/utils/logger'") ||
    content.includes('from "@/lib/utils/logger"')
  ) {
    return content;
  }

  // Find the last import statement
  const importRegex = /^import\s+.*$/gm;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;

    return (
      content.slice(0, insertPosition) +
      "\nimport { logger } from '@/lib/utils/logger';" +
      content.slice(insertPosition)
    );
  } else {
    // No imports found, add at the beginning of the file
    return "import { logger } from '@/lib/utils/logger';\n\n" + content;
  }
}

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let needsImport = false;

    // Apply replacements
    for (const { pattern, replacement, importNeeded } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        if (importNeeded) {
          needsImport = true;
        }
      }
    }

    if (modified) {
      // Add import if needed
      if (needsImport) {
        content = addLoggerImport(content, filePath);
      }

      // Write back the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Processed: ${filePath}`);
      return 1;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Main function
function main() {
  console.log('🔍 Searching for files to process...\n');

  // Find all TypeScript and JavaScript files
  const pattern = '**/*.{ts,tsx,js,jsx}';
  const files = glob.sync(pattern, {
    ignore: skipDirs.map(dir => `${dir}/**`),
    nodir: true,
  });

  console.log(`Found ${files.length} files to check\n`);

  let processedCount = 0;

  for (const file of files) {
    if (shouldProcessFile(file)) {
      processedCount += processFile(file);
    }
  }

  console.log(`\n✨ Complete! Processed ${processedCount} files.`);
  console.log('\n📝 Next steps:');
  console.log('1. Run "pnpm type-check" to ensure no TypeScript errors');
  console.log('2. Run "pnpm test" to ensure tests still pass');
  console.log('3. Review the changes with "git diff"');
  console.log('4. Commit the changes');
}

// Run the script
if (require.main === module) {
  main();
}
