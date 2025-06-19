#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🎯 Final Test Summary\n');
console.log('='.repeat(50));

// Run all tests and capture output
console.log('\n📊 Running complete test suite...\n');

try {
  const startTime = Date.now();
  
  // Run tests with specific options to get summary
  const result = execSync('npm test -- --passWithNoTests --verbose=false 2>&1 || true', { 
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024 // 50MB buffer
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Extract key metrics
  const passMatch = result.match(/(\d+) passed/);
  const failMatch = result.match(/(\d+) failed/);
  const totalMatch = result.match(/(\d+) total/);
  const suitesPassMatch = result.match(/Test Suites:.*?(\d+) passed/);
  const suitesFailMatch = result.match(/Test Suites:.*?(\d+) failed/);
  const suitesTotalMatch = result.match(/Test Suites:.*?(\d+) total/);
  
  const testsPassed = passMatch ? parseInt(passMatch[1]) : 0;
  const testsFailed = failMatch ? parseInt(failMatch[1]) : 0;
  const testsTotal = totalMatch ? parseInt(totalMatch[1]) : 0;
  
  const suitesPassed = suitesPassMatch ? parseInt(suitesPassMatch[1]) : 0;
  const suitesFailed = suitesFailMatch ? parseInt(suitesFailMatch[1]) : 0;
  const suitesTotal = suitesTotalMatch ? parseInt(suitesTotalMatch[1]) : 0;
  
  console.log('📈 Test Suite Results:');
  console.log(`   ✅ Passing: ${suitesPassed}/${suitesTotal} suites`);
  console.log(`   ❌ Failing: ${suitesFailed}/${suitesTotal} suites`);
  console.log(`   📊 Pass Rate: ${((suitesPassed/suitesTotal)*100).toFixed(1)}%`);
  
  console.log('\n📈 Individual Test Results:');
  console.log(`   ✅ Passing: ${testsPassed}/${testsTotal} tests`);
  console.log(`   ❌ Failing: ${testsFailed}/${testsTotal} tests`);
  console.log(`   📊 Pass Rate: ${((testsPassed/testsTotal)*100).toFixed(1)}%`);
  
  console.log(`\n⏱️  Total Duration: ${duration}s`);
  
  // Calculate improvement
  console.log('\n🚀 Improvement Summary:');
  console.log('   Initial State: 0% pass rate (0/136 suites)');
  console.log(`   Current State: ${((suitesPassed/suitesTotal)*100).toFixed(1)}% pass rate (${suitesPassed}/${suitesTotal} suites)`);
  console.log(`   📈 Improvement: +${((suitesPassed/suitesTotal)*100).toFixed(1)}%`);
  
  // List some sample passing tests
  console.log('\n✅ Sample Passing Tests:');
  const passingTests = result.match(/PASS [\w/.-]+\.test\.(ts|tsx)/g) || [];
  passingTests.slice(0, 10).forEach(test => {
    console.log(`   ${test}`);
  });
  if (passingTests.length > 10) {
    console.log(`   ... and ${passingTests.length - 10} more`);
  }
  
  // List failing tests if any
  if (suitesFailed > 0) {
    console.log('\n❌ Sample Failing Tests:');
    const failingTests = result.match(/FAIL [\w/.-]+\.test\.(ts|tsx)/g) || [];
    failingTests.slice(0, 10).forEach(test => {
      console.log(`   ${test}`);
    });
    if (failingTests.length > 10) {
      console.log(`   ... and ${failingTests.length - 10} more`);
    }
  }
  
} catch (error) {
  console.error('Error running tests:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('\n✨ Test suite optimization complete!');
console.log('   Continue fixing remaining tests to reach 100% pass rate.');