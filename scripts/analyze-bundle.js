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


#!/usr/bin/env node

/**
 * Bundle analysis script
 * Analyzes webpack bundle sizes and generates report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle sizes...\n');

// Check if bundle analyzer is installed
const bundleAnalyzerPath = path.join(
  process.cwd(),
  'node_modules',
  '@next',
  'bundle-analyzer'
);
if (!fs.existsSync(bundleAnalyzerPath)) {
  console.log('📦 Installing @next/bundle-analyzer...');
  try {
    execSync('pnpm add -D @next/bundle-analyzer', { stdio: 'inherit' });
    console.log('✅ Bundle analyzer installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install bundle analyzer:', error.message);
    console.log('\n🔧 Manual installation required:');
    console.log('   pnpm add -D @next/bundle-analyzer');
    process.exit(1);
  }
}

// Build with bundle analyzer
try {
  console.log('Building production bundle with analysis...');
  execSync('ANALYZE=true pnpm build', {
    stdio: 'inherit',
    env: { ...process.env, ANALYZE: 'true' },
  });
} catch (error) {
  console.error('Failed to build bundle:', error.message);
  process.exit(1);
}

// Check for .next directory
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.error('No .next directory found. Build may have failed.');
  process.exit(1);
}

// Get build stats
console.log('\n📊 Bundle Statistics:\n');

// Parse build manifest
try {
  const buildManifest = JSON.parse(
    fs.readFileSync(path.join(nextDir, 'build-manifest.json'), 'utf8')
  );

  const pages = Object.keys(buildManifest.pages);
  console.log(`Total pages: ${pages.length}`);

  // Show largest pages
  console.log('\nLargest pages:');
  const pageSizes = [];

  for (const page of pages) {
    const scripts = buildManifest.pages[page] || [];
    const totalSize = scripts.reduce((sum, script) => {
      const filePath = path.join(nextDir, 'static', script);
      if (fs.existsSync(filePath)) {
        return sum + fs.statSync(filePath).size;
      }
      return sum;
    }, 0);

    if (totalSize > 0) {
      pageSizes.push({ page, size: totalSize });
    }
  }

  pageSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach(({ page, size }) => {
      console.log(`  ${page}: ${(size / 1024).toFixed(2)} KB`);
    });
} catch (error) {
  console.error('Failed to parse build manifest:', error.message);
}

// Check for analyzer output
const analyzerOutput = path.join(process.cwd(), '.next', 'analyze');
if (fs.existsSync(analyzerOutput)) {
  console.log('\n✅ Bundle analysis complete!');
  console.log(`📁 Analysis files saved to: ${analyzerOutput}`);
  console.log('\n💡 To view the interactive bundle analyzer:');
  console.log('   Open .next/analyze/client.html in your browser');
} else {
  console.log('\n⚠️  Bundle analyzer output not found.');
  console.log('Make sure @next/bundle-analyzer is installed.');
}

console.log('\n🎯 Optimization suggestions:');
console.log('1. Implement dynamic imports for large components');
console.log('2. Use next/dynamic for code splitting');
console.log('3. Lazy load heavy dependencies (charts, editors)');
console.log('4. Optimize images with next/image');
console.log('5. Review and remove unused dependencies');
