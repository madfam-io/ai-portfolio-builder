#!/usr/bin/env node

/**
 * Check Node.js version compatibility
 * Ensures the current Node.js version meets project requirements
 */

const semver = require('semver');
const { engines } = require('../package.json');

const version = process.version;
const required = engines.node;

console.log(`Current Node.js version: ${version}`);
console.log(`Required Node.js version: ${required}`);

if (!semver.satisfies(version, required)) {
  console.error('\n❌ Error: Node.js version incompatibility detected!');
  console.error(`Your Node.js version ${version} does not satisfy the required version ${required}.`);
  console.error('\n📝 Note: There is a known issue with React hooks in Node.js v21.0.0 - v21.7.x');
  console.error('Please use one of the following versions:');
  console.error('  - Node.js 18.17.0 or higher (LTS recommended)');
  console.error('  - Node.js 20.x (LTS)');
  console.error('  - Node.js 21.8.0 or higher');
  console.error('\nTo install a compatible version, use a Node version manager like nvm:');
  console.error('  nvm install 20');
  console.error('  nvm use 20');
  process.exit(1);
} else {
  console.log('\n✅ Node.js version is compatible!');
}