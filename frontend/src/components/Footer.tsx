import React from 'react';
import { Github } from 'lucide-react';

interface FooterProps {
  onShowDocs: (filename: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onShowDocs }) => {
  return (
    <footer className="mt-16 py-6 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button
              onClick={() => onShowDocs('README.md')}
              className="hover:text-blue-600 transition-colors"
            >
              Docs
            </button>
            <a
              href="https://github.com/pdfrendr/pdfrendr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <Github size={14} />
              GitHub
            </a>
            <a
              href="https://github.com/pdfrendr/pdfrendr/tree/main/examples"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              Examples
            </a>
          </div>
          
          <div className="text-xs text-gray-400">
            © 2025 PDFRendr
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
