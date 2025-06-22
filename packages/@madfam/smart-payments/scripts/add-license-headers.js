#!/usr/bin/env node

/**
 * @madfam/smart-payments - License Header Generator
 * 
 * Adds MADFAM Code Available License (MCAL) v1.0 headers to all source files
 * 
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const LICENSE_HEADER = `/**
 * @madfam/smart-payments
 * 
 * World-class payment gateway detection and routing system with AI-powered optimization
 * 
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 * 
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 * 
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

`;

function addLicenseHeader(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if header already exists
  if (content.includes('@license MCAL-1.0') || content.includes('MADFAM Code Available License')) {
    console.log(`✓ License header already exists: ${filePath}`);
    return;
  }
  
  // Skip if file starts with shebang
  if (content.startsWith('#!')) {
    const lines = content.split('\n');
    const shebang = lines[0];
    const rest = lines.slice(1).join('\n');
    const newContent = shebang + '\n\n' + LICENSE_HEADER + rest;
    fs.writeFileSync(filePath, newContent);
  } else {
    const newContent = LICENSE_HEADER + content;
    fs.writeFileSync(filePath, newContent);
  }
  
  console.log(`✓ Added license header: ${filePath}`);
}

function main() {
  console.log('🏷️  Adding MCAL license headers to @madfam/smart-payments...\n');
  
  // Find all TypeScript files
  const tsFiles = glob.sync('src/**/*.ts', { cwd: process.cwd() });
  const testFiles = glob.sync('src/**/*.test.ts', { cwd: process.cwd() });
  // const configFiles = ['rollup.config.mjs', 'jest.config.js', 'package.json'];
  
  // Add headers to source files
  tsFiles.forEach(file => {
    if (!testFiles.includes(file)) {
      addLicenseHeader(file);
    }
  });
  
  // Add headers to test files (different header)
  testFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('@license MCAL-1.0')) {
      const testHeader = `/**
 * @madfam/smart-payments - Test Suite
 * 
 * Test suite for world-class payment gateway detection and routing system
 * 
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

`;
      const newContent = testHeader + content;
      fs.writeFileSync(file, newContent);
      console.log(`✓ Added test license header: ${file}`);
    }
  });
  
  console.log(`\n🎉 License headers added successfully!`);
  console.log(`📄 Files processed: ${tsFiles.length + testFiles.length}`);
  console.log(`⚖️  License: MADFAM Code Available License (MCAL) v1.0`);
  console.log(`🔗 Full license: https://madfam.com/licenses/mcal-1.0`);
}

if (require.main === module) {
  main();
}

module.exports = { addLicenseHeader, LICENSE_HEADER };