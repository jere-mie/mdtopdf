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

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  const handleExportPDF = () => {
    window.print();
  };

  const handleSaveMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
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
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-white">Markdown to PDF</h1>
        <div className="flex gap-3">
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
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden print:block print:overflow-visible">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-r border-zinc-800 print:hidden">
          <div className="bg-zinc-900 px-6 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Editor
            </h2>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 bg-zinc-950 text-zinc-100 p-6 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="Start typing your markdown here..."
          />
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col print:block">
          <div className="bg-zinc-900 px-6 py-3 border-b border-zinc-800 print:hidden">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
              Preview
            </h2>
          </div>
          <div className="flex-1 overflow-auto bg-white print:overflow-visible print:h-auto">
            <div className="max-w-4xl mx-auto p-8 prose prose-slate lg:prose-lg print:max-w-none print:p-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
