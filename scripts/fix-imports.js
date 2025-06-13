
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing import order violations...\n');

// Get all TypeScript and JavaScript files
const getAllFiles = (dirPath, arrayOfFiles = []): void => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      // Skip node_modules, .next, and other build directories
      if (
        !['node_modules', '.next', 'out', 'coverage', '.git'].includes(file)
      ) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/) && !file.endsWith('.d.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

// Function to fix import order in a single file
const fixImportsInFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Find import section
  let importStartIndex = -1;
  let importEndIndex = -1;
  const imports = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (
      line.startsWith('import ') ||
      line.startsWith('import{') ||
      line.startsWith('import{')
    ) {
      if (importStartIndex === -1) {
        importStartIndex = i;
      }

      // Handle multi-line imports
      let fullImport = lines[i];
      let j = i;
      while (!lines[j].includes(';') && j < lines.length - 1) {
        j++;
        fullImport += '\n' + lines[j];
      }

      imports.push({
        statement: fullImport,
        startLine: i,
        endLine: j,
      });

      i = j;
      importEndIndex = j;
    } else if (importStartIndex !== -1 && line && !line.startsWith('import')) {
      // End of import section
      break;
    }
  }

  if (imports.length === 0) return false;

  // Categorize imports according to ESLint rules
  const categorizeImport = imp => {
    const statement = imp.statement;

    // Type imports
    if (statement.includes('import type')) return 7;

    // Builtin modules
    if (
      statement.match(
        /from ['"](?:fs|path|crypto|http|https|url|util|stream|events|child_process|os|net|dns|cluster|readline|repl|vm|assert|buffer|process|console|zlib|querystring|string_decoder|tls|dgram|v8|perf_hooks|worker_threads)['"]/
      ) ||
      statement.match(/from ['"]node:/)
    ) {
      return 0;
    }

    // External modules (node_modules)
    if (statement.match(/from ['"](?:react|next|@|[a-z])/)) {
      if (!statement.match(/from ['"](?:\.|~|@\/)/)) {
        return 1;
      }
    }

    // Internal modules (aliases like @/)
    if (statement.match(/from ['"]@\//)) {
      return 2;
    }

    // Parent imports
    if (statement.match(/from ['"]\.\.(?:\/|['"])/)) {
      return 3;
    }

    // Sibling imports
    if (statement.match(/from ['"]\.(?:\/|['"])/)) {
      return 4;
    }

    return 1; // Default to external
  };

  // Group imports
  const groupedImports = {
    0: [], // builtin
    1: [], // external
    2: [], // internal
    3: [], // parent
    4: [], // sibling
    5: [], // index
    6: [], // object
    7: [], // type
  };

  imports.forEach(imp => {
    const category = categorizeImport(imp);
    groupedImports[category].push(imp.statement);
  });

  // Sort within groups alphabetically
  Object.keys(groupedImports).forEach(key => {
    groupedImports[key].sort((a, b) => {
      const aPath = a.match(/from ['"](.+)['"]/)?.[1] || '';
      const bPath = b.match(/from ['"](.+)['"]/)?.[1] || '';
      return aPath.toLowerCase().localeCompare(bPath.toLowerCase());
    });
  });

  // Rebuild import section with proper spacing
  const newImports = [];
  Object.keys(groupedImports).forEach(key => {
    if (groupedImports[key].length > 0) {
      if (newImports.length > 0) {
        newImports.push(''); // Add blank line between groups
      }
      newImports.push(...groupedImports[key]);
    }
  });

  // Replace import section in the file
  const beforeImports = lines.slice(0, importStartIndex);
  const afterImports = lines.slice(importEndIndex + 1);

  const newContent = [...beforeImports, ...newImports, ...afterImports].join(
    '\n'
  );

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }

  return false;
};

// Main execution
try {
  const rootDir = path.resolve(__dirname, '..');
  const files = getAllFiles(rootDir);

  let fixedCount = 0;

  console.log(`Found ${files.length} files to check...\n`);

  files.forEach((file, index) => {
    if (fixImportsInFile(file)) {
      console.log(`✅ Fixed imports in: ${path.relative(rootDir, file)}`);
      fixedCount++;
    }

    if ((index + 1) % 100 === 0) {
      console.log(`Progress: ${index + 1}/${files.length} files processed...`);
    }
  });

  console.log(`\n✨ Fixed import order in ${fixedCount} files!`);

  // Run ESLint fix for any remaining import issues
  console.log('\n🔧 Running ESLint fix for any remaining issues...');
  execSync('pnpm eslint . --fix --ext .ts,.tsx,.js,.jsx', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error fixing imports:', error.message);
  process.exit(1);
}
