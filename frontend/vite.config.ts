import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for pdfrendr.github.io
  build: {
    outDir: '../dist-github',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Keep everything in one bundle for simplicity
        format: 'es', // Ensure ES module format
      },
    },
    target: 'es2015', // Target modern browsers that support ES modules
  },
  server: {
    port: 3001,
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    // Ensure we can access the PDFRendr library
    global: 'globalThis',
  },
});
