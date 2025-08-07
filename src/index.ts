/**
 * PDFRendr - PDF Processing Library
 * Converts PDFs to images and rebuilds them as clean PDFs to remove dynamic objects
 * Node.js implementation
 */

import { PDFProcessor, type ProcessingOptions, type ProcessingResult } from './core/pdf-processor';
import { NodeAdapter } from './adapters/node-adapter';

// Dynamic PDF.js import
let pdfjsLib: any;

export interface PDFRendrOptions extends ProcessingOptions {
  // Node.js specific options can be added here if needed
}

export interface PDFRendrResult extends ProcessingResult {
  // Node.js specific result properties can be added here if needed
}

/**
 * Node.js PDF processor
 * Converts PDFs to images and rebuilds them as clean PDFs
 */
export class PDFRendr {
  private processor: PDFProcessor;
  private adapter: NodeAdapter | null = null;

  constructor(options: PDFRendrOptions = {}) {
    this.processor = new PDFProcessor(options);
  }

  /**
   * Get current processing options
   */
  get options(): Required<ProcessingOptions> {
    return this.processor.options;
  }

  /**
   * Process PDF to remove dynamic objects
   */
  async process(inputPdf: ArrayBuffer): Promise<PDFRendrResult> {
    // Initialize PDF.js if needed
    if (!pdfjsLib) {
      await this.initializePDFJS();
    }

    // Initialize adapter if needed
    if (!this.adapter) {
      this.adapter = new NodeAdapter(pdfjsLib);
    }

    try {
      // Extract content as images
      const pages = await this.adapter.extractContent(inputPdf, this.processor.options);
      
      // Process using core engine
      const result = await this.processor.processPDF(inputPdf, pages);
      
      return result as PDFRendrResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`PDF processing failed: ${errorMessage}`);
    }
  }

  /**
   * Initialize PDF.js for Node.js environment
   */
  private async initializePDFJS(): Promise<void> {
    try {
      pdfjsLib = await import('pdfjs-dist');
    } catch (error) {
      throw new Error(`Failed to load PDF.js: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Convenience function for PDF processing
 * Converts PDF to images and rebuilds as clean PDF
 */
export async function processPDF(
  inputPdf: ArrayBuffer,
  options?: PDFRendrOptions
): Promise<PDFRendrResult> {
  const pdfrendrer = new PDFRendr(options);
  return await pdfrendrer.process(inputPdf);
}

// Export types for external use
export type { ProcessingOptions, ProcessingResult };