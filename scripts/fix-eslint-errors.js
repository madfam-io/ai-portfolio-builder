#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Script to fix common ESLint errors across the codebase
 */

const fixes = [];

/**
 * Fix prettier formatting errors
 */
function fixPrettierErrors(filePath, content) {
  let fixed = content;
  let changesMade = false;

  // Fix import formatting - multi-line imports
  fixed = fixed.replace(/import \{ ([^}]+) \} from/g, (match, imports) => {
    const importList = imports
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    if (importList.length > 3 || imports.length > 80) {
      changesMade = true;
      return `import {\n  ${importList.join(',\n  ')},\n} from`;
    }
    return match;
  });

  // Fix double semicolons and empty lines
  fixed = fixed.replace(/;\s*\n\s*\n/g, ';\n');
  if (fixed !== content) changesMade = true;

  // Remove trailing semicolons after imports
  fixed = fixed.replace(/from ['"][^'"]+['"]\s*;\s*\n;\s*\n/g, match => {
    changesMade = true;
    return match.replace(/;\s*\n;\s*\n/, ';\n');
  });

  return { fixed, changesMade };
}

/**
 * Fix TypeScript strict-boolean-expressions
 */
function fixStrictBooleanExpressions(filePath, content) {
  let fixed = content;
  let changesMade = false;

  // Fix conditional any values - add explicit checks
  fixed = fixed.replace(/if \(([^)]+)\)/g, (match, condition) => {
    // Skip if already has explicit comparison
    if (
      condition.includes('===') ||
      condition.includes('!==') ||
      condition.includes('>') ||
      condition.includes('<') ||
      condition.includes('typeof') ||
      condition.includes('instanceof')
    ) {
      return match;
    }

    // Check if it's likely an any/unknown value that needs explicit check
    if (condition.match(/\w+\.\w+/) || condition.match(/\w+\[\w+\]/)) {
      changesMade = true;
      return `if (${condition} !== undefined && ${condition} !== null)`;
    }

    return match;
  });

  // Fix ternary operators with any values
  fixed = fixed.replace(
    /(\w+(?:\.\w+)*(?:\[\w+\])*)\s*\?\s*/g,
    (match, variable) => {
      // Skip if it's already in a proper boolean context
      if (
        content
          .substring(content.indexOf(match) - 50, content.indexOf(match))
          .includes('!!')
      ) {
        return match;
      }
      changesMade = true;
      return `(${variable} !== undefined && ${variable} !== null) ? `;
    }
  );

  return { fixed, changesMade };
}

/**
 * Fix no-explicit-any errors by replacing with proper types
 */
function fixExplicitAny(filePath, content) {
  let fixed = content;
  let changesMade = false;

  // Common any replacements based on context
  const replacements = [
    // Error handling
    { pattern: /catch \(error: any\)/g, replacement: 'catch (error: unknown)' },
    { pattern: /\(error: any\) =>/g, replacement: '(error: unknown) =>' },
    { pattern: /\(err: any\) =>/g, replacement: '(err: unknown) =>' },

    // Response types
    { pattern: /\(response: any\)/g, replacement: '(response: unknown)' },
    { pattern: /\(data: any\)/g, replacement: '(data: unknown)' },

    // Event handlers
    {
      pattern: /\(e: any\)/g,
      replacement: '(e: React.ChangeEvent<HTMLInputElement>)',
    },
    {
      pattern: /\(event: any\)/g,
      replacement: '(event: React.ChangeEvent<HTMLInputElement>)',
    },
  ];

  replacements.forEach(({ pattern, replacement }) => {
    if (fixed.match(pattern)) {
      fixed = fixed.replace(pattern, replacement);
      changesMade = true;
    }
  });

  return { fixed, changesMade };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let finalContent = content;
  let anyChangesMade = false;

  // Apply prettier fixes
  const prettierResult = fixPrettierErrors(filePath, finalContent);
  if (prettierResult.changesMade) {
    finalContent = prettierResult.fixed;
    anyChangesMade = true;
  }

  // Apply strict boolean fixes for TypeScript files
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const booleanResult = fixStrictBooleanExpressions(filePath, finalContent);
    if (booleanResult.changesMade) {
      finalContent = booleanResult.fixed;
      anyChangesMade = true;
    }

    const anyResult = fixExplicitAny(filePath, finalContent);
    if (anyResult.changesMade) {
      finalContent = anyResult.fixed;
      anyChangesMade = true;
    }
  }

  if (anyChangesMade) {
    fs.writeFileSync(filePath, finalContent);
    fixes.push(filePath);
    return true;
  }

  return false;
}

// Files with ESLint errors from the output
const filesToFix = [
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/about/page.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/admin/experiments/[id]/ExperimentDetailsContent.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/admin/experiments/[id]/VariantTableRow.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/admin/experiments/new/page.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/admin/experiments/page.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/analytics/page.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/analytics/repository/[id]/page.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/page.tsx',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/v1/ai/models/selection/route.ts',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/v1/ai/recommend-template/route.ts',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/v1/analytics/repositories/[id]/route.ts',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/v1/analytics/repositories/route.ts',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/v1/experiments/route.ts',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/v1/experiments/track/route.ts',
  '/Users/aldoruizluna/labspace/ai-portfolio-builder/app/api/v1/geo/analyze/route.ts',
];

console.log('🔧 Fixing ESLint errors...\n');

filesToFix.forEach(file => {
  if (processFile(file)) {
    console.log(`✅ Fixed: ${path.basename(file)}`);
  }
});

console.log(`\n📊 Summary: Fixed ${fixes.length} files`);

// Now run prettier to ensure formatting
console.log('\n🎨 Running Prettier to ensure consistent formatting...');
const { execSync } = require('child_process');
try {
  execSync('npx prettier --write "app/**/*.{ts,tsx,js,jsx}"', {
    stdio: 'inherit',
  });
  console.log('✅ Prettier formatting complete');
} catch (error) {
  console.error('❌ Prettier formatting failed:', error.message);
}
