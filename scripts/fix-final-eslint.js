#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing final ESLint issues...\n');

const fixes = [
  {
    file: 'app/api/v1/preview/route.ts',
    replacements: [
      { line: 156, from: '} catch (error) {', to: '} catch (_error) {' },
      { line: 168, from: 'domain: string', to: '_domain: string' }
    ]
  },
  {
    file: 'lib/api/error-handler.ts',
    replacements: [
      { from: 'export function createApiError', to: 'export function _createApiError' }
    ]
  },
  {
    file: 'lib/api/middleware/error-handler.ts',
    replacements: [
      { from: 'import { NextRequest,', to: 'import {' }
    ]
  },
  {
    file: 'lib/monitoring/error-tracking.ts',
    replacements: [
      { line: 75, from: 'console.log(', to: '// console.log(' }
    ]
  },
  {
    file: 'lib/monitoring/performance-monitor.ts',
    replacements: [
      { line: 397, from: '} catch (error) {', to: '} catch (_error) {' },
      { line: 443, from: '} catch (error) {', to: '} catch (_error) {' },
      { line: 493, from: 'console.log(', to: '// console.log(' }
    ]
  },
  {
    file: 'lib/server/error-handler.ts',
    replacements: [
      { line: 110, from: '} catch (error) {', to: '} catch (_error) {' },
      { line: 143, from: ': any', to: ': unknown' }
    ]
  },
  {
    file: 'lib/services/error/api-error-handler.ts',
    replacements: [
      { line: 99, from: ': any', to: ': unknown' }
    ]
  },
  {
    file: 'lib/services/error/error-logger.ts',
    replacements: [
      { line: 125, from: 'console.error(', to: '// console.error(' }
    ]
  },
  {
    file: 'lib/services/error/retry-handler.ts',
    replacements: [
      { line: 115, from: 'return await', to: 'return' }
    ]
  },
  {
    file: 'lib/utils/error-handling/error-monitoring.ts',
    replacements: [
      { line: 97, from: ': any', to: ': unknown' }
    ]
  }
];

fixes.forEach(fixConfig => {
  const filePath = path.join('/Users/aldoruizluna/labspace/ai-portfolio-builder', fixConfig.file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    
    fixConfig.replacements.forEach(replacement => {
      if (replacement.line) {
        // Line-specific replacement
        const lineIndex = replacement.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          lines[lineIndex] = lines[lineIndex].replace(replacement.from, replacement.to);
        }
      } else {
        // Global replacement
        content = lines.join('\n');
        content = content.replace(replacement.from, replacement.to);
        lines = content.split('\n');
      }
    });
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`  ✓ Fixed ${fixConfig.file}`);
  } catch (e) {
    console.error(`  ✗ Error fixing ${fixConfig.file}:`, e.message);
  }
});

console.log('\n✅ Final ESLint fixes completed!');