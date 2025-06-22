#!/usr/bin/env node

/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

const { execSync } = require('child_process');

console.log('📊 Counting test results...\n');

try {
  // Run tests with a timeout
  const output = execSync('timeout 120 npm test 2>&1 || true', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
  });

  // Extract test summary
  const lines = output.split('\n');
  const summaryLine = lines.find(
    line => line.includes('Tests:') && line.includes('passed')
  );
  const suiteLine = lines.find(
    line => line.includes('Test Suites:') && line.includes('passed')
  );

  if (summaryLine) {
    console.log('Test Results:');
    console.log(summaryLine.trim());
  }

  if (suiteLine) {
    console.log(suiteLine.trim());
  }

  // Count PASS/FAIL
  const passCount = (output.match(/PASS /g) || []).length;
  const failCount = (output.match(/FAIL /g) || []).length;

  console.log(`\n✅ Passing test suites: ${passCount}`);
  console.log(`❌ Failing test suites: ${failCount}`);
  console.log(`📊 Total test suites: ${passCount + failCount}`);

  // Calculate percentage
  const total = passCount + failCount;
  if (total > 0) {
    const percentage = ((passCount / total) * 100).toFixed(1);
    console.log(`\n🎯 Pass rate: ${percentage}%`);
  }
} catch (error) {
  console.error('Error running tests:', error.message);
}
