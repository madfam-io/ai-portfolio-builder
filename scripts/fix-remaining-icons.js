#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Additional icon mappings for the remaining unmapped icons
const additionalMappings = {
  // Font Awesome icons
  FaCheckCircle: 'CheckCircle',
  FaPaperPlane: 'Send',
  FaBusinessTime: 'Briefcase',
  FaUserTie: 'UserCheck',
  FaGoogle: 'Chrome', // or use custom implementation
  FaMicrosoft: 'Square', // or use custom implementation
  FaApple: 'Apple', // Lucide has Apple icon
  FaAmazon: 'Package', // Closest match
  FaFacebookF: 'Facebook',
  FaLinkedinIn: 'Linkedin',
  FaMagic: 'Sparkles',
  FaPalette: 'Palette',
  FaMobileAlt: 'Smartphone',
  FaSignOutAlt: 'LogOut',
  FaGitAlt: 'GitBranch',
  FaBehance: 'Layers', // Closest match

  // Feather icons
  FiArchive: 'Archive',
  FiCloud: 'Cloud',
  FiWifiOff: 'WifiOff',
  FiInbox: 'Inbox',
  FiShoppingBag: 'ShoppingBag',
  FiDribbble: 'Dribbble',
  FiInstagram: 'Instagram',
  FiMaximize2: 'Maximize2',
  FiMinimize2: 'Minimize2',
  FiMoon: 'Moon',
  FiSun: 'Sun',
  FiMove: 'Move',
  FiRotateCcw: 'RotateCcw',
  FiRotateCw: 'RotateCw',
  FiToggleLeft: 'ToggleLeft',
  FiToggleRight: 'ToggleRight',
  FiType: 'Type',
  FiZoomIn: 'ZoomIn',
  FiZoomOut: 'ZoomOut',

  // Clean up empty mappings
  '': null,
  '// FiClock': null,
  '// FiTarget': null,
  '// Removed portfolioService import - will use API calls instead': null,
};

// Files to process
const filePatterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
];

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

function processFile(filePath) {
  totalFiles++;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacements = 0;

    // Process each mapping
    Object.entries(additionalMappings).forEach(([oldIcon, newIcon]) => {
      if (!newIcon) return; // Skip null mappings

      // Replace icon usage in JSX
      const iconRegex = new RegExp(`<${oldIcon}([\\s/>])`, 'g');
      const matches = content.match(iconRegex);
      if (matches) {
        content = content.replace(iconRegex, `<${newIcon}$1`);
        replacements += matches.length;
        modified = true;
      }

      // Also check for icon imports that might have been missed
      const importRegex = new RegExp(`\\b${oldIcon}\\b`, 'g');
      if (content.includes(`from 'react-icons/`)) {
        const importMatches = content.match(importRegex);
        if (importMatches) {
          content = content.replace(importRegex, newIcon);
          modified = true;
        }
      }
    });

    // Fix any remaining react-icons imports
    if (content.includes(`from 'react-icons/`)) {
      // Extract all imports from react-icons
      const reactIconsRegex =
        /import\s*{\s*([^}]+)\s*}\s*from\s*['"]react-icons\/\w+['"]/g;
      let match;
      const lucideImports = new Set();

      while ((match = reactIconsRegex.exec(content)) !== null) {
        const icons = match[1].split(',').map(icon => icon.trim());
        icons.forEach(icon => {
          if (additionalMappings[icon]) {
            lucideImports.add(additionalMappings[icon]);
          }
        });
      }

      // Remove react-icons imports
      content = content.replace(
        /import\s*{\s*[^}]+\s*}\s*from\s*['"]react-icons\/\w+['"]\s*;?\s*\n?/g,
        ''
      );

      // Add lucide imports if needed
      if (lucideImports.size > 0) {
        const existingLucideImport = content.match(
          /import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"]/
        );
        if (existingLucideImport) {
          // Merge with existing import
          const existingIcons = existingLucideImport[1]
            .split(',')
            .map(i => i.trim());
          const allIcons = [
            ...new Set([...existingIcons, ...lucideImports]),
          ].sort();
          content = content.replace(
            existingLucideImport[0],
            `import { ${allIcons.join(', ')} } from 'lucide-react'`
          );
        } else {
          // Add new import
          const lucideIconsList = Array.from(lucideImports).sort().join(', ');
          const firstImportMatch = content.match(/^import\s+.*$/m);
          if (firstImportMatch) {
            const insertPosition =
              firstImportMatch.index + firstImportMatch[0].length;
            content =
              content.slice(0, insertPosition) +
              `\nimport { ${lucideIconsList} } from 'lucide-react';` +
              content.slice(insertPosition);
          }
        }
        modified = true;
      }
    }

    // Clean up any duplicate imports or malformed lines
    content = content.replace(/;\s*;/g, ';');
    content = content.replace(/\n\n\n+/g, '\n\n');

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`✅ ${filePath} - Fixed ${replacements} remaining icon(s)`);
    }

    totalReplacements += replacements;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Fixing remaining unmapped icons...\n');

  // Get all files matching patterns
  const files = [];
  filePatterns.forEach(pattern => {
    const matchedFiles = glob.sync(pattern, {
      ignore: excludePatterns,
      nodir: true,
    });
    files.push(...matchedFiles);
  });

  // Remove duplicates
  const uniqueFiles = [...new Set(files)];

  console.log(`Found ${uniqueFiles.length} files to check\n`);

  // Process each file
  uniqueFiles.forEach(processFile);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`Total files checked: ${totalFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Total icons fixed: ${totalReplacements}`);

  if (modifiedFiles > 0) {
    console.log('\n✨ Remaining icons have been fixed!');
    console.log(
      '💡 Please test your application to ensure everything works correctly.'
    );
  } else {
    console.log('\n✨ No remaining unmapped icons found!');
  }
}

// Run the script
main();
