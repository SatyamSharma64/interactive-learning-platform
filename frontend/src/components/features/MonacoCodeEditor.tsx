import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'light' | 'vs' | 'hc-black';
  fontSize?: number;
  minimap?: boolean;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  codeTemplate?: { templateCode: string } | null;
  resetToTemplate?: () => void;
}

export interface CodeEditorRef {
  resetToTemplate: () => void;
  formatCode: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({
  value,
  onChange,
  language,
  height,
  readOnly = false,
  theme = 'vs-dark',
  fontSize = 14,
  minimap = false,
  wordWrap = 'off',
  codeTemplate,
}, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(fontSize);

  // Language mapping for Monaco Editor
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'go': 'go',
      'rust': 'rust',
      'php': 'php',
      'ruby': 'ruby',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'scala': 'scala',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'markdown': 'markdown',
      'shell': 'shell',
      'powershell': 'powershell',
    };
    return languageMap[lang.toLowerCase()] || 'plaintext';
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    resetToTemplate: () => {
      if (codeTemplate?.templateCode && editorRef.current) {
        const editor = editorRef.current;
        editor.setValue(codeTemplate.templateCode);
        onChange(codeTemplate.templateCode);
        editor.focus();
        
        // Position cursor at the end of template code or at a logical position
        const model = editor.getModel();
        if (model) {
          const lineCount = model.getLineCount();
          const lastLineLength = model.getLineLength(lineCount);
          editor.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
        }
      }
    },
    formatCode: () => {
      if (editorRef.current) {
        editorRef.current.trigger('keyboard', 'editor.action.formatDocument', {});
      }
    },
    increaseFontSize: () => {
      if (editorRef.current) {
        const newSize = Math.min(currentFontSize + 1, 24);
        setCurrentFontSize(newSize);
        editorRef.current.updateOptions({ fontSize: newSize });
      }
    },
    decreaseFontSize: () => {
      if (editorRef.current) {
        const newSize = Math.max(currentFontSize - 1, 10);
        setCurrentFontSize(newSize);
        editorRef.current.updateOptions({ fontSize: newSize });
      }
    },
    getEditor: () => editorRef.current,
  }));

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Configure editor options
    editor.updateOptions({
      fontSize: currentFontSize,
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
      lineHeight: 20,
      minimap: { enabled: minimap },
      scrollBeyondLastLine: false,
      wordWrap: wordWrap,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: false,
      folding: true,
      showFoldingControls: 'mouseover',
      foldingHighlight: true,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        bracketPairsHorizontal: true,
        highlightActiveBracketPair: true,
        indentation: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      parameterHints: { enabled: true },
      hover: { enabled: true },
      contextmenu: true,
      mouseWheelZoom: true,
      renderWhitespace: 'selection',
      renderControlCharacters: true,
    });

    // Add custom key bindings
    editor.addCommand(monaco.KeyCode.F5, () => {
      // Custom F5 handler - could trigger code execution
      console.log('F5 pressed - Run code');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Ctrl/Cmd + Enter - could trigger submission
      console.log('Ctrl+Enter pressed - Submit code');
    });

    // Add format document command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.trigger('keyboard', 'editor.action.formatDocument', {});
    });

    // Configure language-specific settings
    const monacoLanguage = getMonacoLanguage(language);
    
    if (monacoLanguage === 'python') {
      // Python-specific configuration
      monaco.languages.setLanguageConfiguration('python', {
        indentationRules: {
          increaseIndentPattern: /^.*:\s*$/,
          decreaseIndentPattern: /^\s*(return|break|continue|pass|raise).*$/,
        },
        onEnterRules: [
          {
            beforeText: /:\s*$/,
            action: { indentAction: monaco.languages.IndentAction.Indent }
          }
        ],
      });
    } else if (monacoLanguage === 'javascript' || monacoLanguage === 'typescript') {
      // JavaScript/TypeScript-specific configuration
      monaco.languages.setLanguageConfiguration(monacoLanguage, {
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] },
          { open: '`', close: '`', notIn: ['string', 'comment'] },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '`', close: '`' },
        ],
      });
    }

    // Focus the editor
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const handleBeforeMount = (monaco: typeof import('monaco-editor')) => {
    // Configure themes
    monaco.editor.defineTheme('coding-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'regexp', foreground: 'D16969' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' },
      ],
      colors: {
        'editor.background': '#0F172A', // slate-900
        'editor.foreground': '#F8FAFC', // slate-50
        'editorLineNumber.foreground': '#64748B', // slate-500
        'editorLineNumber.activeForeground': '#CBD5E1', // slate-300
        'editor.selectionBackground': '#334155', // slate-700
        'editor.selectionHighlightBackground': '#1E293B', // slate-800
        'editorCursor.foreground': '#F8FAFC',
        'editor.findMatchBackground': '#7C3AED', // violet-600
        'editor.findMatchHighlightBackground': '#5B21B6', // violet-800
        'editorGutter.background': '#1E293B', // slate-800
        'editorWidget.background': '#1E293B',
        'editorWidget.border': '#374151',
        'editorSuggestWidget.background': '#1E293B',
        'editorSuggestWidget.border': '#374151',
        'editorSuggestWidget.selectedBackground': '#374151',
        'list.hoverBackground': '#374151',
        'scrollbarSlider.background': '#47556950',
        'scrollbarSlider.hoverBackground': '#47556970',
        'scrollbarSlider.activeBackground': '#475569',
      },
    });

    // Configure custom completions for competitive programming
    const commonSnippets: Record<string, any[]> = {
      python: [
        {
          label: 'main',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'def main():',
            '    ${1:pass}',
            '',
            'if __name__ == "__main__":',
            '    main()'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Main function template'
        },
        {
          label: 'fast_io',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'import sys',
            'input = sys.stdin.readline',
            'print = sys.stdout.write'
          ].join('\n'),
          documentation: 'Fast I/O for competitive programming'
        },
        {
          label: 'list_comprehension',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '[${1:expression} for ${2:item} in ${3:iterable}]',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'List comprehension template'
        }
      ],
      javascript: [
        {
          label: 'readline',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'const readline = require("readline");',
            'const rl = readline.createInterface({',
            '    input: process.stdin,',
            '    output: process.stdout',
            '});',
            '',
            'rl.on("line", (line) => {',
            '    ${1:// Process input}',
            '});'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Node.js readline template'
        },
        {
          label: 'arrow_function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:params}) => ${2:expression}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Arrow function template'
        }
      ],
      java: [
        {
          label: 'main',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'public static void main(String[] args) {',
            '    ${1:// Your code here}',
            '}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Main method template'
        },
        {
          label: 'scanner',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'Scanner sc = new Scanner(System.in);',
            '${1:// Read input}',
            'sc.close();'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Scanner input template'
        }
      ]
    };

    // Register completion providers
    Object.entries(commonSnippets).forEach(([lang, snippets]) => {
      const monacoLang = getMonacoLanguage(lang);
      monaco.languages.registerCompletionItemProvider(monacoLang, {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          return {
            suggestions: snippets.map(snippet => ({
              ...snippet,
              range,
            }))
          };
        }
      });
    });
  };

  // Internal functions for toolbar buttons
  const resetToTemplate = () => {
    if (codeTemplate?.templateCode && editorRef.current) {
      const editor = editorRef.current;
      editor.setValue(codeTemplate.templateCode);
      onChange(codeTemplate.templateCode);
      editor.focus();
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.formatDocument', {});
    }
  };

  const increaseFontSize = () => {
    if (editorRef.current) {
      const newSize = Math.min(currentFontSize + 1, 24);
      setCurrentFontSize(newSize);
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  const decreaseFontSize = () => {
    if (editorRef.current) {
      const newSize = Math.max(currentFontSize - 1, 10);
      setCurrentFontSize(newSize);
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      const observer = new ResizeObserver(() => {
        editorRef.current!.layout();
      });

      const container = editorRef.current!.getDomNode()?.parentElement;
      if (container) observer.observe(container);

      return () => observer.disconnect();
    }
  }, [isEditorReady]);

  // Get initial value - prioritize current value over template
  const getInitialValue = () => {
    return value || '';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-300 font-mono">
            {getMonacoLanguage(language).toUpperCase()}
          </div>
          <div className="text-xs text-slate-400">
            {readOnly ? 'Read-only' : 'Editing'}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {codeTemplate?.templateCode && (
            <button
              onClick={resetToTemplate}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
              title="Reset to template"
            >
              Reset
            </button>
          )}
          
          <button
            onClick={formatCode}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            title="Format code (Ctrl+Shift+F)"
          >
            Format
          </button>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={decreaseFontSize}
              className="w-6 h-6 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors flex items-center justify-center"
              title="Decrease font size"
            >
              -
            </button>
            <span className="text-xs text-slate-400 w-6 text-center">{currentFontSize}</span>
            <button
              onClick={increaseFontSize}
              className="w-6 h-6 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors flex items-center justify-center"
              title="Increase font size"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage={getMonacoLanguage(language)}
          language={getMonacoLanguage(language)}
          value={getInitialValue()}
          theme="coding-dark"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          beforeMount={handleBeforeMount}
          loading={
            <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading editor...</span>
              </div>
            </div>
          }
          options={{
            readOnly,
            fontSize: currentFontSize,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
            minimap: { enabled: minimap },
            scrollBeyondLastLine: false,
            wordWrap: wordWrap,
            automaticLayout: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            matchBrackets: 'always',
            theme: 'coding-dark',
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-slate-800 border-t border-slate-700 px-4 py-1 text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Lines: {value.split('\n').length}</span>
          <span>Characters: {value.length}</span>
          <span>Words: {value.trim() ? value.trim().split(/\s+/).length : 0}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>{getMonacoLanguage(language)}</span>
          <span>Ln {editorRef.current?.getPosition()?.lineNumber || 1}, Col {editorRef.current?.getPosition()?.column || 1}</span>
        </div>
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;