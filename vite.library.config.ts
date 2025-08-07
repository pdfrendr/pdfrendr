import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'frontend/public',
    emptyOutDir: false,
    lib: {
      entry: 'src/browser-only.ts',
      name: 'PDFRendr', // This will be the global variable name
      fileName: 'pdfrendr',
      formats: ['umd'] // UMD format for global access
    },
    rollupOptions: {
      external: [], // Bundle everything for standalone use
      output: {
        globals: {
          // Define any globals if needed
        }
      }
    },
    target: 'es2015'
  },
  define: {
    global: 'globalThis',
  },
});
