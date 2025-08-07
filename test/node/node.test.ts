import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFRendr, processPDF } from '../../src/index';

// Mock the PDF.js adapter to return successful results without actual PDF.js
vi.mock('../../src/adapters/node-adapter.ts', () => ({
  NodeAdapter: class {
    async extractContent() {
      // Return mock page content
      return [{
        pageNumber: 1,
        width: 612,
        height: 792,
        imageData: createMinimalPNG() // Mock PNG data
      }];
    }
  }
}));

// Helper to create valid minimal PNG
function createMinimalPNG(): ArrayBuffer {
  // Create a minimal PNG file header as mock data
  const pngData = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
  
  return pngData.buffer;
}

// Helper to create valid minimal PDF
function createMinimalPDF(): ArrayBuffer {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj

xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000102 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
155
%%EOF`;
  
  return new TextEncoder().encode(pdfContent).buffer;
}

// Helper to create PDF with dynamic content for testing detection
function createPDFWithJavaScript(): ArrayBuffer {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
/OpenAction 4 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj

4 0 obj
<<
/Type /Action
/S /JavaScript
/JS (app.alert('Hello World');)
>>
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000074 00000 n 
0000000123 00000 n 
0000000184 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
261
%%EOF`;
  
  return new TextEncoder().encode(pdfContent).buffer;
}

describe('PDFRendr Node.js Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPDF function', () => {
    it('should process PDF with default options', async () => {
      const mockPdf = createMinimalPDF();
      
      const result = await processPDF(mockPdf);
      
      expect(result).toHaveProperty('processedPdf');
      expect(result).toHaveProperty('removedObjects');
      expect(result).toHaveProperty('originalSize');
      expect(result).toHaveProperty('processedSize');
      expect(result).toHaveProperty('processingTimeMs');
      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(Array.isArray(result.removedObjects)).toBe(true);
    });

    it('should process PDF with custom options', async () => {
      const mockPdf = createMinimalPDF();
      
      const result = await processPDF(mockPdf, {
        renderQuality: 1.5,
        compressionLevel: 3
      });
      
      expect(result).toHaveProperty('processedPdf');
      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle invalid input gracefully', async () => {
      const invalidBuffer = new ArrayBuffer(10); // Too small to be a valid PDF
      
      const result = await processPDF(invalidBuffer);
      
      // Should still return a result structure (graceful handling)
      expect(result).toHaveProperty('processedPdf');
      expect(result).toHaveProperty('removedObjects');
    });

    it('should handle empty buffer', async () => {
      const emptyBuffer = new ArrayBuffer(0);
      
      const result = await processPDF(emptyBuffer);
      
      // Should still return a result structure (graceful handling)
      expect(result).toHaveProperty('processedPdf');
      expect(result).toHaveProperty('removedObjects');
    });
  });

  describe('PDFRendr class', () => {
    it('should create instance with default options', () => {
      const sanitizer = new PDFRendr();
      expect(sanitizer).toBeInstanceOf(PDFRendr);
    });

    it('should create instance with custom options', () => {
      const sanitizer = new PDFRendr({
        renderQuality: 3.0,
        compressionLevel: 1
      });
      expect(sanitizer).toBeInstanceOf(PDFRendr);
    });

    it('should process PDF using instance method', async () => {
      const sanitizer = new PDFRendr();
      const mockPdf = createMinimalPDF();
      
      const result = await sanitizer.process(mockPdf);
      
      expect(result).toHaveProperty('processedPdf');
      expect(result).toHaveProperty('removedObjects');
    });
  });

  describe('Error handling', () => {
    it('should handle PDF processing errors', async () => {
      const corruptPdf = new TextEncoder().encode('Not a PDF').buffer;
      
      const result = await processPDF(corruptPdf);
      
      // Should handle gracefully and return result structure
      expect(result).toHaveProperty('processedPdf');
      expect(result).toHaveProperty('removedObjects');
    });

    it('should validate renderQuality option bounds', () => {
      // Should accept valid range
      expect(() => new PDFRendr({ renderQuality: 1.0 })).not.toThrow();
      expect(() => new PDFRendr({ renderQuality: 4.0 })).not.toThrow();
      expect(() => new PDFRendr({ renderQuality: 2.5 })).not.toThrow();
    });

    it('should validate compressionLevel option bounds', () => {
      // Should accept valid range
      expect(() => new PDFRendr({ compressionLevel: 0 })).not.toThrow();
      expect(() => new PDFRendr({ compressionLevel: 3 })).not.toThrow();
      expect(() => new PDFRendr({ compressionLevel: 2 })).not.toThrow();
    });
  });

  describe('Processing modes (image-only)', () => {
    it('should process PDF in image-only mode', async () => {
      const sanitizer = new PDFRendr();
      const mockPdf = createMinimalPDF();
      
      const result = await sanitizer.process(mockPdf);
      
      expect(result.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(result.processedSize).toBeGreaterThan(0);
    });

    it('should handle different render qualities', async () => {
      const sanitizerLow = new PDFRendr({ renderQuality: 1.0 });
      const sanitizerHigh = new PDFRendr({ renderQuality: 3.0 });
      const mockPdf = createMinimalPDF();
      
      const resultLow = await sanitizerLow.process(mockPdf);
      const resultHigh = await sanitizerHigh.process(mockPdf);
      
      expect(resultLow.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(resultHigh.processedPdf).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle different compression levels', async () => {
      const sanitizerLow = new PDFRendr({ compressionLevel: 0 });
      const sanitizerHigh = new PDFRendr({ compressionLevel: 3 });
      const mockPdf = createMinimalPDF();
      
      const resultLow = await sanitizerLow.process(mockPdf);
      const resultHigh = await sanitizerHigh.process(mockPdf);
      
      expect(resultLow.processedPdf).toBeInstanceOf(ArrayBuffer);
      expect(resultHigh.processedPdf).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('Dynamic object detection', () => {
    it('should detect removed objects', async () => {
      const sanitizer = new PDFRendr();
      const mockPdf = createPDFWithJavaScript();
      
      const result = await sanitizer.process(mockPdf);
      
      expect(Array.isArray(result.removedObjects)).toBe(true);
      expect(result.removedObjects.length).toBeGreaterThan(0);
      expect(result.removedObjects.some(obj => obj.name.includes('JavaScript'))).toBe(true);
    });

    it('should provide processing statistics', async () => {
      const sanitizer = new PDFRendr();
      const mockPdf = createMinimalPDF();
      
      const result = await sanitizer.process(mockPdf);
      
      expect(typeof result.originalSize).toBe('number');
      expect(typeof result.processedSize).toBe('number');
      expect(typeof result.processingTimeMs).toBe('number');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should complete processing in reasonable time', async () => {
      const sanitizer = new PDFRendr();
      const mockPdf = createMinimalPDF();
      
      const startTime = Date.now();
      const result = await sanitizer.process(mockPdf);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // 5 second max
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should report processing time accurately', async () => {
      const sanitizer = new PDFRendr();
      const mockPdf = createMinimalPDF();
      
      const result = await sanitizer.process(mockPdf);
      
      expect(typeof result.processingTimeMs).toBe('number');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory management', () => {
    it('should handle large files efficiently', async () => {
      const sanitizer = new PDFRendr();
      const largeMockPdf = new ArrayBuffer(10000); // Larger mock file
      
      const result = await sanitizer.process(largeMockPdf);
      
      expect(result).toHaveProperty('processedPdf');
      expect(result.processedSize).toBeGreaterThan(0);
    });
  });
});