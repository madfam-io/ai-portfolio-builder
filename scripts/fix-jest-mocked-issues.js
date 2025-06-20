#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 FIXING jest.mocked() ISSUES ACROSS ALL TESTS');

let totalFixed = 0;

function findFiles(dir, pattern) {
  const results = [];
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results.push(...findFiles(filePath, pattern));
      } else if (file.match(pattern)) {
        results.push(filePath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

const testDir = path.join(__dirname, '..', '__tests__');
const testFiles = findFiles(testDir, /\.test\.(ts|tsx)$/);

testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;
  
  // Replace jest.mocked() with direct mock manipulation
  if (content.includes('jest.mocked(')) {
    content = content.replace(/jest\.mocked\(([^)]+)\)\.mockReturnValue/g, '($1 as jest.Mock).mockReturnValue');
    content = content.replace(/jest\.mocked\(([^)]+)\)\.mockResolvedValue/g, '($1 as jest.Mock).mockResolvedValue');
    content = content.replace(/jest\.mocked\(([^)]+)\)\.mockImplementation/g, '($1 as jest.Mock).mockImplementation');
    content = content.replace(/jest\.mocked\(([^)]+)\)/g, '($1 as jest.Mock)');
    fixed = true;
  }
  
  // Fix use-toast specific issues
  if (filePath.includes('use-toast.test.ts')) {
    // The mock is already defined at the top, so we just need to use it correctly
    content = content.replace(
      /jest\.mocked\(useUIStore\)\.mockReturnValue/g,
      '(useUIStore as jest.Mock).mockReturnValue'
    );
    fixed = true;
  }
  
  // Fix HuggingFace service mocking
  if (content.includes('HuggingFaceService')) {
    content = content.replace(
      /jest\.mocked\(HuggingFaceService\)/g,
      '(HuggingFaceService as jest.MockedClass<typeof HuggingFaceService>)'
    );
    fixed = true;
  }
  
  // Add type imports if using jest.Mock
  if (fixed && !content.includes('import type { Mock')) {
    // Add after @jest/globals import
    const jestGlobalsRegex = /import.*from '@jest\/globals';/;
    if (jestGlobalsRegex.test(content)) {
      content = content.replace(jestGlobalsRegex, match => 
        match + '\nimport type { Mock, MockedClass } from \'jest-mock\';'
      );
    }
  }
  
  if (fixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`  ✅ Fixed jest.mocked in ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
});

// Also fix any beforeEach that might be using global mocks incorrectly
testFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;
  
  // Fix mock return values in beforeEach
  if (content.includes('mockReturnValue') && content.includes('as any')) {
    // Ensure proper typing
    content = content.replace(/as any\);/g, 'as ReturnType<typeof useUIStore>);');
    content = content.replace(/as any,/g, 'as ReturnType<typeof useUIStore>,');
    fixed = true;
  }
  
  if (fixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`  ✅ Fixed mock typing in ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
});

console.log(`\n✅ Total files fixed: ${totalFixed}`);
console.log('🚀 Running specific test to verify fix...\n');

const { execSync } = require('child_process');
try {
  // Test the use-toast specifically
  execSync('pnpm test __tests__/hooks/use-toast.test.ts 2>&1 | tail -20', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
} catch (error) {
  console.log('\n📊 Test completed - check results above');
}