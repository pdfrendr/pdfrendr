/**
 * PDFRendr - Browser PDF Processor
 * Converts PDFs to images and rebuilds them as clean PDFs to remove dynamic objects
 * Browser implementation using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFProcessor, type ProcessingOptions, type ProcessingResult } from './core/pdf-processor';
import { PDFJSAdapter } from './adapters/pdfjs-adapter';

// Configure PDF.js worker for browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
}

export interface RenderOptions extends ProcessingOptions {
  // Browser-specific options can be added here if needed
}

export interface RenderResult extends ProcessingResult {
  // Browser-specific result properties can be added here if needed
}

/**
 * Browser PDF processor
 * Converts PDFs to images and rebuilds them as clean PDFs
 */
export class PDFRenderer {
  private processor: PDFProcessor;
  private adapter: PDFJSAdapter;

  constructor(options: RenderOptions = {}) {
    this.processor = new PDFProcessor(options);
    this.adapter = new PDFJSAdapter(pdfjsLib, {
      useSystemFonts: false,
      disableFontFace: true,
      verbosity: 0
    });
  }

  /**
   * Get current processing options
   */
  get options(): Required<ProcessingOptions> {
    return this.processor.options;
  }

  /**
   * Process PDF in browser environment
   * Converts pages to images and rebuilds as clean PDF
   */
  async render(inputPdf: ArrayBuffer): Promise<RenderResult> {
    try {
      // Extract content as images using PDF.js
      const pages = await this.adapter.extractContent(inputPdf, this.processor.options);
      
      // Process using core engine
      const result = await this.processor.processPDF(inputPdf, pages);
      
      return result as RenderResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide helpful error messages for common browser issues
      if (errorMessage.includes('worker')) {
        throw new Error('PDF processing failed: Unable to load PDF worker. This might be due to network restrictions or CORS issues.');
      }
      
      throw new Error(`PDF processing failed: ${errorMessage}`);
    }
  }
}

/**
 * Convenience function for simple PDF processing in browser
 * Converts PDF to images and rebuilds as clean PDF
 */
export async function renderPDF(
  inputPdf: ArrayBuffer,
  options?: RenderOptions
): Promise<RenderResult> {
  const renderer = new PDFRenderer(options);
  return await renderer.render(inputPdf);
}

// Export types for external use
export type { ProcessingOptions, ProcessingResult };