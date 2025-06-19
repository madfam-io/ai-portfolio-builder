#!/usr/bin/env node
/**
 * Script to fix timeout issues in test files
 */

const fs = require('fs');
const path = require('path');

// Files with timeout issues
const filesToFix = [
  {
    path: '__tests__/middleware/csrf-enhanced.test.ts',
    tests: [
      'should reject requests with missing CSRF token',
      'should handle expired CSRF tokens',
      'should provide detailed error messages in development',
      'should provide generic error messages in production',
    ],
  },
  {
    path: '__tests__/lib/ai/huggingface-service.test.ts',
    tests: ['should timeout long-running requests'],
  },
  {
    path: '__tests__/hooks/useAutoSave.test.ts',
    tests: ['should update lastSaved timestamp on successful save'],
  },
];

function addTimeoutToTest(content, testName, timeout = 20000) {
  // Pattern to match it() or test() blocks with the specific test name
  const patterns = [
    // Pattern 1: it('test name', async () => {
    new RegExp(
      `(it\\s*\\(\\s*['"\`]${testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\s*,\\s*async\\s*\\(\\s*\\)\\s*=>\\s*\\{)`,
      'g'
    ),
    // Pattern 2: it('test name', () => {
    new RegExp(
      `(it\\s*\\(\\s*['"\`]${testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\s*,\\s*\\(\\s*\\)\\s*=>\\s*\\{)`,
      'g'
    ),
    // Pattern 3: test('test name', async () => {
    new RegExp(
      `(test\\s*\\(\\s*['"\`]${testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\s*,\\s*async\\s*\\(\\s*\\)\\s*=>\\s*\\{)`,
      'g'
    ),
    // Pattern 4: test('test name', () => {
    new RegExp(
      `(test\\s*\\(\\s*['"\`]${testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\s*,\\s*\\(\\s*\\)\\s*=>\\s*\\{)`,
      'g'
    ),
  ];

  let modified = false;
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      // Replace with timeout parameter added
      content = content.replace(pattern, (match, group1) => {
        const replacement = match
          .replace(/(\s*,\s*)(async\s*)?(\(\s*\)\s*=>\s*\{)/, `$1$2$3`)
          .replace(/(['"\`]\s*,)/, `$1 ${timeout},`);
        modified = true;
        return replacement;
      });
      break;
    }
  }

  return { content, modified };
}

function fixTimeoutIssues(filePath, testNames) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let anyModified = false;

    for (const testName of testNames) {
      const result = addTimeoutToTest(content, testName);
      if (result.modified) {
        content = result.content;
        anyModified = true;
        console.log(`  ✅ Added timeout to: "${testName}"`);
      } else {
        console.log(`  ⏭️  No changes needed for: "${testName}"`);
      }
    }

    if (anyModified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed timeouts in: ${filePath}\n`);
      return true;
    } else {
      console.log(`⏭️  No timeout changes needed in: ${filePath}\n`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing timeout issues in test files...\n');

let fixed = 0;
let total = filesToFix.length;

filesToFix.forEach(({ path: filePath, tests }) => {
  const fullPath = path.join(process.cwd(), filePath);
  console.log(`Processing: ${filePath}`);

  if (fs.existsSync(fullPath)) {
    if (fixTimeoutIssues(fullPath, tests)) {
      fixed++;
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}\n`);
  }
});

console.log(`\n📊 Summary: Fixed ${fixed}/${total} files with timeout issues`);
