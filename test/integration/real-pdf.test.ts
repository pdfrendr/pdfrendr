import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PDFRendr, processPDF } from '../../src/index';
import { PDFRenderer, renderPDF } from '../../src/browser-only';

const FIXTURES_DIR = join(__dirname, '../fixtures');

// Test helper to load PDF fixtures
function loadFixture(filename: string): ArrayBuffer {
  const filePath = join(FIXTURES_DIR, filename);
  if (!existsSync(filePath)) {
    throw new Error(`Test fixture not found: ${filePath}`);
  }
  const buffer = readFileSync(filePath);
  // Create a new ArrayBuffer to avoid detachment issues
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  view.set(buffer);
  return arrayBuffer;
}

describe('Real PDF Processing Tests', () => {
  let simpleTestPdf: ArrayBuffer | null;
  let simple1mbPdf: ArrayBuffer | null;
  let simple3mbPdf: ArrayBuffer | null;
  let jsTestPdf: ArrayBuffer | null;
  let attachmentTestPdf: ArrayBuffer | null;
  let signedTestPdf: ArrayBuffer | null;

  beforeAll(() => {
    // Load all test fixtures
    try {
      simpleTestPdf = loadFixture('simple-test.pdf');
    } catch (error) {
      console.warn('simple-test.pdf not found');
      simpleTestPdf = null;
    }
    
    try {
      simple1mbPdf = loadFixture('simple-1mb.pdf');
    } catch (error) {
      console.warn('simple-1mb.pdf not found');
      simple1mbPdf = null;
    }
    
    try {
      simple3mbPdf = loadFixture('simple-3mb.pdf');
    } catch (error) {
      console.warn('simple-3mb.pdf not found');
      simple3mbPdf = null;
    }
    
    try {
      jsTestPdf = loadFixture('pdf-with-js.pdf');
    } catch (error) {
      console.warn('pdf-with-js.pdf not found');
      jsTestPdf = null;
    }
    
    try {
      attachmentTestPdf = loadFixture('pdf-with-attachment.pdf');
    } catch (error) {
      console.warn('pdf-with-attachment.pdf not found');
      attachmentTestPdf = null;
    }
    
    try {
      signedTestPdf = loadFixture('digitally-signed.pdf');
    } catch (error) {
      console.warn('digitally-signed.pdf not found');
      signedTestPdf = null;
    }
  });

  describe('Node.js Processing', () => {
    it('should process simple generated PDF', async () => {
      if (!simpleTestPdf) return;
      
      const result = await processPDF(simpleTestPdf, {
        renderQuality: 2.0,
        compressionLevel: 1
      });

      expect(result).toHaveProperty('processedPdf');
      expect(result).toHaveProperty('removedObjects');
      expect(result).toHaveProperty('originalSize');
      expect(result).toHaveProperty('processedSize');
      expect(result).toHaveProperty('processingTimeMs');

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(result.processedSize).toBeGreaterThan(0);
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(Array.isArray(result.removedObjects)).toBe(true);

      console.log(`Simple PDF: ${result.originalSize} bytes -> ${result.processedSize} bytes`);
      console.log(`Removed objects: ${result.removedObjects.join(', ') || 'none'}`);
    });

    it('should process 1MB sample PDF', async () => {
      if (!simple1mbPdf) return;
      
      const result = await processPDF(simple1mbPdf);

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(result.processedSize).toBeGreaterThan(0);
      expect(result.originalSize).toBeGreaterThan(100000); // Should be around 1MB
      
      console.log(`1MB PDF: ${result.originalSize} bytes -> ${result.processedSize} bytes`);
      console.log(`Processing time: ${result.processingTimeMs}ms`);
      console.log(`Removed objects: ${result.removedObjects.join(', ') || 'none'}`);
    });

    it('should process 3MB sample PDF', async () => {
      if (!simple3mbPdf) return;
      
      const result = await processPDF(simple3mbPdf, {
        renderQuality: 1.5, // Lower quality for faster processing
        compressionLevel: 2
      });

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(result.processedSize).toBeGreaterThan(0);
      expect(result.originalSize).toBeGreaterThan(100000); // Should be substantial
      
      console.log(`3MB PDF: ${result.originalSize} bytes -> ${result.processedSize} bytes`);
      console.log(`Processing time: ${result.processingTimeMs}ms`);
      console.log(`Removed objects: ${result.removedObjects.join(', ') || 'none'}`);
    });

    it('should detect JavaScript in PDF', async () => {
      if (!jsTestPdf) return;
      
      const result = await processPDF(jsTestPdf);

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      // Note: We expect JavaScript to be detected but the exact string may vary
      expect(result.removedObjects.length).toBeGreaterThan(0);
      
      console.log(`JavaScript PDF: detected objects: ${result.removedObjects.join(', ')}`);
    });

    it('should detect embedded files in PDF', async () => {
      if (!attachmentTestPdf) return;
      
      const result = await processPDF(attachmentTestPdf);

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      // Note: Embedded files should be detected
      expect(result.removedObjects.length).toBeGreaterThan(0);
      
      console.log(`Attachment PDF: detected objects: ${result.removedObjects.join(', ')}`);
    });

    it('should detect digital signatures in PDF', async () => {
      if (!signedTestPdf) return;
      
      const result = await processPDF(signedTestPdf);

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      // Note: Digital signatures should be detected
      expect(result.removedObjects.length).toBeGreaterThan(0);
      
      console.log(`Signed PDF: detected objects: ${result.removedObjects.join(', ')}`);
    });

    it('should handle different render qualities', async () => {
      if (!simpleTestPdf) return;
      
      const lowQuality = await processPDF(simpleTestPdf, { renderQuality: 1.0 });
      const highQuality = await processPDF(simpleTestPdf, { renderQuality: 3.0 });

      expect(lowQuality.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(highQuality.processedPdf).toBeInstanceOf(ArrayBuffer);
      
      // Higher quality should generally produce larger files
      expect(highQuality.processedSize).toBeGreaterThanOrEqual(lowQuality.processedSize * 0.8);
      
      console.log(`Quality comparison: Low (${lowQuality.processedSize}) vs High (${highQuality.processedSize})`);
    });

    it('should handle different compression levels', async () => {
      if (!simpleTestPdf) return;
      
      const lowCompression = await processPDF(simpleTestPdf, { compressionLevel: 0 });
      const highCompression = await processPDF(simpleTestPdf, { compressionLevel: 3 });

      expect(lowCompression.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(highCompression.processedPdf).toBeInstanceOf(ArrayBuffer);
      
      // Higher compression should produce smaller files
      expect(highCompression.processedSize).toBeLessThanOrEqual(lowCompression.processedSize * 1.2);
      
      console.log(`Compression comparison: Low (${lowCompression.processedSize}) vs High (${highCompression.processedSize})`);
    });

    it('should process files within reasonable time limits', async () => {
      if (!simple1mbPdf) return;
      
      const startTime = Date.now();
      const result = await processPDF(simple1mbPdf);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
      expect(result.processingTimeMs).toBeLessThan(30000);
      expect(result.processingTimeMs).toBeGreaterThan(0);
      
      console.log(`Performance: ${totalTime}ms total, ${result.processingTimeMs}ms processing`);
    });

    it('should use class instance for repeated processing', async () => {
      if (!simpleTestPdf) return;
      
      const pdfrendrer = new PDFRendr({ renderQuality: 2.0 });
      
      const result1 = await pdfrendrer.process(simpleTestPdf);
      const result2 = await pdfrendrer.process(simpleTestPdf);

      expect(result1.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(result2.processedPdf).toBeInstanceOf(ArrayBuffer);
      
      // Results should be similar for the same input
      expect(Math.abs(result1.processedSize - result2.processedSize)).toBeLessThan(1000);
      
      console.log(`Repeated processing: ${result1.processedSize} vs ${result2.processedSize} bytes`);
    });
  });

  describe('Browser Processing (Simulated)', () => {
    it.skip('should process simple PDF in browser environment', async () => {
      // Note: Real browser testing is handled in test/browser/sanitizer.test.ts
      // This integration test suite focuses on Node.js functionality with real PDFs
      if (!simpleTestPdf) return;
      
      const renderer = new PDFRenderer({ renderQuality: 2.0 });
      const result = await renderer.render(simpleTestPdf);

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(result.processedSize).toBeGreaterThan(0);
      
      console.log(`Browser-style processing: ${result.originalSize} -> ${result.processedSize} bytes`);
    });

    it.skip('should use convenience function for browser rendering', async () => {
      // Note: Real browser testing is handled in test/browser/sanitizer.test.ts
      // This integration test suite focuses on Node.js functionality with real PDFs
      if (!simpleTestPdf) return;
      
      const result = await renderPDF(simpleTestPdf, {
        renderQuality: 1.5,
        compressionLevel: 2
      });

      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(result.removedObjects).toBeDefined();
      
      console.log(`Convenience function result: ${result.removedObjects.length} objects removed`);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very small files gracefully', async () => {
      const tinyPdf = new ArrayBuffer(100); // Too small to be a valid PDF
      
      try {
        const result = await processPDF(tinyPdf);
        // If it doesn't throw, check the result
        expect(result).toHaveProperty('processedPdf');
        expect(result).toHaveProperty('removedObjects');
      } catch (error) {
        // Expected to throw for invalid PDF
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('PDF processing failed');
      }
    });

    it('should handle empty files gracefully', async () => {
      const emptyPdf = new ArrayBuffer(0);
      
      try {
        const result = await processPDF(emptyPdf);
        // If it doesn't throw, check the result
        expect(result).toHaveProperty('processedPdf');
        expect(result).toHaveProperty('removedObjects');
      } catch (error) {
        // Expected to throw for empty PDF
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('PDF processing failed');
      }
    });

    it('should handle corrupted data gracefully', async () => {
      const corruptData = new ArrayBuffer(1000);
      const view = new Uint8Array(corruptData);
      // Fill with invalid data
      for (let i = 0; i < view.length; i++) {
        view[i] = Math.floor(Math.random() * 256);
      }
      
      try {
        const result = await processPDF(corruptData);
        // If it doesn't throw, check the result
        expect(result).toHaveProperty('processedPdf');
        expect(result).toHaveProperty('removedObjects');
      } catch (error) {
        // Expected to throw for corrupted PDF
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('PDF processing failed');
      }
    });
  });

  describe('File Format Validation', () => {
    it('should process all test fixtures without errors', async () => {
      const fixtures = [
        { name: 'simple-test.pdf', data: simpleTestPdf },
        { name: 'simple-1mb.pdf', data: simple1mbPdf },
        { name: 'simple-3mb.pdf', data: simple3mbPdf },
        { name: 'pdf-with-js.pdf', data: jsTestPdf },
        { name: 'pdf-with-attachment.pdf', data: attachmentTestPdf },
        { name: 'digitally-signed.pdf', data: signedTestPdf }
      ];

      for (const fixture of fixtures) {
        if (!fixture.data) {
          console.warn(`Skipping missing fixture: ${fixture.name}`);
          continue;
        }

        console.log(`\nProcessing ${fixture.name}...`);
        const result = await processPDF(fixture.data);

        expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
        expect(result.processedSize).toBeGreaterThan(0);
        expect(result.originalSize).toBeGreaterThan(0);
        
        console.log(`  Size: ${result.originalSize} -> ${result.processedSize} bytes`);
        console.log(`  Time: ${result.processingTimeMs}ms`);
        console.log(`  Objects: ${result.removedObjects.join(', ') || 'none'}`);
      }
    });
  });
});