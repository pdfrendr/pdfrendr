import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'demo/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'pdfjs-dist/legacy/build/pdf.js': path.resolve(__dirname, './node_modules/pdfjs-dist/legacy/build/pdf.mjs'),
    },
  },
  esbuild: {
    target: 'node18',
  },
});