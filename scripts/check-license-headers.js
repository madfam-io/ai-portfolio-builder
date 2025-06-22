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

// License header patterns to check for
const LICENSE_HEADERS = [
  'MADFAM Code Available License (MCAL) v1.0',
  '@license MIT',
  'MIT License',
];

// File patterns to check
const FILE_PATTERNS = [
  '**/*.js',
  '**/*.jsx',
  '**/*.ts',
  '**/*.tsx',
  '**/*.css',
  '**/*.scss',
];

// Directories and patterns to ignore
const IGNORE_PATTERNS = [
  'node_modules/**',
  '**/node_modules/**',
  'packages/*/node_modules/**',
  'packages/@madfam/*/node_modules/**',
  'dist/**',
  '**/dist/**',
  'packages/*/dist/**',
  'packages/@madfam/*/dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '*.min.js',
  '*.min.css',
  'public/**',
  'scripts/check-license-headers.js', // Don't check this file
  'scripts/add-license-headers.js',
  '__mocks__/**',
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

// Special files that should have different headers
const SPECIAL_FILES = {
  'package.json': false, // No header needed
  'tsconfig.json': false,
  '.env.example': true, // Should have header but in comment form
};

function checkLicenseHeaders() {
  console.log('🔍 Checking license headers...\n');

  let missingHeaders = [];
  let checkedFiles = 0;

  FILE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: IGNORE_PATTERNS,
      nodir: true,
    });

    files.forEach(file => {
      // Skip if not a file (e.g., currency.js directory)
      try {
        const stats = fs.statSync(file);
        if (!stats.isFile()) {
          return;
        }
      } catch (err) {
        console.warn(`Warning: Could not stat ${file}: ${err.message}`);
        return;
      }

      checkedFiles++;
      const content = fs.readFileSync(file, 'utf8');
      const firstLines = content.split('\n').slice(0, 15).join('\n');

      const hasLicenseHeader = LICENSE_HEADERS.some(header =>
        firstLines.includes(header)
      );

      if (!hasLicenseHeader) {
        missingHeaders.push(file);
      }
    });
  });

  console.log(`✅ Checked ${checkedFiles} files\n`);

  if (missingHeaders.length > 0) {
    console.error('❌ Files missing license headers:\n');
    missingHeaders.forEach(file => {
      console.error(`   - ${file}`);
    });
    console.error(`\n📊 Total files missing headers: ${missingHeaders.length}`);
    console.error(
      '\n💡 Run "pnpm run add:license-headers" to automatically add missing headers\n'
    );
    process.exit(1);
  }

  console.log('✅ All files have proper license headers!\n');
}

// Run the check
checkLicenseHeaders();
