import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const target = process.env.TARGET || 'both';

const baseConfig = {
  input: 'src/index.ts',
};

const browserConfig = {
  ...baseConfig,
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
  ],
  external: ['pdfjs-dist', 'pdf-lib', 'canvas'],
  output: [
    {
      file: 'dist/browser/index.esm.js',
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/browser/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
    {
      file: 'dist/browser/index.umd.js',
      format: 'umd',
      name: 'PDFRendr',
      sourcemap: true,
      inlineDynamicImports: true,
      globals: {
        'pdfjs-dist': 'pdfjsLib',
        'pdf-lib': 'PDFLib',
      },
    },
  ],
};

const nodeConfig = {
  ...baseConfig,
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      browser: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false, // Only generate declarations once from browser build
      declarationMap: false, // Disable declaration maps when not generating declarations
    }),
  ],
  external: ['pdfjs-dist', 'pdfjs-dist/legacy/build/pdf.js', 'pdf-lib', 'canvas'],
  output: [
    {
      file: 'dist/node/index.esm.js',
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/node/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
  ],
};

export default defineConfig(() => {
  if (target === 'browser') {
    return [browserConfig];
  } else if (target === 'node') {
    return [nodeConfig];
  } else {
    return [browserConfig, nodeConfig];
  }
});