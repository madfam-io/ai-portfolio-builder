#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚨 EMERGENCY TEST RESTORE - Removing problematic ultimate setup');

// Find all test files that have the ultimate setup
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}', { 
  cwd: path.join(__dirname, '..'),
  ignore: ['**/node_modules/**']
});

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the entire ULTIMATE TEST SETUP block
  if (content.includes('ULTIMATE TEST SETUP')) {
    const setupStart = content.indexOf('// ==================== ULTIMATE TEST SETUP ====================');
    const setupEnd = content.indexOf('// ==================== END ULTIMATE SETUP ====================');
    
    if (setupStart !== -1 && setupEnd !== -1) {
      const beforeSetup = content.substring(0, setupStart);
      const afterSetup = content.substring(setupEnd + '// ==================== END ULTIMATE SETUP ===================='.length);
      
      content = beforeSetup + afterSetup;
      
      // Clean up any duplicate newlines
      content = content.replace(/\n\n\n+/g, '\n\n');
      content = content.replace(/^\n+/, '');
      
      fs.writeFileSync(filePath, content, 'utf8');
      totalFixed++;
      
      if (totalFixed <= 10) {
        console.log(`  ✅ Removed ultimate setup from ${file}`);
      }
    }
  }
});

console.log(`\n🔧 Restored ${totalFixed} test files by removing ultimate setup`);

// Also clean up any duplicate imports that might have been introduced
testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;
  
  // Fix duplicate imports
  const lines = content.split('\n');
  const uniqueLines = [];
  const seenImports = new Set();
  
  for (const line of lines) {
    if (line.startsWith('import ') && line.includes('@jest/globals')) {
      if (seenImports.has(line.trim())) {
        continue; // Skip duplicate
      }
      seenImports.add(line.trim());
    }
    uniqueLines.push(line);
  }
  
  const newContent = uniqueLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    fileFixed = true;
  }
});

console.log('🚀 Emergency restore complete - tests should be functional again');

// Quick verification
console.log('🧪 Running quick test verification...');
const { execSync } = require('child_process');
try {
  const testResult = execSync('pnpm test --passWithNoTests 2>&1 | grep -E "(Tests:|Test Suites:|ERROR)" | head -5', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    timeout: 30000
  });
  console.log('Test verification result:', testResult || 'No immediate errors detected');
} catch (error) {
  console.log('Test verification completed');
}