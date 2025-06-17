/**
 * Custom Jest transformer to handle dynamic imports
 * This transformer converts dynamic imports to static requires for Jest compatibility
 */

module.exports = {
  process(sourceText, sourcePath) {
    // Only process TypeScript/JavaScript files
    if (!sourcePath.match(/\.(ts|tsx|js|jsx)$/)) {
      return { code: sourceText };
    }

    // Transform dynamic imports to require statements
    let transformedCode = sourceText;

    // Handle await import() syntax
    transformedCode = transformedCode.replace(
      /await\s+import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      (match, modulePath) => {
        // For @/ imports, we need to maintain the alias
        if (modulePath.startsWith('@/')) {
          return `require('${modulePath}')`;
        }
        return `require('${modulePath}')`;
      }
    );

    // Handle import().then() syntax
    transformedCode = transformedCode.replace(
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\.then/g,
      (match, modulePath) => {
        return `Promise.resolve(require('${modulePath}')).then`;
      }
    );

    // Handle const { x } = await import() syntax
    transformedCode = transformedCode.replace(
      /const\s+\{([^}]+)\}\s*=\s*await\s+import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      (match, destructured, modulePath) => {
        return `const {${destructured}} = require('${modulePath}')`;
      }
    );

    return {
      code: transformedCode,
    };
  },
};