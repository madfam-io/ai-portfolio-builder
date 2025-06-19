#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Identifying all failing tests...\n');

// Get all test files
const allTests = execSync('find __tests__ -name "*.test.ts" -o -name "*.test.tsx" | sort', { encoding: 'utf8' })
  .split('\n')
  .filter(f => f.trim());

console.log(`Total test files: ${allTests.length}\n`);

const results = {
  passing: [],
  failing: [],
  error: []
};

// Test each file individually
allTests.forEach((testFile, index) => {
  process.stdout.write(`\rTesting ${index + 1}/${allTests.length}...`);
  
  try {
    const result = execSync(`npm test -- "${testFile}" --passWithNoTests 2>&1`, { 
      encoding: 'utf8',
      timeout: 10000,
      stdio: 'pipe'
    });
    
    if (result.includes('PASS ')) {
      results.passing.push(testFile);
    } else if (result.includes('FAIL ')) {
      // Extract error summary
      const errorMatch = result.match(/● (.+)/);
      const error = errorMatch ? errorMatch[1] : 'Unknown error';
      results.failing.push({ file: testFile, error });
    }
  } catch (e) {
    results.error.push(testFile);
  }
});

console.log('\n\n📊 Test Results Summary:');
console.log(`✅ Passing: ${results.passing.length}/${allTests.length} (${((results.passing.length/allTests.length)*100).toFixed(1)}%)`);
console.log(`❌ Failing: ${results.failing.length}/${allTests.length}`);
console.log(`⚠️  Errors: ${results.error.length}/${allTests.length}`);

// Group failing tests by error type
const errorGroups = {};
results.failing.forEach(({ file, error }) => {
  if (!errorGroups[error]) {
    errorGroups[error] = [];
  }
  errorGroups[error].push(file);
});

console.log('\n🔍 Common Error Patterns:');
Object.entries(errorGroups).forEach(([error, files]) => {
  console.log(`\n"${error}" (${files.length} files):`);
  files.slice(0, 3).forEach(f => console.log(`  - ${f}`));
  if (files.length > 3) {
    console.log(`  ... and ${files.length - 3} more`);
  }
});

// Save results for further analysis
fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
console.log('\n💾 Detailed results saved to test-results.json');