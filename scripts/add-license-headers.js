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

// License headers for different file types
const LICENSE_HEADERS = {
  js: `/**
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
 */`,

  css: `/**
 * MADFAM Code Available License (MCAL) v1.0
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * Commercial use prohibited except by MADFAM and licensed partners.
 * For licensing: licensing@madfam.com
 */`,

  html: `<!--
MADFAM Code Available License (MCAL) v1.0
Copyright (c) 2025-present MADFAM. All rights reserved.
Commercial use prohibited except by MADFAM and licensed partners.
For licensing: licensing@madfam.com
-->`,

  yml: `# MADFAM Code Available License (MCAL) v1.0
# Copyright (c) 2025-present MADFAM. All rights reserved.
# Commercial use prohibited except by MADFAM and licensed partners.
# For licensing: licensing@madfam.com`,

  sh: `#!/bin/bash
# MADFAM Code Available License (MCAL) v1.0
# Copyright (c) 2025-present MADFAM. All rights reserved.
# Commercial use prohibited except by MADFAM and licensed partners.
# For licensing: licensing@madfam.com`,

  sql: `-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com`,
};

// Map file extensions to header types
const EXT_TO_HEADER = {
  '.js': 'js',
  '.jsx': 'js',
  '.ts': 'js',
  '.tsx': 'js',
  '.css': 'css',
  '.scss': 'css',
  '.html': 'html',
  '.yml': 'yml',
  '.yaml': 'yml',
  '.sh': 'sh',
  '.sql': 'sql',
};

// File patterns to process
const FILE_PATTERNS = [
  '**/*.js',
  '**/*.jsx',
  '**/*.ts',
  '**/*.tsx',
  '**/*.css',
  '**/*.scss',
  '**/*.yml',
  '**/*.yaml',
  '**/*.sh',
  '**/*.sql',
];

// Patterns to ignore
const IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '*.min.js',
  '*.min.css',
  'public/**',
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
  '.husky/**',
  'scripts/migrations/**',
];

function getHeaderForFile(filePath) {
  const ext = path.extname(filePath);
  const headerType = EXT_TO_HEADER[ext];
  return headerType ? LICENSE_HEADERS[headerType] : null;
}

function hasLicenseHeader(content) {
  return content.includes('MADFAM Code Available License (MCAL)');
}

function addLicenseHeader(filePath, header) {
  const content = fs.readFileSync(filePath, 'utf8');

  if (hasLicenseHeader(content)) {
    return false; // Already has header
  }

  let newContent;

  // Handle shebang lines
  if (content.startsWith('#!')) {
    const lines = content.split('\n');
    const shebang = lines[0];
    const rest = lines.slice(1).join('\n');
    newContent = `${shebang}\n\n${header}\n\n${rest}`;
  } else {
    newContent = `${header}\n\n${content}`;
  }

  fs.writeFileSync(filePath, newContent, 'utf8');
  return true;
}

function main() {
  console.log('📝 Adding license headers to files...\n');

  let processedFiles = 0;
  let addedHeaders = 0;
  let skippedFiles = 0;

  FILE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: IGNORE_PATTERNS,
      nodir: true,
    });

    files.forEach(file => {
      processedFiles++;
      const header = getHeaderForFile(file);

      if (!header) {
        console.warn(`⚠️  No header template for: ${file}`);
        skippedFiles++;
        return;
      }

      if (addLicenseHeader(file, header)) {
        console.log(`✅ Added header to: ${file}`);
        addedHeaders++;
      } else {
        skippedFiles++;
      }
    });
  });

  console.log('\n📊 Summary:');
  console.log(`   - Files processed: ${processedFiles}`);
  console.log(`   - Headers added: ${addedHeaders}`);
  console.log(`   - Files skipped: ${skippedFiles}`);

  if (addedHeaders > 0) {
    console.log('\n✨ License headers added successfully!');
    console.log(
      '💡 Run "pnpm run check:license" to verify all headers are in place.\n'
    );
  } else {
    console.log('\n✅ All files already have license headers!\n');
  }
}

// Run the script
main();
