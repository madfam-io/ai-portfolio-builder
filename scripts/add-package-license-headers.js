#!/usr/bin/env node

/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// License headers for different packages
const LICENSE_HEADERS = {
  MCAL: `/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */`,
  MIT: `/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */`,
};

// Package license mapping
const PACKAGE_LICENSES = {
  '@madfam/auth-kit': 'MCAL',
  '@madfam/experiments': 'MIT',
  '@madfam/logger': 'MIT',
  '@madfam/referral': 'MIT', // Assuming MIT for referral package
};

// File patterns to check
const FILE_PATTERNS = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'];

// Directories to exclude
const IGNORE_PATTERNS = [
  'node_modules/**',
  '**/node_modules/**',
  'dist/**',
  '**/dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '*.min.js',
  '*.min.css',
  'public/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  'jest.setup.js',
  'jest.setup.node.js',
  'jest.config.js',
  'next-env.d.ts',
  '**/*.d.ts',
  '**/rollup.config.js',
];

function getPackageForFile(filePath) {
  const match = filePath.match(/packages\/(@madfam\/[^/]+)\//);
  return match ? match[1] : null;
}

function addLicenseHeader(filePath, licenseType) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check if file already has a license header
  if (
    lines[0].includes('/**') &&
    (lines[1].includes('@license') || lines[1].includes('License'))
  ) {
    return false;
  }

  const header = LICENSE_HEADERS[licenseType];

  // Handle shebang lines
  let insertIndex = 0;
  if (lines[0].startsWith('#!')) {
    insertIndex = 1;
  }

  // Insert header
  lines.splice(insertIndex, 0, header, '');

  fs.writeFileSync(filePath, lines.join('\n'));
  return true;
}

function processPackage(packageName, packagePath) {
  const licenseType = PACKAGE_LICENSES[packageName];
  if (!licenseType) {
    console.warn(`No license type configured for ${packageName}`);
    return { processed: 0, skipped: 0 };
  }

  let processed = 0;
  let skipped = 0;

  FILE_PATTERNS.forEach(pattern => {
    const files = glob.sync(path.join(packagePath, 'src', pattern), {
      ignore: IGNORE_PATTERNS,
      nodir: true,
    });

    files.forEach(file => {
      if (addLicenseHeader(file, licenseType)) {
        processed++;
        console.log(`✅ Added ${licenseType} header to ${file}`);
      } else {
        skipped++;
      }
    });
  });

  return { processed, skipped };
}

// Main execution
console.log('🔧 Adding license headers to package files...\n');

const packagesDir = path.join(__dirname, '..', 'packages', '@madfam');
const packages = Object.keys(PACKAGE_LICENSES);

let totalProcessed = 0;
let totalSkipped = 0;

packages.forEach(packageName => {
  const packagePath = path.join(__dirname, '..', 'packages', packageName);
  if (fs.existsSync(packagePath)) {
    console.log(`\n📦 Processing ${packageName}...`);
    const { processed, skipped } = processPackage(packageName, packagePath);
    totalProcessed += processed;
    totalSkipped += skipped;
  }
});

console.log(
  `\n✨ Done! Added headers to ${totalProcessed} files (${totalSkipped} already had headers)\n`
);
