import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  fileName: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ fileName }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    'Parsing PDF structure...',
    'Extracting page geometry...',
    'Rendering to canvas...',
    'Converting to images...',
    'Analyzing objects...',
    'Rebuilding PDF...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 95);
        const newStep = Math.floor((newProgress / 100) * steps.length);
        setStep(Math.min(newStep, steps.length - 1));
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded border border-gray-200 p-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-50 border border-blue-200">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-900 font-mono">
              PROCESSING: {fileName}
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              {progress.toFixed(0)}%
            </span>
          </div>
          
          <div className="bg-gray-200 rounded h-2 mb-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-600 font-mono">
            {steps[step]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
