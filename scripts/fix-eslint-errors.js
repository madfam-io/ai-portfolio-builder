#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with ESLint errors
console.log('Getting list of files with ESLint errors...');
let eslintOutput;
try {
  eslintOutput = execSync('pnpm lint 2>&1', { encoding: 'utf8' });
} catch (error) {
  // ESLint returns non-zero exit code when there are errors
  eslintOutput = error.stdout || error.output?.join('') || '';
}

// Parse the output to find files with unused variable errors
const lines = eslintOutput.split('\n');
const filesToFix = new Set();
const errorPattern = /^(.+?):\d+:\d+\s+(Error|Warning):/;

lines.forEach(line => {
  const match = line.match(errorPattern);
  if (match) {
    filesToFix.add(match[1]);
  }
});

console.log(`Found ${filesToFix.size} files to fix\n`);

// Function to fix unused catch errors
function fixUnusedCatchErrors(content) {
  // Replace catch (error) with catch (_error) for unused errors
  return content.replace(
    /catch\s*\(\s*(\w+)\s*\)\s*{[^}]*}/g,
    (match, varName) => {
      // Check if the variable is used in the catch block
      const blockContent = match.substring(match.indexOf('{'));
      if (
        !blockContent.includes(varName) ||
        blockContent.includes(`unused ${varName}`)
      ) {
        return match.replace(`catch (${varName})`, `catch (_${varName})`);
      }
      return match;
    }
  );
}

// Function to fix unused error parameters in catch blocks
function fixUnusedErrorParams(content) {
  // More specific pattern for catch blocks with unused 'e' or 'error' variables
  return content
    .replace(/catch\s*\(\s*e\s*\)\s*{/g, 'catch (_e) {')
    .replace(/catch\s*\(\s*error\s*\)\s*{\s*\/\//g, 'catch (_error) { //')
    .replace(/catch\s*\(\s*error\s*\)\s*{\s*}/g, 'catch (_error) { }')
    .replace(/}\s*catch\s*\(\s*error\s*\)\s*{\s*}/g, '} catch (_error) { }');
}

// Process each file
filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  console.log(`Fixing ${file}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Apply fixes
  content = fixUnusedCatchErrors(content);
  content = fixUnusedErrorParams(content);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  }
});

// Run prettier to fix formatting issues
console.log('\nRunning prettier to fix formatting issues...');
try {
  execSync('pnpm format', { stdio: 'inherit' });
  console.log('✅ Prettier formatting complete');
} catch (error) {
  console.error('❌ Prettier formatting failed:', error.message);
}

console.log('\n✅ ESLint fixes complete!');
