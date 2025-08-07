import React, { useState, useCallback } from 'react';
import { Upload, Settings } from 'lucide-react';
import { ProcessingOptions } from '../App';

interface FileUploadProps {
  onFileSelect: (file: File, options: ProcessingOptions) => Promise<void>;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [renderQuality, setRenderQuality] = useState(2.0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0], { renderQuality });
    }
  }, [onFileSelect, renderQuality]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0], { renderQuality });
    }
  }, [onFileSelect, renderQuality]);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          glass rounded-xl p-8 border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="text-center">
          <div className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors
            ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            <Upload className={`h-8 w-8 ${dragActive ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Drop your PDF here
          </h3>
          <p className="text-gray-600 mb-4">
            Or <span className="text-blue-600 font-medium">browse files</span> to upload
          </p>
          <p className="text-sm text-gray-500">
            Your files are processed locally and never leave your device
          </p>
        </div>
      </div>

      {/* Processing Options */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Processing Options</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Render Quality
              </span>
              <span className="text-sm text-blue-600 font-mono">
                {renderQuality.toFixed(1)}x
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={renderQuality}
              onChange={(e) => setRenderQuality(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fast</span>
              <span>High Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
