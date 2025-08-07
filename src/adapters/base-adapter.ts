/**
 * Base PDF Adapter
 * Shared logic for converting PDF pages to images across platforms
 * Core of PDFRendr's image-based processing approach
 */

import type { PageContent, ProcessingOptions } from '../core/pdf-processor';

/**
 * Base adapter with shared PDF.js extraction logic
 */
export abstract class BasePDFAdapter {
  protected pdfjsLib: any;

  constructor(pdfjsLib: any) {
    this.pdfjsLib = pdfjsLib;
  }

  /**
   * Extract content from PDF using PDF.js
   */
  async extractContent(
    pdfData: ArrayBuffer, 
    options: ProcessingOptions
  ): Promise<PageContent[]> {
    // Create a COPY of the ArrayBuffer to prevent PDF.js from transferring/detaching it
    const pdfDataCopy = pdfData.slice(0);
    const uint8Data = new Uint8Array(pdfDataCopy);
    
    // Load PDF document
    const doc = await this.pdfjsLib.getDocument({
      data: uint8Data,
      useSystemFonts: false,
      disableFontFace: true,
      verbosity: 0,
    }).promise;

    const pages: PageContent[] = [];
    
    // Extract each page
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const pageContent = await this.extractPageContent(page, i, options);
      pages.push(pageContent);
    }

    return pages;
  }

  /**
   * Extract content from a single page - shared logic
   */
  protected async extractPageContent(
    page: any, 
    pageNumber: number, 
    options: ProcessingOptions
  ): Promise<PageContent> {
    const viewport = page.getViewport({ scale: options.renderQuality || 2 });
    
    const pageContent: PageContent = {
      pageNumber,
      width: viewport.width,
      height: viewport.height
    };

    // PDFRendr always converts pages to images to remove dynamic objects
    // This is the core approach - no text extraction to avoid encoding issues
    try {
      pageContent.imageData = await this.renderPageAsImage(page, viewport);
    } catch (error) {
      console.warn(`Failed to render page ${pageNumber} as image:`, error);
      throw new Error(`Page rendering failed for page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return pageContent;
  }

  /**
   * Platform-specific image rendering - to be implemented by subclasses
   */
  protected abstract renderPageAsImage(page: any, viewport: any): Promise<ArrayBuffer | undefined>;
}
