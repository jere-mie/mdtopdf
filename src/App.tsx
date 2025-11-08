import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
| Syntax Highlighting | 🔄 Planned | Low |

---

Happy writing!
`;

type View = 'both' | 'editor' | 'preview';

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [activeView, setActiveView] = useState<View>('editor');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('document');

  const handleExportPDF = () => {
    // Update document title for PDF filename
    const originalTitle = document.title;
    document.title = documentTitle;
    window.print();
    // Restore original title after print dialog
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleSaveMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.md`;
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
