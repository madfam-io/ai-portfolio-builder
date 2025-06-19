#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Analyzing test failures...\n');

// Get list of failing tests
const failingTests = [];
const errorPatterns = new Map();

// Run tests and capture failures
try {
  const output = execSync('npm test -- --listTests 2>&1', { encoding: 'utf8' });
  const allTests = output.split('\n').filter(line => line.includes('__tests__'));
  
  console.log(`Found ${allTests.length} test files. Checking each...\n`);
  
  allTests.forEach((testFile, index) => {
    if (index % 10 === 0) {
      process.stdout.write(`\rChecking ${index + 1}/${allTests.length}...`);
    }
    
    try {
      const result = execSync(`npm test -- "${testFile}" --passWithNoTests 2>&1`, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: 'pipe'
      });
      
      if (result.includes('FAIL ')) {
        // Extract error type
        let errorType = 'Unknown error';
        
        if (result.includes('Cannot find module')) {
          const moduleMatch = result.match(/Cannot find module '([^']+)'/);
          errorType = `Module not found: ${moduleMatch ? moduleMatch[1] : 'unknown'}`;
        } else if (result.includes('Test suite failed to run')) {
          if (result.includes('SyntaxError')) {
            errorType = 'Syntax error';
          } else if (result.includes('Configuration error')) {
            errorType = 'Configuration error';
          } else {
            errorType = 'Test suite failed to run';
          }
        } else if (result.includes('Expected')) {
          errorType = 'Assertion failed';
        } else if (result.includes('TypeError')) {
          const typeErrorMatch = result.match(/TypeError: (.+)/);
          errorType = `TypeError: ${typeErrorMatch ? typeErrorMatch[1].substring(0, 50) : 'unknown'}`;
        }
        
        failingTests.push({ file: testFile, error: errorType });
        
        // Count error patterns
        if (!errorPatterns.has(errorType)) {
          errorPatterns.set(errorType, []);
        }
        errorPatterns.get(errorType).push(testFile);
      }
    } catch (e) {
      failingTests.push({ file: testFile, error: 'Timeout or crash' });
    }
  });
  
  console.log('\n\n📊 Failure Analysis:\n');
  
  // Sort error patterns by frequency
  const sortedPatterns = Array.from(errorPatterns.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log('Most common error patterns:\n');
  sortedPatterns.forEach(([error, files]) => {
    console.log(`❌ ${error} (${files.length} files)`);
    files.slice(0, 3).forEach(file => {
      console.log(`   - ${file.replace(process.cwd() + '/', '')}`);
    });
    if (files.length > 3) {
      console.log(`   ... and ${files.length - 3} more\n`);
    }
  });
  
  // Save detailed results
  fs.writeFileSync('failing-tests.json', JSON.stringify({
    total: failingTests.length,
    patterns: Object.fromEntries(errorPatterns),
    tests: failingTests
  }, null, 2));
  
  console.log(`\n💾 Detailed analysis saved to failing-tests.json`);
  console.log(`\n📈 Summary: ${failingTests.length} failing tests found`);
  
} catch (error) {
  console.error('Error during analysis:', error.message);
}