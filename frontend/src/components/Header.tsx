import React from 'react';

interface HeaderProps {
  onHomeClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  const handleClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
  };

  return (
    <header className="py-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleClick}
        >
          <img 
            src="/logo.png" 
            alt="PDFRendr" 
            className="h-12 w-12 bg-white p-1 rounded border"
          />
          <div>
            <h1 className="text-2xl text-gray-900 font-mono">
              PDFRendr
            </h1>
            <p className="text-sm text-gray-500 font-mono">
              PDF Analysis & Reconstruction Engine
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 font-mono">
          <div>v1.0.0</div>
          <div>Browser-based</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
