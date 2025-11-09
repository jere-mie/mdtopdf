import { memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  activeView: 'both' | 'editor' | 'preview';
}

const Editor = memo(({ value, onChange, activeView }: EditorProps) => {
  return (
    <div className={`flex-1 flex flex-col border-r border-zinc-800 print:hidden ${
      activeView === 'preview' ? 'hidden lg:flex' : activeView === 'editor' ? 'flex' : 'flex'
    }`}>
      <div className="bg-zinc-900 px-4 sm:px-6 py-3 border-b border-zinc-800 hidden lg:block">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Editor
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={value}
          height="100%"
          extensions={[markdown(), EditorView.lineWrapping]}
          onChange={onChange}
          theme="dark"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
          }}
          style={{
            height: '100%',
            fontSize: '0.875rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        />
      </div>
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
