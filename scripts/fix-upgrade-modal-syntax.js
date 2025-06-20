#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(
  process.cwd(),
  '__tests__/components/billing/upgrade-modal.test.tsx'
);

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix pattern: expect(mockToast).toHaveBeenCalledWith(\n      {\n        ...\n    );
  content = content.replace(
    /expect\(mockToast\)\.toHaveBeenCalledWith\(\s*{\s*([^}]+)}\s*\);\s*}\);/gs,
    (match, contents) => {
      // Check if there's a missing closing brace
      const openBraces = (contents.match(/{/g) || []).length;
      const closeBraces = (contents.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        return `expect(mockToast).toHaveBeenCalledWith({${contents}});
    });`;
      }
      return match;
    }
  );

  // Fix all instances of toHaveBeenCalledWith with broken syntax
  content = content.replace(
    /\.toHaveBeenCalledWith\(\s*{\s*([^}]+?)}\s*\);\s*}\);/gs,
    '.toHaveBeenCalledWith({\n$1\n      });\n    });'
  );

  // Fix pattern where there's a missing closing parenthesis
  content = content.replace(
    /\.toHaveBeenCalledWith\(\s*{\s*([^}]+?)variant: 'destructive',\s*\);\s*}\);/gs,
    `.toHaveBeenCalledWith({
$1variant: 'destructive',
      });
    });`
  );

  // Fix mock implementation/rejection patterns
  content = content.replace(
    /\.(mockImplementation|mockRejectedValue)\(\s*([^)]+)\)\s*render\(/g,
    '.$1($2);\n\n    render('
  );

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed upgrade-modal.test.tsx syntax errors');
}
