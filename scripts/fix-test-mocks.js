#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the api-route-test-helpers.ts file
const filePath = '__tests__/utils/api-route-test-helpers.ts';
let content = fs.readFileSync(filePath, 'utf8');

// List of modules that we know don't exist
const nonExistentModules = [
  '@/lib/integrations/github/analytics-client',
  '@/lib/analytics/client',
  '@/lib/feature-flags/client',
  '@/lib/api/middleware/versioning',
  '@/lib/services/cache/cache-service',
  '@/components/dashboard/billing-dashboard',
  '@/components/dashboard/usage-dashboard',
  '@/components/dashboard/analytics-dashboard',
];

// Comment out non-existent module mocks
nonExistentModules.forEach(moduleName => {
  // Find the jest.doMock call for this module
  const regex = new RegExp(`(\\s*)(jest\\.doMock\\('${moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?\\)\\);)`, 'g');
  
  content = content.replace(regex, (match, indent, mockCode) => {
    // Comment out each line
    const lines = mockCode.split('\n');
    const commentedLines = lines.map((line, index) => {
      if (index === 0) {
        return `${indent}// ${line}`;
      }
      return `${indent}// ${line.trim()}`;
    });
    return commentedLines.join('\n');
  });
});

// Write the updated content
fs.writeFileSync(filePath, content);

console.log('✅ Fixed test mocks in api-route-test-helpers.ts');

// Also check for analytics service mock that might have wrong path
content = content.replace(
  "jest.doMock('@/lib/services/analyticsService'",
  "jest.doMock('@/lib/services/analytics/analyticsService'"
);

// Save again
fs.writeFileSync(filePath, content);

console.log('✅ Fixed analytics service path');