
#!/usr/bin/env node

/**
 * Script to analyze and standardize translation key naming patterns
 * Usage: node scripts/standardize-translations.js [--fix]
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Translation directories
const TRANSLATIONS_DIR = path.join(__dirname, '../lib/i18n/translations');
const LANGUAGES = ['en', 'es'];

// Naming convention rules
const NAMING_RULES = {
  // Keys that should be renamed
  renames: {
    // Page titles
    contactPageTitle: 'contactTitle',
    aboutPageTitle: 'aboutTitle',
    blogPageTitle: 'blogTitle',
    careersPageTitle: 'careersTitle',
    apiPageTitle: 'apiTitle',
    gdprPageTitle: 'gdprTitle',

    // Descriptions
    aiContentDesc: 'aiContentDescription',
    oneClickDesc: 'oneClickDescription',
    multilingualDesc: 'multilingualDescription',

    // Numeric sequences that should be more descriptive
    heroTitle2: 'heroSubtitle',
    heroTitle3: 'heroTagline',
    ctaTitle2: 'ctaSubtitle',

    // Action states
    signInButton: 'signIn',
    signUpButton: 'signUp',
  },

  // Patterns to check
  patterns: {
    camelCase: /^[a-z][a-zA-Z0-9]*$/,
    noSnakeCase: /^(?!.*_).*$/,
    noKebabCase: /^(?!.*-).*$/,
    noUpperStart: /^[a-z]/,
  },
};

// Statistics
let stats = {
  totalKeys: 0,
  issues: [],
  renames: [],
  patterns: [],
};

/**
 * Load translation file
 */
function loadTranslationFile(filePath) {
  try {
    delete require.cache[require.resolve(filePath)];
    return require(filePath).default || require(filePath);
  } catch (error) {
    console.error(
      `${colors.red}Error loading ${filePath}: ${error.message}${colors.reset}`
    );
    return null;
  }
}

/**
 * Flatten nested object to get all keys
 */
function flattenKeys(obj, prefix = '') {
  let keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Check naming patterns
 */
function checkNamingPatterns(key) {
  const issues = [];

  // Check camelCase
  if (!NAMING_RULES.patterns.camelCase.test(key.split('.').pop())) {
    issues.push({
      key,
      issue: 'Not in camelCase',
      severity: 'error',
    });
  }

  // Check for snake_case
  if (!NAMING_RULES.patterns.noSnakeCase.test(key)) {
    issues.push({
      key,
      issue: 'Contains snake_case',
      severity: 'error',
    });
  }

  // Check for kebab-case
  if (!NAMING_RULES.patterns.noKebabCase.test(key)) {
    issues.push({
      key,
      issue: 'Contains kebab-case',
      severity: 'error',
    });
  }

  // Check numeric suffixes
  if (/\d+$/.test(key)) {
    issues.push({
      key,
      issue: 'Contains numeric suffix - consider more descriptive name',
      severity: 'warning',
    });
  }

  // Check for inconsistent patterns
  if (key.includes('Desc') && !key.includes('Description')) {
    issues.push({
      key,
      issue: 'Uses "Desc" abbreviation instead of "Description"',
      severity: 'warning',
    });
  }

  return issues;
}

/**
 * Analyze translation files
 */
function analyzeTranslations() {
  console.log(`${colors.blue}Analyzing translation files...${colors.reset}\n`);

  LANGUAGES.forEach(lang => {
    const langDir = path.join(TRANSLATIONS_DIR, lang);
    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.ts'));

    console.log(
      `${colors.yellow}Language: ${lang.toUpperCase()}${colors.reset}`
    );

    files.forEach(file => {
      const filePath = path.join(langDir, file);
      const translations = loadTranslationFile(filePath);

      if (!translations) return;

      const keys = flattenKeys(translations);
      stats.totalKeys += keys.length;

      console.log(`  ${file}: ${keys.length} keys`);

      // Check each key
      keys.forEach(key => {
        // Check if key should be renamed
        if (NAMING_RULES.renames[key]) {
          stats.renames.push({
            file: `${lang}/${file}`,
            oldKey: key,
            newKey: NAMING_RULES.renames[key],
          });
        }

        // Check naming patterns
        const patternIssues = checkNamingPatterns(key);
        if (patternIssues.length > 0) {
          patternIssues.forEach(issue => {
            stats.patterns.push({
              file: `${lang}/${file}`,
              ...issue,
            });
          });
        }
      });
    });

    console.log('');
  });
}

/**
 * Display results
 */
function displayResults() {
  console.log(
    `${colors.blue}=== Translation Key Analysis Results ===${colors.reset}\n`
  );

  console.log(`Total keys analyzed: ${stats.totalKeys}`);
  console.log(`Keys to rename: ${stats.renames.length}`);
  console.log(`Pattern issues: ${stats.patterns.length}`);
  console.log('');

  if (stats.renames.length > 0) {
    console.log(`${colors.yellow}Keys to Rename:${colors.reset}`);
    stats.renames.forEach(({ file, oldKey, newKey }) => {
      console.log(`  ${file}: ${oldKey} → ${newKey}`);
    });
    console.log('');
  }

  if (stats.patterns.length > 0) {
    console.log(`${colors.yellow}Pattern Issues:${colors.reset}`);
    const errors = stats.patterns.filter(p => p.severity === 'error');
    const warnings = stats.patterns.filter(p => p.severity === 'warning');

    if (errors.length > 0) {
      console.log(`${colors.red}  Errors:${colors.reset}`);
      errors.forEach(({ file, key, issue }) => {
        console.log(`    ${file}: ${key} - ${issue}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`${colors.yellow}  Warnings:${colors.reset}`);
      warnings.forEach(({ file, key, issue }) => {
        console.log(`    ${file}: ${key} - ${issue}`);
      });
    }
  }

  console.log('');
  console.log(`${colors.green}Analysis complete!${colors.reset}`);

  if (
    stats.renames.length > 0 ||
    stats.patterns.filter(p => p.severity === 'error').length > 0
  ) {
    console.log(
      `\n${colors.yellow}Run with --fix flag to automatically fix renameable issues.${colors.reset}`
    );
    console.log(
      `${colors.yellow}Note: This will only fix simple renames, not complex refactoring.${colors.reset}`
    );
  }
}

/**
 * Main execution
 */
function main() {
  const shouldFix = process.argv.includes('--fix');

  console.log(
    `${colors.blue}PRISMA Translation Key Standardization${colors.reset}`
  );
  console.log(
    `${colors.blue}======================================${colors.reset}\n`
  );

  analyzeTranslations();
  displayResults();

  if (shouldFix && stats.renames.length > 0) {
    console.log(
      `\n${colors.red}Auto-fix not implemented yet. Please rename keys manually.${colors.reset}`
    );
    console.log(
      `${colors.yellow}Refer to lib/i18n/NAMING_CONVENTIONS.md for guidelines.${colors.reset}`
    );
  }
}

// Run the script
main();
