#!/usr/bin/env node

/**
 * Script to remove console statements from production code
 * Preserves console statements in:
 * - Test files
 * - Scripts
 * - Development-only logger utilities
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.next',
  'coverage',
  '__tests__',
  'scripts',
  'e2e',
  '.git',
  'dist',
  'build',
];

// Files to preserve console statements
const preserveFiles = [
  'logger.ts',
  'logger.js',
  'jest.setup.ts',
  'jest.setup.js',
];

// Pattern to match console statements
const consolePattern =
  /console\.(log|warn|error|info|debug|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml|profile|profileEnd)\s*\([^)]*\)\s*;?/g;

// Development-only console pattern (preserve these)
const devConsolePattern =
  /if\s*\(\s*process\.env\.NODE_ENV\s*===?\s*['"`]development['"`]\s*\)\s*{[^}]*console\.[^}]*}/gs;

function shouldProcessFile(filePath) {
  // Check if file is in excluded directory
  for (const dir of excludeDirs) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
      return false;
    }
  }

  // Check if file should be preserved
  const fileName = path.basename(filePath);
  return !preserveFiles.includes(fileName);
}

function removeConsoleStatements(content) {
  // First, preserve development-only console statements
  const devBlocks = [];
  let preservedContent = content.replace(devConsolePattern, match => {
    const placeholder = `__DEV_CONSOLE_${devBlocks.length}__`;
    devBlocks.push(match);
    return placeholder;
  });

  // Remove standalone console statements
  preservedContent = preservedContent.replace(consolePattern, '');

  // Restore development-only blocks
  devBlocks.forEach((block, index) => {
    preservedContent = preservedContent.replace(
      `__DEV_CONSOLE_${index}__`,
      block
    );
  });

  return preservedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = removeConsoleStatements(content);

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('Removing console statements from production code...\n');

  // Find all TypeScript and JavaScript files
  const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];

  let totalFiles = 0;
  let modifiedFiles = 0;

  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: excludeDirs.map(dir => `**/${dir}/**`),
      nodir: true,
    });

    files.forEach(file => {
      if (shouldProcessFile(file)) {
        totalFiles++;
        if (processFile(file)) {
          modifiedFiles++;
          console.log(`✓ Cleaned: ${file}`);
        }
      }
    });
  });

  console.log(
    `\n✅ Complete! Modified ${modifiedFiles} out of ${totalFiles} files.`
  );

  if (modifiedFiles > 0) {
    console.log(
      '\n📝 Remember to review the changes and run tests before committing.'
    );
  }
}

// Run the script
main();
