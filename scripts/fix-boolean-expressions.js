#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing strict boolean expression errors...\n');

// Get all TypeScript files
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      if (
        ![
          'node_modules',
          '.next',
          'out',
          'coverage',
          '.git',
          'public',
        ].includes(file)
      ) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else if (file.match(/\.(ts|tsx)$/) && !file.endsWith('.d.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

// Function to fix boolean expressions in a file
const fixBooleanExpressionsInFile = filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Common patterns that need fixing
  const patterns = [
    // Pattern: if (someVar) -> if (someVar !== null && someVar !== undefined)
    {
      pattern: /if\s*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*{/g,
      replacement: (match, varName) => {
        // Skip if it's already a boolean expression
        if (
          varName === 'true' ||
          varName === 'false' ||
          varName.startsWith('is') ||
          varName.startsWith('has') ||
          varName.startsWith('should') ||
          varName.startsWith('can')
        ) {
          return match;
        }
        return `if (${varName} !== null && ${varName} !== undefined) {`;
      },
      description: 'nullable check',
    },

    // Pattern: && someVar -> && someVar !== null && someVar !== undefined
    {
      pattern:
        /&&\s+([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*(?=[)}&|])/g,
      replacement: (match, varName) => {
        // Skip if it's already a boolean or comparison
        if (
          varName === 'true' ||
          varName === 'false' ||
          varName.startsWith('is') ||
          varName.startsWith('has')
        ) {
          return match;
        }
        return `&& ${varName} !== null && ${varName} !== undefined `;
      },
      description: 'logical AND',
    },

    // Pattern: someVar ? -> someVar !== null && someVar !== undefined ?
    {
      pattern:
        /([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*\?\s*(?!\.)/g,
      replacement: (match, varName, offset, string) => {
        // Check if it's part of a ternary operator
        const beforeMatch = string.substring(Math.max(0, offset - 50), offset);
        if (
          beforeMatch.includes('=') ||
          beforeMatch.includes('return') ||
          beforeMatch.includes(':')
        ) {
          // Skip boolean variables
          if (
            varName === 'true' ||
            varName === 'false' ||
            varName.startsWith('is') ||
            varName.startsWith('has')
          ) {
            return match;
          }
          return `${varName} !== null && ${varName} !== undefined ? `;
        }
        return match; // It's optional chaining, not ternary
      },
      description: 'ternary operator',
    },

    // Pattern: !someVar -> someVar === null || someVar === undefined
    {
      pattern: /!\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=[)}&|])/g,
      replacement: (match, varName) => {
        // Skip if it's already a boolean
        if (
          varName === 'true' ||
          varName === 'false' ||
          varName.startsWith('is') ||
          varName.startsWith('has')
        ) {
          return match;
        }
        return `(${varName} === null || ${varName} === undefined) `;
      },
      description: 'negation',
    },
  ];

  // Apply each pattern
  patterns.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      content = content.replace(pattern, replacement);
      console.log(
        `✅ Fixed ${matches.length} ${description} expressions in ${path.relative(process.cwd(), filePath)}`
      );
      modified = true;
    }
  });

  // Fix specific cases for arrays and strings
  // Pattern: someArray.length -> someArray.length > 0
  const lengthPattern =
    /([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.length\s*(?=[)}&|])/g;
  const lengthMatches = content.match(lengthPattern);
  if (lengthMatches) {
    content = content.replace(lengthPattern, '$1.length > 0 ');
    console.log(
      `✅ Fixed ${lengthMatches.length} length checks in ${path.relative(process.cwd(), filePath)}`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
};

// Main execution
try {
  const rootDir = path.resolve(__dirname, '..');
  const files = getAllFiles(rootDir);

  let fixedCount = 0;
  const targetFiles = files.filter(
    f =>
      !f.includes('.test.') && !f.includes('.spec.') && !f.includes('__tests__')
  );

  console.log(`Found ${targetFiles.length} TypeScript files to check...\n`);

  targetFiles.forEach((file, index) => {
    if (fixBooleanExpressionsInFile(file)) {
      fixedCount++;
    }

    if ((index + 1) % 50 === 0) {
      console.log(
        `Progress: ${index + 1}/${targetFiles.length} files processed...`
      );
    }
  });

  console.log(`\n✨ Fixed boolean expressions in ${fixedCount} files!`);
} catch (error) {
  console.error('❌ Error fixing boolean expressions:', error.message);
  process.exit(1);
}
