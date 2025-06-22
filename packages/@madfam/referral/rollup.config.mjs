import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

const input = {
  index: 'src/index.ts',
  'engine/index': 'src/engine/index.ts',
  'hooks/index': 'src/hooks/index.ts',
  'components/index': 'src/components/index.ts',
  'types/index': 'src/types/index.ts',
};

export default defineConfig([
  // CommonJS and ESM builds
  {
    input,
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      {
        dir: 'dist',
        format: 'esm',
        entryFileNames: '[name].esm.js',
        chunkFileNames: '[name]-[hash].esm.js',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      esbuild({
        target: 'es2020',
        jsx: 'automatic',
        tsconfig: './tsconfig.json',
      }),
    ],
    external: [
      ...Object.keys(packageJson.peerDependencies || {}),
      ...Object.keys(packageJson.dependencies || {}),
      /^node:/,
    ],
  },
  // TypeScript declarations
  {
    input,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].d.ts',
      chunkFileNames: '[name]-[hash].d.ts',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    plugins: [dts()],
    external: [/\.css$/],
  },
]);