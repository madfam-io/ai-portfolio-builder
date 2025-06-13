
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Adding missing function return types...\n');

// Get all TypeScript files
const getAllFiles = (dirPath, arrayOfFiles = []): void => {
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
    } else if (
      file.match(/\.(ts|tsx)$/) &&
      !file.endsWith('.d.ts') &&
      !file.includes('.test.') &&
      !file.includes('.spec.')
    ) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

// Function to add return types to a file
const addReturnTypesToFile = filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const isReactComponent = filePath.endsWith('.tsx');

  // Pattern to match default export functions in React components
  if (isReactComponent) {
    // Match: export default function ComponentName() {
    const defaultFunctionPattern =
      /^export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*{/gm;
    if (defaultFunctionPattern.test(content)) {
      content = content.replace(defaultFunctionPattern, (match, name) => {
        console.log(
          `✅ Adding React.ReactElement to ${name} in ${path.relative(process.cwd(), filePath)}`
        );
        modified = true;
        return match.replace(')', '): React.ReactElement');
      });
    }
  }

  // Pattern for API route handlers
  if (filePath.includes('/api/') && filePath.endsWith('route.ts')) {
    // Match: export async function GET(request: Request) {
    const apiHandlerPattern =
      /^export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/gm;
    if (apiHandlerPattern.test(content)) {
      content = content.replace(apiHandlerPattern, (match, async, method) => {
        const isAsync = async ? true : false;
        const returnType = isAsync ? 'Promise<Response>' : 'Response';
        console.log(
          `✅ Adding ${returnType} to ${method} in ${path.relative(process.cwd(), filePath)}`
        );
        modified = true;
        return match.replace(')', `): ${returnType}`);
      });
    }
  }

  // Pattern for regular async functions
  const asyncFunctionPattern =
    /^(export\s+)?async\s+function\s+(\w+)\s*\([^)]*\)\s*{/gm;
  const matches = content.match(asyncFunctionPattern);
  if (matches) {
    matches.forEach(match => {
      // Skip if already has return type
      if (!match.includes('): ')) {
        const functionName = match.match(/function\s+(\w+)/)?.[1];
        if (
          functionName &&
          !functionName.startsWith('handle') &&
          !functionName.startsWith('on')
        ) {
          const newMatch = match.replace(')', '): Promise<void>');
          content = content.replace(match, newMatch);
          console.log(
            `✅ Adding Promise<void> to ${functionName} in ${path.relative(process.cwd(), filePath)}`
          );
          modified = true;
        }
      }
    });
  }

  // Pattern for arrow functions assigned to const
  const arrowFunctionPattern =
    /^(export\s+)?const\s+(\w+)\s*=\s*(\([^)]*\)|[^=]+)\s*=>\s*{/gm;
  const arrowMatches = content.match(arrowFunctionPattern);
  if (arrowMatches) {
    arrowMatches.forEach(match => {
      if (!match.includes('): ') && !match.includes('> =')) {
        const functionName = match.match(/const\s+(\w+)/)?.[1];
        if (
          functionName &&
          functionName[0] === functionName[0].toUpperCase() &&
          isReactComponent
        ) {
          // React component
          const newMatch = match.replace('=>', ': React.ReactElement =>');
          content = content.replace(match, newMatch);
          console.log(
            `✅ Adding React.ReactElement to ${functionName} in ${path.relative(process.cwd(), filePath)}`
          );
          modified = true;
        }
      }
    });
  }

  if (modified) {
    // Ensure React is imported if we added React.ReactElement
    if (
      content.includes('React.ReactElement') &&
      !content.includes('import React')
    ) {
      if (content.includes("from 'react'")) {
        // Add React to existing import
        content = content.replace(
          /import\s*{([^}]+)}\s*from\s*['"]react['"]/g,
          (match, imports) => {
            if (!imports.includes('React')) {
              return `import React, {${imports}} from 'react'`;
            }
            return match;
          }
        );
      } else {
        // Add new React import at the top
        content = `import React from 'react';\n${content}`;
      }
    }

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

  console.log(`Found ${files.length} TypeScript files to check...\n`);

  files.forEach((file, index) => {
    if (addReturnTypesToFile(file)) {
      fixedCount++;
    }

    if ((index + 1) % 50 === 0) {
      console.log(`Progress: ${index + 1}/${files.length} files processed...`);
    }
  });

  console.log(`\n✨ Added return types to ${fixedCount} functions!`);
} catch (error) {
  console.error('❌ Error adding return types:', error.message);
  process.exit(1);
}
