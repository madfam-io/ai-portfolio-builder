module.exports = {
  presets: ['next/babel'],
  plugins: [
    // Transform dynamic imports for Jest
    function transformDynamicImports() {
      return {
        visitor: {
          Import(path) {
            // Only transform in test environment
            if (process.env.NODE_ENV === 'test') {
              const parent = path.parent;
              
              // Check if this is a dynamic import
              if (parent.type === 'CallExpression' && parent.callee === path.node) {
                const argument = parent.arguments[0];
                
                // Only transform string literal imports
                if (argument && argument.type === 'StringLiteral') {
                  const modulePath = argument.value;
                  
                  // Replace with require wrapped in Promise.resolve
                  path.parentPath.replaceWith(
                    this.babel.template.expression`
                      Promise.resolve(
                        global.__dynamic_import_mock__[MODULE_PATH] || require(MODULE_PATH)
                      )
                    `({ MODULE_PATH: argument })
                  );
                }
              }
            }
          }
        }
      };
    }
  ].filter(Boolean)
};