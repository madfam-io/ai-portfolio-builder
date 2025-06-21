#!/usr/bin/env node

/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// License header pattern to check for
const LICENSE_HEADER = 'MADFAM Code Available License (MCAL) v1.0';

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
  'dist/**',
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
      checkedFiles++;
      const content = fs.readFileSync(file, 'utf8');
      const firstLines = content.split('\n').slice(0, 15).join('\n');

      if (!firstLines.includes(LICENSE_HEADER)) {
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
