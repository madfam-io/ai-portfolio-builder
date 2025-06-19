#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}', { 
  cwd: path.join(__dirname, '..'),
  ignore: ['**/node_modules/**']
});

console.log(`Fixing comprehensive issues in ${testFiles.length} test files`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;
  
  // Remove problematic comprehensive-test-setup if it exists
  if (content.includes('comprehensive-test-setup')) {
    content = content.replace(/import.*comprehensive-test-setup.*\n/g, '');
    fileFixed = true;
    console.log(`  ✓ Removed problematic comprehensive-test-setup import from ${file}`);
  }
  
  // Fix duplicate mock setups
  const mockCount = (content.match(/jest\.mock\(/g) || []).length;
  if (mockCount > 10) {
    // This file has too many mocks, let's clean it up
    const lines = content.split('\n');
    const uniqueLines = [];
    const seenMocks = new Set();
    
    for (const line of lines) {
      if (line.includes('jest.mock(')) {
        const mockPath = line.match(/jest\.mock\('([^']+)'/);
        if (mockPath && seenMocks.has(mockPath[1])) {
          continue; // Skip duplicate mock
        }
        if (mockPath) {
          seenMocks.add(mockPath[1]);
        }
      }
      uniqueLines.push(line);
    }
    
    content = uniqueLines.join('\n');
    fileFixed = true;
    console.log(`  ✓ Cleaned up duplicate mocks in ${file}`);
  }
  
  // Fix syntax errors from our previous script
  content = content.replace(/jest\.fn\(\)\n\)/g, 'jest.fn())');
  content = content.replace(/,\n\s*\}\)\n\s*\}\)/g, '\n  })\n}');
  
  // Fix broken Supabase mock format
  if (content.includes('mockSupabaseClient') && content.includes('Object.<anonymous>')) {
    // The mock is causing Jest issues, let's simplify it
    content = content.replace(
      /\/\/ Mock Supabase[\s\S]*?}\);/g,
      `// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) }))
  }))
}));`
    );
    fileFixed = true;
    console.log(`  ✓ Simplified Supabase mock in ${file}`);
  }
  
  // Fix async test functions that were incorrectly modified
  content = content.replace(/it\('([^']+)', async \(\) => \{[\s\S]*?await act\(async \(\) => \{/g, 
    (match, testName) => {
      return match.replace('await act(async () => {', 'act(() => {');
    }
  );
  
  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
  }
});

console.log(`\nFixed ${totalFixed} test files with comprehensive issues`);