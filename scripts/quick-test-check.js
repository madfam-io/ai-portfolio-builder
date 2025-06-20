#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🚀 Quick Test Check\n');

// Test categories
const testCategories = [
  { name: 'Hooks', pattern: '__tests__/hooks/*.test.ts' },
  { name: 'Utils', pattern: '__tests__/lib/utils/*.test.ts' },
  { name: 'Stores', pattern: '__tests__/lib/store/*.test.ts' },
  { name: 'Components', pattern: '__tests__/components/**/*.test.tsx' },
  { name: 'API Routes', pattern: '__tests__/app/api/**/*.test.ts' },
  { name: 'Middleware', pattern: '__tests__/middleware*.test.ts' },
  { name: 'Integration', pattern: '__tests__/integration/*.test.tsx' },
  { name: 'E2E', pattern: '__tests__/e2e/*.test.ts' },
];

console.log('Running tests by category...\n');

let totalPass = 0;
let totalFail = 0;

testCategories.forEach(category => {
  try {
    process.stdout.write(`Testing ${category.name}... `);

    const result = execSync(
      `npm test -- "${category.pattern}" --passWithNoTests 2>&1`,
      {
        encoding: 'utf8',
        stdio: 'pipe',
      }
    );

    // Extract pass/fail counts
    const passMatch = result.match(/(\d+) passed/);
    const failMatch = result.match(/(\d+) failed/);

    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 0;

    totalPass += passed;
    totalFail += failed;

    if (failed === 0 && passed > 0) {
      console.log(`✅ ${passed} tests passed`);
    } else if (failed > 0) {
      console.log(`❌ ${failed} failed, ${passed} passed`);
    } else {
      console.log('⚠️  No tests found or error');
    }
  } catch (e) {
    console.log('❌ Error running tests');
  }
});

console.log('\n📊 Overall Summary:');
console.log(`✅ Total Passed: ${totalPass}`);
console.log(`❌ Total Failed: ${totalFail}`);
console.log(
  `📈 Pass Rate: ${((totalPass / (totalPass + totalFail)) * 100).toFixed(1)}%`
);
