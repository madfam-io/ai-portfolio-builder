import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

const packageJson = {
  name: '@madfam/smart-payments',
  main: 'dist/index.js',
  module: 'dist/index.esm.js',
  types: 'dist/index.d.ts',
};

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'node-ipinfo',
  'crypto',
  'querystring',
  'url',
  'http',
  'https',
];

const entries = [
  // Build module bundles first
  'src/card-intelligence/index.ts',
  'src/geo/index.ts',
  'src/routing/index.ts',
  'src/pricing/index.ts',
  'src/performance/index.ts',
  'src/business-intelligence/index.ts',
  'src/ai/index.ts',
  'src/enterprise/index.ts',
  'src/research/index.ts',
  'src/white-label/index.ts',
  'src/subscription/index.ts',
  'src/consulting/index.ts',
  // Build main index last
  'src/index.ts',
];

export default [
  // CommonJS and ESM builds
  ...entries.map(input => ({
    input,
    output: [
      {
        file: input.replace('src/', 'dist/').replace('.ts', '.js'),
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: input.replace('src/', 'dist/').replace('.ts', '.esm.js'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        preferBuiltins: true,
      }),
      esbuild({
        target: 'es2020',
        jsx: 'automatic',
        tsconfig: './tsconfig.json',
      }),
    ],
    external,
    onwarn(warning, warn) {
      // Suppress specific warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      if (
        warning.code === 'MISSING_EXPORT' &&
        warning.message.includes('node-ipinfo')
      )
        return;
      // Log other warnings
      warn(warning);
    },
  })),

  // TypeScript declarations
  ...entries.map(input => ({
    input,
    output: {
      file: input.replace('src/', 'dist/').replace('.ts', '.d.ts'),
      format: 'esm',
    },
    plugins: [dts()],
    external: [/\.css$/],
  })),
];
