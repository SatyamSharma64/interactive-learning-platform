// import { trpc } from '@/lib/trpc';
// import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
// import Editor from '@monaco-editor/react';
// import * as monaco from 'monaco-editor';

// interface CodeEditorProps {
//   value: string;
//   onChange: (value: string) => void;
//   language: string;
//   problemId: string;
//   height?: string;
//   readOnly?: boolean;
//   theme?: 'vs-dark' | 'light' | 'vs' | 'hc-black';
//   fontSize?: number;
//   minimap?: boolean;
//   wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
//   onRun?: () => void;
//   onSubmit?: () => void;
// }

// export interface CodeEditorRef {
//   editor: monaco.editor.IStandaloneCodeEditor | null;
//   formatCode: () => void;
//   runCode: () => void;
//   submitCode: () => void;
//   increaseFontSize: () => void;
//   decreaseFontSize: () => void;
//   resetToTemplate: () => void;
//   getValue: () => string;
//   setValue: (value: string) => void;
//   focus: () => void;
//   getSelection: () => monaco.ISelection | null;
//   setSelection: (selection: monaco.ISelection) => void;
// }

// export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({
//   value,
//   onChange,
//   language,
//   problemId,
//   height = '400px',
//   readOnly = false,
//   theme = 'vs-dark',
//   fontSize = 14,
//   minimap = false,
//   wordWrap = 'off',
//   onRun,
//   onSubmit,
// }, ref) => {
//   const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
//   const [languageId, setLanguageId] = useState<string>(language);
//   const [isEditorReady, setIsEditorReady] = useState(false);

//   const { data: codeTemplate, isLoading } = trpc.problems.getCodeTemplateById.useQuery(
//     { 
//       problemId: problemId!, 
//       languageId: languageId! 
//     },
//     { enabled: !!problemId && !!languageId },
//   );

//   // Expose methods to parent component
//   useImperativeHandle(ref, () => ({
//     editor: editorRef.current,
//     formatCode,
//     runCode,
//     submitCode,
//     increaseFontSize,
//     decreaseFontSize,
//     resetToTemplate,
//     getValue: () => editorRef.current?.getValue() || '',
//     setValue: (newValue: string) => editorRef.current?.setValue(newValue),
//     focus: () => editorRef.current?.focus(),
//     getSelection: () => editorRef.current?.getSelection() || null,
//     setSelection: (selection: monaco.ISelection) => editorRef.current?.setSelection(selection),
//   }), []);

//   // Language mapping for Monaco Editor
//   const getMonacoLanguage = (lang: string): string => {
//     const languageMap: Record<string, string> = {
//       'javascript': 'javascript',
//       'typescript': 'typescript',
//       'python': 'python',
//       'java': 'java',
//       'cpp': 'cpp',
//       'c': 'c',
//       'csharp': 'csharp',
//       'go': 'go',
//       'rust': 'rust',
//       'php': 'php',
//       'ruby': 'ruby',
//       'swift': 'swift',
//       'kotlin': 'kotlin',
//       'scala': 'scala',
//       'sql': 'sql',
//       'html': 'html',
//       'css': 'css',
//       'json': 'json',
//       'xml': 'xml',
//       'yaml': 'yaml',
//       'markdown': 'markdown',
//       'shell': 'shell',
//       'powershell': 'powershell',
//     };
//     return languageMap[lang.toLowerCase()] || 'plaintext';
//   };

//   const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
//     editorRef.current = editor;
//     setIsEditorReady(true);

//     // Configure editor options
//     editor.updateOptions({
//       fontSize: fontSize,
//       fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
//       lineHeight: 20,
//       minimap: { enabled: minimap },
//       scrollBeyondLastLine: false,
//       wordWrap: wordWrap,
//       automaticLayout: true,
//       tabSize: 2,
//       insertSpaces: true,
//       detectIndentation: false,
//       folding: true,
//       showFoldingControls: 'mouseover',
//       foldingHighlight: true,
//       bracketPairColorization: { enabled: true },
//       guides: {
//         bracketPairs: true,
//         bracketPairsHorizontal: true,
//         highlightActiveBracketPair: true,
//         indentation: true,
//       },
//       suggestOnTriggerCharacters: true,
//       acceptSuggestionOnCommitCharacter: true,
//       acceptSuggestionOnEnter: 'on',
//       quickSuggestions: {
//         other: true,
//         comments: false,
//         strings: false,
//       },
//       parameterHints: { enabled: true },
//       hover: { enabled: true },
//       contextmenu: true,
//       mouseWheelZoom: true,
//     });

//     // Add custom key bindings
//     editor.addCommand(monaco.KeyCode.F5, () => {
//       runCode();
//     });

//     editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
//       submitCode();
//     });

//     // Add format document command
//     editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
//       formatCode();
//     });

//     // Configure language-specific settings
//     const monacoLanguage = getMonacoLanguage(language);
    
