import React from 'react';

interface HexLineData {
  line: string;
  hexHighlight?: {
    start: number;
    length: number;
  };
  asciiHighlight?: {
    start: number;
    length: number;
  };
}

interface HexViewerProps {
  hexData: string;
}

const HexViewer: React.FC<HexViewerProps> = ({ hexData }) => {
  const lines = hexData.split('\n');
  
  const renderLine = (lineData: HexLineData, index: number) => {
    const { line, hexHighlight, asciiHighlight } = lineData;
    
    if (!hexHighlight && !asciiHighlight) {
      return <div key={index}>{line}</div>;
    }
    
    const parts: React.ReactNode[] = [];
    let currentPos = 0;
    
    // Process hex highlight
    if (hexHighlight) {
      // Before hex highlight
      if (hexHighlight.start > currentPos) {
        parts.push(line.substring(currentPos, hexHighlight.start));
        currentPos = hexHighlight.start;
      }
      
      // Hex highlight
      const hexText = line.substring(currentPos, currentPos + hexHighlight.length);
      parts.push(
        <span 
          key={`hex-${index}`}
          className="bg-yellow-300 text-black font-bold"
        >
          {hexText}
        </span>
      );
      currentPos += hexHighlight.length;
    }
    
    // Between highlights or after hex highlight
    if (asciiHighlight) {
      if (asciiHighlight.start > currentPos) {
        parts.push(line.substring(currentPos, asciiHighlight.start));
        currentPos = asciiHighlight.start;
      }
      
      // ASCII highlight
      const asciiText = line.substring(currentPos, currentPos + asciiHighlight.length);
      parts.push(
        <span 
          key={`ascii-${index}`}
          className="bg-yellow-300 text-black font-bold"
        >
          {asciiText}
        </span>
      );
      currentPos += asciiHighlight.length;
    }
    
    // Remaining text
    if (currentPos < line.length) {
      parts.push(line.substring(currentPos));
    }
    
    return <div key={index}>{parts}</div>;
  };
  
  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono overflow-auto border h-96 w-full">
      {lines.map((lineStr, index) => {
        try {
          const lineData: HexLineData = JSON.parse(lineStr);
          return renderLine(lineData, index);
        } catch {
          // Fallback for plain text lines
          return <div key={index}>{lineStr}</div>;
        }
      })}
    </div>
  );
};

export default HexViewer;
