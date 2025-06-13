#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to search for files
const filePatterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  'middleware/**/*.{ts,tsx,js,jsx}'
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/logger.ts', // Don't modify the logger itself
  '**/replace-console-logs.js' // Don't modify this script
];

// Count statistics
let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

// Function to check if logger is imported
function hasLoggerImport(content) {
  return content.includes("from '@/lib/utils/logger'") || 
         content.includes('from "@/lib/utils/logger"');
}

// Function to add logger import
function addLoggerImport(content, filePath) {
  // Skip if already has logger import
  if (hasLoggerImport(content)) {
    return content;
  }

  // Find the last import statement
  const importRegex = /^import\s+.*?;?\s*$/gm;
  const imports = content.match(importRegex);
  
  if (!imports || imports.length === 0) {
    // No imports, add at the beginning after 'use client' if present
    if (content.startsWith("'use client'")) {
      return content.replace("'use client';\n", "'use client';\n\nimport { logger } from '@/lib/utils/logger';\n");
    }
    return `import { logger } from '@/lib/utils/logger';\n\n${content}`;
  }

  // Find the position of the last import
  let lastImportIndex = -1;
  let lastImportLength = 0;
  imports.forEach(imp => {
    const index = content.lastIndexOf(imp);
    if (index > lastImportIndex) {
      lastImportIndex = index;
      lastImportLength = imp.length;
    }
  });

  if (lastImportIndex !== -1) {
    const insertPosition = lastImportIndex + lastImportLength;
    return content.slice(0, insertPosition) + 
           "\nimport { logger } from '@/lib/utils/logger';" + 
           content.slice(insertPosition);
  }

  return content;
}

// Function to replace console statements
function replaceConsoleStatements(content, filePath) {
  let modified = false;
  let replacements = 0;

  // Replace console.log
  content = content.replace(
    /console\.log\s*\((.*?)\);?/g,
    (match, args) => {
      replacements++;
      modified = true;
      
      // Try to extract meaningful context
      if (args.includes(',')) {
        return `logger.debug(${args});`;
      } else {
        return `logger.debug(${args});`;
      }
    }
  );

  // Replace console.error
  content = content.replace(
    /console\.error\s*\((.*?)\);?/g,
    (match, args) => {
      replacements++;
      modified = true;
      
      // Check if it's an error object
      if (args.includes('error') || args.includes('err') || args.includes('Error')) {
        // Split by comma to separate message and error
        const parts = args.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          return `logger.error(${parts[0]}, ${parts.slice(1).join(', ')});`;
        }
        return `logger.error('Error occurred', ${args});`;
      }
      return `logger.error(${args});`;
    }
  );

  // Replace console.warn
  content = content.replace(
    /console\.warn\s*\((.*?)\);?/g,
    (match, args) => {
      replacements++;
      modified = true;
      return `logger.warn(${args});`;
    }
  );

  // Replace console.info
  content = content.replace(
    /console\.info\s*\((.*?)\);?/g,
    (match, args) => {
      replacements++;
      modified = true;
      return `logger.info(${args});`;
    }
  );

  // Replace console.debug
  content = content.replace(
    /console\.debug\s*\((.*?)\);?/g,
    (match, args) => {
      replacements++;
      modified = true;
      return `logger.debug(${args});`;
    }
  );

  // Replace console.group and console.groupEnd
  content = content.replace(/console\.group\s*\(.*?\);?/g, '// Group logging removed');
  content = content.replace(/console\.groupEnd\s*\(\s*\);?/g, '// Group end removed');

  // Add logger import if we made replacements and it's not already there
  if (modified && !hasLoggerImport(content)) {
    content = addLoggerImport(content, filePath);
  }

  totalReplacements += replacements;
  return { content, modified, replacements };
}

// Process a single file
function processFile(filePath) {
  totalFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified, replacements } = replaceConsoleStatements(content, filePath);
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles++;
      console.log(`✅ ${filePath} - Replaced ${replacements} console statement(s)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  console.log('🔍 Searching for console statements to replace...\n');

  // Get all files matching patterns
  const files = [];
  filePatterns.forEach(pattern => {
    const matchedFiles = glob.sync(pattern, { 
      ignore: excludePatterns,
      nodir: true 
    });
    files.push(...matchedFiles);
  });

  // Remove duplicates
  const uniqueFiles = [...new Set(files)];

  console.log(`Found ${uniqueFiles.length} files to check\n`);

  // Process each file
  uniqueFiles.forEach(processFile);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`Total files checked: ${totalFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Total console statements replaced: ${totalReplacements}`);

  if (modifiedFiles > 0) {
    console.log('\n✨ Console statements have been replaced with structured logging!');
    console.log('⚠️  Please review the changes and ensure the logger is properly imported in all modified files.');
  } else {
    console.log('\n✨ No console statements found to replace!');
  }
}

// Run the script
main();