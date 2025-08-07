import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  filename?: string;
  onClose: () => void;
}

const DocsModal: React.FC<DocsModalProps> = ({ isOpen, filename, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && filename) {
      loadDocumentation(filename);
    }
  }, [isOpen, filename]);

  const loadDocumentation = async (file: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://raw.githubusercontent.com/pdfrendr/pdfrendr/main/${file}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const markdown = await response.text();
      setContent(parseMarkdown(markdown));
    } catch (error) {
      setContent(`
        <div class="text-center py-8">
          <p class="text-lg font-semibold text-gray-900 mb-2">Could not load ${file}</p>
          <p class="text-gray-600 mb-4">Please visit the GitHub repository to view the documentation.</p>
          <a href="https://github.com/pdfrendr/pdfrendr" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            View on GitHub <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z"></path></svg>
          </a>
        </div>
      `);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">$1</a>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, '</p>');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {filename?.replace('.md', '').replace(/-/g, ' ') || 'Documentation'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsModal;
