import { useState, useEffect, useCallback } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import DocumentManager from './components/DocumentManager';
import { useDocuments } from './hooks/useDocuments';
import 'katex/dist/katex.min.css';

const defaultMarkdown = `# Welcome to Markdown to PDF

## 🔒 100% Private & Secure
This application runs **entirely in your browser**. Your documents never leave your device.

- **No Server Communication**: All processing happens client-side
- **No Data Collection**: We don't track, store, or access your content
- **No Account Required**: Use anonymously without sign-up
- **Offline Capable**: Works without an internet connection
- **Local Storage Only**: Documents saved in your browser's localStorage

### 🛡️ Your Privacy Matters
Unlike cloud-based editors, your sensitive documents stay on your machine. Perfect for private notes, confidential reports, or any content you want to keep secure.

## ✨ Features
- **Live Preview**: See your markdown rendered in real-time
- **Multi-Document Management**: Save and switch between documents
- **Export to PDF**: Generate PDFs locally using browser print
- **Save Markdown**: Download your markdown files
- **Selectable Text**: PDF text is fully selectable and searchable
- **Math Support**: LaTeX equations with KaTeX
- **Syntax Highlighting**: Code blocks with syntax colors
- **GitHub Flavored Markdown**: Tables, task lists, and more

## 🚀 Getting Started
1. Start typing in the editor to see live preview
2. Set a document title to save it locally
3. Click "Documents" to manage your saved documents
4. Export to PDF when ready (processed locally in your browser)

### Code Example
\`\`\`javascript
// All processing happens right here in your browser
function generatePDF() {
  window.print(); // Native browser print-to-PDF
}
\`\`\`

### Math (LaTeX)
Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Tables
| Feature | Status | Security |
|---------|--------|----------|
| Client-Side Only | ✅ | 🔒 Private |
| Local PDF Generation | ✅ | 🔒 Private |
| No Server Upload | ✅ | 🔒 Private |
| localStorage Only | ✅ | 🔒 Private |

### Blockquote
> "Privacy is not about hiding something. It's about protecting everything."

### HTML Support
<div style="background-color: #dcfce7; padding: 15px; border-left: 4px solid #22c55e; border-radius: 5px; margin: 10px 0;">
  <strong>🔐 Security Note:</strong> All your data stays in your browser. Clear your browser data to completely remove all documents.
</div>

Happy writing! 🎉
`;

type View = 'both' | 'editor' | 'preview';

function App() {
  const {
    currentDocument,
    updateCurrentDocument,
    updateDocumentTitle,
    createDocument,
    switchDocument,
    deleteDocument,
    renameDocument,
  } = useDocuments();

  const [markdown, setMarkdown] = useState(() => {
    // Show default markdown for fresh documents (no title)
    return currentDocument.title ? currentDocument.content : defaultMarkdown;
  });
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(() => {
    return currentDocument.title ? currentDocument.content : defaultMarkdown;
  });
  const [activeView, setActiveView] = useState<View>('editor');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [clearAllDocuments, setClearAllDocuments] = useState(false);

  // Handle Esc key to close clear modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearModal) {
        setShowClearModal(false);
      }
    };

    if (showClearModal) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [showClearModal]);

  // Sync markdown with current document
  useEffect(() => {
    // Show default markdown for fresh documents (no title)
    const content = currentDocument.title ? currentDocument.content : defaultMarkdown;
    setMarkdown(content);
    setDebouncedMarkdown(content);
  }, [currentDocument.id]);

  // Memoize the markdown change handler
  const handleMarkdownChange = useCallback((value: string) => {
    setMarkdown(value);
    updateCurrentDocument(value);
  }, [updateCurrentDocument]);

  // Debounce markdown updates for preview (150ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMarkdown(markdown);
    }, 150);
    return () => clearTimeout(timer);
  }, [markdown]);

  const handleExportPDF = () => {
    // Update document title for PDF filename
    const originalTitle = document.title;
    const filename = currentDocument.title.trim() || 'untitled';
    document.title = filename;
    window.print();
    // Restore original title after print dialog
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleSaveMarkdown = () => {
    const filename = currentDocument.title.trim() || 'untitled';
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
    
    // Clear all saved documents if checkbox is checked
    if (clearAllDocuments) {
      localStorage.removeItem('mdtopdf_documents');
      localStorage.removeItem('mdtopdf_current_document');
      // Create a fresh document
      createDocument();
      
      // Force DocumentManager to reload by closing and reopening if it's open
      if (showDocumentManager) {
        setShowDocumentManager(false);
        setTimeout(() => setShowDocumentManager(true), 0);
      }
    }
    
    setShowClearModal(false);
    setClearAllDocuments(false); // Reset checkbox
  };

  const closeModal = () => {
    setShowClearModal(false);
    setClearAllDocuments(false); // Reset checkbox when closing
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden print:h-auto print:block print:overflow-visible">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 print:hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">Markdown to PDF</h1>
              <input
                type="text"
                value={currentDocument.title}
                onChange={(e) => updateDocumentTitle(e.target.value)}
                placeholder="Untitled (set title to save)"
                className="hidden sm:block flex-1 max-w-xs px-3 py-1.5 bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex gap-3 shrink-0">
              <button
                onClick={() => setShowDocumentManager(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </button>
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
              <a
                href="https://github.com/jere-mie/mdtopdf"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="View on GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
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
                  value={currentDocument.title}
                  onChange={(e) => updateDocumentTitle(e.target.value)}
                  placeholder="Untitled (set title to save)"
                  className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                onClick={() => {
                  setShowDocumentManager(true);
                  setIsMenuOpen(false);
                }}
                className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                📚 Documents
              </button>
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
              <a
                href="https://github.com/jere-mie/mdtopdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </span>
              </a>
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
        <Editor 
          value={markdown}
          onChange={handleMarkdownChange}
          activeView={activeView}
        />
        <Preview 
          markdown={debouncedMarkdown}
          activeView={activeView}
        />
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
              <p className="text-gray-700 mb-4">
                Are you sure you want to clear all content?
              </p>
              <p className="text-gray-500 text-sm mb-4">
                This will clear the current document's content. Make sure you've saved your work if needed.
              </p>
              
              {/* Checkbox for clearing all documents */}
              <label className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                <input
                  type="checkbox"
                  checked={clearAllDocuments}
                  onChange={(e) => setClearAllDocuments(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-900 font-medium block">Also delete all saved documents</span>
                  <span className="text-gray-600 text-sm">This will permanently remove all documents from your browser's storage</span>
                </div>
              </label>
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

      {/* Document Manager Modal */}
      <DocumentManager
        isOpen={showDocumentManager}
        onClose={() => setShowDocumentManager(false)}
        currentDocument={currentDocument}
        onDocumentSelect={switchDocument}
        onDocumentCreate={createDocument}
        onDocumentDelete={deleteDocument}
        onDocumentRename={renameDocument}
      />
    </div>
  );
}

export default App;
