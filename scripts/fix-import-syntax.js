#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

// Files that need import fixes
const filesToFix = [
  'components/admin/AdminUserDashboard.tsx',
  'components/editor/EditorHeader.tsx', 
  'components/editor/EditorSidebar.tsx',
  'components/editor/EditorToolbar.tsx',
  'components/editor/PortfolioEditor.tsx'
];

console.log('🔧 Fixing malformed import statements...');

function fixImportSyntax() {
  for (const filePath of filesToFix) {
    const fullPath = path.join(projectRoot, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix malformed import syntax
      content = fixMalformedImports(content);
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }
}

function fixMalformedImports(content) {
  let fixed = content;

  // Fix standalone closing braces that should be part of imports
  fixed = fixed.replace(/^} from ['"][^'"]+['"];?\s*$/gm, '');
  
  // Fix imports that start with closing brace
  fixed = fixed.replace(/^} from 'react-icons\/fi';\s*\nimport \{/gm, 'import {');
  
  // Fix missing opening braces for react-icons imports
  fixed = fixed.replace(/^import \{\s*\n(\s*Fi[A-Za-z0-9,\s\n]*)\s*\}/gm, (match, iconList) => {
    // Check if this is a react-icons import
    if (iconList.includes('Fi')) {
      return `import {\n${iconList}\n} from 'react-icons/fi';`;
    }
    return match;
  });

  // Fix incomplete import statements
  fixed = fixed.replace(/^import \{\s*\n(\s*[A-Za-z0-9,\s\n]*)\s*$/gm, (match, importList) => {
    // If we have imports without a from clause, try to determine the source
    if (importList.includes('Fi')) {
      return `import {\n${importList}\n} from 'react-icons/fi';`;
    }
    return match;
  });

  // Remove orphaned closing braces
  fixed = fixed.replace(/^}\s*$/gm, '');

  // Fix specific pattern: } from 'react-icons/fi' followed by import {
  fixed = fixed.replace(/} from 'react-icons\/fi';\s*\nimport \{([^}]+)\}/gs, 'import {\n$1\n} from \'react-icons/fi\';');

  return fixed;
}

// Run the fixes
fixImportSyntax();

console.log('✅ Import syntax fixes complete!');