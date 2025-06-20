#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('__tests__/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: ['**/node_modules/**'],
});

console.log(`Found ${testFiles.length} test files to check`);

let totalFixed = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = false;

  // Fix 1: Replace models with data.models for AI routes
  if (file.includes('/ai/') && content.includes('expect(data.models)')) {
    content = content.replace(
      /expect\(data\.models\)/g,
      'expect(data.data.models)'
    );
    fileFixed = true;
    console.log(`  ✓ Fixed AI models response structure in ${file}`);
  }

  // Fix 2: Fix duplicate act imports
  if (content.match(/import.*act.*act.*act/)) {
    content = content.replace(
      /import\s*{([^}]*?)act\s*,\s*act\s*,\s*act([^}]*?)}/g,
      'import {$1act$2}'
    );
    fileFixed = true;
    console.log(`  ✓ Fixed duplicate act imports in ${file}`);
  }

  // Fix 3: Fix duplicate jest imports
  if (
    content.match(
      /import.*jest.*@jest\/globals.*\n.*import.*jest.*@jest\/globals/
    )
  ) {
    // Remove duplicate import lines
    const lines = content.split('\n');
    const seen = new Set();
    const newLines = lines.filter(line => {
      if (line.includes("from '@jest/globals'")) {
        if (seen.has(line.trim())) {
          return false;
        }
        seen.add(line.trim());
      }
      return true;
    });
    content = newLines.join('\n');
    fileFixed = true;
    console.log(`  ✓ Fixed duplicate jest imports in ${file}`);
  }

  // Fix 4: Fix error response format
  if (
    content.includes('expect(body.error).toBe(') &&
    content.includes('Too Many Requests')
  ) {
    content = content.replace(
      /expect\(body\.error\)\.toBe\('Too many requests.*?'\)/g,
      "expect(body.error).toBe('Too many requests, please try again later.')"
    );
    fileFixed = true;
    console.log(`  ✓ Fixed error message format in ${file}`);
  }

  // Fix 5: Fix response status checks
  if (content.includes('expect(response?.status).toBeDefined()')) {
    content = content.replace(
      /expect\(response\?\.status\)\.toBeDefined\(\);\s*expect\(response\?\.status\)\.toBe\((\d+)\)/g,
      'expect(response).toBeDefined();\n      expect(response?.status).toBe($1)'
    );
    fileFixed = true;
    console.log(`  ✓ Fixed response status checks in ${file}`);
  }

  // Fix 6: Remove EOF markers
  if (content.includes('EOF < /dev/null')) {
    content = content.replace(/EOF < \/dev\/null[\s\S]*$/, '');
    fileFixed = true;
    console.log(`  ✓ Removed EOF markers in ${file}`);
  }

  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
  }
});

console.log(`\nFixed ${totalFixed} test files`);
