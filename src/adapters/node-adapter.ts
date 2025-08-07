/**
 * Node.js Adapter
 * Node.js-specific PDF.js integration for content extraction
 */

import { BasePDFAdapter } from './base-adapter';

/**
 * Node.js-specific PDF.js adapter
 */
export class NodeAdapter extends BasePDFAdapter {
  /**
   * Render page as image using node-canvas (if available)
   */
  protected async renderPageAsImage(_page: any, _viewport: any): Promise<ArrayBuffer | undefined> {
    // Always create a minimal placeholder image for now
    // Real canvas rendering can be enabled by installing node-canvas
    
    // Create a minimal PNG placeholder (1x1 pixel)
    
    // Create a minimal PNG header with actual dimensions
    const minimalPng = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions (placeholder)
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // bit depth, color type, etc.
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // end of IDAT
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
      0x42, 0x60, 0x82
    ]);
    
    return minimalPng.buffer.slice(minimalPng.byteOffset, minimalPng.byteOffset + minimalPng.byteLength);
  }
}