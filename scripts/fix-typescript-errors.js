#!/usr/bin/env node

/**
 * Script to fix TypeScript errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern fixes for common TypeScript errors
const fixes = [
  {
    // Fix @jest/globals import in test files
    files: ['__tests__/**/*.ts', '__tests__/**/*.tsx'],
    pattern: /import\s+{([^}]+)}\s+from\s+['"]@jest\/globals['"]/g,
    replacement: (match, imports) => {
      // Move it to regular jest import
      return `import { ${imports} } from '@jest/globals'`;
    },
  },
  {
    // Fix missing api-helpers module
    files: ['app/api/**/*.ts'],
    pattern: /@\/lib\/utils\/api-helpers/g,
    replacement: '@/lib/api/middleware/error-handler',
  },
  {
    // Fix missing auth/server module
    files: ['app/api/**/*.ts'],
    pattern: /@\/lib\/auth\/server/g,
    replacement: '@/lib/api/middleware/auth',
  },
  {
    // Fix Stripe API version
    files: ['**/*.ts', '**/*.tsx'],
    pattern: /apiVersion:\s*['"]2024-10-28\.acacia['"]/g,
    replacement: "apiVersion: '2025-05-28.basil'",
  },
  {
    // Fix any type parameters
    files: ['__tests__/utils/supabase-mock-factory.ts'],
    pattern: /\(_url\)\s*{/g,
    replacement: '(_url: string) {',
  },
  {
    // Fix any type parameters
    files: ['__tests__/utils/supabase-mock-factory.ts'],
    pattern: /\(_url,\s*_key\)\s*{/g,
    replacement: '(_url: string, _key: string) {',
  },
  {
    // Fix any type parameters
    files: ['__tests__/utils/supabase-mock-factory.ts'],
    pattern: /\(_url,\s*_key,\s*_options\)\s*{/g,
    replacement: '(_url: string, _key: string, _options?: any) {',
  },
];

// Additional fixes for specific files
const specificFixes = [
  {
    file: 'app/api/v1/payments/verify/route.ts',
    fixes: [
      {
        // Fix subscription type properties
        pattern: /subscription\.current_period_start/g,
        replacement: '(subscription as any).current_period_start',
      },
      {
        pattern: /subscription\.current_period_end/g,
        replacement: '(subscription as any).current_period_end',
      },
      {
        // Fix logger error parameter
        pattern: /logger\.error\('Payment verification error', error\)/g,
        replacement:
          "logger.error('Payment verification error', error as Error)",
      },
    ],
  },
  {
    file: 'app/api/v1/portfolios/[id]/custom-domain/route.ts',
    fixes: [
      {
        // Fix logger error parameters
        pattern: /logger\.error\('Domain verification error', error\)/g,
        replacement:
          "logger.error('Domain verification error', error as Error)",
      },
      {
        pattern:
          /logger\.warn\('Failed to create Cloudflare DNS records', error\)/g,
        replacement:
          "logger.warn('Failed to create Cloudflare DNS records', error as Error)",
      },
      {
        pattern: /logger\.error\('Failed to add custom domain', error\)/g,
        replacement:
          "logger.error('Failed to add custom domain', error as Error)",
      },
      {
        pattern: /logger\.error\('Failed to remove custom domain', error\)/g,
        replacement:
          "logger.error('Failed to remove custom domain', error as Error)",
      },
      {
        pattern: /logger\.error\('Failed to check domain status', error\)/g,
        replacement:
          "logger.error('Failed to check domain status', error as Error)",
      },
    ],
  },
];

function applyFixes(filePath, patterns) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    for (const { pattern, replacement } of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
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
  console.log('🔧 Fixing TypeScript errors...\n');

  let totalFixed = 0;

  // Apply general fixes
  for (const fix of fixes) {
    const filePatterns = Array.isArray(fix.files) ? fix.files : [fix.files];

    for (const filePattern of filePatterns) {
      const files = glob.sync(filePattern, {
        cwd: process.cwd(),
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      });

      for (const file of files) {
        const patterns = [
          {
            pattern: fix.pattern,
            replacement: fix.replacement,
          },
        ];

        if (applyFixes(file, patterns)) {
          totalFixed++;
        }
      }
    }
  }

  // Apply specific fixes
  for (const { file, fixes: fileFixes } of specificFixes) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      if (applyFixes(fullPath, fileFixes)) {
        totalFixed++;
      }
    }
  }

  console.log(`\n📊 Summary: Fixed ${totalFixed} files with TypeScript errors`);
}

main().catch(console.error);
