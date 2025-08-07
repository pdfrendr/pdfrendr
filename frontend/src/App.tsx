import React, { useState, useCallback, useEffect } from 'react';
import { Github, Code, Zap, Eye, Lock } from 'lucide-react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import Results from './components/Results';
import Footer from './components/Footer';
import DocsModal from './components/DocsModal';

export interface DetectionResultWithHex {
  name: string;
  hexSnippet?: string;
  position?: number;
}

export interface ProcessingResult {
  processedPdf: ArrayBuffer;
  removedObjects: DetectionResultWithHex[];
  originalSize: number;
  processedSize: number;
  processingTimeMs: number;
  statistics?: {
    obj: number;
    stream: number;
    pages: number;
    javascript: number;
    js: number;
    aa: number;
    openAction: number;
    suspiciousScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    analysis: string[];
  };
  structure?: {
    version: string;
    isLinearized: boolean;
    hasIncrementalUpdates: boolean;
    corruptedStructure: boolean;
    totalObjects: number;
  };
  fingerprint?: string;
  obfuscationAnalysis?: {
    hasObfuscation: boolean;
    level: 'none' | 'light' | 'moderate' | 'heavy';
    details: string[];
  };
}

export interface ProcessingOptions {
  renderQuality: number;
}

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [docsModal, setDocsModal] = useState<{ isOpen: boolean; file?: string }>({ isOpen: false });
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  // Load PDFRendr library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = './pdfrendr.umd.cjs';
    script.onload = () => {
      console.log('PDFRendr library loaded');
      setLibraryLoaded(true);
    };
    script.onerror = () => console.error('Failed to load PDFRendr library');
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleFileSelect = useCallback(async (file: File, options: ProcessingOptions) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setFileName(file.name);

    try {
      // Use the global PDFRendr library
      if (!window.PDFRendr || !window.PDFRendr.PDFRenderer) {
        throw new Error('PDFRendr library not available. Please ensure the library is loaded.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const renderer = new window.PDFRendr.PDFRenderer(options);
      const processingResult = await renderer.render(arrayBuffer);

      // Fix originalSize if needed
      if (processingResult.originalSize === 0) {
        processingResult.originalSize = arrayBuffer.byteLength;
      }

      setResult(processingResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsProcessing(false);
    setFileName('');
  }, []);

  const showDocs = useCallback((filename: string) => {
    setDocsModal({ isOpen: true, file: filename });
  }, []);

  const closeDocs = useCallback(() => {
    setDocsModal({ isOpen: false });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* GitHub Link */}
      <div className="fixed top-4 right-4 z-40">
        <a
          href="https://github.com/pdfrendr/pdfrendr.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
        >
          <Github size={16} />
          View on GitHub
        </a>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <Header onHomeClick={handleReset} />

        <main className="space-y-8">
          {!result && !isProcessing && !error && (
            <>
              {!libraryLoaded && (
                <div className="bg-white/80 backdrop-blur-sm rounded border border-gray-200 p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600 font-mono">Loading analysis engine...</p>
                </div>
              )}
              
              {libraryLoaded && <FileUpload onFileSelect={handleFileSelect} />}
              
              {/* Technical Specs */}
              <div className="bg-white/60 backdrop-blur-sm rounded border border-gray-200 p-4">
                <div className="text-xs text-gray-500 font-mono mb-3 border-b border-gray-200 pb-2">
                  CAPABILITIES
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="text-center">
                    <Lock className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                    <div className="text-gray-900 font-mono">Local</div>
                    <div className="text-gray-500">No uploads</div>
                  </div>
                  <div className="text-center">
                    <img src="/logo.png" alt="PDFRendr" className="h-4 w-4 mx-auto mb-1 opacity-60" />
                    <div className="text-gray-900 font-mono">Image-based</div>
                    <div className="text-gray-500">PDF.js + pdf-lib</div>
                  </div>
                  <div className="text-center">
                    <Zap className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                    <div className="text-gray-900 font-mono">WebAssembly</div>
                    <div className="text-gray-500">High performance</div>
                  </div>
                  <div className="text-center">
                    <Eye className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                    <div className="text-gray-900 font-mono">Preserve</div>
                    <div className="text-gray-500">Visual fidelity</div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-white/60 backdrop-blur-sm rounded border border-gray-200 p-4">
                <details className="group">
                  <summary className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer list-none font-mono">
                    <Code className="h-4 w-4 text-gray-500" />
                    Processing Pipeline
                    <span className="ml-auto group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-xs text-gray-600 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">1.</span>
                      <span>PDF.js parse → Extract page geometry & content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">2.</span>
                      <span>Canvas render → Generate PNG bitmap data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">3.</span>
                      <span>pdf-lib rebuild → Embed images as new PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">4.</span>
                      <span>Binary analysis → Detect & log removed objects</span>
                    </div>
                  </div>
                </details>
              </div>
            </>
          )}

          {isProcessing && <ProcessingStatus fileName={fileName} />}
          
          {result && (
            <Results 
              result={result} 
              fileName={fileName} 
              onReset={handleReset} 
            />
          )}

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm rounded border border-red-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-mono">✕</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-red-900 mb-1 font-mono">ANALYSIS_FAILED</h3>
                  <p className="text-xs text-red-700 mb-4 font-mono">{error}</p>
                  <button
                    onClick={handleReset}
                    className="px-3 py-2 bg-red-600 text-white rounded text-xs font-mono hover:bg-red-700 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer onShowDocs={showDocs} />
      
      <DocsModal
        isOpen={docsModal.isOpen}
        filename={docsModal.file}
        onClose={closeDocs}
      />
      

    </div>
  );
}

// Declare global PDFRenderer for TypeScript
declare global {
  interface Window {
    PDFRendr?: {
      PDFRenderer: new (options: ProcessingOptions) => {
        render: (inputPdf: ArrayBuffer) => Promise<ProcessingResult>;
      };
    };
  }
}

export default App;
