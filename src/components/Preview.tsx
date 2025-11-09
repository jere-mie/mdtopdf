import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewProps {
  markdown: string;
  activeView: 'both' | 'editor' | 'preview';
}

const Preview = memo(({ markdown, activeView }: PreviewProps) => {
  return (
    <div className={`flex-1 flex flex-col overflow-hidden print:block print:overflow-visible ${
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
  );
});

Preview.displayName = 'Preview';

export default Preview;
