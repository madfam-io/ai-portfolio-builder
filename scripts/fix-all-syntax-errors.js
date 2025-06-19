#!/usr/bin/env node

/**
 * Script to fix all syntax errors in test files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files with specific syntax errors to fix
const syntaxFixes = [
  {
    files: ['__tests__/app/api/v1/ai/enhance-bio/route.test.ts'],
    patterns: [
      {
        // Fix missing closing brace after object
        find: /}\s*\n\s*await POST\(request\);/g,
        replace: '});\n\n      await POST(request);',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/experiments/active/route.test.ts'],
    patterns: [
      {
        // Fix _request to request
        find: /const _request = new NextRequest\(/g,
        replace: 'const request = new NextRequest(',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/geo/optimize/route.test.ts'],
    patterns: [
      {
        // Fix missing closing brace
        find: /}\s*\n\s*const response = await POST\(mockRequest\);/g,
        replace: '});\n\n        const response = await POST(mockRequest);',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/integrations/github/callback/route.test.ts'],
    patterns: [
      {
        // Fix Object.defineProperty indentation/syntax
        find: /\n\s*\/\/ Mock cookie with matching state\s*\n\s*Object\.defineProperty/g,
        replace:
          '\n      // Mock cookie with matching state\n      Object.defineProperty',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/portfolios/[id]/variants/route.test.ts'],
    patterns: [
      {
        // Fix missing closing parenthesis
        find: /'http:\/\/localhost:3000\/api\/v1\/portfolios\/portfolio-123\/variants'\s*\n\s*const handler/g,
        replace:
          "'http://localhost:3000/api/v1/portfolios/portfolio-123/variants'\n      );\n      const handler",
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/portfolios/check-subdomain/route.test.ts'],
    patterns: [
      {
        // Fix missing closing brace
        find: /}\s*\n\s*const response = await POST\(request\);/g,
        replace: '});\n\n    const response = await POST(request);',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/preview/route.test.ts'],
    patterns: [
      {
        // Fix extra closing parenthesis
        find: /transformed: true,\s*\n\s*}\)\);/g,
        replace: 'transformed: true,\n    });',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/public/[subdomain]/route.test.ts'],
    patterns: [
      {
        // Fix missing closing parenthesis
        find: /'http:\/\/localhost:3000\/api\/v1\/public\/johndoe'\s*\n\s*const params/g,
        replace:
          "'http://localhost:3000/api/v1/public/johndoe'\n      );\n      const params",
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/stripe/check-promotion/route.test.ts'],
    patterns: [
      {
        // Fix missing closing parenthesis on mockStripe.prices
        find: /config\s*\n\s*};/g,
        replace: 'config\n    });\n  };',
      },
    ],
  },
  {
    files: [
      '__tests__/app/api/v1/stripe/checkout-credits/route.test.ts',
      '__tests__/app/api/v1/stripe/checkout/route.test.ts',
      '__tests__/app/api/v1/stripe/portal/route.test.ts',
    ],
    patterns: [
      {
        // Fix mock user assignment
        find: /\(request as any\)\.user = mockUser;/g,
        replace: '(request as any).user = mockUser;',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/stripe/webhook/route.test.ts'],
    patterns: [
      {
        // Fix missing closing parenthesis
        find: /\/\/ Mock user lookup\s*\n\s*mockSupabase\.single\.mockResolvedValueOnce/g,
        replace:
          '// Mock user lookup\n      mockSupabase.single.mockResolvedValueOnce',
      },
    ],
  },
  {
    files: ['__tests__/app/api/v1/upload/image/route.test.ts'],
    patterns: [
      {
        // Fix missing closing parenthesis on mockUpload
        find: /'user-123\/profile\/test-image-123\.jpg'\s*\n\s*}\);/g,
        replace: "'user-123/profile/test-image-123.jpg'\n    );\n  });",
      },
    ],
  },
];

// Additional pattern to fix common issues across all test files
const commonPatterns = [
  {
    // Fix missing closing parenthesis on NextRequest
    pattern:
      /(new NextRequest\([^)]+)(\n\s*)(const|let|var|it\(|expect|await)/g,
    replacement: '$1\n      );$2$3',
  },
  {
    // Fix missing closing brace on mock objects
    pattern: /}\s*\n(\s*)(await|const|let|var|expect)\s+/g,
    check: (match, line) => {
      // Only fix if it looks like a missing closing for a mock
      const prevLines = line.split('\n').slice(-3).join('\n');
      return prevLines.includes('mock') || prevLines.includes('.fn()');
    },
    replacement: '});\n$1$2 ',
  },
];

function fixFile(filePath, patterns) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    for (const { find, replace } of patterns) {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changed = true;
      }
    }

    // Apply common patterns
    for (const { pattern, replacement, check } of commonPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!check || check(match, content)) {
            content = content.replace(
              match,
              match.replace(pattern, replacement)
            );
            changed = true;
          }
        });
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing syntax errors in test files...\n');

  let totalFixed = 0;
  let totalFiles = 0;

  // Fix specific files with known patterns
  for (const { files, patterns } of syntaxFixes) {
    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        totalFiles++;
        if (fixFile(fullPath, patterns)) {
          totalFixed++;
        }
      }
    }
  }

  // Find and fix common issues in all test files
  const testFiles = glob.sync('__tests__/**/*.{test,spec}.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true,
  });

  console.log(
    `\n🔍 Checking ${testFiles.length} test files for common syntax issues...\n`
  );

  for (const file of testFiles) {
    if (fixFile(file, [])) {
      totalFixed++;
    }
  }

  console.log(`\n📊 Summary: Fixed ${totalFixed} files with syntax errors`);
}

main().catch(console.error);
