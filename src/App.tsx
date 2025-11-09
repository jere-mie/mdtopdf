import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

const defaultMarkdown = `# Welcome to Markdown to PDF

## Features
- **Live Preview**: See your markdown rendered in real-time
- **Export to PDF**: Download your document as a PDF
- **Save Markdown**: Download your markdown file
- **Selectable Text**: PDF text is fully selectable and searchable

## Getting Started
Start typing in the editor on the left to see the preview update automatically.

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Math (LaTeX)
Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### HTML Support
You can use <span style="color: red; font-weight: bold;">HTML tags</span> directly!

<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0;">
  <strong>Note:</strong> This is a custom HTML block with styling.
</div>

### Lists
1. First item
2. Second item
3. Third item

- Bullet point
- Another bullet
- Last one

### Blockquote
> This is a blockquote. It can contain **bold** and *italic* text.

### Links
[Visit React Documentation](https://react.dev)

### Tables
| Feature | Status | Priority |
|---------|--------|----------|
| Live Preview | ✅ Done | High |
| PDF Export | ✅ Done | High |
| Tables | ✅ Done | Medium |
| Syntax Highlighting | ✅ Done | Medium |
| LaTeX Math | ✅ Done | Medium |
| HTML Passthrough | ✅ Done | Low |

---

Happy writing!
`;

type View = 'both' | 'editor' | 'preview';

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [activeView, setActiveView] = useState<View>('editor');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('document');
  const [showClearModal, setShowClearModal] = useState(false);

  const handleExportPDF = () => {
    // Update document title for PDF filename
    const originalTitle = document.title;
    const filename = documentTitle.trim() || 'mdtopdf';
    document.title = filename;
    window.print();
    // Restore original title after print dialog
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleSaveMarkdown = () => {
    const filename = documentTitle.trim() || 'mdtopdf';
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadMarkdown = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setMarkdown(text);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    if (markdown.trim()) {
      setShowClearModal(true);
    }
  };

  const confirmClear = () => {
    setMarkdown('');
    setShowClearModal(false);
  };

  const closeModal = () => {
    setShowClearModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 print:h-auto print:block">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 print:hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">Markdown to PDF</h1>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document title"
                className="hidden sm:block flex-1 max-w-xs px-3 py-1.5 bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex gap-3 shrink-0">
              <label className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 cursor-pointer transition-colors">
                Load MD
                <input
                  type="file"
                  accept=".md,.markdown"
                  onChange={handleLoadMarkdown}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleSaveMarkdown}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save MD
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-2">
              <div className="sm:hidden">
                <label className="block text-zinc-400 text-xs mb-1 px-1">Document Title</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="document"
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <label className="block w-full px-4 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 cursor-pointer transition-colors text-center">
                📁 Load Markdown
                <input
                  type="file"
                  accept=".md,.markdown"
                  onChange={(e) => {
                    handleLoadMarkdown(e);
                    setIsMenuOpen(false);
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  handleSaveMarkdown();
                  setIsMenuOpen(false);
                }}
                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                💾 Save Markdown
              </button>
              <button
                onClick={() => {
                  handleExportPDF();
                  setIsMenuOpen(false);
                }}
                className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => {
                  handleClear();
                  setIsMenuOpen(false);
                }}
                className="block w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
              >
                🗑️ Clear
              </button>
            </div>
          )}
        </div>

        {/* Mobile View Switcher */}
        <div className="flex gap-0 border-t border-zinc-800 lg:hidden">
          <button
            onClick={() => setActiveView('editor')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeView === 'editor'
                ? 'border-blue-500 text-white bg-zinc-800'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveView('preview')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeView === 'preview'
                ? 'border-blue-500 text-white bg-zinc-800'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveView('both')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeView === 'both'
                ? 'border-blue-500 text-white bg-zinc-800'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            Both
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden print:block print:overflow-visible">
        {/* Editor */}
        <div className={`flex-1 flex flex-col border-r border-zinc-800 print:hidden ${
          activeView === 'preview' ? 'hidden lg:flex' : activeView === 'editor' ? 'flex' : 'flex'
        }`}>
          <div className="bg-zinc-900 px-4 sm:px-6 py-3 border-b border-zinc-800 hidden lg:block">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Editor
            </h2>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 bg-zinc-950 text-zinc-100 p-4 sm:p-6 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="Start typing your markdown here..."
          />
        </div>

        {/* Preview */}
        <div className={`flex-1 flex flex-col print:block ${
          activeView === 'editor' ? 'hidden lg:flex' : activeView === 'preview' ? 'flex' : 'flex'
        }`}>
          <div className="bg-zinc-900 px-4 sm:px-6 py-3 border-b border-zinc-800 print:hidden hidden lg:block">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Preview
            </h2>
          </div>
          <div className="flex-1 overflow-auto bg-white print:overflow-visible print:h-auto">
            <div className="max-w-4xl mx-auto p-4 sm:p-8 prose prose-slate lg:prose-lg print:max-w-none print:p-0">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-red-500 to-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Clear All Content
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to clear all content?
              </p>
              <p className="text-gray-500 text-sm">
                This action cannot be undone. Make sure you've saved your work if needed.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
