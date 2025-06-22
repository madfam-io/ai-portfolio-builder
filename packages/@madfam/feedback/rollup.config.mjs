import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const packageJson = await import('./package.json', { assert: { type: 'json' } });

const external = [
  ...Object.keys(packageJson.default.dependencies || {}),
  ...Object.keys(packageJson.default.peerDependencies || {}),
  'react/jsx-runtime',
];

const plugins = [
  peerDepsExternal(),
  resolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }),
  commonjs(),
  json(),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: ['**/*.test.ts', '**/*.test.tsx'],
  }),
];

const productionPlugins = [...plugins, terser()];

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.default.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.default.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: productionPlugins,
    external,
  },
  // React bundle
  {
    input: 'src/react.ts',
    output: [
      {
        file: 'dist/react.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/react.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: productionPlugins,
    external,
  },
  // Core bundle
  {
    input: 'src/core/index.ts',
    output: [
      {
        file: 'dist/core/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/core/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: productionPlugins,
    external,
  },
  // Storage bundle
  {
    input: 'src/storage/index.ts',
    output: [
      {
        file: 'dist/storage/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/storage/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: productionPlugins,
    external,
  },
  // API bundle
  {
    input: 'src/api/index.ts',
    output: [
      {
        file: 'dist/api/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/api/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: productionPlugins,
    external,
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external,
  },
  {
    input: 'src/react.ts',
    output: [{ file: 'dist/react.d.ts', format: 'es' }],
    plugins: [dts()],
    external,
  },
  {
    input: 'src/core/index.ts',
    output: [{ file: 'dist/core/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external,
  },
  {
    input: 'src/storage/index.ts',
    output: [{ file: 'dist/storage/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external,
  },
  {
    input: 'src/api/index.ts',
    output: [{ file: 'dist/api/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external,
  },
];