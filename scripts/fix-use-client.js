#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
  './components/landing/CTA.tsx',
  './components/landing/Features.tsx',
  './components/landing/Footer.tsx',
  './components/landing/Hero.tsx',
  './components/landing/HowItWorks.tsx',
  './components/landing/Pricing.tsx',
  './components/landing/SocialProof.tsx',
  './components/landing/Templates.tsx',
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const fixed = content.replace(
    /import React from 'react';\n\('use client'\);/,
    "'use client';\n\nimport React from 'react';"
  );

  if (fixed !== content) {
    fs.writeFileSync(file, fixed);
    console.log(`✅ Fixed ${file}`);
  }
});

console.log('\n✨ Done!');
