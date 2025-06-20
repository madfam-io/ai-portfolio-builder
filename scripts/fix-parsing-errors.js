#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to fix parsing errors caused by incorrect HTML entity replacements
const fixPatterns = [
  // Fix generic types that were incorrectly escaped
  { pattern: /&lt;(\w+)&gt;/g, replacement: '<$1>' },
  { pattern: /&lt;([\w\s,]+)&gt;/g, replacement: '<$1>' },
  { pattern: /Promise&lt;/g, replacement: 'Promise<' },
  { pattern: /&gt;/g, replacement: '>' },
  { pattern: /&lt;/g, replacement: '<' },
  { pattern: /&amp;/g, replacement: '&' },
  { pattern: /&apos;/g, replacement: "'" },
  { pattern: /&quot;/g, replacement: '"' },
];

// Files with parsing errors from the lint output
const filesToFix = [
  'lib/analytics/posthog/middleware.ts',
  'lib/utils/crypto.ts',
  'lib/utils/csrf-client.ts',
  'lib/utils/date.ts',
  'lib/utils/dynamic-import.ts',
  'lib/utils/encryption.ts',
  'lib/utils/error-handling/error-monitoring.ts',
  'lib/utils/error-handling/error-types.ts',
  'lib/utils/error-handling/error-utils.ts',
  'lib/utils/experiments/calculate-results.ts',
  'lib/utils/geolocation.ts',
  'lib/utils/license.ts',
  'lib/utils/performance.ts',
  'lib/utils/portfolio-transformer.ts',
  'lib/utils/template-sections.tsx',
  'lib/utils/toast.ts',
  'lib/validations/portfolio.ts',
  'lib/monitoring/signoz/correlation.ts',
  'lib/monitoring/performance.ts',
  'lib/monitoring/error-tracking.ts',
  'lib/monitoring/apm.ts',
  'lib/monitoring/health-check.ts'
];

console.log(`Fixing parsing errors in ${filesToFix.length} files`);

let totalFixes = 0;

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileFixes = 0;

  // Apply each fix pattern
  fixPatterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileFixes += matches.length;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    totalFixes += fileFixes;
    console.log(`✓ Fixed ${fileFixes} issues in ${file}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total fixes: ${totalFixes}`);
console.log(`Files processed: ${filesToFix.length}`);