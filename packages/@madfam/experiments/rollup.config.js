import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const packageJson = require('./package.json');

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
    ],
    external: ['react', 'react-dom'],
  },
  // React components bundle
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
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
    ],
    external: ['react', 'react-dom'],
  },
  // Middleware bundle
  {
    input: 'src/middleware.ts',
    output: [
      {
        file: 'dist/middleware.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/middleware.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
    ],
  },
  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: 'src/react.ts',
    output: [{ file: 'dist/react.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: 'src/middleware.ts',
    output: [{ file: 'dist/middleware.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
