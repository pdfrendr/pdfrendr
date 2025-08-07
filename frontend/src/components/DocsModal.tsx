import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { marked } from 'marked';

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
      const response = await fetch(`https://raw.githubusercontent.com/pdfrendr/pdfrendr.github.io/main/${file}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const markdown = await response.text();
      setContent(await parseMarkdown(markdown));
    } catch (error) {
      setContent(`
        <div class="text-center py-8">
          <p class="text-lg font-semibold text-gray-900 mb-2">Could not load ${file}</p>
          <p class="text-gray-600 mb-4">Please visit the GitHub repository to view the documentation.</p>
          <a href="https://github.com/pdfrendr/pdfrendr.github.io" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            View on GitHub <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z"></path></svg>
          </a>
        </div>
      `);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = async (markdown: string): Promise<string> => {
    // Configure marked with custom renderer for Tailwind CSS classes
    const renderer = new marked.Renderer();
    
    // Customize heading styles
    renderer.heading = (text, level) => {
      const classes = {
        1: 'text-2xl font-bold text-gray-900 mt-8 mb-6 border-b border-gray-200 pb-2',
        2: 'text-xl font-semibold text-gray-900 mt-8 mb-4',
        3: 'text-lg font-semibold text-gray-900 mt-6 mb-3',
        4: 'text-base font-semibold text-gray-900 mt-4 mb-2',
        5: 'text-sm font-semibold text-gray-900 mt-3 mb-2',
        6: 'text-xs font-semibold text-gray-900 mt-2 mb-1'
      };
      return `<h${level} class="${classes[level] || classes[3]}">${text}</h${level}>`;
    };
    
    // Customize paragraph styles
    renderer.paragraph = (text) => {
      return `<p class="mb-4 text-gray-700 leading-relaxed">${text}</p>`;
    };
    
    // Customize code block styles
    renderer.code = (code, language) => {
      return `<pre class="bg-gray-100 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono text-gray-800">${code}</code></pre>`;
    };
    
    // Customize inline code styles
    renderer.codespan = (code) => {
      return `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">${code}</code>`;
    };
    
    // Customize link styles
    renderer.link = (href, title, text) => {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">${text}</a>`;
    };
    
    // Customize list styles
    renderer.list = (body, ordered) => {
      const tag = ordered ? 'ol' : 'ul';
      const classes = ordered ? 'list-decimal list-inside mb-4 ml-4 space-y-1' : 'list-disc list-inside mb-4 ml-4 space-y-1';
      return `<${tag} class="${classes}">${body}</${tag}>`;
    };
    
    renderer.listitem = (text) => {
      return `<li class="text-gray-700">${text}</li>`;
    };
    
    // Customize table styles
    renderer.table = (header, body) => {
      return `<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-200 rounded-lg">${header}${body}</table></div>`;
    };
    
    renderer.tablerow = (content) => {
      return `<tr class="border-b border-gray-100">${content}</tr>`;
    };
    
    renderer.tablecell = (content, flags) => {
      const tag = flags.header ? 'th' : 'td';
      const classes = flags.header 
        ? 'px-4 py-2 bg-gray-50 font-semibold text-left text-gray-900 border-b border-gray-200' 
        : 'px-4 py-2 text-gray-700';
      return `<${tag} class="${classes}">${content}</${tag}>`;
    };
    
    // Customize blockquote styles
    renderer.blockquote = (quote) => {
      return `<blockquote class="border-l-4 border-blue-500 pl-4 my-4 text-gray-600 italic">${quote}</blockquote>`;
    };
    
    // Configure marked options
    marked.setOptions({
      renderer,
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Line breaks
      sanitize: false, // Allow HTML (we trust our own markdown)
      smartypants: true // Smart quotes
    });
    
    return marked.parse(markdown);
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
              className="max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsModal;