//     if (monacoLanguage === 'python') {
//       // Python-specific configuration
//       monaco.languages.setLanguageConfiguration('python', {
//         indentationRules: {
//           increaseIndentPattern: /^.*:\s*$/,
//           decreaseIndentPattern: /^\s*(return|break|continue|pass|raise).*$/,
//         },
//         onEnterRules: [
//           {
//             beforeText: /:\s*$/,
//             action: { indentAction: monaco.languages.IndentAction.Indent }
//           }
//         ],
//       });
//     } else if (monacoLanguage === 'javascript' || monacoLanguage === 'typescript') {
//       // JavaScript/TypeScript-specific configuration
//       monaco.languages.setLanguageConfiguration(monacoLanguage, {
//         brackets: [
//           ['{', '}'],
//           ['[', ']'],
//           ['(', ')']
//         ],
//         autoClosingPairs: [
//           { open: '{', close: '}' },
//           { open: '[', close: ']' },
//           { open: '(', close: ')' },
//           { open: '"', close: '"', notIn: ['string'] },
//           { open: "'", close: "'", notIn: ['string', 'comment'] },
//           { open: '`', close: '`', notIn: ['string', 'comment'] },
//         ],
//         surroundingPairs: [
//           { open: '{', close: '}' },
//           { open: '[', close: ']' },
//           { open: '(', close: ')' },
//           { open: '"', close: '"' },
//           { open: "'", close: "'" },
//           { open: '`', close: '`' },
//         ],
//       });
//     }

//     // Focus the editor
//     editor.focus();
//   };

//   const handleEditorChange = (value: string | undefined) => {
//     if (value !== undefined) {
//       onChange(value);
//     }
//   };

//   const handleBeforeMount = (monaco: typeof import('monaco-editor')) => {
//     // Configure themes
//     monaco.editor.defineTheme('coding-dark', {
//       base: 'vs-dark',
//       inherit: true,
//       rules: [
//         { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
//         { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
//         { token: 'string', foreground: 'CE9178' },
//         { token: 'number', foreground: 'B5CEA8' },
//         { token: 'regexp', foreground: 'D16969' },
//         { token: 'type', foreground: '4EC9B0' },
//         { token: 'class', foreground: '4EC9B0' },
//         { token: 'function', foreground: 'DCDCAA' },
//         { token: 'variable', foreground: '9CDCFE' },
//         { token: 'constant', foreground: '4FC1FF' },
//       ],
//       colors: {
//         'editor.background': '#0F172A', // slate-900
//         'editor.foreground': '#F8FAFC', // slate-50
//         'editorLineNumber.foreground': '#64748B', // slate-500
//         'editorLineNumber.activeForeground': '#CBD5E1', // slate-300
//         'editor.selectionBackground': '#334155', // slate-700
//         'editor.selectionHighlightBackground': '#1E293B', // slate-800
//         'editorCursor.foreground': '#F8FAFC',
//         'editor.findMatchBackground': '#7C3AED', // violet-600
//         'editor.findMatchHighlightBackground': '#5B21B6', // violet-800
//         'editorGutter.background': '#1E293B', // slate-800
//         'editorWidget.background': '#1E293B',
//         'editorWidget.border': '#374151',
//         'editorSuggestWidget.background': '#1E293B',
//         'editorSuggestWidget.border': '#374151',
//         'editorSuggestWidget.selectedBackground': '#374151',
//         'list.hoverBackground': '#374151',
//         'scrollbarSlider.background': '#47556950',
//         'scrollbarSlider.hoverBackground': '#47556970',
//         'scrollbarSlider.activeBackground': '#475569',
//       },
//     });

//     // Configure custom completions for competitive programming
//     const commonSnippets: Record<string, any[]> = {
//       python: [
//         {
//           label: 'main',
//           kind: monaco.languages.CompletionItemKind.Snippet,
//           insertText: [
//             'def main():',
//             '    ${1:pass}',
//             '',
//             'if __name__ == "__main__":',
//             '    main()'
//           ].join('\n'),
//           insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
//           documentation: 'Main function template'
//         },
//         {
//           label: 'fast_io',
//           kind: monaco.languages.CompletionItemKind.Snippet,
//           insertText: [
//             'import sys',
//             'input = sys.stdin.readline',
//             'print = sys.stdout.write'
//           ].join('\n'),
//           documentation: 'Fast I/O for competitive programming'
//         }
//       ],
//       javascript: [
//         {
//           label: 'readline',
//           kind: monaco.languages.CompletionItemKind.Snippet,
//           insertText: [
//             'const readline = require("readline");',
//             'const rl = readline.createInterface({',
//             '    input: process.stdin,',
//             '    output: process.stdout',
//             '});',
//             '',
//             'rl.on("line", (line) => {',
//             '    ${1:// Process input}',
//             '});'
//           ].join('\n'),
//           insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
//           documentation: 'Node.js readline template'
//         }
//       ]
//     };

