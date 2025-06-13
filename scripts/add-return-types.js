
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('🔧 Adding missing function return types...\n');

// Get all TypeScript files
const getAllFiles = (dirPath, arrayOfFiles = []): void => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      if (
        !['node_modules', '.next', 'out', 'coverage', '.git'].includes(file)
      ) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else if (file.match(/\.(ts|tsx)$/) && !file.endsWith('.d.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

// Common React component return types
const getReactReturnType = hasJSX => {
  if (hasJSX) {
    return 'React.ReactElement';
  }
  return 'void';
};

// Function to add return types to a file
const addReturnTypesToFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let modified = false;
  let newContent = content;

  const isReactComponent = filePath.endsWith('.tsx');
  const hasReactImport =
    content.includes("from 'react'") || content.includes('from "react"');

  // Function to check if a function returns JSX
  const returnsJSX = node => {
    let hasJSX = false;

    const visitor = node => {
      if (
        ts.isJsxElement(node) ||
        ts.isJsxSelfClosingElement(node) ||
        ts.isJsxFragment(node)
      ) {
        hasJSX = true;
      }
      ts.forEachChild(node, visitor);
    };

    ts.forEachChild(node, visitor);
    return hasJSX;
  };

  // Visitor function
  const visitor = node => {
    // Check for functions without return types
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node)
    ) {
      const hasReturnType = node.type !== undefined;

      if (!hasReturnType && node.body) {
        const functionText = content.substring(node.pos, node.end);
        const functionName = node.name ? node.name.text : 'anonymous';

        // Skip if it's in a test file
        if (filePath.includes('.test.') || filePath.includes('.spec.')) {
          return;
        }

        // Skip if it's a callback or event handler
        if (
          functionName.startsWith('handle') ||
          functionName.startsWith('on')
        ) {
          return;
        }

        // Determine return type
        let returnType = 'void';

        if (
          isReactComponent &&
          (functionName === 'default' || functionName.match(/^[A-Z]/))
        ) {
          // React component
          returnType = 'React.ReactElement';
        } else if (returnsJSX(node)) {
          returnType = 'React.ReactElement';
        } else if (node.body && ts.isBlock(node.body)) {
          // Check for return statements
          let hasReturn = false;
          let isAsync = false;

          const checkReturns = node => {
            if (ts.isReturnStatement(node) && node.expression) {
              hasReturn = true;
            }
            if (
              node.modifiers &&
              node.modifiers.some(m => m.kind === ts.SyntaxKind.AsyncKeyword)
            ) {
              isAsync = true;
            }
            ts.forEachChild(node, checkReturns);
          };

          checkReturns(node);

          if (hasReturn) {
            // Try to infer type from context
            if (
              functionName.includes('get') ||
              functionName.includes('fetch')
            ) {
              returnType = isAsync ? 'Promise<unknown>' : 'unknown';
            } else {
              returnType = 'unknown';
            }
          }
        }

        // Add return type
        if (returnType !== 'void' || functionName === 'default') {
          const endOfParams = node.parameters.end;
          let insertPosition = endOfParams + 1;

          // Find the position after the closing parenthesis
          let i = insertPosition;
          while (i < content.length && content[i] !== ')') {
            i++;
          }
          insertPosition = i + 1;

          // Check if there's already a colon (for generic functions)
          if (content[insertPosition] === ':') {
            return;
          }

          newContent =
            newContent.substring(0, insertPosition) +
            `: ${returnType}` +
            newContent.substring(insertPosition);
          modified = true;

          console.log(
            `✅ Added return type to ${functionName} in ${path.relative(process.cwd(), filePath)}`
          );
        }
      }
    }

    ts.forEachChild(node, visitor);
  };

  ts.forEachChild(sourceFile, visitor);

  if (modified) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }

  return false;
};

// Main execution
try {
  const rootDir = path.resolve(__dirname, '..');
  const files = getAllFiles(rootDir);

  let fixedCount = 0;
  const reactFiles = files.filter(f => f.endsWith('.tsx'));
  const tsFiles = files.filter(f => f.endsWith('.ts') && !f.endsWith('.tsx'));

  console.log(
    `Found ${reactFiles.length} React files and ${tsFiles.length} TypeScript files to check...\n`
  );

  // Process React files first
  console.log('Processing React components...');
  reactFiles.forEach(file => {
    if (addReturnTypesToFile(file)) {
      fixedCount++;
    }
  });

  console.log('\nProcessing TypeScript files...');
  tsFiles.forEach(file => {
    if (addReturnTypesToFile(file)) {
      fixedCount++;
    }
  });

  console.log(`\n✨ Added return types to ${fixedCount} functions!`);
} catch (error) {
  console.error('❌ Error adding return types:', error.message);
  process.exit(1);
}
