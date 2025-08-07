/**
 * Core PDF Processing Engine
 * Converts PDFs to images and rebuilds them as clean PDFs
 * Platform-agnostic business logic for PDF processing
 */

import { PDFDocument } from 'pdf-lib';
import { getDetectedObjectsWithHex, type DetectionResultWithHex } from '../detection/pdf-objects';

export interface ProcessingOptions {
  // Rendering quality (1.0 to 4.0)
  renderQuality?: number;
  
  // Compression level (0-3, higher = more compression)
  compressionLevel?: number;
  
  // Processing timeout
  timeoutMs?: number;
}

export interface ProcessingResult {
  processedPdf: ArrayBuffer;
  removedObjects: DetectionResultWithHex[];
  originalSize: number;
  processedSize: number;
  processingTimeMs: number;
}

export interface PageContent {
  pageNumber: number;
  imageData?: ArrayBuffer;
  textContent?: string;
  width: number;
  height: number;
}

/**
 * Core PDF processing engine
 * Handles image-based PDF reconstruction to remove dynamic objects
 */
export class PDFProcessor {
  private _options: Required<ProcessingOptions>;

  constructor(options: ProcessingOptions = {}) {
    this._options = {
      renderQuality: 2.0,
      compressionLevel: 2,
      timeoutMs: 30000,
      ...options
    };
  }

  /**
   * Get current processing options
   */
  get options(): Required<ProcessingOptions> {
    return { ...this._options };
  }

  /**
   * Process PDF using extracted page content
   */
  async processPDF(
    originalPdf: ArrayBuffer,
    pages: PageContent[]
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    // Detect what we're removing
    const removedObjects = this.detectRemovedObjects(originalPdf);
    
    // Create new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Process each page
    for (const pageContent of pages) {
      await this.addPageToPDF(pdfDoc, pageContent);
    }
    
    // Generate final PDF
    const processedPdfBytes = await pdfDoc.save({
      useObjectStreams: this._options.compressionLevel > 1,
      addDefaultPage: false
    });
    
    const processingTimeMs = Date.now() - startTime;
    
    return {
      processedPdf: processedPdfBytes.buffer.slice(
        processedPdfBytes.byteOffset,
        processedPdfBytes.byteOffset + processedPdfBytes.byteLength
      ) as ArrayBuffer,
      removedObjects,
      originalSize: originalPdf.byteLength,
      processedSize: processedPdfBytes.length,
      processingTimeMs
    };
  }

  /**
   * Add a page to the PDF document
   */
  private async addPageToPDF(pdfDoc: PDFDocument, pageContent: PageContent): Promise<void> {
    const page = pdfDoc.addPage([pageContent.width, pageContent.height]);
    
    // PDFRendr processing: convert pages to images and rebuild
    if (pageContent.imageData) {
      const image = await pdfDoc.embedPng(pageContent.imageData);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageContent.width,
        height: pageContent.height,
      });
    } else {
      console.warn('No image data available for page - this should not happen in normal operation');
    }
  }

  /**
   * Detect what types of content were excluded
   */
  private detectRemovedObjects(originalPdf: ArrayBuffer): DetectionResultWithHex[] {
    const detectedObjects = getDetectedObjectsWithHex(originalPdf);
    
    // PDFRendr always uses image-only processing - note this in results
    if (detectedObjects.length === 0) {
      // Even if no specific objects detected, we're still converting to images
      detectedObjects.push({
        name: 'Document processed as images (dynamic objects removed)',
        hexSnippet: undefined,
        position: undefined
      });
    }

    return detectedObjects;
  }

}