//     // Register completion providers
//     Object.entries(commonSnippets).forEach(([lang, snippets]) => {
//       const monacoLang = getMonacoLanguage(lang);
//       monaco.languages.registerCompletionItemProvider(monacoLang, {
//         provideCompletionItems: (model, position) => {
//           return {
//             suggestions: snippets.map(snippet => ({
//               ...snippet,
//               range: {
//                 startLineNumber: position.lineNumber,
//                 endLineNumber: position.lineNumber,
//                 startColumn: position.column,
//                 endColumn: position.column,
//               },
//             }))
//           };
//         }
//       });
//     });
//   };

//   const resetToTemplate = () => {
//     if (codeTemplate?.templateCode && editorRef.current) {
//       editorRef.current.setValue(codeTemplate.templateCode);
//       editorRef.current.focus();
//     }
//   };

//   const formatCode = () => {
//     if (editorRef.current) {
//       editorRef.current.trigger('keyboard', 'editor.action.formatDocument', {});
//     }
//   };

//   const runCode = () => {
//     if (onRun) {
//       onRun();
//     } else {
//       console.log('F5 pressed - Run code');
//     }
//   };

//   const submitCode = () => {
//     if (onSubmit) {
//       onSubmit();
//     } else {
//       console.log('Ctrl+Enter pressed - Submit code');
//     }
//   };

//   const increaseFontSize = () => {
//     if (editorRef.current) {
//       const currentSize = editorRef.current.getOptions().get(monaco.editor.EditorOption.fontSize);
//       editorRef.current.updateOptions({ fontSize: Math.min(currentSize + 1, 24) });
//     }
//   };

//   const decreaseFontSize = () => {
//     if (editorRef.current) {
//       const currentSize = editorRef.current.getOptions().get(monaco.editor.EditorOption.fontSize);
//       editorRef.current.updateOptions({ fontSize: Math.max(currentSize - 1, 10) });
//     }
//   };

//   // Get initial value - prioritize template if available and no current value
//   const getInitialValue = () => {
//     if (value) return value;
//     if (codeTemplate?.templateCode) return codeTemplate.templateCode;
//     return '';
//   };

//   return (
//     <div className="h-full flex flex-col bg-slate-900">
//       {/* Editor Toolbar */}
//       <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-2">
//         <div className="flex items-center space-x-4">
//           <div className="text-sm text-slate-300 font-mono">
//             {getMonacoLanguage(language).toUpperCase()}
//           </div>
//           <div className="text-xs text-slate-400">
//             {readOnly ? 'Read-only' : 'Editing'}
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           {codeTemplate?.templateCode && (
//             <button
//               onClick={resetToTemplate}
//               className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
//               title="Reset to template"
//             >
//               Reset
//             </button>
//           )}
          
//           <button
//             onClick={formatCode}
//             className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
//             title="Format code (Ctrl+Shift+F)"
//           >
//             Format
//           </button>
          
//           <div className="flex items-center space-x-1">
//             <button
//               onClick={decreaseFontSize}
//               className="w-6 h-6 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors flex items-center justify-center"
//               title="Decrease font size"
//             >
//               -
//             </button>
//             <button
//               onClick={increaseFontSize}
//               className="w-6 h-6 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors flex items-center justify-center"
//               title="Increase font size"
//             >
//               +
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Monaco Editor */}
//       <div className="flex-1">
//         <Editor
//           height={height}
//           defaultLanguage={getMonacoLanguage(language)}
//           language={getMonacoLanguage(languageId)}
//           value={getInitialValue()}
//           theme="coding-dark"
//           onChange={handleEditorChange}
//           onMount={handleEditorDidMount}
//           beforeMount={handleBeforeMount}
//           loading={
//             <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400">
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
//                 <span>Loading editor...</span>
//               </div>
//             </div>
//           }
//           options={{
//             readOnly,
//             fontSize: fontSize,
//             fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
//             minimap: { enabled: minimap },
//             scrollBeyondLastLine: false,
//             wordWrap: wordWrap,
//             automaticLayout: true,
//             lineNumbers: 'on',
//             renderLineHighlight: 'all',
//             selectOnLineNumbers: true,
//             matchBrackets: 'always',
//             theme: 'coding-dark',
//           }}
//         />
//       </div>

//       {/* Status Bar */}
//       <div className="flex items-center justify-between bg-slate-800 border-t border-slate-700 px-4 py-1 text-xs text-slate-400">
//         <div className="flex items-center space-x-4">
//           <span>Lines: {value.split('\n').length}</span>
//           <span>Characters: {value.length}</span>
//           {isLoading && (
//             <span className="flex items-center space-x-1">
//               <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
//               <span>Loading template...</span>
//             </span>
//           )}
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <span>UTF-8</span>
//           <span>{getMonacoLanguage(language)}</span>
//           <span>Ln {editorRef.current?.getPosition()?.lineNumber || 1}</span>
//         </div>
//       </div>
//     </div>
//   );
// });

// CodeEditor.displayName = 'CodeEditor';

// export default CodeEditor;