
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(tsx?|jsx?)$/) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        results.push(...findFiles(filePath, pattern));
      }
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Fix import order issues
function fixImportOrder(content) {
  const lines = content.split('\n');
  const imports = [];
  const otherLines = [];
  let inImportBlock = false;
  let useClientLine = null;
  
  // Extract imports
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim() === "'use client';" || line.trim() === '"use client";') {
      useClientLine = line;
      continue;
    }
    
    if (line.startsWith('import ') || (inImportBlock && line.trim())) {
      imports.push(line);
      inImportBlock = true;
    } else if (inImportBlock && !line.trim()) {
      // Empty line after imports
      inImportBlock = false;
    } else {
      otherLines.push(line);
    }
  }
  
  // Sort imports
  const reactImports = imports.filter(i => i.includes('from \'react\'') || i.includes('from "react"'));
  const reactIconImports = imports.filter(i => i.includes('react-icons'));
  const nextImports = imports.filter(i => i.includes('from \'next') || i.includes('from "next'));
  const localImports = imports.filter(i => i.includes('from \'@/') || i.includes('from "@/') || i.includes('from \'./') || i.includes('from "../'));
  const otherImports = imports.filter(i => 
    !reactImports.includes(i) && 
    !reactIconImports.includes(i) && 
    !nextImports.includes(i) && 
    !localImports.includes(i)
  );
  
  // Rebuild content
  const result = [];
  if (useClientLine) result.push(useClientLine, '');
  
  if (reactImports.length > 0) result.push(...reactImports);
  if (nextImports.length > 0) result.push(...nextImports);
  if (reactIconImports.length > 0) result.push(...reactIconImports);
  if (otherImports.length > 0) result.push(...otherImports);
  if (localImports.length > 0) {
    if (result.length > (useClientLine ? 2 : 0)) result.push('');
    result.push(...localImports);
  }
  
  result.push('');
  result.push(...otherLines);
  
  // Clean up multiple empty lines
  return result.join('\n').replace(/\n{4,}/g, '\n\n\n').replace(/\n{3,}$/g, '\n');
}

// Fix return type annotations
function addReturnTypes(content, filePath) {
  let modified = content;
  
  // Add return types for route handlers
  if (filePath.includes('/api/')) {
    // GET handlers
    modified = modified.replace(
      /export\s+async\s+function\s+GET\s*\([^)]*\)\s*{/g,
      'export async function GET($1): Promise<Response> {'
    );
    modified = modified.replace(
      /export\s+async\s+function\s+GET\s*\([^)]*\):\s*{/g,
      'export async function GET($1): Promise<Response> {'
    );
    
    // POST handlers
    modified = modified.replace(
      /export\s+async\s+function\s+POST\s*\([^)]*\)\s*{/g,
      'export async function POST($1): Promise<Response> {'
    );
    
    // PUT handlers
    modified = modified.replace(
      /export\s+async\s+function\s+PUT\s*\([^)]*\)\s*{/g,
      'export async function PUT($1): Promise<Response> {'
    );
    
    // DELETE handlers
    modified = modified.replace(
      /export\s+async\s+function\s+DELETE\s*\([^)]*\)\s*{/g,
      'export async function DELETE($1): Promise<Response> {'
    );
  }
  
  // Fix arrow functions missing return types
  modified = modified.replace(
    /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
    (match, name, params) => {
      if (!match.includes(': ')) {
        return `const ${name} = (${params}): void => {`;
      }
      return match;
    }
  );
  
  return modified;
}

// Fix any type issues
function fixAnyTypes(content) {
  let modified = content;
  
  // Replace explicit any with unknown in most cases
  modified = modified.replace(/:\s*any(\s|,|;|\))/g, ': unknown$1');
  modified = modified.replace(/as\s+any(\s|,|;|\))/g, 'as unknown$1');
  
  // Fix conditional checks
  modified = modified.replace(/if\s*\(([^)]+)\s+!==\s+undefined\s+&&\s+\1\s+!==\s+null\)/g, 'if ($1)');
  modified = modified.replace(/\?\.\s*length\s*>\s*0/g, '?.length');
  
  // Fix strict boolean expressions
  modified = modified.replace(/if\s*\(([^)]+)\.length\)/g, 'if ($1.length > 0)');
  modified = modified.replace(/&&\s*([^&\s]+)\.length\s*&&/g, '&& $1.length > 0 &&');
  
  return modified;
}

// Split large files
function splitLargeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  if (lines.length <= 500) return false;
  
  console.log(`File ${filePath} has ${lines.length} lines - needs splitting`);
  
  // For now, just log files that need splitting
  // In a real implementation, we would extract components/functions to separate files
  return true;
}

// Reduce function complexity
function reduceComplexity(content, functionName) {
  // This is a simplified approach - in reality, we'd need to refactor the logic
  let modified = content;
  
  // Look for the function
  const functionRegex = new RegExp(`(async\\s+)?function\\s+${functionName}\\s*\\([^)]*\\)[^{]*{`, 'g');
  const match = functionRegex.exec(modified);
  
  if (match) {
    console.log(`Found complex function: ${functionName}`);
    // Add early returns where possible
    // Extract helper functions
    // Simplify conditional logic
  }
  
  return modified;
}

// Main processing
const files = findFiles('.');
let fixedCount = 0;

console.log(`Processing ${files.length} files...`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = content;
  let fileModified = false;
  
  // Fix import order
  const fixedImports = fixImportOrder(modified);
  if (fixedImports !== modified) {
    modified = fixedImports;
    fileModified = true;
  }
  
  // Add return types
  const withReturnTypes = addReturnTypes(modified, file);
  if (withReturnTypes !== modified) {
    modified = withReturnTypes;
    fileModified = true;
  }
  
  // Fix any types
  const fixedAny = fixAnyTypes(modified);
  if (fixedAny !== modified) {
    modified = fixedAny;
    fileModified = true;
  }
  
  // Remove extra newlines
  modified = modified.replace(/\n{4,}/g, '\n\n\n');
  
  if (fileModified) {
    fs.writeFileSync(file, modified);
    console.log(`Fixed ${file}`);
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);

// Run prettier to fix formatting issues
console.log('\nRunning prettier...');
try {
  execSync('pnpm prettier --write "**/*.{ts,tsx,js,jsx}"', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to run prettier');
}

console.log('\nDone!');