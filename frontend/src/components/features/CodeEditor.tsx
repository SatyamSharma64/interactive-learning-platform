import React, { useRef, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = '300px',
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync line numbers with textarea scroll
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    
    if (!textarea || !lineNumbers) return;

    const handleScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      if (e.shiftKey) {
        // Shift+Tab: Remove indentation
        const lines = value.split('\n');
        const startLine = value.substring(0, start).split('\n').length - 1;
        const endLine = value.substring(0, end).split('\n').length - 1;
        
        const newLines = lines.map((line, index) => {
          if (index >= startLine && index <= endLine) {
            return line.replace(/^  /, ''); // Remove 2 spaces from start
          }
          return line;
        });
        
        const newValue = newLines.join('\n');
        onChange(newValue);
        
        // Adjust cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            const newStart = Math.max(0, start - 2);
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newStart;
          }
        }, 0);
      } else {
        // Tab: Add indentation
        if (start === end) {
          // No selection: just insert spaces
          const newValue = value.substring(0, start) + '  ' + value.substring(end);
          onChange(newValue);
          
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
            }
          }, 0);
        } else {
          // Selection: indent all selected lines
          const lines = value.split('\n');
          const startLine = value.substring(0, start).split('\n').length - 1;
          const endLine = value.substring(0, end).split('\n').length - 1;
          
          const newLines = lines.map((line, index) => {
            if (index >= startLine && index <= endLine) {
              return '  ' + line;
            }
            return line;
          });
          
          const newValue = newLines.join('\n');
          onChange(newValue);
        }
      }
    } else if (e.key === 'Enter') {
      // Auto-indent on new line
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const beforeCursor = value.substring(0, start);
      const afterCursor = value.substring(start);
      
      // Get the current line to determine indentation
      const currentLine = beforeCursor.split('\n').pop() || '';
      const indentMatch = currentLine.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      
      // Add extra indent for certain characters
      let extraIndent = '';
      if (currentLine.trim().endsWith(':') || 
          currentLine.trim().endsWith('{') ||
          currentLine.trim().endsWith('[') ||
          currentLine.trim().endsWith('(')) {
        extraIndent = '  ';
      }
      
      const newValue = beforeCursor + '\n' + currentIndent + extraIndent + afterCursor;
      onChange(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + 1 + currentIndent.length + extraIndent.length;
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPosition;
        }
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      // Toggle comment
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const lines = value.split('\n');
      const startLine = value.substring(0, start).split('\n').length - 1;
      const endLine = value.substring(0, end).split('\n').length - 1;
      
      const commentPrefix = language === 'python' ? '# ' : '// ';
      
      const newLines = lines.map((line, index) => {
        if (index >= startLine && index <= endLine) {
          if (line.trim().startsWith(commentPrefix.trim())) {
            return line.replace(commentPrefix, '');
          } else {
            return commentPrefix + line;
          }
        }
        return line;
      });
      
      const newValue = newLines.join('\n');
      onChange(newValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

  const getPlaceholder = () => {
    switch (language) {
      case 'python':
        return `def solution():
    # Write your Python solution here
    pass`;
      case 'javascript':
        return `function solution() {
    // Write your JavaScript solution here
}`;
      default:
        return `Write your ${language} solution here...`;
    }
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="w-12 bg-slate-800 text-gray-500 text-sm font-mono flex-shrink-0 overflow-hidden border-r border-slate-700"
      >
        <div className="py-4 px-2 leading-6 select-none text-right">
          {lineNumbers.map((num) => (
            <div key={num} className="h-6 flex items-center justify-end">
              {num}
            </div>
          ))}
        </div>
      </div>
      
      {/* Code Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-slate-900 text-white border-none ${
            readOnly ? 'cursor-default' : 'cursor-text'
          }`}
          style={{ 
            lineHeight: '1.5',
            tabSize: 2,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace'
          }}
          placeholder={value ? '' : getPlaceholder()}
          spellCheck={false}
          wrap="off"
        />
      </div>
    </div>
  );
};

// Basic syntax highlighting function
const highlightSyntax = (code: string, language: string): React.ReactNode => {
  if (language === 'python') {
    return code.split('\n').map((line, lineIndex) => (
      <div key={lineIndex}>
        {line.split(/(\b(?:def|class|if|else|elif|for|while|try|except|import|from|return|break|continue|pass|and|or|not|in|is|True|False|None)\b|#.*$|"[^"]*"|'[^']*'|\d+)/g).map((token, tokenIndex) => {
          if (/^(?:def|class|if|else|elif|for|while|try|except|import|from|return|break|continue|pass|and|or|not|in|is)$/.test(token)) {
            return <span key={tokenIndex} className="text-purple-400 font-semibold">{token}</span>;
          } else if (/^(?:True|False|None)$/.test(token)) {
            return <span key={tokenIndex} className="text-orange-400">{token}</span>;
          } else if (/^#.*$/.test(token)) {
            return <span key={tokenIndex} className="text-gray-500 italic">{token}</span>;
          } else if (/^["'].*["']$/.test(token)) {
            return <span key={tokenIndex} className="text-green-400">{token}</span>;
          } else if (/^\d+$/.test(token)) {
            return <span key={tokenIndex} className="text-blue-400">{token}</span>;
          }
          return <span key={tokenIndex} className="text-white">{token}</span>;
        })}
      </div>
    ));
  } else if (language === 'javascript') {
    return code.split('\n').map((line, lineIndex) => (
      <div key={lineIndex}>
        {line.split(/(\b(?:function|const|let|var|if|else|for|while|do|switch|case|default|try|catch|finally|return|break|continue|class|extends|import|export|from|async|await|true|false|null|undefined)\b|\/\/.*$|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|`[^`]*`|\d+)/g).map((token, tokenIndex) => {
          if (/^(?:function|const|let|var|if|else|for|while|do|switch|case|default|try|catch|finally|return|break|continue|class|extends|import|export|from|async|await)$/.test(token)) {
            return <span key={tokenIndex} className="text-purple-400 font-semibold">{token}</span>;
          } else if (/^(?:true|false|null|undefined)$/.test(token)) {
            return <span key={tokenIndex} className="text-orange-400">{token}</span>;
          } else if (/^(?:\/\/.*$|\/\*[\s\S]*?\*\/)/.test(token)) {
            return <span key={tokenIndex} className="text-gray-500 italic">{token}</span>;
          } else if (/^["'`].*["'`]$/.test(token)) {
            return <span key={tokenIndex} className="text-green-400">{token}</span>;
          } else if (/^\d+$/.test(token)) {
            return <span key={tokenIndex} className="text-blue-400">{token}</span>;
          }
          return <span key={tokenIndex} className="text-white">{token}</span>;
        })}
      </div>
    ));
  }
  
  // Fallback for other languages
  return code.split('\n').map((line, lineIndex) => (
    <div key={lineIndex} className="text-white">{line}</div>
  ));
};