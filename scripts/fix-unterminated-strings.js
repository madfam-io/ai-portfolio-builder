#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with unterminated string errors from lint output
const filesToFix = [
  { file: 'app/admin/experiments/[id]/ExperimentDetailsContent.tsx', line: 81 },
  { file: 'app/admin/experiments/[id]/VariantTableRow.tsx', line: 45 },
  { file: 'app/admin/experiments/[id]/page.tsx', line: 47 },
  { file: 'app/admin/experiments/new/page.tsx', line: 56 },
  { file: 'app/admin/experiments/page.tsx', line: 57 },
  { file: 'app/admin/layout.tsx', line: 118 },
  { file: 'app/analytics/page.tsx', line: 95 },
  { file: 'app/analytics/repository/[id]/page.tsx', line: 107 },
  { file: 'app/api/v1/ai/enhance-bio/route.ts', line: 161 },
  { file: 'app/api/v1/ai/models/selection/route.ts', line: 181 },
  { file: 'app/api/v1/ai/optimize-project/route.ts', line: 192 },
  { file: 'app/api/v1/ai/recommend-template/route.ts', line: 172 },
  { file: 'app/api/v1/analytics/repositories/[id]/route.ts', line: 73 },
  { file: 'app/api/v1/analytics/repositories/route.ts', line: 63 },
  { file: 'app/api/v1/beta/feedback/survey/route.ts', line: 79 },
  { file: 'app/api/v1/domains/verify/route.ts', line: 91 },
  { file: 'app/api/v1/experiments/route.ts', line: 112 },
  { file: 'app/api/v1/geo/analyze/route.ts', line: 125 },
  { file: 'app/api/v1/geo/keywords/route.ts', line: 92 },
  { file: 'app/api/v1/geo/optimize/route.ts', line: 125 },
  { file: 'app/api/v1/integrations/github/callback/route.ts', line: 37 },
  { file: 'app/api/v1/integrations/linkedin/import/route.ts', line: 172 },
  { file: 'app/api/v1/portfolios/[id]/custom-domain/route.ts', line: 21 },
  { file: 'app/api/v1/portfolios/[id]/custom-domain/status/route.ts', line: 75 },
  { file: 'app/api/v1/portfolios/[id]/variants/route.ts', line: 28 },
  { file: 'app/api/v1/portfolios/check-subdomain/route.ts', line: 157 },
  { file: 'app/api/v1/preview/route.ts', line: 75 },
  { file: 'app/api/v1/variants/[id]/route.ts', line: 148 },
  { file: 'app/auth/login/page.tsx', line: 75 },
  { file: 'app/auth/reset-password/page.tsx', line: 34 },
];

console.log(`Fixing unterminated strings in ${filesToFix.length} files`);

let totalFixes = 0;

filesToFix.forEach(({ file, line }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  if (lines[line - 1]) {
    const originalLine = lines[line - 1];
    let fixedLine = originalLine;
    
    // Fix common patterns that cause unterminated strings
    // 1. Remove stray &apos; at end of template literals
    fixedLine = fixedLine.replace(/(\$\{[^}]*\})\s*:\s*'&apos;(\}`)/, '$1 : \'\'}$2');
    fixedLine = fixedLine.replace(/'&apos;(\})/, '\'\'}$1');
    
    // 2. Fix &apos; that should be ' inside template literals
    fixedLine = fixedLine.replace(/(\$\{[^}]*)'&apos;([^}]*\})/, '$1\'$2');
    
    // 3. Fix standalone &apos; that's breaking strings
    fixedLine = fixedLine.replace(/' : '&apos;/, '\' : \'\'');
    
    // 4. Fix template literal with just &apos;
    fixedLine = fixedLine.replace(/\? 'animate-spin' : '&apos;\}`/, '? \'animate-spin\' : \'\'\}`');
    
    // 5. General fix for misplaced &apos;
    if (fixedLine.includes('&apos;') && fixedLine.includes('`')) {
      // If it's in a template literal context, just remove the &apos;
      fixedLine = fixedLine.replace(/'&apos;/, '\'\'');
    }
    
    if (fixedLine !== originalLine) {
      lines[line - 1] = fixedLine;
      fs.writeFileSync(filePath, lines.join('\n'));
      totalFixes++;
      console.log(`✓ Fixed line ${line} in ${file}`);
      console.log(`  Before: ${originalLine.trim()}`);
      console.log(`  After:  ${fixedLine.trim()}`);
    }
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total fixes: ${totalFixes}`);