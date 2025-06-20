#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to find and replace unescaped entities in JSX
const entityReplacements = [
  // Apostrophes
  { pattern: /(\>)([^<]*)'([^<]*<)/g, replacement: '$1$2&apos;$3' },
  { pattern: /(\{`)([^`]*)'([^`]*`\})/g, replacement: '$1$2&apos;$3' },
  { pattern: /([\s>])don't([\s<])/g, replacement: '$1don&apos;t$2' },
  { pattern: /([\s>])can't([\s<])/g, replacement: '$1can&apos;t$2' },
  { pattern: /([\s>])won't([\s<])/g, replacement: '$1won&apos;t$2' },
  { pattern: /([\s>])isn't([\s<])/g, replacement: '$1isn&apos;t$2' },
  { pattern: /([\s>])aren't([\s<])/g, replacement: '$1aren&apos;t$2' },
  { pattern: /([\s>])wasn't([\s<])/g, replacement: '$1wasn&apos;t$2' },
  { pattern: /([\s>])weren't([\s<])/g, replacement: '$1weren&apos;t$2' },
  { pattern: /([\s>])hasn't([\s<])/g, replacement: '$1hasn&apos;t$2' },
  { pattern: /([\s>])haven't([\s<])/g, replacement: '$1haven&apos;t$2' },
  { pattern: /([\s>])hadn't([\s<])/g, replacement: '$1hadn&apos;t$2' },
  { pattern: /([\s>])doesn't([\s<])/g, replacement: '$1doesn&apos;t$2' },
  { pattern: /([\s>])didn't([\s<])/g, replacement: '$1didn&apos;t$2' },
  { pattern: /([\s>])couldn't([\s<])/g, replacement: '$1couldn&apos;t$2' },
  { pattern: /([\s>])shouldn't([\s<])/g, replacement: '$1shouldn&apos;t$2' },
  { pattern: /([\s>])wouldn't([\s<])/g, replacement: '$1wouldn&apos;t$2' },
  { pattern: /([\s>])it's([\s<])/g, replacement: '$1it&apos;s$2' },
  { pattern: /([\s>])that's([\s<])/g, replacement: '$1that&apos;s$2' },
  { pattern: /([\s>])what's([\s<])/g, replacement: '$1what&apos;s$2' },
  { pattern: /([\s>])there's([\s<])/g, replacement: '$1there&apos;s$2' },
  { pattern: /([\s>])here's([\s<])/g, replacement: '$1here&apos;s$2' },
  { pattern: /([\s>])who's([\s<])/g, replacement: '$1who&apos;s$2' },
  { pattern: /([\s>])let's([\s<])/g, replacement: '$1let&apos;s$2' },
  { pattern: /([\s>])you're([\s<])/g, replacement: '$1you&apos;re$2' },
  { pattern: /([\s>])we're([\s<])/g, replacement: '$1we&apos;re$2' },
  { pattern: /([\s>])they're([\s<])/g, replacement: '$1they&apos;re$2' },
  { pattern: /([\s>])I'm([\s<])/g, replacement: '$1I&apos;m$2' },
  { pattern: /([\s>])you've([\s<])/g, replacement: '$1you&apos;ve$2' },
  { pattern: /([\s>])we've([\s<])/g, replacement: '$1we&apos;ve$2' },
  { pattern: /([\s>])they've([\s<])/g, replacement: '$1they&apos;ve$2' },
  { pattern: /([\s>])I've([\s<])/g, replacement: '$1I&apos;ve$2' },
  { pattern: /([\s>])you'll([\s<])/g, replacement: '$1you&apos;ll$2' },
  { pattern: /([\s>])we'll([\s<])/g, replacement: '$1we&apos;ll$2' },
  { pattern: /([\s>])they'll([\s<])/g, replacement: '$1they&apos;ll$2' },
  { pattern: /([\s>])I'll([\s<])/g, replacement: '$1I&apos;ll$2' },
  { pattern: /([\s>])you'd([\s<])/g, replacement: '$1you&apos;d$2' },
  { pattern: /([\s>])we'd([\s<])/g, replacement: '$1we&apos;d$2' },
  { pattern: /([\s>])they'd([\s<])/g, replacement: '$1they&apos;d$2' },
  { pattern: /([\s>])I'd([\s<])/g, replacement: '$1I&apos;d$2' },

  // Quotes
  { pattern: /(\>)([^<]*)"([^<]*)"([^<]*<)/g, replacement: '$1$2&quot;$3&quot;$4' },
  
  // Less than and greater than in text content
  { pattern: /(\>)([^<]*)<([^</>]+)>([^<]*<)/g, replacement: '$1$2&lt;$3&gt;$4' },
  
  // Ampersands (but not already escaped entities)
  { pattern: /(\>)([^<]*)&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);)([^<]*<)/g, replacement: '$1$2&amp;$3' }
];

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.turbo/**',
    'scripts/fix-unescaped-entities.js'
  ]
});

console.log(`Found ${files.length} files to process`);

let totalReplacements = 0;
const filesWithChanges = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let fileReplacements = 0;

  // Skip if file doesn't contain JSX/TSX
  if (!content.includes('<') || !content.includes('>')) {
    return;
  }

  // Apply each replacement pattern
  entityReplacements.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileReplacements += matches.length;
    }
  });

  // Special handling for common patterns in JSX text
  // Fix apostrophes in JSX text nodes
  const jsxTextPattern = />([^<]+)</g;
  content = content.replace(jsxTextPattern, (match, text) => {
    if (text.includes("'") && !text.includes('&apos;')) {
      const fixedText = text.replace(/'/g, '&apos;');
      fileReplacements++;
      return `>${fixedText}<`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    totalReplacements += fileReplacements;
    filesWithChanges.push({ file, changes: fileReplacements });
    console.log(`✓ Fixed ${fileReplacements} unescaped entities in ${file}`);
  }
});

console.log('\n=== Summary ===');
console.log(`Total replacements: ${totalReplacements}`);
console.log(`Files modified: ${filesWithChanges.length}`);

if (filesWithChanges.length > 0) {
  console.log('\nFiles with changes:');
  filesWithChanges
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 20)
    .forEach(({ file, changes }) => {
      console.log(`  ${file}: ${changes} changes`);
    });
  
  if (filesWithChanges.length > 20) {
    console.log(`  ... and ${filesWithChanges.length - 20} more files`);
  }
}