#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();

console.log('🔧 Fixing ALL malformed import statements...');

function findAllTsxTsFiles() {
  try {
    const command = `find ${projectRoot} -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | head -100`;
    const output = execSync(command, { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
}

function fixImportSyntax(content) {
  let fixed = content;

  // Fix standalone closing braces that should be part of imports
  fixed = fixed.replace(/^} from ['"][^'"]+['"];?\s*$/gm, '');

  // Fix specific pattern: } from 'react-icons/fi' at the start of an import block
  fixed = fixed.replace(
    /^} from 'react-icons\/fi';\s*\nimport \{/gm,
    'import {'
  );
  fixed = fixed.replace(
    /^} from 'react-icons\/fa';\s*\nimport \{/gm,
    'import {'
  );

  // Fix imports that start with just a closing brace on its own line
  fixed = fixed.replace(/^}\s*from ['"][^'"]+['"];\s*$/gm, '');

  // Fix malformed import blocks where import and } are separated
  fixed = fixed.replace(
    /import\s+BackToTopButton from[^;]+;\s*\n\s*} from/g,
    '} from'
  );

  // Fix malformed React imports
  fixed = fixed.replace(/^} from 'react';\s*\nimport React/gm, 'import React');

  // Fix incomplete import statements that end without proper closing
  fixed = fixed.replace(/^import \{\s*\n([^}]+)\n\s*$/gm, (match, imports) => {
    if (imports.includes('from ')) {
      return match; // Already has 'from', leave as is
    }
    // Try to determine the source based on import names
    if (
      imports.includes('createContext') ||
      imports.includes('useState') ||
      imports.includes('useEffect')
    ) {
      return `import {\n${imports}\n} from 'react';`;
    }
    if (imports.includes('Fi') && imports.includes(',')) {
      return `import {\n${imports}\n} from 'react-icons/fi';`;
    }
    if (imports.includes('Fa') && imports.includes(',')) {
      return `import {\n${imports}\n} from 'react-icons/fa';`;
    }
    return match;
  });

  // Fix imports where the import statement and source are mixed up
  fixed = fixed.replace(
    /import ([^{]+) from ([^;]+);\s*\n\s*} from ([^;]+);/g,
    'import {$1} from $3;'
  );

  // Fix missing opening braces
  fixed = fixed.replace(
    /^import\s+([A-Z][a-zA-Z0-9_,\s]*)\s+from\s+['"][^'"]+['"];?$/gm,
    (match, imports) => {
      if (!imports.includes('{') && imports.includes(',')) {
        return match.replace(imports, `{${imports}}`);
      }
      return match;
    }
  );

  return fixed;
}

function fixFileSyntax() {
  const files = findAllTsxTsFiles();
  let fixedCount = 0;

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixImportSyntax(content);

      if (fixed !== content) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        fixedCount++;
        console.log(`✅ Fixed: ${path.relative(projectRoot, filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  console.log(`✅ Fixed ${fixedCount} files`);
}

// Run the fixes
fixFileSyntax();

console.log('✅ All import syntax fixes complete!');
