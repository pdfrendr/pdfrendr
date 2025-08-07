import React from 'react';
import { Download, RotateCcw, FileCheck, Database, Clock, Package2, Hash, Eye, AlertTriangle, Info, Shield, Zap } from 'lucide-react';
import { ProcessingResult } from '../App';
import HexViewer from './HexViewer';

interface ResultsProps {
  result: ProcessingResult;
  fileName: string;
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, fileName, onReset }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const sizeReduction = result.originalSize > 0 
    ? ((result.originalSize - result.processedSize) / result.originalSize * 100).toFixed(1)
    : '0.0';

  const compressionRatio = result.originalSize > 0 
    ? (result.processedSize / result.originalSize).toFixed(3)
    : '1.000';

  const processingSpeed = result.originalSize > 0 && result.processingTimeMs > 0
    ? ((result.originalSize / 1024 / 1024) / (result.processingTimeMs / 1000)).toFixed(1)
    : '0.0';

  const downloadProcessed = () => {
    const blob = new Blob([result.processedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '_processed.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <FileCheck className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg text-gray-900">
          Processing Analysis Complete
        </h3>
        <div className="ml-auto text-sm text-gray-500 font-mono">
          {new Date().toISOString().slice(0, 19)}Z
        </div>
      </div>

      {/* Technical Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <Database className="h-4 w-4 text-gray-500 mb-1" />
          <div className="text-sm text-gray-900 font-mono">
            {formatBytes(result.originalSize)}
          </div>
          <div className="text-xs text-gray-500">Input</div>
        </div>
        
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <Package2 className="h-4 w-4 text-gray-500 mb-1" />
          <div className="text-sm text-gray-900 font-mono">
            {formatBytes(result.processedSize)}
          </div>
          <div className="text-xs text-gray-500">Output</div>
        </div>
        
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <Hash className="h-4 w-4 text-gray-500 mb-1" />
          <div className="text-sm text-gray-900 font-mono">
            {compressionRatio}
          </div>
          <div className="text-xs text-gray-500">Ratio</div>
        </div>
        
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <Eye className="h-4 w-4 text-gray-500 mb-1" />
          <div className="text-sm text-gray-900 font-mono">
            -{sizeReduction}%
          </div>
          <div className="text-xs text-gray-500">Reduction</div>
        </div>

        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <Clock className="h-4 w-4 text-gray-500 mb-1" />
          <div className="text-sm text-gray-900 font-mono">
            {result.processingTimeMs}ms
          </div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>

        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="h-4 w-4 mb-1 flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          </div>
          <div className="text-sm text-gray-900 font-mono">
            {processingSpeed} MB/s
          </div>
          <div className="text-xs text-gray-500">Speed</div>
        </div>
      </div>

      {/* Object Analysis */}
      {result.removedObjects && result.removedObjects.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              DETECTED[{result.removedObjects.length}]
            </span>
            PDF Object Analysis
          </h4>
          <div className="space-y-2">
            {result.removedObjects.map((object, index) => (
              <details key={index} className="bg-gray-50 rounded border border-gray-200">
                <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-gray-900">{object.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs">+</span>
                </summary>
                <div className="px-3 pb-3 pt-1 border-t border-gray-200 bg-white">
                  <div className="text-xs text-gray-600 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-gray-500 font-mono">Offset</div>
                        <div className="text-gray-900 font-mono">
                          {object.position ? `0x${object.position.toString(16).toUpperCase()}` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-mono">Type</div>
                        <div className="text-gray-900 font-mono text-xs">
                          {object.name.includes('/URI') ? 'URI_ACTION' :
                           object.name.includes('/JavaScript') ? 'JS_OBJECT' :
                           object.name.includes('/Form') ? 'FORM_ACTION' :
                           object.name.includes('/Font') ? 'FONT_EMBED' :
                           object.name.includes('/Sig') ? 'SIGNATURE' :
                           object.name.includes('/AA') || object.name.includes('/A ') ? 'ANNOTATION' :
                           object.name.includes('/XFA') ? 'XFA_FORM' :
                           object.name.includes('/Embedded') ? 'FILE_EMBED' :
                           'PDF_OBJECT'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-mono">Status</div>
                        <div className="text-gray-900 font-mono text-xs">
                          NEUTRALIZED
                        </div>
                      </div>
                    </div>
                    {object.hexSnippet && (
                      <div>
                        <div className="text-gray-500 font-mono mb-2">Binary Data</div>
                        <HexViewer hexData={object.hexSnippet || ''} />
                      </div>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {result.removedObjects?.length === 0 && (
        <div className="mb-6 bg-gray-50 rounded border border-gray-200 p-4 text-center">
          <div className="text-sm text-gray-600 font-mono">
            CLEAN[0] No dynamic objects detected
          </div>
        </div>
      )}

      {/* Stevens-style PDF Analysis */}
      {result.statistics && (
        <div className="mb-6 bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Shield size={16} />
              PDF Structure Analysis
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                Didier Stevens Method
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Risk Assessment */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                result.statistics.riskLevel === 'critical' ? 'bg-red-100 text-red-600' :
                result.statistics.riskLevel === 'high' ? 'bg-orange-100 text-orange-600' :
                result.statistics.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {result.statistics.riskLevel === 'critical' || result.statistics.riskLevel === 'high' ? 
                  <AlertTriangle size={16} /> : 
                  result.statistics.riskLevel === 'medium' ? <Info size={16} /> : <Shield size={16} />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    Risk Level: {result.statistics.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">
                    Score: {result.statistics.suspiciousScore}/100
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {result.statistics.analysis.map((analysis, idx) => (
                    <div key={idx} className="text-sm text-gray-600">{analysis}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* PDF Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500 font-mono">Objects</div>
                <div className="font-mono text-gray-900">{result.statistics.obj}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500 font-mono">Streams</div>
                <div className="font-mono text-gray-900">{result.statistics.stream}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500 font-mono">Pages</div>
                <div className="font-mono text-gray-900">{result.statistics.pages}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500 font-mono">JavaScript</div>
                <div className={`font-mono ${result.statistics.javascript + result.statistics.js > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {result.statistics.javascript + result.statistics.js}
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500 font-mono">Auto Actions</div>
                <div className={`font-mono ${result.statistics.aa + result.statistics.openAction > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {result.statistics.aa + result.statistics.openAction}
                </div>
              </div>
            </div>

            {/* Document Structure */}
            {result.structure && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Document Structure</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-mono">{result.structure.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Linearized:</span>
                    <span className="font-mono">{result.structure.isLinearized ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Updates:</span>
                    <span className="font-mono">{result.structure.hasIncrementalUpdates ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Objects:</span>
                    <span className="font-mono">{result.structure.totalObjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Corrupted:</span>
                    <span className={`font-mono ${result.structure.corruptedStructure ? 'text-red-600' : 'text-green-600'}`}>
                      {result.structure.corruptedStructure ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Obfuscation Analysis */}
            {result.obfuscationAnalysis && result.obfuscationAnalysis.hasObfuscation && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Obfuscation Detected</span>
                  <span className={`text-xs px-2 py-1 rounded font-mono ${
                    result.obfuscationAnalysis.level === 'heavy' ? 'bg-red-100 text-red-800' :
                    result.obfuscationAnalysis.level === 'moderate' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.obfuscationAnalysis.level.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1">
                  {result.obfuscationAnalysis.details.map((detail, idx) => (
                    <div key={idx} className="text-xs text-gray-600">{detail}</div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Fingerprint */}
            {result.fingerprint && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Document Fingerprint</div>
                <div className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded">
                  {result.fingerprint}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={downloadProcessed}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-colors"
        >
          <Download size={16} />
          Download
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={16} />
          New Analysis
        </button>
      </div>
    </div>
  );
};

export default Results;
