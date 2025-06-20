#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('📊 Checking test progress...\n');

// Run a subset of tests to get a sample
const testSamples = [
  '__tests__/hooks/use-toast.test.ts',
  '__tests__/lib/utils/date.test.ts',
  '__tests__/lib/utils/crypto.test.ts',
  '__tests__/lib/store/ui-store.test.ts',
  '__tests__/lib/store/auth-store.test.ts',
  '__tests__/middleware.test.ts',
  '__tests__/components/billing/upgrade-modal.test.tsx',
  '__tests__/app/api/v1/health/route.test.ts',
];

let passCount = 0;
let failCount = 0;
let totalTests = 0;

testSamples.forEach(test => {
  try {
    const result = execSync(`npm test -- ${test} 2>&1`, { encoding: 'utf8' });
    if (result.includes('PASS ')) {
      passCount++;
      console.log(`✅ ${test}`);
    } else if (result.includes('FAIL ')) {
      failCount++;
      console.log(`❌ ${test}`);
    }

    // Extract test count
    const testMatch = result.match(/Tests:\s+(\d+)\s+(passed|failed)/);
    if (testMatch) {
      totalTests += parseInt(testMatch[1]);
    }
  } catch (e) {
    failCount++;
    console.log(`❌ ${test} (error)`);
  }
});

console.log('\n📊 Sample Results:');
console.log(`✅ Passing suites: ${passCount}/${testSamples.length}`);
console.log(`❌ Failing suites: ${failCount}/${testSamples.length}`);
console.log(
  `📈 Pass rate: ${((passCount / testSamples.length) * 100).toFixed(1)}%`
);

// Estimate total based on sample
const totalSuites = 136; // Total test suites
const estimatedPassRate = passCount / testSamples.length;
const estimatedPassing = Math.round(totalSuites * estimatedPassRate);

console.log('\n🎯 Estimated Total Progress:');
console.log(`Estimated passing suites: ~${estimatedPassing}/${totalSuites}`);
console.log(`Estimated pass rate: ~${(estimatedPassRate * 100).toFixed(1)}%`);
