const fs = require('fs');
const path = require('path');

const failingTests = [
  '__tests__/components/dashboard/ai-credit-packs.test.tsx',
  '__tests__/components/dashboard/billing-dashboard.test.tsx',
  '__tests__/middleware/middleware.test.ts',
  '__tests__/services/demo-portfolio-service.test.ts',
  '__tests__/middleware/csrf.test.ts',
  '__tests__/performance/optimization.test.ts',
  '__tests__/onboarding/onboarding-store.test.ts',
  '__tests__/monitoring/signoz-integration.test.ts',
  '__tests__/integration/template-system.test.tsx',
  '__tests__/integration/portfolio-publishing.test.tsx',
  '__tests__/integration/auth-flow.test.tsx',
  '__tests__/integration/api-flow.test.ts',
  '__tests__/integration/ai-enhancement-flow.test.tsx',
  '__tests__/feedback/feedback-system.test.ts',
  '__tests__/e2e/template-switching.test.ts',
  '__tests__/middleware-simple.test.ts',
  '__tests__/middleware.test.ts',
  '__tests__/middleware/edge-rate-limiter.test.ts',
];

function fixCommonIssues(content) {
  // Fix duplicate imports
  const lines = content.split('\n');
  const seenImports = new Set();
  const uniqueLines = [];

  for (const line of lines) {
    if (line.trim().startsWith('import ') && line.includes(' from ')) {
      if (!seenImports.has(line.trim())) {
        seenImports.add(line.trim());
        uniqueLines.push(line);
      }
    } else {
      uniqueLines.push(line);
    }
  }

  content = uniqueLines.join('\n');

  // Fix duplicate act imports
  content = content.replace(
    /import\s*{\s*([^}]*),\s*act\s*,\s*act\s*([^}]*)\s*}\s*from\s*'@testing-library\/react'/g,
    "import { $1, act $2 } from '@testing-library/react'"
  );

  // Remove extra commas in imports
  content = content.replace(/import\s*{\s*,/g, 'import {');
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*}/g, '}');

  // Fix empty import statements
  content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"]/g, '');

  return content;
}

async function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    content = fixCommonIssues(content);

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('Fixing syntax errors in failing tests...\n');

  for (const testFile of failingTests) {
    await processFile(testFile);
  }

  console.log('\nDone!');
}

main().catch(console.error);
