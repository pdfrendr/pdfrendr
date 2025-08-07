/**
 * PDF.js Browser Adapter
 * Browser-specific PDF.js integration for content extraction
 */

import { BasePDFAdapter } from './base-adapter';

export interface PDFJSConfig {
  workerSrc?: string;
  useSystemFonts?: boolean;
  disableFontFace?: boolean;
  verbosity?: number;
}

/**
 * Browser-specific PDF.js adapter
 */
export class PDFJSAdapter extends BasePDFAdapter {
  constructor(pdfjsLib: any, _config: PDFJSConfig = {}) {
    super(pdfjsLib);
    // Config options could be used for future PDF.js configuration
  }

  /**
   * Render page as PNG image in browser
   */
  protected async renderPageAsImage(page: any, viewport: any): Promise<ArrayBuffer> {
    // Ensure viewport has valid dimensions
    const width = Math.max(1, Math.floor(viewport.width || 595));
    const height = Math.max(1, Math.floor(viewport.height || 842));
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    
    // Render page to canvas with validated viewport
    await page.render({
      canvasContext: context,
      viewport: { ...viewport, width, height }
    }).promise;
    
    // Convert to PNG
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          blob.arrayBuffer().then(resolve).catch(reject);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    });
  }
}